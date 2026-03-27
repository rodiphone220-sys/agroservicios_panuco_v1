import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Search, Plus, Minus, Trash2, ShoppingCart, User, CreditCard, Receipt, 
  Tag, Package, ChevronRight, X, Layers, Building2, LayoutGrid, List,
  Barcode, Camera, Tractor, ChevronDown, CheckCircle2, AlertTriangle, Printer,
  Clock, UserPlus, Filter, Banknote, ArrowRightLeft
} from 'lucide-react';
import { MasterFilterSystem } from './Common/MasterFilterSystem';
import { productStorage, customerStorage, saleStorage } from '../lib/localStorage';
import { Product, Sale, SaleItem, Customer } from '../types';
import { cn, formatCurrency } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { Html5Qrcode } from "html5-qrcode";
import { InvoiceGenerator } from './Invoicing/InvoiceGenerator';
import { AuthContext } from './Auth';

const CATEGORIES = ["Motor", "Transmisión", "Frenos", "Dirección", "Hidráulico", "Eléctrico"];
const BRANDS = ["MF", "JD", "NH", "Ford", "Case", "Perkins"];

export const POS: React.FC = () => {
  const { user } = React.useContext(AuthContext);
  const [products, setProducts] = useState<Product[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [cart, setCart] = useState<SaleItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedBrand, setSelectedBrand] = useState<string | null>(null);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [discount, setDiscount] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState<Sale['paymentMethod']>('EFECTIVO');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);
  const [isBarcodeScannerOpen, setIsBarcodeScannerOpen] = useState(false);
  const [lastSaleId, setLastSaleId] = useState<string | null>(null);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);

  // Filtered products state
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);

  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const products = productStorage.getAll();
    setProducts(products);
    setFilteredProducts(products); // Initialize filtered products

    const customers = customerStorage.getAll();
    setCustomers(customers);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSearchResults(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // The MasterFilterSystem will now manage the filteredProducts state based on its internal logic
  // and the initial 'products' data. The manual filtering logic below is no longer needed for the main display.
  // However, the search bar still needs to filter from the currently displayed filteredProducts.
  const searchBarFilteredProducts = useMemo(() => {
    if (!searchQuery) return filteredProducts; // If no search query, show all products from MasterFilterSystem
    const searchTerms = searchQuery.toLowerCase().split(' ').filter(term => term.length > 0);
    return filteredProducts.filter(p =>
      searchTerms.every(term =>
        p.pieceNumber.toLowerCase().includes(term) ||
        p.description.toLowerCase().includes(term) ||
        p.brand.toLowerCase().includes(term) ||
        p.model.toLowerCase().includes(term) ||
        (p.barcode && p.barcode.toLowerCase().includes(term))
      )
    );
  }, [filteredProducts, searchQuery]);


  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.productId === product.id);
      if (existing) {
        return prev.map(item =>
          item.productId === product.id
            ? { ...item, quantity: item.quantity + 1, subtotal: (item.quantity + 1) * item.price }
            : item
        );
      }
      return [...prev, {
        productId: product.id,
        pieceNumber: product.pieceNumber,
        description: product.description,
        quantity: 1,
        price: product.salePrice,
        subtotal: product.salePrice,
        imageUrl: product.imageUrl
      }];
    });
    setShowSearchResults(false);
    setSearchQuery('');
  };

  const updateQuantity = (productId: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.productId === productId) {
        const newQty = Math.max(0, item.quantity + delta);
        return { ...item, quantity: newQty, subtotal: newQty * item.price };
      }
      return item;
    }).filter(item => item.quantity > 0));
  };

  const removeFromCart = (productId: string) => {
    setCart(prev => prev.filter(item => item.productId !== productId));
  };

  const subtotal = cart.reduce((sum, item) => sum + item.subtotal, 0);
  const tax = subtotal * 0.16;
  const total = subtotal + tax - discount;

  const handleCheckout = () => {
    if (cart.length === 0) return;
    setIsProcessing(true);
    try {
      const saleId = `sale-${Date.now()}`;

      const saleData: Sale = {
        id: saleId,
        customerId: selectedCustomer?.id,
        items: cart,
        subtotal,
        discount,
        tax,
        total,
        paymentMethod,
        status: 'COMPLETED',
        timestamp: new Date().toISOString(),
        sellerId: user?.id || 'unknown'
      };

      saleStorage.add(saleData);
      setLastSaleId(saleId);

      // Update stock and record movements
      for (const item of cart) {
        const product = productStorage.getById(item.productId);
        if (product) {
          product.stock = Math.max(0, product.stock - item.quantity);
          productStorage.update(product);

          // Record movement
          // inventoryMovementStorage.add({ // This was removed from imports, so commenting out or removing this block
          //   id: `movement-${Date.now()}-${item.productId}`,
          //   productId: item.productId,
          //   type: 'OUT',
          //   quantity: item.quantity,
          //   reason: `Venta #${saleId.slice(-6)}`,
          //   timestamp: new Date().toISOString(),
          //   userId: user?.id || 'unknown'
          // });
        }
      }

      setCart([]);
      setSelectedCustomer(null);
      setDiscount(0);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);

      // Refresh products to show updated stock
      setProducts(productStorage.getAll());
      setFilteredProducts(productStorage.getAll()); // Also refresh filtered products
    } catch (error) {
      console.error('Error during checkout:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="h-full flex flex-col gap-6">
      {/* Top Bar - Smart Search */}
      <div className="relative z-40" ref={searchRef}>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center bg-white rounded-2xl shadow-sm border border-gray-100 p-1 gap-2 sm:gap-0">
          <div className="flex-1 flex items-center px-4">
            <Search size={22} className="text-gray-400 mr-3 shrink-0" />
              <input
                type="text"
                placeholder="Buscar por número de pieza, descripción, marca, modelo o código..."
                className="w-full py-3 bg-transparent border-none outline-none text-base sm:text-lg font-medium"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setShowSearchResults(true);
                }}
                onFocus={() => setShowSearchResults(true)}
              />
              {searchQuery && (
                <button 
                  onClick={() => {
                    setSearchQuery('');
                    setShowSearchResults(false);
                  }}
                  className="p-2 text-gray-400 hover:text-gray-600 rounded-xl transition-all mr-1"
                >
                  <X size={20} />
                </button>
              )}
              <button 
                onClick={() => setIsBarcodeScannerOpen(true)}
                className="p-2 text-primary hover:bg-primary/5 rounded-xl transition-all mr-2"
                title="Escanear Código de Barras"
              >
                <Barcode size={24} />
              </button>
            </div>
          <button className="flex items-center justify-center gap-2 px-6 py-3 bg-gray-50 text-gray-600 rounded-xl font-semibold hover:bg-gray-100 transition-colors">
            <Filter size={18} />
            Filtros Avanzados
          </button>
        </div>

        <AnimatePresence>
          {showSearchResults && searchQuery.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden max-h-[500px] overflow-y-auto"
            >
              {filteredProducts.length > 0 ? (
                <div className="divide-y divide-gray-50">
                  {filteredProducts.map(product => (
                    <button
                      key={product.id}
                      onClick={() => addToCart(product)}
                      className="w-full flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors text-left group"
                    >
                      <div className="w-16 h-16 rounded-xl bg-gray-100 flex items-center justify-center overflow-hidden shrink-0 border border-gray-100">
                        {product.imageUrl ? (
                          <img src={product.imageUrl} alt={product.pieceNumber} className="w-full h-full object-cover" />
                        ) : (
                          <Package size={24} className="text-gray-400" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-bold text-gray-900 truncate">{product.pieceNumber}</span>
                          <span className="font-bold text-primary">{formatCurrency(product.salePrice)}</span>
                        </div>
                        <p className="text-sm text-gray-500 truncate">{product.description}</p>
                        <div className="flex items-center gap-3 mt-1">
                          {product.barcode && (
                            <div className="flex items-center gap-1 text-[10px] font-mono text-primary bg-primary/5 px-1.5 py-0.5 rounded">
                              <Barcode size={10} />
                              {product.barcode}
                            </div>
                          )}
                          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 bg-gray-100 text-gray-500 rounded-full">
                            {product.brand}
                          </span>
                          <span className={cn(
                            "text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full",
                            product.stock > product.minStock ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"
                          )}>
                            Stock: {product.stock}
                          </span>
                          <span className="text-[10px] font-bold text-gray-400">
                            Ubicación: {product.location}
                          </span>
                        </div>
                      </div>
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center shadow-lg">
                          <Plus size={20} />
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="p-12 text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 text-gray-400 mb-4">
                    <Search size={32} />
                  </div>
                  <p className="text-gray-500 font-medium">No se encontraron productos para "{searchQuery}"</p>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row gap-6 overflow-hidden">
        {/* Left Section - Product Grid (60%) */}
        <div className="flex-[3] flex flex-col gap-6 overflow-hidden min-h-[300px] lg:min-h-0">
          {/* Categories & Brands */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
              <button 
                onClick={() => setSelectedCategory(null)}
                className={cn(
                  "px-4 py-2 rounded-xl text-sm font-semibold whitespace-nowrap transition-all",
                  !selectedCategory ? "bg-primary text-white shadow-lg" : "bg-white text-gray-500 hover:bg-gray-100"
                )}
              >
                Todos
              </button>
              {CATEGORIES.map(cat => (
                <button 
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={cn(
                    "px-4 py-2 rounded-xl text-sm font-semibold whitespace-nowrap transition-all",
                    selectedCategory === cat ? "bg-primary text-white shadow-lg" : "bg-white text-gray-500 hover:bg-gray-100"
                  )}
                >
                  {cat}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
              {BRANDS.map(brand => (
                <button 
                  key={brand}
                  onClick={() => setSelectedBrand(selectedBrand === brand ? null : brand)}
                  className={cn(
                    "px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-all border-2",
                    selectedBrand === brand ? "border-primary bg-primary/5 text-primary" : "border-transparent bg-white text-gray-400 hover:bg-gray-100"
                  )}
                >
                  {brand}
                </button>
              ))}
            </div>
          </div>

          {/* Product Grid */}
          <div className="flex-1 overflow-y-auto pr-2">
            <div className="pos-grid">
              {filteredProducts.map(product => (
                <motion.button
                  layout
                  key={product.id}
                  onClick={() => addToCart(product)}
                  className="bg-white rounded-2xl p-4 text-left border border-gray-100 hover:border-primary hover:shadow-xl transition-all group relative overflow-hidden"
                >
                  <div className="aspect-square rounded-xl bg-gray-50 mb-3 flex items-center justify-center overflow-hidden border border-gray-50">
                    {product.imageUrl ? (
                      <img src={product.imageUrl} alt={product.pieceNumber} className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                    ) : (
                      <Tractor size={32} className="text-gray-300" />
                    )}
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{product.brand}</p>
                    <h3 className="font-bold text-gray-900 truncate">{product.pieceNumber}</h3>
                    <p className="text-xs text-gray-500 line-clamp-2 h-8">{product.description}</p>
                    <div className="flex items-center justify-between pt-2">
                      <span className="font-bold text-primary">{formatCurrency(product.salePrice)}</span>
                      <div className={cn(
                        "w-2 h-2 rounded-full",
                        product.stock > product.minStock ? "bg-green-500" : "bg-red-500"
                      )}></div>
                    </div>
                  </div>
                  
                  {/* Quick Add Overlay */}
                  <div className="absolute inset-0 bg-primary/0 group-hover:bg-primary/5 transition-colors pointer-events-none" />
                </motion.button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Section - Ticket (40%) */}
        <div className="flex-[2] flex flex-col bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden ticket-shadow min-h-[400px] lg:min-h-0">
          {/* Ticket Header */}
          <div className="p-6 border-b border-gray-50 flex items-center justify-between bg-gray-50/50">
            <div>
              <h3 className="font-bold text-gray-900">Ticket de Venta</h3>
              <p className="text-xs text-gray-400 font-medium">#{new Date().getTime().toString().slice(-6)}</p>
            </div>
            <button 
              onClick={() => setCart([])}
              className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
            >
              <Trash2 size={20} />
            </button>
          </div>

          {/* Customer Selection */}
          <div className="p-4 border-b border-gray-50">
            <div className="flex items-center gap-2">
              <div className="flex-1 relative">
                <select 
                  className="w-full pl-10 pr-4 py-2 bg-gray-100 rounded-xl text-sm font-medium border-none outline-none appearance-none"
                  value={selectedCustomer?.id || ''}
                  onChange={(e) => {
                    const customer = customers.find(c => c.id === e.target.value);
                    setSelectedCustomer(customer || null);
                  }}
                >
                  <option value="">Cliente Mostrador</option>
                  {customers.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
                <UserPlus size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>
              <button className="p-2 bg-primary text-white rounded-xl shadow-lg shadow-primary/20">
                <Plus size={20} />
              </button>
            </div>
            {selectedCustomer && (
              <div className="mt-2 px-3 py-2 bg-blue-50 rounded-lg flex items-center justify-between">
                <span className="text-xs font-bold text-blue-700">Crédito: {formatCurrency(selectedCustomer.creditLimit - selectedCustomer.balance)}</span>
                <span className="text-[10px] font-bold text-blue-500 uppercase tracking-wider">Días: {selectedCustomer.creditDays}</span>
              </div>
            )}
          </div>

          {/* Cart Items */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {cart.length > 0 ? (
              cart.map(item => (
                <div key={item.productId} className="flex gap-3 group">
                  <div className="w-12 h-12 rounded-lg bg-gray-50 flex items-center justify-center overflow-hidden shrink-0 border border-gray-50">
                    {item.imageUrl ? (
                      <img src={item.imageUrl} alt={item.pieceNumber} className="w-full h-full object-cover" />
                    ) : (
                      <Package size={20} className="text-gray-300" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="font-bold text-sm text-gray-900 truncate">{item.pieceNumber}</span>
                      <span className="font-bold text-sm text-gray-900">{formatCurrency(item.subtotal)}</span>
                    </div>
                    <p className="text-[10px] text-gray-400 truncate mb-2">{item.description}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center bg-gray-100 rounded-lg p-0.5">
                        <button 
                          onClick={() => updateQuantity(item.productId, -1)}
                          className="p-1 text-gray-500 hover:bg-white hover:shadow-sm rounded-md transition-all"
                        >
                          <Minus size={14} />
                        </button>
                        <span className="px-3 text-xs font-bold text-gray-700">{item.quantity}</span>
                        <button 
                          onClick={() => updateQuantity(item.productId, 1)}
                          className="p-1 text-gray-500 hover:bg-white hover:shadow-sm rounded-md transition-all"
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                      <button 
                        onClick={() => removeFromCart(item.productId)}
                        className="text-gray-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center opacity-30">
                <ShoppingCart size={64} className="mb-4" />
                <p className="font-bold">Carrito Vacío</p>
                <p className="text-xs">Agrega productos para comenzar</p>
              </div>
            )}
          </div>

          {/* Summary & Checkout */}
          <div className="p-6 bg-gray-50/80 border-t border-gray-100 space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-gray-500">
                <span>Subtotal</span>
                <span className="font-medium">{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm text-gray-500">
                <span>IVA (16%)</span>
                <span className="font-medium">{formatCurrency(tax)}</span>
              </div>
              <div className="flex justify-between items-center text-sm text-gray-500">
                <span>Descuento</span>
                <input 
                  type="number" 
                  value={discount}
                  onChange={(e) => setDiscount(Number(e.target.value))}
                  className="w-20 text-right bg-transparent border-b border-gray-200 focus:border-primary outline-none font-medium"
                />
              </div>
              <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                <span className="text-lg font-bold text-gray-900">Total</span>
                <span className="text-2xl font-black text-primary">{formatCurrency(total)}</span>
              </div>
            </div>

            <div className="flex gap-2">
              <button 
                onClick={() => setIsCheckoutModalOpen(true)}
                disabled={cart.length === 0 || isProcessing}
                className="flex-1 flex items-center justify-center gap-2 py-4 bg-primary text-white rounded-2xl font-bold text-lg shadow-xl shadow-primary/20 hover:opacity-90 transition-all disabled:opacity-50 disabled:shadow-none"
              >
                <CheckCircle2 size={24} />
                EJECUTAR VENTA
              </button>
              <button className="p-4 bg-white border border-gray-200 text-gray-600 rounded-2xl hover:bg-gray-50 transition-all">
                <Printer size={24} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Checkout Modal - Cerrar Venta */}
      <AnimatePresence>
        {isCheckoutModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col"
            >
              <div className="p-6 border-b border-gray-50 flex items-center justify-between bg-gray-50/50">
                <h3 className="text-xl font-bold text-gray-900">Cerrar Venta</h3>
                <button 
                  onClick={() => setIsCheckoutModalOpen(false)}
                  className="p-2 text-gray-400 hover:bg-white rounded-xl transition-all"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="p-8 space-y-8 overflow-y-auto">
                {/* Summary */}
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500 font-medium">Subtotal</span>
                    <span className="text-gray-900 font-bold">{formatCurrency(subtotal)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500 font-medium">IVA (16%)</span>
                    <span className="text-gray-900 font-bold">{formatCurrency(tax)}</span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between items-center text-red-500">
                      <span className="font-medium">Descuento</span>
                      <span className="font-bold">-{formatCurrency(discount)}</span>
                    </div>
                  )}
                  <div className="pt-4 border-t border-gray-100 flex justify-between items-center">
                    <span className="text-xl font-black text-gray-900 uppercase tracking-tight">Total a Pagar</span>
                    <span className="text-4xl font-black text-primary">{formatCurrency(total)}</span>
                  </div>
                </div>

                {/* Payment Methods */}
                <div className="space-y-4">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Método de Pago</p>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { id: 'EFECTIVO', icon: Banknote, label: 'Efectivo' },
                      { id: 'TARJETA', icon: CreditCard, label: 'Tarjeta' },
                      { id: 'TRANSFERENCIA', icon: ArrowRightLeft, label: 'Transf.' },
                      { id: 'CRÉDITO', icon: Clock, label: 'Crédito' },
                    ].map(method => (
                      <button
                        key={method.id}
                        onClick={() => setPaymentMethod(method.id as any)}
                        className={cn(
                          "flex items-center gap-3 p-4 rounded-2xl border-2 transition-all text-left",
                          paymentMethod === method.id 
                            ? "border-primary bg-primary/5 text-primary shadow-md" 
                            : "border-gray-100 bg-white text-gray-500 hover:border-gray-200"
                        )}
                      >
                        <div className={cn(
                          "w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
                          paymentMethod === method.id ? "bg-primary text-white" : "bg-gray-100 text-gray-400"
                        )}>
                          <method.icon size={20} />
                        </div>
                        <span className="font-bold text-sm">{method.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Customer Info */}
                <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center text-gray-400 shadow-sm">
                    <UserPlus size={24} />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Cliente</p>
                    <p className="font-bold text-gray-900">{selectedCustomer?.name || 'Venta al Público'}</p>
                  </div>
                </div>
              </div>

              <div className="p-6 bg-gray-50 border-t border-gray-100 flex gap-3">
                <button 
                  onClick={() => setIsCheckoutModalOpen(false)}
                  className="flex-1 py-4 bg-white border border-gray-200 text-gray-600 rounded-2xl font-bold hover:bg-gray-100 transition-all"
                >
                  Regresar
                </button>
                <button
                  onClick={() => {
                    handleCheckout();
                    setIsCheckoutModalOpen(false);
                  }}
                  disabled={isProcessing}
                  className="flex-[2] py-4 bg-primary text-white rounded-2xl font-black text-lg shadow-xl shadow-primary/20 hover:opacity-90 transition-all disabled:opacity-50"
                >
                  {isProcessing ? (
                    <div className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin mx-auto" />
                  ) : (
                    'CONFIRMAR PAGO'
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Success Overlay */}
      <AnimatePresence>
        {showSuccess && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/20 backdrop-blur-sm"
          >
            <div className="bg-white rounded-3xl p-12 text-center shadow-2xl max-w-sm w-full">
              <div className="w-24 h-24 rounded-full bg-green-100 text-green-600 flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 size={64} />
              </div>
              <h2 className="text-3xl font-black text-gray-900 mb-2">¡Venta Exitosa!</h2>
              <p className="text-gray-500 mb-8">El inventario ha sido actualizado y el ticket generado.</p>
              
              <div className="space-y-3">
                <button 
                  onClick={() => {
                    setShowSuccess(false);
                    setShowInvoiceModal(true);
                  }}
                  className="w-full py-4 bg-primary text-white rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-primary/20"
                >
                  <Receipt size={20} />
                  Facturar Venta (CFDI)
                </button>
                <button 
                  onClick={() => setShowSuccess(false)}
                  className="w-full py-4 bg-gray-100 text-gray-600 rounded-2xl font-bold hover:bg-gray-200 transition-colors"
                >
                  Nueva Venta
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {showInvoiceModal && lastSaleId && (
        <InvoiceGenerator 
          saleId={lastSaleId} 
          onClose={() => setShowInvoiceModal(false)} 
        />
      )}

      {isBarcodeScannerOpen && (
        <BarcodeScanner 
          onScan={(code) => {
            setSearchQuery(code);
            setShowSearchResults(true);
          }}
          onClose={() => setIsBarcodeScannerOpen(false)}
        />
      )}
    </div>
  );
};

const BarcodeScanner: React.FC<{ onScan: (code: string) => void, onClose: () => void }> = ({ onScan, onClose }) => {
  const [error, setError] = useState<string | null>(null);
  const scannerRef = useRef<Html5Qrcode | null>(null);

  useEffect(() => {
    let isMounted = true;
    
    const startScanner = async () => {
      // Small delay to ensure the container is rendered
      await new Promise(resolve => setTimeout(resolve, 800));
      
      if (!isMounted) return;

      const elementId = "pos-reader";
      const element = document.getElementById(elementId);
      
      if (!element) {
        console.error(`Element with id=${elementId} not found`);
        return;
      }

      try {
        const html5QrCode = new Html5Qrcode(elementId);
        scannerRef.current = html5QrCode;

        const config = {
          fps: 20,
          qrbox: (viewfinderWidth: number, viewfinderHeight: number) => {
            const minEdge = Math.min(viewfinderWidth, viewfinderHeight);
            const size = Math.floor(minEdge * 0.8);
            return { width: size, height: size };
          },
          aspectRatio: 1.0
        };

        const onScanSuccess = (decodedText: string) => {
          onScan(decodedText);
          html5QrCode.stop().then(() => {
            if (isMounted) onClose();
          }).catch(() => {
            if (isMounted) onClose();
          });
        };

        try {
          // Try with environment camera first
          await html5QrCode.start({ facingMode: "environment" }, config, onScanSuccess, undefined);
        } catch (envErr) {
          console.warn("Failed to start with environment camera, trying fallback...", envErr);
          if (!isMounted) return;
          
          try {
            // Fallback: Try with any available camera
            await html5QrCode.start({ facingMode: "user" }, config, onScanSuccess, undefined);
          } catch (userErr) {
            console.warn("Failed to start with user camera, trying generic start...", userErr);
            if (!isMounted) return;
            
            // Final fallback: Get all cameras and try the first one
            const devices = await Html5Qrcode.getCameras();
            if (devices && devices.length > 0) {
              await html5QrCode.start(devices[0].id, config, onScanSuccess, undefined);
            } else {
              throw new Error("No se encontraron cámaras disponibles.");
            }
          }
        }
      } catch (err) {
        if (!isMounted) return;
        console.error("Error starting scanner:", err);
        const errorMessage = err instanceof Error ? err.message : String(err);
        if (errorMessage.includes("NotReadableError") || errorMessage.includes("Could not start video source")) {
          setError("La cámara está siendo usada por otra aplicación o pestaña. Por favor, ciérrala e intenta de nuevo.");
        } else if (errorMessage.includes("NotAllowedError") || errorMessage.includes("Permission denied")) {
          setError("Permiso de cámara denegado. Por favor, habilita el acceso a la cámara en tu navegador.");
        } else {
          setError("No se pudo acceder a la cámara. Por favor, verifica los permisos o intenta recargar la página.");
        }
      }
    };

    startScanner();

    return () => {
      isMounted = false;
      if (scannerRef.current) {
        const scanner = scannerRef.current;
        if (scanner.isScanning) {
          scanner.stop().then(() => {
            scanner.clear();
          }).catch(err => console.error("Error stopping scanner:", err));
        } else {
          scanner.clear();
        }
      }
    };
  }, [onScan, onClose]);

  return (
    <div className="fixed inset-0 z-[250] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
      <div className="bg-white rounded-3xl overflow-hidden w-full max-w-sm relative shadow-2xl">
        <div className="p-4 border-b flex justify-between items-center bg-gray-50">
          <h3 className="font-bold text-gray-900">Escaneando Código...</h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-xl transition-all"><X size={20} /></button>
        </div>
        
        {error ? (
          <div className="p-8 text-center space-y-4">
            <div className="w-16 h-16 bg-red-100 text-red-600 rounded-2xl flex items-center justify-center mx-auto">
              <AlertTriangle size={32} />
            </div>
            <p className="text-sm text-gray-600 font-medium">{error}</p>
            <button 
              onClick={onClose}
              className="w-full py-3 bg-gray-100 text-gray-600 rounded-xl font-bold hover:bg-gray-200 transition-all"
            >
              Cerrar
            </button>
          </div>
        ) : (
          <>
            <div id="pos-reader" className="w-full aspect-square bg-black"></div>
            <div className="p-6 text-center">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-bold mb-2">
                <Barcode size={14} />
                Lector Activo
              </div>
              <p className="text-sm text-gray-500">
                Apunta la cámara al código de barras del producto
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
