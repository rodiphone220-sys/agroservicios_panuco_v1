import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  Save, 
  Download, 
  X, 
  ChevronDown, 
  CheckCircle2, 
  History,
  Tag,
  Truck,
  Layers,
  DollarSign,
  Package,
  Trash2
} from 'lucide-react';
import { cn, formatCurrency } from '../../lib/utils';
import { filterTemplateStorage } from '../../lib/localStorage';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';

interface FilterState {
  search: string;
  category: string;
  brand: string;
  model: string;
  minPrice: number | '';
  maxPrice: number | '';
  minStock: number | '';
  maxStock: number | '';
}

interface MasterFilterProps {
  onFilterChange: (results: any[]) => void;
  data: any[];
  moduleName: string;
  onExport?: (filteredData: any[]) => void;
}

export const MasterFilterSystem: React.FC<MasterFilterProps> = ({ 
  onFilterChange, 
  data, 
  moduleName,
  onExport 
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    category: '',
    brand: '',
    model: '',
    minPrice: '',
    maxPrice: '',
    minStock: '',
    maxStock: '',
  });

  const [templates, setTemplates] = useState<any[]>([]);
  const [showTemplates, setShowTemplates] = useState(false);

  // Load templates on first mount
  useEffect(() => {
    const stored = filterTemplateStorage.getAll();
    setTemplates(stored.filter(t => t.module === moduleName));
  }, [moduleName]);

  // Main Filtering Engine
  useEffect(() => {
    const results = data.filter(item => {
      // 1. Omni-search (Description, Part Number, Barcode)
      const searchLower = filters.search.toLowerCase();
      const matchesSearch = !filters.search || 
        item.description?.toLowerCase().includes(searchLower) ||
        item.pieceNumber?.toLowerCase().includes(searchLower) ||
        item.barcode?.toLowerCase().includes(searchLower);

      // 2. Exact Filters
      const matchesCategory = !filters.category || item.category === filters.category;
      const matchesBrand = !filters.brand || item.brand === filters.brand;
      const matchesModel = !filters.model || item.model?.includes(filters.model);

      // 3. Ranges
      const matchesPrice = (filters.minPrice === '' || item.salePrice >= (filters.minPrice as number)) &&
                          (filters.maxPrice === '' || item.salePrice <= (filters.maxPrice as number));
      const matchesStock = (filters.minStock === '' || item.stock >= (filters.minStock as number)) &&
                          (filters.maxStock === '' || item.stock <= (filters.maxStock as number));

      return matchesSearch && matchesCategory && matchesBrand && matchesModel && matchesPrice && matchesStock;
    });

    onFilterChange(results);
  }, [filters, data]);

  // Actions
  const saveTemplate = () => {
    const name = prompt('Nombre para esta plantilla de filtros:');
    if (!name) return;

    const newTemplate = {
      id: Math.random().toString(36).substr(2, 9),
      name,
      module: moduleName,
      filterData: { ...filters, search: '' } // Don't save search term in template usually
    };

    filterTemplateStorage.add(newTemplate);
    setTemplates([...templates, newTemplate]);
    toast.success('Plantilla de filtros guardada');
  };

  const applyTemplate = (template: any) => {
    setFilters({ ...template.filterData, search: filters.search });
    setShowTemplates(false);
    toast.info(`Filtros aplicados: ${template.name}`);
  };

  const deleteTemplate = (id: string) => {
    filterTemplateStorage.delete(id);
    setTemplates(templates.filter(t => t.id !== id));
  };

  const clearFilters = () => {
    setFilters({
      search: filters.search, // Keep search
      category: '',
      brand: '',
      model: '',
      minPrice: '',
      maxPrice: '',
      minStock: '',
      maxStock: '',
    });
    toast.info('Filtros avanzados limpiados');
  };

  const exportToCSV = () => {
    if (onExport) {
        // Parent handles export if provided
        onExport(data.filter(item => item /* Logic repeats here or pass filtered items */));
    } else {
        // Default Simple CSV Export
        const filteredData = data.filter(item => {
            const searchLower = filters.search.toLowerCase();
            const matchesSearch = !filters.search || 
              item.description?.toLowerCase().includes(searchLower) ||
              item.pieceNumber?.toLowerCase().includes(searchLower);
            const matchesCategory = !filters.category || item.category === filters.category;
            const matchesBrand = !filters.brand || item.brand === filters.brand;
            return matchesSearch && matchesCategory && matchesBrand;
        });

        const headers = ["ID", "Parte", "Descripcion", "Marca", "Categoria", "Precio", "Stock"];
        const rows = filteredData.map(i => [i.id, i.pieceNumber, i.description, i.brand, i.category, i.salePrice, i.stock]);
        const content = [headers, ...rows].map(e => e.join(",")).join("\n");
        const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `Export_${moduleName}_${new Date().toLocaleDateString()}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.success('Reporte exportado correctamente');
    }
  };

  // Extract unique facets for suggestion
  const categories = [...new Set(data.filter(i => i.category).map(i => i.category))];
  const brands = [...new Set(data.filter(i => i.brand).map(i => i.brand))];

  return (
    <div className="bg-white border-b border-gray-100 p-4 sticky top-0 z-30 shadow-sm">
      <div className="flex flex-wrap items-center gap-3">
        {/* Omni-search Bar */}
        <div className="flex-1 min-w-[300px] relative group">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors">
            <Search size={20} />
          </div>
          <input 
            type="text" 
            placeholder="Buscar por # de parte, descripción o código de barras..." 
            className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:bg-white focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all font-medium text-sm"
            value={filters.search}
            onChange={e => setFilters({...filters, search: e.target.value})}
          />
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setIsExpanded(!isExpanded)}
            className={cn(
              "p-3 rounded-2xl transition-all flex items-center gap-2 font-bold text-xs uppercase tracking-widest",
              isExpanded 
                ? "bg-primary text-white shadow-lg shadow-primary/20" 
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            )}
          >
            <Filter size={18} />
            <span className="hidden sm:inline">Advanced</span>
            <ChevronDown size={14} className={cn("transition-transform duration-300", isExpanded && "rotate-180")} />
          </button>

          <div className="relative">
            <button 
              onClick={() => setShowTemplates(!showTemplates)}
              className="p-3 bg-gray-100 text-gray-600 rounded-2xl hover:bg-gray-200 transition-all flex items-center gap-2 font-bold text-xs uppercase"
            >
              <History size={18} />
              <span className="hidden sm:inline">Templates</span>
            </button>
            <AnimatePresence>
              {showTemplates && (
                <motion.div 
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute top-full right-0 mt-3 w-64 bg-white border border-gray-100 rounded-3xl shadow-2xl p-4 overflow-hidden"
                >
                  <h4 className="text-[10px] font-black uppercase text-gray-400 mb-4 tracking-widest px-2">Plantillas Guardadas</h4>
                  <div className="space-y-2 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                    {templates.length === 0 && (
                        <p className="text-xs text-gray-400 italic text-center py-4">Sin plantillas guardadas</p>
                    )}
                    {templates.map(t => (
                      <div key={t.id} className="flex items-center gap-2 group">
                        <button 
                          onClick={() => applyTemplate(t)}
                          className="flex-1 text-left px-4 py-3 bg-gray-50 hover:bg-primary/5 hover:text-primary rounded-xl text-sm font-bold transition-all border border-transparent hover:border-primary/20"
                        >
                          {t.name}
                        </button>
                        <button 
                          onClick={() => deleteTemplate(t.id)}
                          className="p-2 text-red-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <button 
            onClick={exportToCSV}
            className="p-3 bg-gray-900 text-white rounded-2xl hover:bg-black transition-all shadow-xl shadow-black/10 flex items-center gap-2 font-bold text-xs uppercase"
          >
            <Download size={18} />
            <span className="hidden sm:inline">Export</span>
          </button>
        </div>
      </div>

      {/* Advanced Filter Panel */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden bg-slate-50 mt-4 rounded-3xl border border-gray-100"
          >
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Categorias y Marcas */}
              <div className="space-y-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
                    <Layers size={12} /> Categoría
                  </label>
                  <select 
                    value={filters.category}
                    onChange={e => setFilters({...filters, category: e.target.value})}
                    className="w-full px-4 py-2 bg-white border border-gray-200 rounded-xl outline-none focus:border-primary text-sm font-bold"
                  >
                    <option value="">Todas las Categorías</option>
                    {categories.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
                    <Tag size={12} /> Marca
                  </label>
                  <select 
                    value={filters.brand}
                    onChange={e => setFilters({...filters, brand: e.target.value})}
                    className="w-full px-4 py-2 bg-white border border-gray-200 rounded-xl outline-none focus:border-primary text-sm font-bold"
                  >
                    <option value="">Todas las Marcas</option>
                    {brands.map(b => <option key={b} value={b}>{b}</option>)}
                  </select>
                </div>
              </div>

              {/* Precios */}
              <div className="space-y-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
                    <DollarSign size={12} /> Rango de Precios
                  </label>
                  <div className="flex items-center gap-2">
                    <input 
                        type="number" 
                        placeholder="Min" 
                        value={filters.minPrice}
                        onChange={e => setFilters({...filters, minPrice: e.target.value === '' ? '' : parseFloat(e.target.value)})}
                        className="w-full px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-bold outline-none focus:border-primary"
                    />
                    <span className="text-gray-400">-</span>
                    <input 
                        type="number" 
                        placeholder="Max" 
                        value={filters.maxPrice}
                        onChange={e => setFilters({...filters, maxPrice: e.target.value === '' ? '' : parseFloat(e.target.value)})}
                        className="w-full px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-bold outline-none focus:border-primary"
                    />
                  </div>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
                    <Truck size={12} /> Modelo / Compatibilidad
                  </label>
                  <input 
                    type="text" 
                    placeholder="Ej. TS6000, 6603..."
                    className="w-full px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-bold outline-none focus:border-primary"
                    value={filters.model}
                    onChange={e => setFilters({...filters, model: e.target.value})}
                  />
                </div>
              </div>

              {/* Inventario / Stock */}
              <div className="space-y-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
                    <Package size={12} /> Rango de Stock
                  </label>
                  <div className="flex items-center gap-2">
                    <input 
                        type="number" 
                        placeholder="Min" 
                        value={filters.minStock}
                        onChange={e => setFilters({...filters, minStock: e.target.value === '' ? '' : parseFloat(e.target.value)})}
                        className="w-full px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-bold outline-none focus:border-primary"
                    />
                    <span className="text-gray-400">-</span>
                    <input 
                        type="number" 
                        placeholder="Max" 
                        value={filters.maxStock}
                        onChange={e => setFilters({...filters, maxStock: e.target.value === '' ? '' : parseFloat(e.target.value)})}
                        className="w-full px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-bold outline-none focus:border-primary"
                    />
                  </div>
                </div>
                <div className="flex items-end h-full">
                    <button 
                        onClick={() => setFilters({...filters, minStock: 0, maxStock: 5})}
                        className="w-full py-2 bg-red-50 text-red-600 border border-red-100 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-red-100 transition-all"
                    >
                        Ver Stock Bajo
                    </button>
                </div>
              </div>

              {/* Botones de Control de Panel */}
              <div className="flex flex-col justify-between">
                <div className="flex flex-col gap-2">
                    <button 
                        onClick={saveTemplate}
                        className="w-full py-3 bg-white border border-gray-200 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-gray-100 transition-all flex items-center justify-center gap-2"
                    >
                        <Save size={14} /> Guardar Filtro
                    </button>
                    <button 
                        onClick={clearFilters}
                        className="w-full py-3 bg-white border border-gray-200 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-gray-100 transition-all text-red-500 flex items-center justify-center gap-2"
                    >
                        <Trash2 size={14} /> Limpiar Filtros
                    </button>
                </div>
                <button 
                    onClick={() => setIsExpanded(false)}
                    className="w-full py-4 bg-gray-900 text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-black transition-all"
                >
                    Aplicar y Cerrar
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
