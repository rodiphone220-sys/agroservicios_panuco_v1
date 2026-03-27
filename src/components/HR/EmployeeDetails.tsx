import React, { useState, useEffect } from 'react';
import { 
  X, 
  User, 
  Calendar, 
  Clock, 
  MapPin, 
  AlertCircle, 
  CheckCircle2, 
  Plane, 
  Briefcase,
  DollarSign,
  TrendingUp,
  FileText,
  ShieldCheck
} from 'lucide-react';
import { Employee } from '../../types';
import { formatCurrency, formatDate } from '../../lib/utils';
import { motion } from 'motion/react';
import { toast } from 'sonner';

interface EmployeeDetailsProps {
    employee: Employee;
    onClose: () => void;
}

export const EmployeeDetails: React.FC<EmployeeDetailsProps> = ({ employee, onClose }) => {
    const [attendance, setAttendance] = useState<any[]>([]);
    const [isCheckingIn, setIsCheckingIn] = useState(false);
    const [incidents, setIncidents] = useState<any[]>([]);

    useEffect(() => {
        // Mock data
        setAttendance([
            { id: 1, date: '2026-03-26', checkIn: '08:00 AM', checkOut: '06:00 PM', location: 'Sucursal Central', status: 'ON_TIME' },
            { id: 2, date: '2026-03-25', checkIn: '08:15 AM', checkOut: '06:05 PM', location: 'Sucursal Central', status: 'LATE' },
            { id: 3, date: '2026-03-24', checkIn: '07:55 AM', checkOut: '05:55 PM', location: 'Sucursal Central', status: 'ON_TIME' },
        ]);
        setIncidents([
            { id: 1, type: 'VACATION', startDate: '2026-04-10', endDate: '2026-04-15', status: 'APPROVED', description: 'Vacaciones de semana santa' }
        ]);
    }, [employee]);

    const handleCheckInOut = () => {
        setIsCheckingIn(true);
        // Simulate geolocation
        setTimeout(() => {
            const now = new Date();
            const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            toast.success(`Check-in registrado a las ${timeStr} en Sucursal Central (GPS: 19.4326, -99.1332)`, {
                icon: <MapPin className="text-primary" />
            });
            setIsCheckingIn(false);
        }, 1500);
    };

    return (
        <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="bg-white w-full max-w-2xl h-full shadow-2xl overflow-y-auto custom-scrollbar"
        >
            {/* Header Profile */}
            <div className="bg-gray-900 p-10 text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 blur-[100px] rounded-full -mr-32 -mt-32" />
                <button onClick={onClose} className="absolute top-6 right-6 p-2 hover:bg-white/10 rounded-full transition-all">
                    <X size={24} />
                </button>

                <div className="flex items-center gap-6 relative z-10">
                    <div className="w-24 h-24 rounded-[32px] bg-primary text-white flex items-center justify-center text-4xl font-black shadow-2xl shadow-primary/40">
                        {employee.name.charAt(0)}
                    </div>
                    <div className="space-y-1">
                        <h3 className="text-3xl font-black tracking-tight">{employee.name}</h3>
                        <div className="flex items-center gap-3">
                            <span className="text-xs font-black uppercase tracking-widest text-primary">{employee.position}</span>
                            <div className="w-1 h-1 bg-gray-600 rounded-full" />
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">ID: {employee.id}</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="p-8 space-y-10">
                {/* Stats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                    <div className="bg-gray-50 p-6 rounded-3xl space-y-1">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Sueldo Base</p>
                        <p className="text-xl font-black text-gray-900">{formatCurrency(employee.salary)}</p>
                    </div>
                    <div className="bg-gray-50 p-6 rounded-3xl space-y-1">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Comisiones (%)</p>
                        <p className="text-xl font-black text-green-600">{employee.commissionRate}%</p>
                    </div>
                    <div className="bg-gray-900 p-6 rounded-3xl space-y-1 shadow-xl shadow-black/10">
                        <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Pago Est. Mes</p>
                        <p className="text-xl font-black text-white">{formatCurrency(employee.salary * 1.15)}</p>
                    </div>
                </div>

                {/* Checklist Action */}
                <div className="p-6 bg-primary/5 rounded-[32px] border border-primary/10 flex flex-col sm:flex-row items-center justify-between gap-6">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center text-white shadow-lg shadow-primary/20">
                            <Clock size={24} />
                        </div>
                        <div>
                            <p className="font-black text-gray-900">Control de Asistencia</p>
                            <p className="text-xs font-bold text-gray-500 italic">Validación GPS Sucursal Central</p>
                        </div>
                    </div>
                    <button 
                        onClick={handleCheckInOut}
                        disabled={isCheckingIn}
                        className="px-8 py-4 bg-gray-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-black transition-all flex items-center gap-2 group disabled:opacity-50"
                    >
                        {isCheckingIn ? (
                            <Clock className="animate-spin text-primary" size={18} />
                        ) : (
                            <MapPin className="text-primary group-hover:scale-125 transition-transform" size={18} />
                        )}
                        Registrar Entrada/Salida
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left">
                    {/* Recent Attendance */}
                    <div className="space-y-6">
                        <h4 className="text-lg font-black text-gray-900 flex items-center gap-2">
                            <Clock size={20} className="text-primary" />
                            Registro de Asistencia
                        </h4>
                        <div className="space-y-3">
                            {attendance.map((a) => (
                                <div key={a.id} className="p-4 bg-white border border-gray-100 rounded-2xl flex justify-between items-center group hover:border-primary/20 transition-all">
                                    <div className="flex items-center gap-3">
                                        <div className={cn(
                                            "w-2 h-2 rounded-full",
                                            a.status === 'ON_TIME' ? "bg-green-500" : "bg-amber-500"
                                        )} />
                                        <div>
                                            <p className="text-xs font-black text-gray-900">{formatDate(a.date).split(' ')[0]}</p>
                                            <p className="text-[10px] font-bold text-gray-400 uppercase">{a.location}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[10px] font-black text-gray-900">{a.checkIn} - {a.checkOut}</p>
                                        <p className={cn(
                                            "text-[8px] font-bold uppercase",
                                            a.status === 'ON_TIME' ? "text-green-600" : "text-amber-600"
                                        )}>{a.status === 'ON_TIME' ? 'PUNTUAL' : 'RETARDO'}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Incidents & Vacations */}
                    <div className="space-y-6">
                        <h4 className="text-lg font-black text-gray-900 flex items-center gap-2">
                            <Plane size={20} className="text-primary" />
                            Incidencias y Vacaciones
                        </h4>
                        <div className="space-y-3">
                            {incidents.map((i) => (
                                <div key={i.id} className="p-5 bg-white border border-gray-100 rounded-2xl space-y-3 hover:border-primary/20 transition-all">
                                    <div className="flex justify-between items-start">
                                        <div className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-[8px] font-black uppercase tracking-widest">
                                            {i.type}
                                        </div>
                                        <div className="flex items-center gap-1 text-green-600">
                                            <CheckCircle2 size={12} />
                                            <span className="text-[8px] font-black uppercase tracking-widest">{i.status}</span>
                                        </div>
                                    </div>
                                    <p className="text-sm font-bold text-gray-900 leading-tight">{i.description}</p>
                                    <div className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase">
                                        <Calendar size={12} />
                                        <span>Del {formatDate(i.startDate).split(' ')[0]} al {formatDate(i.endDate).split(' ')[0]}</span>
                                    </div>
                                </div>
                            ))}
                            <button className="w-full py-4 border-2 border-dashed border-gray-100 rounded-2xl text-[10px] font-black text-gray-400 uppercase tracking-widest hover:border-primary/30 hover:text-primary transition-all flex items-center justify-center gap-2">
                                <Plus size={14} /> Nueva Solicitud
                            </button>
                        </div>
                    </div>
                </div>

                {/* Fiscal Details Section */}
                <div className="pt-8 border-t border-gray-100 space-y-6">
                    <h4 className="text-lg font-black text-gray-900 flex items-center gap-2">
                        <ShieldCheck size={20} className="text-primary" />
                        Información Fiscal y Contractual
                    </h4>
                    <div className="grid grid-cols-2 gap-y-6 gap-x-12">
                        {[
                            { label: 'RFC', value: employee.rfc },
                            { label: 'CURP', value: employee.curp },
                            { label: 'Cuenta Bancaria', value: employee.bankAccount },
                            { label: 'Régimen Fiscal', value: employee.taxRegime },
                            { label: 'Ingreso', value: formatDate(employee.hireDate).split(' ')[0] },
                            { label: 'Código Postal', value: employee.zipCode },
                        ].map((field, idx) => (
                            <div key={idx}>
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{field.label}</p>
                                <p className="text-sm font-bold text-gray-900">{field.value}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

const cn = (...classes: any[]) => classes.filter(Boolean).join(' ');

const Plus = ({ size }: { size: number }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
);
