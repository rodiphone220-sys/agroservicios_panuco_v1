import React, { useContext, useState, useEffect, useRef } from 'react';

import { AuthContext } from './Auth';
import { 
  Tractor, 
  ShoppingCart, 
  Package, 
  Users, 
  Truck, 
  BarChart3, 
  Settings, 
  LogOut, 
  Menu, 
  X,
  Bell,
  Search,
  AlertTriangle,
  UserCheck,
  FileText,
  ShieldCheck,
  DollarSign,
  Clock,
  ScanText,
  Receipt,
  Wallet
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { MultiAssistantChat } from './Assistant/MultiAssistantChat';
import { Toaster, toast } from 'sonner';
import { productStorage } from '../lib/localStorage';
import { Product } from '../types';

interface NavItemProps {
  icon: React.ElementType;
  label: string;
  active: boolean;
  onClick: () => void;
  collapsed?: boolean;
}

const NavItem: React.FC<NavItemProps> = ({ icon: Icon, label, active, onClick, collapsed }) => (
  <button
    onClick={onClick}
    className={cn(
      "flex items-center gap-3 px-4 py-3 rounded-xl transition-all w-full text-left group relative",
      active 
        ? "bg-primary text-white shadow-lg shadow-primary/20" 
        : "text-gray-500 hover:bg-gray-100 hover:text-gray-900"
    )}
  >
    <Icon size={22} className={cn("shrink-0 transition-transform group-hover:scale-110", active && "text-white")} />
    {!collapsed && <span className="font-medium whitespace-nowrap">{label}</span>}
    {collapsed && (
      <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50">
        {label}
      </div>
    )}
  </button>
);

export const Layout: React.FC<{ 
  children: React.ReactNode; 
  activeTab: string; 
  setActiveTab: (tab: string) => void;
}> = ({ children, activeTab, setActiveTab }) => {
  const { user, signOut } = useContext(AuthContext);
  const [collapsed, setCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [lowStockCount, setLowStockCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const [lowStockProducts, setLowStockProducts] = useState<Product[]>([]);
  const prevLowStockIds = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (!user) return;

    // Check localStorage for low stock products on mount and when tab changes
    const checkStock = () => {
      const allProducts = productStorage.getAll();
      const lowStock = allProducts.filter(p => p.stock <= p.minStock);
      
      setLowStockProducts(lowStock);
      setLowStockCount(lowStock.length);
    };

    checkStock();
  }, [user, activeTab]);

  const navItems = [
    { id: 'pos', label: 'Punto de Venta', icon: ShoppingCart, roles: ['ADMIN', 'VENDEDOR', 'CAJERO', 'GERENTE'] },
    { id: 'inventory', label: 'Inventario', icon: Package, roles: ['ADMIN', 'ALMACENISTA', 'GERENTE'] },
    { id: 'ocr-reader', label: 'Lector OCR', icon: ScanText, roles: ['ADMIN', 'ALMACENISTA', 'GERENTE'] },
    { id: 'customers', label: 'Clientes', icon: Users, roles: ['ADMIN', 'VENDEDOR', 'GERENTE'] },
    { id: 'vendors', label: 'Proveedores', icon: Truck, roles: ['ADMIN', 'ALMACENISTA', 'GERENTE'] },
    { id: 'reports', label: 'Reportes', icon: BarChart3, roles: ['ADMIN', 'GERENTE'] },
    { id: 'employees', label: 'Recursos Humanos', icon: UserCheck, roles: ['ADMIN', 'GERENTE'] },
    { id: 'commissions', label: 'Comisiones', icon: DollarSign, roles: ['ADMIN', 'GERENTE'] },
    { id: 'attendance', label: 'Asistencia', icon: Clock, roles: ['ADMIN', 'GERENTE'] },
    { id: 'invoicing', label: 'Facturación', icon: FileText, roles: ['ADMIN', 'GERENTE', 'CAJERO', 'VENDEDOR'] },
    { id: 'payroll', label: 'Finanzas', icon: Wallet, roles: ['ADMIN', 'GERENTE'] },
    { id: 'professional-invoice', label: 'Facturador Pro', icon: Receipt, roles: ['ADMIN', 'GERENTE', 'CAJERO', 'VENDEDOR'] },
    { id: 'sat-config', label: 'Configuración SAT', icon: ShieldCheck, roles: ['ADMIN'] },
    { id: 'settings', label: 'Configuración del Sistema', icon: Settings, roles: ['ADMIN'] },
  ];

  const filteredNavItems = navItems.filter(item => item.roles.includes(user?.role || ''));

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Sidebar Desktop */}
      <motion.aside
        animate={{ width: collapsed ? 80 : 280 }}
        className="hidden lg:flex flex-col bg-white border-r border-gray-100 shadow-sm relative z-30"
      >
        <div className="p-6 flex items-center gap-3 border-b border-gray-50 mb-6">
          <div className="w-10 h-10 rounded-xl bg-primary text-white flex items-center justify-center shrink-0 shadow-lg">
            <Tractor size={24} />
          </div>
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="overflow-hidden"
            >
              <h1 className="font-bold text-xl text-gray-900 whitespace-nowrap">Farmer Parts</h1>
              <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">Spare Parts OS</p>
            </motion.div>
          )}
        </div>

        <nav className="flex-1 px-4 space-y-2 overflow-y-auto">
          {filteredNavItems.map((item) => (
            <NavItem
              key={item.id}
              icon={item.icon}
              label={item.label}
              active={activeTab === item.id}
              onClick={() => setActiveTab(item.id)}
              collapsed={collapsed}
            />
          ))}
        </nav>

        <div className="p-4 border-t border-gray-50 space-y-2">
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="hidden lg:flex items-center gap-3 px-4 py-3 text-gray-500 hover:bg-gray-100 rounded-xl w-full transition-all"
          >
            {collapsed ? <Menu size={22} /> : <X size={22} />}
            {!collapsed && <span className="font-medium">Colapsar</span>}
          </button>
          <button
            onClick={signOut}
            className="flex items-center gap-3 px-4 py-3 text-red-500 hover:bg-red-50 rounded-xl w-full transition-all"
          >
            <LogOut size={22} />
            {!collapsed && <span className="font-medium">Cerrar Sesión</span>}
          </button>
        </div>
      </motion.aside>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setMobileMenuOpen(false)}
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar Mobile */}
      <motion.aside
        initial={{ x: -300 }}
        animate={{ x: mobileMenuOpen ? 0 : -300 }}
        className="fixed top-0 bottom-0 left-0 w-72 bg-white z-50 lg:hidden flex flex-col shadow-2xl"
      >
        <div className="p-6 flex items-center justify-between border-b border-gray-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary text-white flex items-center justify-center shadow-lg">
              <Tractor size={24} />
            </div>
            <h1 className="font-bold text-xl text-gray-900">Farmer Parts</h1>
          </div>
          <button onClick={() => setMobileMenuOpen(false)} className="p-2 text-gray-500">
            <X size={24} />
          </button>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          {filteredNavItems.map((item) => (
            <NavItem
              key={item.id}
              icon={item.icon}
              label={item.label}
              active={activeTab === item.id}
              onClick={() => {
                setActiveTab(item.id);
                setMobileMenuOpen(false);
              }}
            />
          ))}
        </nav>
        <div className="p-4 border-t border-gray-50">
          <button
            onClick={signOut}
            className="flex items-center gap-3 px-4 py-3 text-red-500 hover:bg-red-50 rounded-xl w-full"
          >
            <LogOut size={22} />
            <span className="font-medium">Cerrar Sesión</span>
          </button>
        </div>
      </motion.aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <header className="h-16 bg-white border-b border-gray-100 px-6 flex items-center justify-between shrink-0 z-20">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-2 text-gray-500 hover:bg-gray-100 rounded-lg"
            >
              <Menu size={24} />
            </button>
            <h2 className="text-lg font-semibold text-gray-900 capitalize">
              {navItems.find(i => i.id === activeTab)?.label}
            </h2>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center bg-gray-100 rounded-full px-4 py-2 w-64">
              <Search size={18} className="text-gray-400 mr-2" />
              <input 
                type="text" 
                placeholder="Buscar global..." 
                className="bg-transparent border-none outline-none text-sm w-full"
              />
            </div>
            
            <div className="relative">
              <button 
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2 text-gray-500 hover:bg-gray-100 rounded-full relative"
              >
                <Bell size={20} />
                {lowStockCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-red-500 text-white text-[10px] flex items-center justify-center rounded-full border-2 border-white font-bold">
                    {lowStockCount}
                  </span>
                )}
              </button>

              <AnimatePresence>
                {showNotifications && lowStockCount > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute top-full right-0 mt-2 w-80 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-[100]"
                  >
                    <div className="p-4 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
                      <h3 className="font-bold text-sm text-gray-900">Alertas de Stock</h3>
                      <span className="px-2 py-0.5 bg-red-100 text-red-600 text-[10px] font-bold rounded-full uppercase">
                        {lowStockCount} Críticos
                      </span>
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                      {lowStockProducts.map(product => (
                        <button
                          key={product.id}
                          onClick={() => {
                            setActiveTab('inventory');
                            setShowNotifications(false);
                          }}
                          className="w-full p-4 hover:bg-gray-50 flex items-start gap-3 border-b border-gray-50 last:border-0 text-left transition-colors"
                        >
                          <div className="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center shrink-0">
                            <AlertTriangle size={20} className="text-red-500" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-gray-900 truncate">{product.description}</p>
                            <p className="text-xs text-gray-500 mt-0.5">
                              Stock: <span className="font-bold text-red-500">{product.stock}</span> / Mín: {product.minStock}
                            </p>
                            <p className="text-[10px] text-gray-400 mt-1 uppercase font-bold tracking-wider">
                              {product.pieceNumber} • {product.brand}
                            </p>
                          </div>
                        </button>
                      ))}
                    </div>
                    <button 
                      onClick={() => {
                        setActiveTab('inventory');
                        setShowNotifications(false);
                      }}
                      className="w-full p-3 text-center text-xs font-bold text-primary hover:bg-gray-50 transition-colors"
                    >
                      Ir al Inventario Completo
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="flex items-center gap-3 pl-4 border-l border-gray-100">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-bold text-gray-900 leading-none">{user?.name}</p>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mt-1">{user?.role}</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-gray-200 border-2 border-white shadow-sm overflow-hidden">
                <img 
                  src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.email}`} 
                  alt="Avatar" 
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-4 lg:p-6 relative">
          {children}
        </div>
        <MultiAssistantChat activeTab={activeTab} />

        <Toaster position="top-right" richColors closeButton />
      </main>
    </div>
  );
};
