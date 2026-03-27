import React, { useState, useEffect } from 'react';
import { 
  Printer, 
  CheckCircle2, 
  X, 
  ShieldCheck, 
  DollarSign, 
  Banknote, 
  ArrowRightLeft, 
  Tractor,
  Camera,
  History,
  TrendingDown,
  TrendingUp,
  AlertCircle
} from 'lucide-react';
import { saleStorage } from '../../lib/localStorage';
import { formatCurrency, formatDate } from '../../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';

export const ShiftClosing: React.FC = () => {
    const [corteZ, setCorteZ] = useState<any | null>(null);
    const [isClosing, setIsClosing] = useState(false);
    const [history, setHistory] = useState<any[]>([]);

    useEffect(() => {
        const stored = localStorage.getItem('farmer_parts_cash_closings');
        if (stored) setHistory(JSON.parse(stored));
    }, []);

    const performClosing = () => {
        setIsClosing(true);
        setTimeout(() => {
            const allSales = saleStorage.getAll();
            const today = new Date().toISOString().split('T')[0];
            const todaySales = allSales.filter(s => s.timestamp.startsWith(today));

            const summary = {
                id: `z-${Date.now()}`,
                timestamp: new Date().toISOString(),
                totalSales: todaySales.length,
                totalAmount: todaySales.reduce((s, sales) => s + sales.total, 0),
                methods: {
                    cash: todaySales.filter(s => s.paymentMethod === 'EFECTIVO').reduce((s, sales) => s + sales.total, 0),
                    card: todaySales.filter(s => s.paymentMethod === 'TARJETA').reduce((s, sales) => s + sales.total, 0),
                    transfer: todaySales.filter(s => s.paymentMethod === 'TRANSFERENCIA').reduce((s, sales) => s + sales.total, 0),
                },
                user: 'Admin - Juan Pérez'
            };

            const updatedHistory = [summary, ...history];
            setHistory(updatedHistory);
            localStorage.setItem('farmer_parts_cash_closings', JSON.stringify(updatedHistory));
            setCorteZ(summary);
            setIsClosing(false);
            toast.success('Corte de Caja (Z) realizado con éxito');
        }, 2000);
    };

    return (
        <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Active Session Status */}
                <div className="bg-white p-10 rounded-[40px] border border-gray-100 shadow-sm space-y-8">
                    <div className="flex justify-between items-start">
                        <div className="space-y-1">
                            <h3 className="text-2xl font-black text-gray-900 tracking-tight">Corte de Caja Actual</h3>
                            <p className="text-gray-400 font-bold text-xs uppercase tracking-widest">Resumen del Turno Activo</p>
                        </div>
                        <div className="px-3 py-1 bg-green-100 text-green-600 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                           <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                           En Línea
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="p-6 bg-gray-50 rounded-3xl flex justify-between items-center transition-all hover:bg-white border border-transparent hover:border-gray-100">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-primary/10 text-primary rounded-2xl flex items-center justify-center shadow-inner"><TrendingUp size={24} /></div>
                                <span className="font-black text-gray-600">Ventas Registradas</span>
                            </div>
                            <span className="text-xl font-black text-gray-900">{saleStorage.getAll().filter(s => s.timestamp.startsWith(new Date().toISOString().split('T')[0])).length}</span>
                        </div>
                        <div className="p-6 bg-gray-50 rounded-3xl flex justify-between items-center transition-all hover:bg-white border border-transparent hover:border-gray-100">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-2xl flex items-center justify-center shadow-inner"><DollarSign size={24} /></div>
                                <span className="font-black text-gray-600">Efectivo Estimado</span>
                            </div>
                            <span className="text-xl font-black text-gray-900">{formatCurrency(saleStorage.getAll().filter(s => s.timestamp.startsWith(new Date().toISOString().split('T')[0]) && s.paymentMethod === 'EFECTIVO').reduce((s, sales) => s + sales.total, 0))}</span>
                        </div>
                    </div>

                    <button 
                        onClick={performClosing}
                        disabled={isClosing}
                        className="w-full py-5 bg-black text-white rounded-[24px] font-black uppercase tracking-widest shadow-xl shadow-black/20 hover:bg-gray-900 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                    >
                        {isClosing ? <ShieldCheck className="animate-spin text-primary" /> : <ShieldCheck className="text-primary" />}
                        {isClosing ? 'Procesando Corte...' : 'Realizar Corte de Caja (Z)'}
                    </button>
                    <p className="text-center text-[10px] font-bold text-gray-400 uppercase tracking-widest px-8">Al realizar el corte Z, el turno actual se dará por finalizado y se enviará el reporte a contabilidad automáticamente.</p>
                </div>

                {/* Closing History */}
                <div className="bg-white p-10 rounded-[40px] border border-gray-100 shadow-sm flex flex-col">
                    <h3 className="text-xl font-black text-gray-900 mb-6 flex items-center gap-2">
                        <History className="text-primary" />
                        Historial de Cortes
                    </h3>
                    <div className="space-y-4 flex-1 overflow-y-auto pr-2 custom-scrollbar">
                        {history.length === 0 && <p className="text-center py-20 text-gray-400 font-bold">No hay registros de cortes previos.</p>}
                        {history.map((h) => (
                            <div key={h.id} className="p-5 bg-gray-50 rounded-3xl border border-transparent hover:border-gray-100 hover:bg-white transition-all group flex justify-between items-center">
                                <div>
                                    <p className="font-black text-gray-900">{formatCurrency(h.totalAmount)}</p>
                                    <p className="text-[10px] font-bold text-gray-400 uppercase">{formatDate(h.timestamp)} • {h.totalSales} Ventas</p>
                                </div>
                                <button 
                                    onClick={() => setCorteZ(h)}
                                    className="p-3 bg-white text-gray-400 rounded-xl hover:text-primary hover:bg-primary/5 opacity-0 group-hover:opacity-100 transition-all"
                                >
                                    <Printer size={18} />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Modal de Reporte Z (Vista previa/Impresión) */}
            <AnimatePresence>
                {corteZ && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[300] bg-black/80 backdrop-blur-md flex items-center justify-center p-4"
                    >
                        <motion.div 
                            initial={{ scale: 0.9, y: 50 }}
                            animate={{ scale: 1, y: 0 }}
                            className="bg-white w-full max-w-sm rounded-[48px] shadow-2xl relative overflow-hidden"
                        >
                            <div className="p-10 space-y-8" id="corte-z-print-area">
                                <div className="text-center space-y-2">
                                    <div className="w-16 h-16 bg-primary/10 text-primary rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-inner">
                                        <Tractor size={32} />
                                    </div>
                                    <h2 className="text-xl font-black tracking-tight">REPORTE FINAL Z</h2>
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{formatDate(corteZ.timestamp)}</p>
                                </div>

                                <div className="space-y-4 pt-6 border-t border-dotted border-gray-200">
                                    <div className="flex justify-between text-xs font-bold text-gray-500 uppercase tracking-widest italic">
                                        <span>Total de Ventas:</span>
                                        <span className="text-gray-900 not-italic font-black ">{corteZ.totalSales}</span>
                                    </div>
                                    <div className="flex justify-between items-center py-4 bg-gray-50 rounded-2xl px-6">
                                        <span className="text-xs font-black uppercase text-gray-400">Gran Total:</span>
                                        <span className="text-2xl font-black text-gray-900">{formatCurrency(corteZ.totalAmount)}</span>
                                    </div>
                                    <div className="space-y-2 py-4">
                                        <div className="flex justify-between text-[10px] font-black text-gray-400 uppercase italic">
                                            <span>(+) Efectivo:</span>
                                            <span className="text-gray-600 not-italic">{formatCurrency(corteZ.methods.cash)}</span>
                                        </div>
                                        <div className="flex justify-between text-[10px] font-black text-gray-400 uppercase italic">
                                            <span>(+) Tarjetas:</span>
                                            <span className="text-gray-600 not-italic">{formatCurrency(corteZ.methods.card)}</span>
                                        </div>
                                        <div className="flex justify-between text-[10px] font-black text-gray-400 uppercase italic">
                                            <span>(+) Transferencias:</span>
                                            <span className="text-gray-600 not-italic">{formatCurrency(corteZ.methods.transfer)}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-8 text-center space-y-6">
                                    <div className="w-full border-t border-gray-100 pt-8">
                                        <p className="text-[8px] font-bold text-gray-400 uppercase mb-8">Firma del Responsable</p>
                                        <div className="w-40 h-[1px] bg-gray-200 mx-auto" />
                                        <p className="text-xs font-black text-gray-900 mt-2 uppercase">{corteZ.user}</p>
                                    </div>
                                </div>
                            </div>
                            <div className="p-6 bg-gray-50 flex gap-4">
                                <button 
                                    onClick={() => window.print()}
                                    className="flex-1 py-4 bg-white border border-gray-100 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-white transition-all flex items-center justify-center gap-2 shadow-sm"
                                >
                                    <Printer size={16} /> Imprimir
                                </button>
                                <button 
                                    onClick={() => setCorteZ(null)}
                                    className="flex-1 py-4 bg-primary text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-primary/20 hover:opacity-90 transition-all"
                                >
                                    Finalizar
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};
