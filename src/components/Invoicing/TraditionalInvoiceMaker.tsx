import React, { useState, useEffect, useRef } from 'react';
import { 
  Printer, 
  Plus, 
  Trash2, 
  Save, 
  FileText, 
  Building2, 
  User, 
  Package,
  QrCode,
  X,
  ChevronRight,
  ChevronLeft,
  AlertCircle,
  Eye,
  Settings
} from 'lucide-react';
import { cn, formatCurrency, numberToWords } from '../../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { useReactToPrint } from 'react-to-print';
import { toast } from 'sonner';

interface InvoiceItem {
  id: string;
  quantity: number;
  description: string;
  pieceNumber: string;
  brand: string;
  unitPrice: number;
  importe: number;
}

interface InvoiceData {
  company: {
    name: string;
    giro: string;
    rfc: string;
    address: string;
    phones: string;
    city: string;
    state: string;
    zip: string;
  };
  client: {
    name: string;
    rfc: string;
    address: string;
    city: string;
    state: string;
    zip: string;
    email: string;
  };
  invoice: {
    serie: string;
    folio: string;
    date: string;
    paymentMethod: string;
    paymentType: string;
    cfdiUsage: string;
    currency: string;
    exchangeRate: number;
  };
  items: InvoiceItem[];
}

