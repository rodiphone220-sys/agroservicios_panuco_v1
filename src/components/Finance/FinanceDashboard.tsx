import React, { useState, useEffect, useMemo } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  ArrowUpRight, 
  ArrowDownLeft, 
  PieChart as PieChartIcon, 
  FileText, 
  Download, 
  Filter,
  BarChart3,
  Calendar,
  Wallet,
  Clock,
  Target,
  ArrowRightLeft
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  AreaChart, Area, PieChart, Pie, Cell 
} from 'recharts';
import { saleStorage, productStorage } from '../../lib/localStorage';
import { formatCurrency, formatDate } from '../../lib/utils';
import { cn } from '../../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';

// Finance Transaction Types
export interface Transaction {
    id: string;
    type: 'INCOME' | 'EXPENSE';
    category: string;
    description: string;
    amount: number;
    timestamp: string;
    source: string; // 'SALE', 'PAYROLL', 'MANUAL', etc.
}

export const FinanceDashboard: React.FC = () => {
  const [sales, setSales] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filterType, setFilterType] = useState<'ALL' | 'INCOME' | 'EXPENSE'>('ALL');

  useEffect(() => {
    const allSales = saleStorage.getAll();
    setSales(allSales);

    // Build ledger from sales and payroll
    const saleTransactions: Transaction[] = allSales.map(s => ({
        id: `trans-${s.id}`,
        type: 'INCOME',
        category: 'Venta',
        description: `Venta #${s.id.slice(-6)}`,
        amount: s.total,
        timestamp: s.timestamp,
        source: 'SALE'
    }));

    // For demo, let's add some mock expenses (rent, light, water)
    const mockExpenses: Transaction[] = [
        { id: 'exp1', type: 'EXPENSE', category: 'Servicios', description: 'Renta Local', amount: 15000, timestamp: new Date(Date.now() - 86400000 * 2).toISOString(), source: 'MANUAL' },
        { id: 'exp2', type: 'EXPENSE', category: 'Insumos', description: 'Papelería y Limpieza', amount: 1200, timestamp: new Date(Date.now() - 86400000 * 5).toISOString(), source: 'MANUAL' }
    ];

    const payrollData = JSON.parse(localStorage.getItem('farmer_parts_payroll_history') || '[]');
    const payrollTransactions: Transaction[] = payrollData.map((p: any) => ({
        id: `trans-${p.id}`,
        type: 'EXPENSE',
        category: 'Nómina',
        description: `Pago nómina ${p.employeeName}`,
        amount: p.grossSalary,
        timestamp: p.date,
        source: 'PAYROLL'
    }));

    setTransactions([...saleTransactions, ...mockExpenses, ...payrollTransactions].sort((a,b) => b.timestamp.localeCompare(a.timestamp)));
  }, []);

  const stats = useMemo(() => {
    const income = transactions.filter(t => t.type === 'INCOME').reduce((s,t) => s + t.amount, 0);
    const expense = transactions.filter(t => t.type === 'EXPENSE').reduce((s,t) => s + t.amount, 0);
    return {
        income,
        expense,
        profit: income - expense,
        margin: income > 0 ? ((income - expense) / income * 100).toFixed(1) : 0
    };
  }, [transactions]);

  const chartData = useMemo(() => {
    const map: Record<string, { date: string, income: number, expense: number }> = {};
    const last15Days = Array.from({ length: 15 }, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - i);
        return d.toISOString().split('T')[0];
    }).reverse();

    last15Days.forEach(d => map[d] = { date: d.split('-').slice(1).join('/'), income: 0, expense: 0 });

    transactions.forEach(t => {
        const day = t.timestamp.split('T')[0];
        if (map[day]) {
            if (t.type === 'INCOME') map[day].income += t.amount;
            else map[day].expense += t.amount;
        }
    });

    return Object.values(map);
  }, [transactions]);

  const COLORS = ['#10b981', '#ef4444', '#f59e0b', '#3b82f6'];

  return (
    <div className="space-y-8 pb-12">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Ingresos Totales', value: stats.income, icon: ArrowUpRight, color: 'text-green-600', bg: 'bg-green-50' },
          { label: 'Egresos Totales', value: stats.expense, icon: ArrowDownLeft, color: 'text-red-600', bg: 'bg-red-50' },
          { label: 'Utilidad Neta', value: stats.profit, icon: DollarSign, color: 'text-primary', bg: 'bg-primary/10' },
          { label: 'Margen de Utilidad', value: `${stats.margin}%`, icon: Target, color: 'text-amber-600', bg: 'bg-amber-50' },
        ].map((stat, i) => (
          <motion.div 
            key={i} 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm flex items-center gap-5 translate-y-0 hover:-translate-y-1 transition-all"
          >
            <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center", stat.bg)}>
              <stat.icon size={28} className={stat.color} />
            </div>
            <div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{stat.label}</p>
              <p className="text-xl font-black text-gray-900">
                {typeof stat.value === 'number' ? formatCurrency(stat.value) : stat.value}
              </p>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Chart */}
        <div className="lg:col-span-2 bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm">
          <div className="flex justify-between items-center mb-8">
            <h3 className="font-black text-xl text-gray-900 tracking-tight flex items-center gap-2">
                <BarChart3 className="text-primary" />
                Flujo de Caja (Caja Activa)
            </h3>
            <div className="flex gap-2 text-[10px] font-black uppercase tracking-widest">
                <span className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-primary" /> Ingresos</span>
                <span className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-red-400" /> Egresos</span>
            </div>
          </div>
          <div className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }} tickFormatter={(v) => `$${v/1000}k`} />
                <Tooltip 
                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', padding: '12px' }}
                />
                <Area type="monotone" dataKey="income" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorIncome)" />
                <Area type="monotone" dataKey="expense" stroke="#ef4444" strokeWidth={3} fill="transparent" strokeDasharray="5 5" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Ledger - Recent Movements */}
        <div className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm flex flex-col">
            <div className="flex justify-between items-center mb-6">
                <h3 className="font-black text-lg text-gray-900 flex items-center gap-2">
                    <ArrowRightLeft className="text-primary" />
                    Libro Mayor (Ledger)
                </h3>
                <button className="text-[10px] font-black text-primary uppercase tracking-widest hover:underline">Ver Todo</button>
            </div>
            <div className="space-y-4 flex-1 overflow-y-auto pr-2 custom-scrollbar max-h-[400px]">
                {transactions.slice(0, 10).map((t) => (
                    <div key={t.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl group hover:bg-white border border-transparent hover:border-gray-100 transition-all">
                        <div className="flex items-center gap-3">
                            <div className={cn(
                                "w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
                                t.type === 'INCOME' ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"
                            )}>
                                {t.type === 'INCOME' ? <ArrowUpRight size={20} /> : <ArrowDownLeft size={20} />}
                            </div>
                            <div>
                                <p className="text-sm font-black text-gray-900 leading-tight">{t.description}</p>
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{t.category} • {formatDate(t.timestamp).split(' ')[0]}</p>
                            </div>
                        </div>
                        <p className={cn(
                            "text-sm font-black",
                            t.type === 'INCOME' ? "text-green-600" : "text-red-500"
                        )}>
                            {t.type === 'INCOME' ? '+' : '-'}{formatCurrency(t.amount)}
                        </p>
                    </div>
                ))}
            </div>
        </div>
      </div>
    </div>
  );
};
