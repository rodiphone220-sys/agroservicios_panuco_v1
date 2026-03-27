import React, { useState, useEffect, useRef } from 'react';
import { 
  Package, 
  Plus, 
  Search, 
  Filter, 
  MoreVertical, 
  AlertTriangle, 
  ArrowUpRight, 
  ArrowDownLeft, 
  History,
  Edit2,
  Trash2,
  ChevronRight,
  ChevronLeft,
  X,
  Save,
  Image as ImageIcon,
  Camera,
  Loader2,
  CheckCircle2,
  Barcode
} from 'lucide-react';
import { GoogleGenAI } from "@google/genai";
import { Html5Qrcode } from "html5-qrcode";
import { productStorage, customerStorage, vendorStorage, inventoryMovementStorage } from '../lib/localStorage';
import { Product, InventoryMovement, Vendor } from '../types';
import { cn, formatCurrency, formatDate } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { InventoryHistory } from './InventoryHistory';
import { MasterFilterSystem } from './Common/MasterFilterSystem';

const BRANDS = ["MF", "JD", "NH", "Ford", "Case", "Perkins"];

export const Inventory: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const [movements, setMovements] = useState<InventoryMovement[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [notification, setNotification] = useState<{ message: string, type: 'success' | 'error' } | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [isBarcodeScannerOpen, setIsBarcodeScannerOpen] = useState(false);
  const [filterLowStock, setFilterLowStock] = useState(false);
  const [vendors, setVendors] = useState<Vendor[]>([]);

  useEffect(() => {
    const fetchVendors = () => {
      try {
        const allVendors = vendorStorage.getAll();
        setVendors(allVendors.sort((a, b) => a.name.localeCompare(b.name)));
      } catch (error) {
        console.error("Error fetching vendors:", error);
      }
    };
    fetchVendors();
  }, []);

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result?.toString().split(',')[1] || '');
      reader.onerror = error => reject(error);
    });
  };

  const handleScan = async (file: File) => {
    setIsScanning(true);
    setScanProgress(0);
    try {
      const base64Data = await fileToBase64(file);
      
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        throw new Error('La clave de API de Gemini no está configurada. Por favor, revisa la configuración del entorno.');
      }

      const ai = new GoogleGenAI({ apiKey });
      
      // Simulate progress since we don't have OCR progress anymore
      const progressInterval = setInterval(() => {
        setScanProgress(prev => Math.min(prev + 5, 90));
      }, 200);

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: {
          parts: [
            {
              text: `Analyze this image of an agricultural spare part. 
              CASE 1: If it's a label, extract the piece number, brand, and details.
              CASE 2: If it's just the part (no label), identify the part visually (e.g., "Bomba de agua para MF 285", "Filtro de aceite John Deere").
              
              You may use Google Search to find current market prices and technical specifications if needed.
              
              Return a JSON object with: pieceNumber, description, brand, suggestedSalePrice, suggestedPurchasePrice, category, model. 
              Brands MUST be one of: ${BRANDS.join(', ')}. 
              If you identify the part visually but don't see a piece number, try to provide a likely one or leave it empty.
              Provide a professional description in Spanish.`
            },
            {
              inlineData: {
                mimeType: file.type,
                data: base64Data
              }
            }
          ]
        },
        config: { 
          responseMimeType: "application/json",
          tools: [{ googleSearch: {} }]
        }
      });

      clearInterval(progressInterval);
      setScanProgress(100);

      const result = JSON.parse(response.text || '{}');
      setFormData(prev => ({
        ...prev,
        pieceNumber: result.pieceNumber || prev.pieceNumber,
        description: result.description || prev.description,
        brand: BRANDS.includes(result.brand) ? result.brand : prev.brand,
        salePrice: result.suggestedSalePrice || prev.salePrice,
        purchasePrice: result.suggestedPurchasePrice || prev.purchasePrice,
        category: result.category || prev.category,
        model: result.model || prev.model,
        imageUrl: `data:${file.type};base64,${base64Data}`
      }));
    } catch (error) {
      console.error('Scan error:', error);
      let message = 'Error al analizar la imagen. Por favor, intenta de nuevo.';
      if (error instanceof Error) {
        if (error.message.includes('Failed to fetch')) {
          message = 'Error de conexión con el servicio de IA. Por favor, verifica tu conexión a internet o intenta más tarde.';
        } else {
          message = error.message;
        }
      }
      setNotification({ message, type: 'error' });
    } finally {
      setIsScanning(false);
      setScanProgress(0);
    }
  };

  // Form state
  const [formData, setFormData] = useState<Partial<Product>>({
    pieceNumber: '',
    description: '',
    brand: 'MF',
    model: '',
    category: 'Motor',
    purchasePrice: 0,
    salePrice: 0,
    stock: 0,
    minStock: 5,
    maxStock: 50,
    location: '',
    imageUrl: '',
    barcode: '',
    vendorId: '',
    leadTime: 7
  });

  const refreshData = () => {
    setProducts(productStorage.getAll());
    setMovements(inventoryMovementStorage.getAll());
  };

  useEffect(() => {
    refreshData();
  }, [isModalOpen]);

  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);

  useEffect(() => {
    setFilteredProducts(products);
  }, [products]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingProduct) {
        const oldStock = editingProduct.stock;
        const newStock = formData.stock || 0;
        
        const updatedProduct = { ...editingProduct, ...formData } as Product;
        productStorage.update(updatedProduct);
        
        // Record movement if stock changed
        if (oldStock !== newStock) {
          const diff = newStock - oldStock;
          inventoryMovementStorage.add({
            id: `movement-${Date.now()}`,
            productId: editingProduct.id,
            type: diff > 0 ? 'IN' : 'OUT',
            quantity: Math.abs(diff),
            reason: 'Ajuste manual de inventario',
            timestamp: new Date().toISOString(),
            userId: 'demo-user'
          });
        }
        
        setNotification({ message: 'Producto actualizado correctamente', type: 'success' });
      } else {
        const newId = `prod-${Date.now()}`;
        const newProduct = { ...formData, id: newId } as Product;
        productStorage.add(newProduct);
        
        // Record initial stock if > 0
        if ((formData.stock || 0) > 0) {
          inventoryMovementStorage.add({
            id: `movement-${Date.now()}`,
            productId: newId,
            type: 'IN',
            quantity: formData.stock || 0,
            reason: 'Inventario inicial',
            timestamp: new Date().toISOString(),
            userId: 'demo-user'
          });
        }
        
        setNotification({ message: 'Producto creado correctamente', type: 'success' });
      }
      refreshData();
      setIsModalOpen(false);
      setEditingProduct(null);
      setFormData({
        pieceNumber: '',
        description: '',
        brand: 'MF',
        model: '',
        category: 'Motor',
        purchasePrice: 0,
        salePrice: 0,
        stock: 0,
        minStock: 5,
        maxStock: 50,
        location: '',
        imageUrl: '',
        barcode: '',
        vendorId: '',
        leadTime: 7
      });
    } catch (error) {
      console.error('Error saving product:', error);
      setNotification({ message: 'Error al guardar el producto.', type: 'error' });
    }
  };

  const handleDelete = (id: string) => {
    try {
      productStorage.delete(id);
      setDeleteConfirm(null);
      setNotification({ message: 'Producto eliminado correctamente', type: 'success' });
      refreshData();
    } catch (error) {
      console.error('Error deleting product:', error);
      setNotification({ message: 'Error al eliminar el producto.', type: 'error' });
    }
  };

  const openEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData(product);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Productos', value: products.length, icon: Package, color: 'bg-blue-500' },
          { label: 'Stock Bajo', value: products.filter(p => p.stock <= p.minStock).length, icon: AlertTriangle, color: 'bg-amber-500' },
          { label: 'Valor Inventario', value: formatCurrency(products.reduce((sum, p) => sum + (p.purchasePrice * p.stock), 0)), icon: ArrowUpRight, color: 'bg-green-500' },
          { label: 'Movimientos Hoy', value: movements.filter(m => formatDate(m.timestamp).includes(formatDate(new Date()).split(' ')[0])).length, icon: History, color: 'bg-purple-500' },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
            <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center text-white shadow-lg", stat.color)}>
              <stat.icon size={24} />
            </div>
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">{stat.label}</p>
              <p className="text-xl font-black text-gray-900">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Advanced Filters */}
      <MasterFilterSystem 
        data={products} 
        onFilterChange={setFilteredProducts} 
        moduleName="Inventario"
        onExport={(data) => {
            const headers = ["ID", "Parte", "Descripcion", "Marca", "Categoria", "Costo", "Venta", "Stock", "Ubicacion"];
            const rows = data.map(i => [i.id, i.pieceNumber, i.description, i.brand, i.category, i.purchasePrice, i.salePrice, i.stock, i.location]);
            const content = [headers, ...rows].map(e => e.join(",")).join("\n");
            const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.download = `Reporte_Inventario_${new Date().toLocaleDateString()}.csv`;
            link.click();
        }}
      />

      <div className="flex flex-wrap gap-2 w-full lg:w-auto">
          <button 
            onClick={() => setFilterLowStock(!filterLowStock)}
            className={cn(
              "flex-1 lg:flex-none flex items-center justify-center gap-2 px-4 sm:px-6 py-3 rounded-xl font-semibold border transition-all text-sm sm:text-base",
              filterLowStock 
                ? "bg-red-50 text-red-600 border-red-100 shadow-sm" 
                : "bg-white text-gray-600 border-gray-100 hover:bg-gray-50"
            )}
          >
            <AlertTriangle size={20} />
            <span className="hidden sm:inline">Stock Bajo</span>
            <span className="sm:hidden">Bajo</span>
          </button>
          <button 
            onClick={() => setShowHistory(true)}
            className="flex-1 lg:flex-none flex items-center justify-center gap-2 px-4 sm:px-6 py-3 bg-white text-gray-600 rounded-xl font-semibold border border-gray-100 hover:bg-gray-50 transition-all text-sm sm:text-base"
          >
            <History size={20} />
            Historial
          </button>
          <button 
            onClick={() => {
              setEditingProduct(null);
              setFormData({
                pieceNumber: '',
                description: '',
                brand: 'MF',
                model: '',
                category: 'Motor',
                purchasePrice: 0,
                salePrice: 0,
                stock: 0,
                minStock: 5,
                maxStock: 50,
                location: '',
                imageUrl: '',
                barcode: '',
                vendorId: '',
                leadTime: 7
              });
              setIsModalOpen(true);
            }}
            className="flex-1 lg:flex-none flex items-center justify-center gap-2 px-4 sm:px-6 py-3 bg-primary text-white rounded-xl font-semibold shadow-lg shadow-primary/20 hover:opacity-90 transition-all text-sm sm:text-base"
          >
            Nuevo
          </button>
        </div>

      <AnimatePresence>
        {showHistory && (
          <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="w-full max-w-6xl h-full flex flex-col">
              <InventoryHistory onClose={() => setShowHistory(false)} />
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* Product Table */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-50">
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Producto</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Marca/Modelo</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Categoría</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest text-right">Precio Venta</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest text-center">Stock</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Ubicación</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredProducts.map(product => (
                <tr key={product.id} className="hover:bg-gray-50/50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center overflow-hidden shrink-0">
                        {product.imageUrl ? (
                          <img src={product.imageUrl} alt={product.pieceNumber} className="w-full h-full object-cover" />
                        ) : (
                          <Package size={20} className="text-gray-400" />
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-bold text-gray-900">{product.pieceNumber}</p>
                          {product.stock <= product.minStock && (
                            <span className="px-1.5 py-0.5 bg-red-100 text-red-600 text-[9px] font-black rounded uppercase flex items-center gap-1 shrink-0">
                              <AlertTriangle size={10} />
                              Bajo
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-500 truncate max-w-[200px]">{product.description}</p>
                        {product.barcode && (
                          <div className="flex items-center gap-1 mt-1 text-[10px] font-mono text-primary bg-primary/5 px-1.5 py-0.5 rounded w-fit">
                            <Barcode size={10} />
                            {product.barcode}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-xs font-bold text-gray-700 bg-gray-100 px-2 py-1 rounded-md mr-2">{product.brand}</span>
                    <span className="text-xs text-gray-500">{product.model}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-xs font-medium text-gray-600">{product.category}</span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <p className="font-bold text-gray-900">{formatCurrency(product.salePrice)}</p>
                    <p className="text-[10px] text-gray-400 font-bold">Costo: {formatCurrency(product.purchasePrice)}</p>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className={cn(
                      "inline-flex items-center justify-center px-3 py-1 rounded-full text-xs font-black",
                      product.stock <= product.minStock ? "bg-red-100 text-red-600" : "bg-green-100 text-green-600"
                    )}>
                      {product.stock}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-xs font-mono text-gray-500">{product.location || 'N/A'}</span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => openEdit(product)}
                        className="p-2 text-gray-400 hover:text-primary hover:bg-primary/5 rounded-lg transition-all"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button 
                        onClick={() => setDeleteConfirm(product.id)}
                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Notifications */}
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: 50, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: 50, x: '-50%' }}
            className={cn(
              "fixed bottom-8 left-1/2 z-[200] px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3 min-w-[300px]",
              notification.type === 'success' ? "bg-green-600 text-white" : "bg-red-600 text-white"
            )}
          >
            {notification.type === 'success' ? <CheckCircle2 size={20} /> : <AlertTriangle size={20} />}
            <p className="font-bold text-sm">{notification.message}</p>
            <button onClick={() => setNotification(null)} className="ml-auto p-1 hover:bg-white/20 rounded-lg transition-all">
              <X size={16} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deleteConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white rounded-3xl shadow-2xl w-full max-w-sm p-8 text-center"
            >
              <div className="w-16 h-16 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-6">
                <Trash2 size={32} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">¿Eliminar producto?</h3>
              <p className="text-gray-500 mb-8">Esta acción no se puede deshacer. El producto será eliminado permanentemente del inventario.</p>
              <div className="flex gap-3">
                <button 
                  onClick={() => setDeleteConfirm(null)}
                  className="flex-1 py-3 bg-gray-100 text-gray-600 rounded-xl font-bold hover:bg-gray-200 transition-all"
                >
                  Cancelar
                </button>
                <button 
                  onClick={() => handleDelete(deleteConfirm)}
                  className="flex-1 py-3 bg-red-600 text-white rounded-xl font-bold shadow-lg shadow-red-600/20 hover:opacity-90 transition-all"
                >
                  Eliminar
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add/Edit Modal */}
      <AnimatePresence>
        {isModalOpen && (
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
              className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden"
            >
              <div className="p-6 border-b border-gray-50 flex items-center justify-between bg-gray-50/50">
                <h3 className="text-xl font-bold text-gray-900">
                  {editingProduct ? 'Editar Producto' : 'Nuevo Producto'}
                </h3>
                <button onClick={() => setIsModalOpen(false)} className="p-2 text-gray-400 hover:bg-white rounded-xl transition-all">
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handleSave} className="p-8 space-y-6 max-h-[70vh] overflow-y-auto">
                {/* Analysis Box / Drop Zone */}
                <div 
                  onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setIsDragging(false);
                    const file = e.dataTransfer.files?.[0];
                    if (file) handleScan(file);
                  }}
                  className={cn(
                    "border-2 border-dashed rounded-3xl p-8 transition-all flex flex-col items-center justify-center gap-4 relative overflow-hidden",
                    isDragging ? "border-primary bg-primary/5 scale-[1.01]" : "border-gray-200 bg-gray-50/30",
                    isScanning && "pointer-events-none"
                  )}
                >
                  <input 
                    id="scanner-input-file"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleScan(file);
                    }}
                  />
                  <input 
                    id="scanner-input-camera"
                    type="file"
                    accept="image/*"
                    capture="environment"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleScan(file);
                    }}
                  />

                  {isScanning ? (
                    <div className="flex flex-col items-center gap-4 text-center py-4">
                      <div className="relative">
                        <Loader2 size={48} className="text-primary animate-spin" />
                        <div className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-primary">
                          {Math.round(scanProgress)}%
                        </div>
                      </div>
                      <div>
                        <p className="font-bold text-gray-900">Analizando con IA...</p>
                        <p className="text-xs text-gray-500">Identificando pieza y extrayendo datos</p>
                      </div>
                    </div>
                  ) : formData.imageUrl ? (
                    <div className="relative w-full aspect-video rounded-2xl overflow-hidden group/preview">
                      <img 
                        src={formData.imageUrl} 
                        alt="Vista previa" 
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/preview:opacity-100 transition-opacity flex items-center justify-center gap-3">
                        <button 
                          type="button"
                          onClick={() => document.getElementById('scanner-input-camera')?.click()}
                          className="p-3 bg-white rounded-full text-gray-900 hover:scale-110 transition-transform"
                          title="Cambiar foto"
                        >
                          <Camera size={20} />
                        </button>
                        <button 
                          type="button"
                          onClick={() => setFormData(prev => ({ ...prev, imageUrl: '' }))}
                          className="p-3 bg-white rounded-full text-red-600 hover:scale-110 transition-transform"
                          title="Eliminar foto"
                        >
                          <Trash2 size={20} />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shadow-inner">
                        <Camera size={24} />
                      </div>
                      <div className="text-center">
                        <p className="font-bold text-gray-900">Escaneo Inteligente</p>
                        <p className="text-xs text-gray-500 mb-4">Arrastra una imagen o selecciona una opción:</p>
                        <div className="flex gap-2">
                          <button 
                            type="button"
                            onClick={() => document.getElementById('scanner-input-camera')?.click()}
                            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-bold text-gray-700 hover:bg-gray-50 transition-all shadow-sm"
                          >
                            <Camera size={16} />
                            Tomar Foto
                          </button>
                          <button 
                            type="button"
                            onClick={() => document.getElementById('scanner-input-file')?.click()}
                            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-bold text-gray-700 hover:bg-gray-50 transition-all shadow-sm"
                          >
                            <ImageIcon size={16} />
                            Subir Imagen
                          </button>
                        </div>
                      </div>
                    </>
                  )}

                  {/* Progress Bar Overlay */}
                  {isScanning && (
                    <div className="absolute bottom-0 left-0 h-1 bg-primary transition-all duration-300" style={{ width: `${scanProgress}%` }} />
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Número de Pieza</label>
                    <input 
                      required
                      type="text" 
                      className="w-full px-4 py-3 bg-gray-50 rounded-xl border-none outline-none focus:ring-2 ring-primary/20 transition-all font-medium"
                      value={formData.pieceNumber}
                      onChange={e => setFormData({...formData, pieceNumber: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Marca</label>
                    <select 
                      className="w-full px-4 py-3 bg-gray-50 rounded-xl border-none outline-none focus:ring-2 ring-primary/20 transition-all font-medium"
                      value={formData.brand}
                      onChange={e => setFormData({...formData, brand: e.target.value})}
                    >
                      {BRANDS.map(b => <option key={b} value={b}>{b}</option>)}
                    </select>
                  </div>
                  <div className="md:col-span-2 space-y-2">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Descripción</label>
                    <textarea 
                      required
                      className="w-full px-4 py-3 bg-gray-50 rounded-xl border-none outline-none focus:ring-2 ring-primary/20 transition-all font-medium h-24 resize-none"
                      value={formData.description}
                      onChange={e => setFormData({...formData, description: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Precio Compra</label>
                    <input 
                      required
                      type="number" 
                      className="w-full px-4 py-3 bg-gray-50 rounded-xl border-none outline-none focus:ring-2 ring-primary/20 transition-all font-medium"
                      value={formData.purchasePrice}
                      onChange={e => setFormData({...formData, purchasePrice: Number(e.target.value)})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Precio Venta</label>
                    <input 
                      required
                      type="number" 
                      className="w-full px-4 py-3 bg-gray-50 rounded-xl border-none outline-none focus:ring-2 ring-primary/20 transition-all font-medium"
                      value={formData.salePrice}
                      onChange={e => setFormData({...formData, salePrice: Number(e.target.value)})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Stock Inicial</label>
                    <input 
                      required
                      type="number" 
                      className="w-full px-4 py-3 bg-gray-50 rounded-xl border-none outline-none focus:ring-2 ring-primary/20 transition-all font-medium"
                      value={formData.stock}
                      onChange={e => setFormData({...formData, stock: Number(e.target.value)})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Ubicación Almacén</label>
                    <input 
                      type="text" 
                      placeholder="Ej: P1-E4-C12"
                      className="w-full px-4 py-3 bg-gray-50 rounded-xl border-none outline-none focus:ring-2 ring-primary/20 transition-all font-medium"
                      value={formData.location}
                      onChange={e => setFormData({...formData, location: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Proveedor</label>
                    <select 
                      className="w-full px-4 py-3 bg-gray-50 rounded-xl border-none outline-none focus:ring-2 ring-primary/20 transition-all font-medium"
                      value={formData.vendorId}
                      onChange={e => setFormData({...formData, vendorId: e.target.value})}
                    >
                      <option value="">Seleccionar Proveedor</option>
                      {vendors.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Lead Time (Días)</label>
                    <input 
                      type="number" 
                      className="w-full px-4 py-3 bg-gray-50 rounded-xl border-none outline-none focus:ring-2 ring-primary/20 transition-all font-medium"
                      value={formData.leadTime}
                      onChange={e => setFormData({...formData, leadTime: Number(e.target.value)})}
                    />
                  </div>
                  <div className="md:col-span-2 space-y-2">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Código de Barras</label>
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <Barcode className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                        <input 
                          type="text" 
                          placeholder="Escanea o ingresa el código"
                          className="w-full pl-12 pr-4 py-3 bg-gray-50 rounded-xl border-none outline-none focus:ring-2 ring-primary/20 transition-all font-medium"
                          value={formData.barcode}
                          onChange={e => setFormData({...formData, barcode: e.target.value})}
                        />
                      </div>
                      <button 
                        type="button"
                        onClick={() => setIsBarcodeScannerOpen(true)}
                        className="px-4 bg-primary text-white rounded-xl font-bold shadow-lg shadow-primary/20 hover:opacity-90 transition-all flex items-center gap-2"
                      >
                        <Camera size={20} />
                        Escanear
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex gap-4 pt-4">
                  <button 
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 py-4 bg-gray-100 text-gray-600 rounded-2xl font-bold hover:bg-gray-200 transition-all"
                  >
                    Cancelar
                  </button>
                  <button 
                    type="submit"
                    className="flex-1 py-4 bg-primary text-white rounded-2xl font-bold shadow-xl shadow-primary/20 hover:opacity-90 transition-all flex items-center justify-center gap-2"
                  >
                    <Save size={20} />
                    {editingProduct ? 'Guardar Cambios' : 'Crear Producto'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {isBarcodeScannerOpen && (
        <BarcodeScanner 
          onScan={(code) => setFormData(prev => ({ ...prev, barcode: code }))}
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

      const elementId = "reader";
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
            <div id="reader" className="w-full aspect-square bg-black"></div>
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