export const TraditionalInvoiceMaker: React.FC<{ onClose?: () => void }> = ({ onClose }) => {
  const [data, setData] = useState<InvoiceData>({
    company: {
      name: 'FARMER PARTS, S.A. DE C.V.',
      giro: 'REFACCIONES PARA TRACTORES Y MAQUINARIA PESADA',
      rfc: 'FPA850101ABC',
      address: 'AV. AGRICULTURA 123, COL. INDUSTRIAL',
      phones: '442-123-4567 / 442-987-6543',
      city: 'QUERÉTARO',
      state: 'QUERÉTARO',
      zip: '76000'
    },
    client: {
      name: '',
      rfc: '',
      address: '',
      city: '',
      state: '',
      zip: '',
      email: ''
    },
    invoice: {
      serie: 'A',
      folio: '1001',
      date: new Date().toISOString().split('T')[0],
      paymentMethod: 'PUE - PAGO EN UNA SOLA EXHIBICIÓN',
      paymentType: '01 - EFECTIVO',
      cfdiUsage: 'G03 - GASTOS EN GENERAL',
      currency: 'MXN',
      exchangeRate: 1.00
    },
    items: [
      {
        id: '1',
        quantity: 1,
        description: 'BOMBA DE AGUA MASSEY FERGUSON 285',
        pieceNumber: '1660114M91',
        brand: 'MF',
        unitPrice: 1250.00,
        importe: 1250.00
      }
    ]
  });

  const [activeStep, setActiveStep] = useState<1 | 2 | 3>(1);
  const [showPreview, setShowPreview] = useState(false);

  // Totals calculation
  const subtotal = data.items.reduce((acc, item) => acc + item.importe, 0);
  const iva = subtotal * 0.16;
  const total = subtotal + iva;

  const addItem = () => {
    const newItem: InvoiceItem = {
      id: Math.random().toString(36).substr(2, 9),
      quantity: 1,
      description: '',
      pieceNumber: '',
      brand: '',
      unitPrice: 0,
      importe: 0
    };
    setData({ ...data, items: [...data.items, newItem] });
  };

  const removeItem = (id: string) => {
    if (data.items.length === 1) {
      toast.error('La factura debe tener al menos un concepto');
      return;
    }
    setData({ ...data, items: data.items.filter(i => i.id !== id) });
  };

  const updateItem = (id: string, field: keyof InvoiceItem, value: any) => {
    const newItems = data.items.map(item => {
      if (item.id === id) {
        const updated = { ...item, [field]: value };
        // Recalculate importe if qty or price changes
        if (field === 'quantity' || field === 'unitPrice') {
          updated.importe = updated.quantity * updated.unitPrice;
        }
        return updated;
      }
      return item;
    });
    setData({ ...data, items: newItems });
  };

  const printRef = useRef<HTMLDivElement>(null);
  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: `Factura_${data.invoice.serie}_${data.invoice.folio}`,
  });


  const validate = () => {
    if (!data.client.name || !data.client.rfc) {
      toast.error('Faltan datos del cliente');
      return false;
    }
    if (data.items.some(i => !i.description || i.unitPrice <= 0)) {
      toast.error('Hay conceptos incompletos o con precio cero');
      return false;
    }
    return true;
  };

  const inputClass = "w-full px-4 py-2 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-sm font-medium";
  const labelClass = "text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 block";

  return (
    <div className="flex flex-col lg:flex-row h-screen bg-gray-100 overflow-hidden font-sans">
      {/* Editor Section */}
      <div className="lg:w-1/2 flex flex-col bg-slate-50 border-r border-gray-200 shadow-xl z-10 overflow-hidden">
        {/* Editor Header */}
        <div className="p-6 bg-white border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center text-white shadow-lg shadow-primary/20">
              <FileText size={24} />
            </div>
            <div>
              <h1 className="text-xl font-black text-gray-900 leading-none">Nueva Factura</h1>
              <p className="text-xs text-gray-500 font-bold uppercase tracking-tighter mt-1">Generador de Documentos Fiscales</p>
            </div>
          </div>
          {onClose && (
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
              <X size={20} />
            </button>
          )}
        </div>

        {/* Steps Tab */}
        <div className="flex p-4 gap-2 bg-white border-b border-gray-50 shrink-0">
          {[1, 2, 3].map((s) => (
            <button
              key={s}
              onClick={() => setActiveStep(s as any)}
              className={cn(
                "flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border-2",
                activeStep === s 
                  ? "bg-primary border-primary text-white shadow-lg shadow-primary/20" 
                  : "bg-white border-gray-100 text-gray-400 hover:border-gray-200"
              )}
            >
              Paso {s}: {s === 1 ? 'Emisor/Receptor' : s === 2 ? 'Conceptos' : 'Finalizar'}
            </button>
          ))}
        </div>

        {/* Editor Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8 no-scrollbar">
          <AnimatePresence mode="wait">
            {activeStep === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-8"
              >
                <section className="space-y-4">
                  <h3 className="flex items-center gap-2 text-primary font-black uppercase text-xs tracking-widest">
                    <Building2 size={16} /> Datos de la Empresa (Emisor)
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2">
                      <label className={labelClass}>Razón Social</label>
                      <input 
                        className={inputClass} 
                        value={data.company.name} 
                        onChange={e => setData({...data, company: {...data.company, name: e.target.value}})}
                      />
                    </div>
                    <div>
                      <label className={labelClass}>RFC</label>
                      <input className={inputClass} value={data.company.rfc} onChange={e => setData({...data, company: {...data.company, rfc: e.target.value}})} />
                    </div>
                    <div>
                      <label className={labelClass}>Teléfonos</label>
                      <input className={inputClass} value={data.company.phones} onChange={e => setData({...data, company: {...data.company, phones: e.target.value}})} />
                    </div>
                    <div className="col-span-2">
                        <label className={labelClass}>Giro / Actividad</label>
                        <input className={inputClass} value={data.company.giro} onChange={e => setData({...data, company: {...data.company, giro: e.target.value}})} />
                    </div>
                  </div>
                </section>

                <div className="h-px bg-gray-200" />

                <section className="space-y-4">
                  <h3 className="flex items-center gap-2 text-blue-600 font-black uppercase text-xs tracking-widest">
                    <User size={16} /> Datos del Cliente (Receptor)
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2">
                        <label className={labelClass}>Nombre / Razón Social</label>
                        <input className={inputClass} placeholder="Ej. Rancho Agrícola S.A." value={data.client.name} onChange={e => setData({...data, client: {...data.client, name: e.target.value}})} />
                    </div>
                    <div>
                        <label className={labelClass}>RFC Cliente</label>
                        <input className={inputClass} placeholder="XAXX010101000" value={data.client.rfc} onChange={e => setData({...data, client: {...data.client, rfc: e.target.value}})} />
                    </div>
                    <div>
                        <label className={labelClass}>C.P.</label>
                        <input className={inputClass} value={data.client.zip} onChange={e => setData({...data, client: {...data.client, zip: e.target.value}})} />
                    </div>
                    <div className="col-span-2">
                        <label className={labelClass}>Domicilio Fiscal</label>
                        <input className={inputClass} value={data.client.address} onChange={e => setData({...data, client: {...data.client, address: e.target.value}})} />
                    </div>
                  </div>
                </section>
              </motion.div>
            )}

            {activeStep === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-6"
              >
                <div className="flex items-center justify-between">
                    <h3 className="flex items-center gap-2 text-primary font-black uppercase text-xs tracking-widest">
                        <Package size={16} /> Detalle de Conceptos
                    </h3>
                    <button 
                        onClick={addItem}
                        className="flex items-center gap-1.5 px-4 py-2 bg-primary text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-primary/90 transition-all shadow-lg shadow-primary/20"
                    >
                        <Plus size={14} /> Agregar Item
                    </button>
                </div>

                <div className="space-y-4">
                  {data.items.map((item, idx) => (
                    <div key={item.id} className="p-5 bg-white border border-gray-100 rounded-2xl shadow-sm relative group animate-in fade-in slide-in-from-left-4 duration-300">
                        <button 
                            onClick={() => removeItem(item.id)}
                            className="absolute -top-2 -right-2 w-8 h-8 bg-red-50 text-red-600 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all border-2 border-white shadow-lg"
                        >
                            <Trash2 size={14} />
                        </button>
                        <div className="grid grid-cols-12 gap-4">
                            <div className="col-span-2">
                                <label className={labelClass}>Cant</label>
                                <input type="number" className={inputClass} value={item.quantity} onChange={e => updateItem(item.id, 'quantity', parseFloat(e.target.value))} />
                            </div>
                            <div className="col-span-10">
                                <label className={labelClass}>Descripción / Concepto</label>
                                <input className={inputClass} value={item.description} onChange={e => updateItem(item.id, 'description', e.target.value.toUpperCase())} />
                            </div>
                            <div className="col-span-4">
                                <label className={labelClass}>No. Parte</label>
                                <input className={inputClass} value={item.pieceNumber} onChange={e => updateItem(item.id, 'pieceNumber', e.target.value)} />
                            </div>
                            <div className="col-span-4">
                                <label className={labelClass}>Precio Unitario</label>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
                                    <input type="number" className={cn(inputClass, "pl-7")} value={item.unitPrice} onChange={e => updateItem(item.id, 'unitPrice', parseFloat(e.target.value))} />
                                </div>
                            </div>
                            <div className="col-span-4">
                                <label className={labelClass}>Importe</label>
                                <div className="w-full px-4 py-2 bg-gray-50 border border-gray-100 rounded-xl text-sm font-bold text-gray-700">
                                    {formatCurrency(item.importe)}
                                </div>
                            </div>
                        </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {activeStep === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-8"
              >
                <section className="space-y-4 text-center p-8 bg-white border border-dashed border-gray-200 rounded-3xl">
                   <div className="w-20 h-20 bg-green-50 text-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                       <Save size={40} />
                   </div>
                   <h3 className="text-xl font-black text-gray-900">¡Factura Lista!</h3>
                   <p className="text-gray-500 text-sm max-w-xs mx-auto">Revisa la vista previa a la derecha y procede con la impresión física o digital.</p>
                </section>

                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white p-4 rounded-2xl border border-gray-100">
                        <label className={labelClass}>Metodo de Pago</label>
                        <select className={inputClass} value={data.invoice.paymentMethod} onChange={e => setData({...data, invoice: {...data.invoice, paymentMethod: e.target.value}})}>
                            <option>PUE - PAGO EN UNA SOLA EXHIBICIÓN</option>
                            <option>PPD - PAGO EN PARCIALIDADES O DIFERIDO</option>
                        </select>
                    </div>
                    <div className="bg-white p-4 rounded-2xl border border-gray-100">
                        <label className={labelClass}>Uso de CFDI</label>
                        <select className={inputClass} value={data.invoice.cfdiUsage} onChange={e => setData({...data, invoice: {...data.invoice, cfdiUsage: e.target.value}})}>
                            <option>G03 - GASTOS EN GENERAL</option>
                            <option>P01 - POR DEFINIR</option>
                            <option>I01 - CONSTRUCCIONES</option>
                        </select>
                    </div>
                </div>

                <div className="bg-gray-900 text-white p-6 rounded-3xl space-y-4 shadow-2xl">
                    <div className="flex justify-between items-center text-gray-400 text-xs font-black uppercase tracking-widest">
                        <span>Resumen Financiero</span>
                        <span>{data.invoice.serie} - {data.invoice.folio}</span>
                    </div>
                    <div className="space-y-2">
                        <div className="flex justify-between text-lg">
                            <span className="opacity-60">Subtotal</span>
                            <span className="font-bold">{formatCurrency(subtotal)}</span>
                        </div>
                        <div className="flex justify-between text-lg">
                            <span className="opacity-60">I.V.A. (16%)</span>
                            <span className="font-bold">{formatCurrency(iva)}</span>
                        </div>
                        <div className="h-px bg-white/10 my-4" />
                        <div className="flex justify-between text-3xl font-black text-primary">
                            <span>TOTAL</span>
                            <span>{formatCurrency(total)}</span>
                        </div>
                    </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Editor Footer */}
        <div className="p-6 bg-white border-t border-gray-100 flex gap-3 shrink-0">
           <button 
                onClick={() => setActiveStep(prev => Math.max(1, prev - 1) as any)}
                disabled={activeStep === 1}
                className="p-4 bg-gray-100 text-gray-600 rounded-2xl hover:bg-gray-200 transition-all disabled:opacity-30"
           >
               <ChevronLeft size={24} />
           </button>
           
           {activeStep < 3 ? (
             <button 
                onClick={() => setActiveStep(prev => Math.min(3, prev + 1) as any)}
                className="flex-1 bg-gray-900 text-white py-4 rounded-2xl font-black uppercase tracking-widest hover:bg-black transition-all flex items-center justify-center gap-2"
             >
                 Siguiente Paso <ChevronRight size={20} />
             </button>
           ) : (
             <button 
                onClick={() => {
                   if(validate()) {
                       handlePrint();
                       toast.success('Generando impresión...');
                   }
                }}
                className="flex-1 bg-primary text-white py-4 rounded-2xl font-black uppercase tracking-widest hover:bg-primary/90 transition-all shadow-xl shadow-primary/20 flex items-center justify-center gap-2"
             >
                 <Printer size={20} /> Imprimir Factura
             </button>
           )}

           <button 
                onClick={() => setShowPreview(!showPreview)}
                className={cn(
                    "lg:hidden p-4 rounded-2xl transition-all",
                    showPreview ? "bg-primary text-white" : "bg-gray-100 text-gray-600"
                )}
           >
               <Eye size={24} />
           </button>
        </div>
      </div>

      {/* Preview Section */}
      <div className={cn(
          "flex-1 bg-slate-200 p-8 lg:p-12 overflow-y-auto flex justify-center items-start transition-all",
          showPreview ? "fixed inset-0 z-[200] block" : "hidden lg:flex"
      )}>
        {/* The Actual Invoice Paper */}
        <div 
          ref={printRef}
          className="bg-white w-full max-w-[215mm] min-h-[279mm] shadow-[0_0_50px_rgba(0,0,0,0.1)] p-12 relative flex flex-col gap-6 print:shadow-none print:p-8"
          style={{ 
            fontFamily: "'Courier New', Courier, monospace",
            color: '#000'
          }}
        >
          {/* Top Bar Decoration */}
          <div className="absolute top-0 left-0 right-0 h-2 bg-primary print:hidden" />
          
          {/* Header */}
          <div className="flex justify-between items-start border-b-2 border-black pb-6">
            <div className="space-y-2 max-w-[60%]">
              <h2 className="text-2xl font-black leading-none">{data.company.name}</h2>
              <p className="text-[9px] font-bold leading-tight">{data.company.giro}</p>
              <div className="text-[10px] space-y-0.5 pt-2">
                <p>RFC: <span className="font-bold underlineDecoration decoration-wavy underline">{data.company.rfc}</span></p>
                <p>{data.company.address}</p>
                <p>C.P. {data.company.zip} {data.company.city}, {data.company.state}</p>
                <p>TELÉFONOS: {data.company.phones}</p>
              </div>
            </div>
            <div className="text-right flex flex-col items-end gap-2">
              <div className="border-4 border-black p-3 text-center min-w-[150px]">
                <p className="text-[10px] font-black uppercase tracking-widest border-b border-black pb-1 mb-1">Factura</p>
                <p className="text-xl font-black">{data.invoice.serie}-{data.invoice.folio}</p>
              </div>
              <p className="text-[10px] font-bold">FECHA: {data.invoice.date}</p>
              <div className="absolute top-10 right-10 rotate-12 opacity-10 pointer-events-none select-none print:hidden">
                 <h1 className="text-6xl font-black text-primary border-8 border-primary px-4 py-2">ORIGINAL</h1>
              </div>
            </div>
          </div>

          {/* Client Info Grid */}
          <div className="grid grid-cols-12 gap-y-2 border-b-2 border-black pb-4 text-[11px]">
            <div className="col-span-2 font-black uppercase text-[9px] text-zinc-600">Nombre / Razón Social:</div>
            <div className="col-span-10 border-b border-black/20 pb-1">{data.client.name || '____________________________________________________'}</div>
            
            <div className="col-span-2 font-black uppercase text-[9px] text-zinc-600">RFC del Cliente:</div>
            <div className="col-span-4 border-b border-black/20 pb-1">{data.client.rfc || '____________________'}</div>
            
            <div className="col-span-2 font-black uppercase text-[9px] text-zinc-600 text-right pr-4">Residencia Fiscal:</div>
            <div className="col-span-4 border-b border-black/20 pb-1 uppercase">{data.client.state} {data.client.city}</div>

            <div className="col-span-2 font-black uppercase text-[9px] text-zinc-600">Domicilio:</div>
            <div className="col-span-10 border-b border-black/20 pb-1">{data.client.address || '____________________________________________________'}</div>
          </div>

          <div className="grid grid-cols-2 gap-8 text-[10px] mb-4">
             <div className="space-y-1">
                 <p><span className="font-black uppercase text-[8px] text-zinc-600">Uso de CFDI:</span> {data.invoice.cfdiUsage}</p>
                 <p><span className="font-black uppercase text-[8px] text-zinc-600">Metodo de Pago:</span> {data.invoice.paymentMethod}</p>
             </div>
             <div className="space-y-1">
                 <p><span className="font-black uppercase text-[8px] text-zinc-600">Forma de Pago:</span> {data.invoice.paymentType}</p>
                 <p><span className="font-black uppercase text-[8px] text-zinc-600">Moneda:</span> {data.invoice.currency}</p>
             </div>
          </div>

          {/* Table */}
          <div className="flex-1 flex flex-col">
            <div className="flex font-black text-[10px] border-y-2 border-black py-2 bg-zinc-50 uppercase tracking-tighter">
              <div className="w-16 text-center">Cant.</div>
              <div className="w-24 text-center">Unidad</div>
              <div className="flex-1 px-4">Descripción del Concepto</div>
              <div className="w-24 text-right">Unitario</div>
              <div className="w-24 text-right">Importe</div>
            </div>
            <div className="flex-1 min-h-[350px] divide-y divide-black/10">
              {data.items.map((item) => (
                <div key={item.id} className="flex text-[11px] py-3 items-start leading-tight">
                  <div className="w-16 text-center font-bold">{item.quantity}</div>
                  <div className="w-24 text-center text-[10px]">PIEZA</div>
                  <div className="flex-1 px-4">
                    <p className="font-black">{item.description}</p>
                    <p className="text-[9px] opacity-70">REF: {item.pieceNumber} | {item.brand}</p>
                  </div>
                  <div className="w-24 text-right">{formatCurrency(item.unitPrice)}</div>
                  <div className="w-24 text-right font-bold">{formatCurrency(item.importe)}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Totals Section */}
          <div className="border-t-2 border-black pt-4">
            <div className="flex justify-between items-start gap-12">
              <div className="flex-1 space-y-4">
                <div className="border-2 border-black p-3 bg-zinc-50 relative overflow-hidden">
                    <p className="text-[9px] font-black uppercase text-zinc-600 mb-1">Importe con Letra (Total):</p>
                    <p className="text-[11px] font-bold leading-tight underline decoration-double decoration-black/20">
                        *** ({numberToWords(total)}) ***
                    </p>
                    <div className="absolute top-0 right-0 p-1 opacity-5">
                        <FileText size={40} />
                    </div>
                </div>

                {/* Simulated Fiscal Elements */}
                <div className="flex gap-4 items-end pr-4">
                    <div className="w-24 h-24 bg-white border border-black p-1 shrink-0">
                        <QrCode size="100%" />
                    </div>
                    <div className="space-y-1.5 flex-1 min-w-0">
                        <div>
                            <p className="text-[7px] font-black opacity-50 uppercase tracking-tighter">Sello Digital del CFDI</p>
                            <p className="text-[6px] break-all leading-[1] line-clamp-2">
                                gY2zK9x1P8mQ5nL4wR7tV2jH9kN8mP5x2wR7nV4jK2mQ5nL9x1P8mH9cN8bP5x2wR7nV4jK2mQ5nL9x1P8mH9cN8bP5x2wR7nV4jK2mQ5nL9x1P8mH9cN8bP5x2wR7nV4jK2mQ5nL9x1P8mH9cN8b
                            </p>
                        </div>
                        <div>
                            <p className="text-[7px] font-black opacity-50 uppercase tracking-tighter">Sello del SAT</p>
                            <p className="text-[6px] break-all leading-[1] line-clamp-2">
                                vL4wR7tV2jH9kN8mP5x2wR7nV4jK2mQ5nL9x1P8mH9cN8bP5x2wR7nV4jK2mQ5nL9x1P8mH9cN8bP5x2wR7nV4jK2mQ5nL9x1P8mH9cN8bP5x2wR7nV4jK2mQ5nL9x1P8mH9cN8b
                            </p>
                        </div>
                        <div>
                            <p className="text-[7px] font-black opacity-50 uppercase tracking-tighter">Cadena Original</p>
                            <p className="text-[6px] break-all leading-[1] line-clamp-2">
                                ||1.1|E9E3B46D-2F3C-4D5E-8A1B-2C3D4E5F6G7H|2026-03-27T09:16:12|SAT970701NN3|vL4wR7tV2jH9kN8mP5x2wR7nV4jK2mQ5nL9x1P8mH9cN8bP5x
                            </p>
                        </div>
                    </div>
                </div>
              </div>

              <div className="w-64 space-y-1 border-l-2 border-black pl-8">
                <div className="flex justify-between text-xs">
                  <span className="font-bold">SUBTOTAL:</span>
                  <span>{formatCurrency(subtotal)}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="font-bold">I.V.A. (16%):</span>
                  <span>{formatCurrency(iva)}</span>
                </div>
                <div className="flex justify-between text-lg font-black bg-black text-white px-2 py-1 mt-2">
                  <span>TOTAL:</span>
                  <span>{formatCurrency(total)}</span>
                </div>
                <div className="pt-8 text-center space-y-4">
                    <div className="border-t border-black pt-1 w-full mx-auto">
                        <p className="text-[8px] font-black uppercase">Firma de Recibido</p>
                    </div>
                </div>
              </div>
            </div>
          </div>

          {/* Legal Footer */}
          <div className="mt-auto pt-6 border-t border-black/20 text-[7px] text-zinc-500 flex justify-between items-end">
             <div className="space-y-0.5 max-w-sm">
                 <p className="font-black uppercase text-[8px] text-zinc-800">Este documento es una representación impresa de un CFDI 4.0</p>
                 <p>Pago en una sola exhibición - Efectos fiscales al pago. Régimen General de Ley Personas Morales.</p>
                 <p>UUID: E9E3B46D-2F3C-4D5E-8A1B-2C3D4E5F6G7H | No. Certificado: 00001000000504465028</p>
             </div>
             <div className="text-right italic">
                 Farmer Parts OS - Generado el {new Date().toLocaleString()}
             </div>
          </div>
          
          {/* Mobile Back Button */}
          {showPreview && (
              <button 
                onClick={() => setShowPreview(false)}
                className="fixed bottom-8 right-8 bg-gray-900 text-white p-4 rounded-full shadow-2xl lg:hidden z-[1000]"
              >
                  <ChevronLeft size={24} />
              </button>
          )}
        </div>
      </div>
    </div>
  );
};
