import React, { useState, useEffect } from 'react';
import { 
  Users, 
  DollarSign, 
  FileText, 
  History, 
  Download, 
  Plus, 
  CheckCircle2, 
  AlertTriangle,
  ChevronRight,
  Printer,
  Calculator,
  Calendar,
  Wallet,
  ArrowDownCircle,
  TrendingDown,
  Mail
} from 'lucide-react';
import { productStorage, customerStorage, saleStorage } from '../../lib/localStorage';
import { cn, formatCurrency, formatDate } from '../../lib/utils';
import { processPayroll, PayrollResult } from '../../lib/payrollUtils';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';

// Mock Employees if HR list is empty/missing
const MOCK_EMPLOYEES = [
  { id: 'emp1', name: 'Juan Pérez', role: 'Vendedor Senior', baseSalary: 12000, department: 'Ventas', email: 'juan@farmerparts.com' },
  { id: 'emp2', name: 'María García', role: 'Almacenista', baseSalary: 8500, department: 'Almacén', email: 'maria@farmerparts.com' },
  { id: 'emp3', name: 'Carlos Ruiz', role: 'Administrador', baseSalary: 18000, department: 'Administración', email: 'carlos@farmerparts.com' },
];

export const PayrollManager: React.FC = () => {
  const [employees, setEmployees] = useState(MOCK_EMPLOYEES);
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));
  const [payrollEntries, setPayrollEntries] = useState<any[]>([]);
  const [showReceipt, setShowReceipt] = useState<any | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Load existing payroll from localStorage (pretend)
  useEffect(() => {
    const stored = localStorage.getItem('farmer_parts_payroll_history');
    if (stored) {
      setPayrollEntries(JSON.parse(stored));
    }
  }, []);

  const calculateCommissions = (employeeId: string, month: string) => {
    // In a real app, we would fetch sales from saleStorage filtered by user and month
    // For demo, we generate a random commission between 800 and 3500
    const hash = employeeId.split('').reduce((a, b) => a + b.charCodeAt(0), 0);
    return 1000 + (hash % 2500);
  };

  const generateMonthlyPayroll = () => {
    setIsProcessing(true);
    setTimeout(() => {
        const newEntries = employees.map(emp => {
            const commissions = calculateCommissions(emp.id, selectedMonth);
            const calculations = processPayroll(emp.baseSalary, commissions);
            return {
                id: `pay-${emp.id}-${selectedMonth}`,
                employeeName: emp.name,
                employeeId: emp.id,
                role: emp.role,
                month: selectedMonth,
                date: new Date().toISOString(),
                ...calculations
            };
        });

        const updatedHistory = [...newEntries, ...payrollEntries.filter(e => e.month !== selectedMonth)];
        setPayrollEntries(updatedHistory);
        localStorage.setItem('farmer_parts_payroll_history', JSON.stringify(updatedHistory));
        setIsProcessing(false);
        toast.success(`Nómina de ${selectedMonth} generada correctamente`);
    }, 1500);
  };

  const exportToExcel = () => {
    const currentPayroll = payrollEntries.filter(e => e.month === selectedMonth);
    if (currentPayroll.length === 0) {
        toast.error('No hay datos de nómina para este mes');
        return;
    }

    const headers = ["ID Emp", "Nombre", "Sueldo Base", "Comisiones", "Bruto", "ISR", "IMSS", "Neto"];
    const rows = currentPayroll.map(p => [p.employeeId, p.employeeName, p.baseSalary, p.commissions, p.grossSalary, p.isr, p.imss, p.netSalary]);
    const csvContent = [headers, ...rows].map(r => r.join(",")).join("\n");
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `Nomina_${selectedMonth}.csv`;
    link.click();
    toast.success('Documento exportado para contabilidad');
  };

  const currentMonthEntries = payrollEntries.filter(e => e.month === selectedMonth);

  return (
    <div className="space-y-8 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black text-gray-900 tracking-tight flex items-center gap-3">
            <Wallet className="text-primary" size={32} />
            Gestión de Nómina (Payroll)
          </h2>
          <p className="text-gray-500 font-medium">Cálculo de sueldos, comisiones y retenciones fiscales.</p>
        </div>

        <div className="flex items-center gap-3">
            <input 
                type="month" 
                value={selectedMonth}
                onChange={e => setSelectedMonth(e.target.value)}
                className="px-4 py-3 bg-white border border-gray-200 rounded-2xl outline-none focus:ring-4 ring-primary/10 font-bold text-gray-700"
            />
            {currentMonthEntries.length === 0 ? (
                <button 
                    onClick={generateMonthlyPayroll}
                    disabled={isProcessing}
                    className="px-6 py-3 bg-primary text-white rounded-2xl font-bold flex items-center gap-2 hover:opacity-90 transition-all shadow-xl shadow-primary/20 disabled:opacity-50"
                >
                    {isProcessing ? <Calculator className="animate-spin" size={20} /> : <Plus size={20} />}
                    Generar Nómina
                </button>
            ) : (
                <button 
                   onClick={exportToExcel}
                   className="px-6 py-3 bg-gray-900 text-white rounded-2xl font-bold flex items-center gap-2 hover:bg-black transition-all shadow-xl shadow-black/10"
                >
                    <Download size={20} />
                    Exportar Excel
                </button>
            )}
        </div>
      </div>

      {/* Summary Stats */}
      {currentMonthEntries.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                  { label: 'Egresos Totales', value: currentMonthEntries.reduce((s, e) => s + e.grossSalary, 0), icon: ArrowDownCircle, color: 'text-red-500', bg: 'bg-red-50' },
                  { label: 'Sueldos Netos', value: currentMonthEntries.reduce((s, e) => s + e.netSalary, 0), icon: DollarSign, color: 'text-green-500', bg: 'bg-green-50' },
                  { label: 'Retenciones (ISR+IMSS)', value: currentMonthEntries.reduce((s, e) => s + (e.isr + e.imss), 0), icon: TrendingDown, color: 'text-amber-500', bg: 'bg-amber-50' },
              ].map((stat, i) => (
                  <div key={i} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-5 translate-y-0 hover:-translate-y-1 transition-all">
                      <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center shadow-inner", stat.bg)}>
                          <stat.icon size={28} className={stat.color} />
                      </div>
                      <div>
                          <p className="text-xs font-black text-gray-400 uppercase tracking-widest">{stat.label}</p>
                          <p className="text-2xl font-black text-gray-900">{formatCurrency(stat.value)}</p>
                      </div>
                  </div>
              ))}
          </div>
      )}

      {/* Employee List / Payroll Table */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-50">
                <th className="px-8 py-5 text-xs font-black text-gray-400 uppercase tracking-widest">Colaborador</th>
                <th className="px-8 py-5 text-xs font-black text-gray-400 uppercase tracking-widest">Sueldo Base</th>
                <th className="px-8 py-5 text-xs font-black text-gray-400 uppercase tracking-widest text-green-600">Comisiones</th>
                <th className="px-8 py-5 text-xs font-black text-gray-400 uppercase tracking-widest text-red-500">Deducciones</th>
                <th className="px-8 py-5 text-xs font-black text-gray-400 uppercase tracking-widest">Pago Neto</th>
                <th className="px-8 py-5 text-xs font-black text-gray-400 uppercase tracking-widest text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {currentMonthEntries.length === 0 ? (
                  <tr>
                      <td colSpan={6} className="px-8 py-20 text-center">
                          <div className="flex flex-col items-center gap-4 text-gray-400">
                              <Calendar size={64} className="opacity-20" />
                              <p className="font-bold">No se ha generado la nómina para el mes de {selectedMonth}</p>
                              <button onClick={generateMonthlyPayroll} className="text-primary font-black uppercase text-xs tracking-widest hover:underline">Hacerlo ahora</button>
                          </div>
                      </td>
                  </tr>
              ) : currentMonthEntries.map(entry => (
                <tr key={entry.id} className="hover:bg-gray-50/50 transition-colors group">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center font-black">
                        {entry.employeeName.charAt(0)}
                      </div>
                      <div>
                        <p className="font-black text-gray-900">{entry.employeeName}</p>
                        <p className="text-xs text-gray-500 font-bold">{entry.role} • {entry.employeeId}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6 font-bold text-gray-600">{formatCurrency(entry.baseSalary)}</td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-2">
                      <span className="font-black text-green-600">{formatCurrency(entry.commissions)}</span>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-[10px] font-bold text-gray-400 uppercase">
                        <span>ISR</span>
                        <span>{formatCurrency(entry.isr)}</span>
                      </div>
                      <div className="flex items-center justify-between text-[10px] font-bold text-gray-400 uppercase">
                        <span>IMSS</span>
                        <span>{formatCurrency(entry.imss)}</span>
                      </div>
                      <div className="h-1.5 w-full bg-red-100 rounded-full overflow-hidden">
                        <div 
                            className="h-full bg-red-500" 
                            style={{ width: `${(entry.isr + entry.imss) / entry.grossSalary * 100}%` }}
                        />
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <p className="text-lg font-black text-gray-900">{formatCurrency(entry.netSalary)}</p>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <div className="flex items-center justify-end gap-2">
                        <button 
                            onClick={() => setShowReceipt(entry)}
                            className="p-3 bg-gray-50 text-gray-400 rounded-xl hover:bg-primary/10 hover:text-primary transition-all"
                            title="Ver Recibo"
                        >
                            <FileText size={18} />
                        </button>
                        <button className="p-3 bg-gray-50 text-gray-400 rounded-xl hover:bg-gray-900 hover:text-white transition-all">
                            <Mail size={18} />
                        </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Receipt Modal */}
      <AnimatePresence>
        {showReceipt && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] bg-black/60 backdrop-blur-md flex items-center justify-center p-4 sm:p-8"
          >
            <motion.div 
               initial={{ scale: 0.9, y: 20 }}
               animate={{ scale: 1, y: 0 }}
               exit={{ scale: 0.9, y: 20 }}
               className="bg-white w-full max-w-xl rounded-[40px] shadow-2xl overflow-hidden relative"
            >
                <div className="p-10 space-y-8" id="payroll-receipt">
                    <div className="flex justify-between items-start">
                        <div className="space-y-2">
                            <h3 className="text-2xl font-black tracking-tighter text-primary">FARMER PARTS SA DE CV</h3>
                            <p className="text-xs font-bold text-gray-400 uppercase">RFC: FPAR-990101-AAA</p>
                        </div>
                        <div className="text-right">
                             <div className="bg-primary/5 text-primary px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest inline-block mb-2">
                                Recibo de Nómina
                             </div>
                             <p className="text-sm font-black text-gray-900">Periodo: {showReceipt.month}</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-8 py-8 border-y border-gray-100">
                        <div>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Empleado</p>
                            <p className="text-lg font-black text-gray-900">{showReceipt.employeeName}</p>
                            <p className="text-sm font-bold text-gray-500">{showReceipt.role}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Fecha de Pago</p>
                            <p className="text-sm font-black text-gray-900">{formatDate(showReceipt.date)}</p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="font-bold text-gray-600">Sueldo Base Mensual</span>
                                <span className="font-black">{formatCurrency(showReceipt.baseSalary)}</span>
                            </div>
                            <div className="flex justify-between text-sm text-green-600">
                                <span className="font-bold">Comisiones por Ventas</span>
                                <span className="font-black">+ {formatCurrency(showReceipt.commissions)}</span>
                            </div>
                            <div className="border-t border-gray-100 pt-2 flex justify-between font-black text-gray-900">
                                <span>Percepciones Totales</span>
                                <span>{formatCurrency(showReceipt.grossSalary)}</span>
                            </div>
                        </div>

                        <div className="space-y-2 pt-4 border-t border-dotted border-gray-200">
                            <div className="flex justify-between text-sm text-red-500">
                                <span className="font-bold">Retención ISR</span>
                                <span className="font-black">- {formatCurrency(showReceipt.isr)}</span>
                            </div>
                            <div className="flex justify-between text-sm text-red-500">
                                <span className="font-bold">Cuota IMSS</span>
                                <span className="font-black">- {formatCurrency(showReceipt.imss)}</span>
                            </div>
                            {showReceipt.infonavit > 0 && (
                                <div className="flex justify-between text-sm text-red-500">
                                    <span className="font-bold">Préstamo INFONAVIT</span>
                                    <span className="font-black">- {formatCurrency(showReceipt.infonavit)}</span>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="mt-8 bg-black text-white p-8 rounded-[32px] flex justify-between items-center">
                        <div>
                            <p className="text-xs font-black uppercase tracking-widest text-gray-400">Neto a Pagar</p>
                            <p className="text-3xl font-black tracking-tight">{formatCurrency(showReceipt.netSalary)}</p>
                        </div>
                        <div className="text-right flex flex-col items-end">
                            <CheckCircle2 size={32} className="text-primary mb-2" />
                            <p className="text-[10px] font-bold text-gray-400">PAGADO ELECTRÓNICAMENTE</p>
                        </div>
                    </div>
                </div>

                <div className="p-6 bg-gray-50 flex gap-4 mt-auto">
                    <button 
                       onClick={() => window.print()} 
                       className="flex-1 py-4 bg-white border border-gray-200 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-gray-100 transition-all flex items-center justify-center gap-2"
                    >
                        <Printer size={16} /> Imprimir
                    </button>
                    <button 
                       onClick={() => setShowReceipt(null)} 
                       className="flex-1 py-4 bg-primary text-white rounded-2xl font-black uppercase text-xs tracking-widest shadow-lg shadow-primary/20 hover:opacity-90 transition-all"
                    >
                        Cerrar
                    </button>
                </div>
                <button 
                  onClick={() => setShowReceipt(null)}
                  className="absolute top-6 right-6 p-2 text-gray-400 hover:text-gray-900 transition-all"
                >
                    <X size={24} />
                </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const X = ({ size }: { size: number }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="6" x2="6" y2="18"></line>
        <line x1="6" y1="6" x2="18" y2="18"></line>
    </svg>
);
