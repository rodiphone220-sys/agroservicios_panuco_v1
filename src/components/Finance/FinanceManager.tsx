import React, { useState } from 'react';
import { 
  BarChart3, 
  Wallet, 
  ArrowRightLeft, 
  FileText, 
  ShieldCheck, 
  Users,
  PieChart as PieChartIcon,
  ChevronRight,
  TrendingUp,
  CreditCard,
  UserPlus
} from 'lucide-react';
import { FinanceDashboard } from './FinanceDashboard';
import { ShiftClosing } from './ShiftClosing';
import { PayrollManager } from './PayrollManager';
import { cn } from '../../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

type FinanceTab = 'dashboard' | 'ledger' | 'closing' | 'accounts' | 'payroll';

export const FinanceManager: React.FC = () => {
    const [activeTab, setActiveTab] = useState<FinanceTab>('dashboard');

    const tabs = [
        { id: 'dashboard', label: 'Dashboard', icon: PieChartIcon },
        { id: 'closing', label: 'Corte de Caja', icon: ShieldCheck },
        { id: 'payroll', label: 'Nómina', icon: Wallet },
        { id: 'accounts', label: 'Cuentas por Cobrar', icon: UserPlus },
    ];

    const renderTab = () => {
        switch (activeTab) {
            case 'dashboard': return <FinanceDashboard />;
            case 'closing': return <ShiftClosing />;
            case 'payroll': return <PayrollManager />;
            case 'accounts': return (
                <div className="bg-white p-20 rounded-[40px] border border-gray-100 text-center space-y-4">
                    <UserPlus size={64} className="text-gray-200 mx-auto" />
                    <h3 className="text-xl font-black text-gray-900">Módulo de Cuentas por Cobrar</h3>
                    <p className="text-gray-400 max-w-sm mx-auto font-bold tracking-tight">Estamos sincronizando el historial de ventas a crédito para generar el consolidado de deuda por cliente.</p>
                </div>
            );
            default: return <FinanceDashboard />;
        }
    };

    return (
        <div className="space-y-10 pb-20">
            {/* Horizontal Sub-Navigation */}
            <div className="flex flex-wrap items-center gap-2 bg-white/50 backdrop-blur-sm p-2 rounded-3xl border border-gray-100 w-fit">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as FinanceTab)}
                        className={cn(
                            "flex items-center gap-2 px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all",
                            activeTab === tab.id 
                                ? "bg-gray-900 text-white shadow-xl shadow-black/20" 
                                : "text-gray-400 hover:text-gray-900 hover:bg-white"
                        )}
                    >
                        <tab.icon size={16} />
                        {tab.label}
                    </button>
                ))}
            </div>

            <motion.div
                key={activeTab}
                initial={{ opacity: 0, scale: 0.98, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.3 }}
            >
                {renderTab()}
            </motion.div>
        </div>
    );
};
