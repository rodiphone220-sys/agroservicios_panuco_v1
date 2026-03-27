/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useContext } from 'react';
import { AuthProvider, AuthContext, LoginView } from './components/Auth';
import { ErrorBoundary } from './components/ErrorBoundary';
import { Layout } from './components/Layout';
import { POS } from './components/POS';
import { Inventory } from './components/Inventory';
import { Customers } from './components/Customers';
import { Vendors } from './components/Vendors';
import { Reports } from './components/Reports';
import { Settings } from './components/Settings';
import { EmployeeList } from './components/HR/EmployeeList';
import { CommissionCalculator } from './components/HR/CommissionCalculator';
import { AttendanceManager } from './components/HR/AttendanceManager';
import { SatConfigWizard } from './components/Invoicing/SatConfigWizard';
import { TaxReports } from './components/Invoicing/TaxReports';
import { TraditionalInvoiceMaker } from './components/Invoicing/TraditionalInvoiceMaker';
import { OCRInvoiceReader } from './components/OCRInvoiceReader';
import { FinanceManager } from './components/Finance/FinanceManager';
import { BarChart3, Settings as SettingsIcon, AlertCircle } from 'lucide-react';

function AppContent() {
  const { user, loading } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState('pos');

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-primary">
        <div className="w-12 h-12 border-4 border-white/30 border-t-white rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <LoginView />;
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'pos': return <POS />;
      case 'inventory': return <Inventory />;
      case 'ocr-reader': return <OCRInvoiceReader />;
      case 'customers': return <Customers />;
      case 'vendors': return <Vendors />;
      case 'reports': return <Reports />;
      case 'employees': return <EmployeeList />;
      case 'commissions': return <CommissionCalculator />;
      case 'attendance': return <AttendanceManager />;
      case 'invoicing': return <TaxReports />;
      case 'professional-invoice': return <TraditionalInvoiceMaker onClose={() => setActiveTab('invoicing')} />;
      case 'sat-config': return <SatConfigWizard />;
      case 'payroll': return <FinanceManager />;
      case 'settings': return <Settings />;
      default: return <POS />;
    }
  };

  return (
    <Layout activeTab={activeTab} setActiveTab={setActiveTab}>
      {renderContent()}
    </Layout>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ErrorBoundary>
  );
}

