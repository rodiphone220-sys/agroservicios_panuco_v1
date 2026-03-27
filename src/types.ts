export type Role = 'ADMIN' | 'VENDEDOR' | 'ALMACENISTA' | 'GERENTE' | 'CAJERO';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  branchId?: string;
}

export interface Product {
  id: string;
  pieceNumber: string;
  description: string;
  brand: string;
  model: string;
  purchasePrice: number;
  salePrice: number;
  stock: number;
  minStock: number;
  maxStock: number;
  location: string;
  imageUrl: string;
  barcode: string;
  vendorId: string;
  leadTime: number;
  category: string;
}

export interface SaleItem {
  productId: string;
  pieceNumber: string;
  description: string;
  quantity: number;
  price: number;
  subtotal: number;
  imageUrl?: string;
}

export interface Sale {
  id: string;
  customerId?: string;
  items: SaleItem[];
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  paymentMethod: 'EFECTIVO' | 'TARJETA' | 'TRANSFERENCIA' | 'CRÉDITO';
  status: 'COMPLETED' | 'CANCELLED' | 'QUOTATION';
  timestamp: string;
  sellerId: string;
}

export interface Customer {
  id: string;
  name: string;
  type: 'FISICA' | 'MORAL';
  rfc: string;
  curp?: string;
  address: {
    street: string;
    number: string;
    colony: string;
    zip: string;
    city: string;
    state: string;
  };
  email: string;
  phone: string;
  creditLimit: number;
  creditDays: number;
  discount: number;
  priceList: string;
  status: 'ACTIVO' | 'INACTIVO' | 'MOROSO';
  balance: number;
}

export interface Vendor {
  id: string;
  name: string;
  type: 'NACIONAL' | 'INTERNACIONAL';
  rfc: string;
  address: string;
  email: string;
  phone: string;
  contact: string;
  leadTime: number;
  rating: number;
}

export interface BusinessConfig {
  name: string;
  logo: string;
  primaryColor: string;
  secondaryColor: string;
  rfc: string;
  address: string;
  terms: string;
}

export interface InventoryMovement {
  id: string;
  productId: string;
  type: 'IN' | 'OUT' | 'ADJ';
  quantity: number;
  reason: string;
  timestamp: string;
  userId: string;
}

export interface Employee {
  id: string;
  uid: string;
  name: string;
  rfc: string;
  curp: string;
  role: Role;
  position: string;
  hireDate: string;
  salary: number;
  commissionRate: number;
  status: 'ACTIVE' | 'INACTIVE';
  bankAccount: string;
  taxRegime: string;
  zipCode: string;
  email: string;
}

export interface Attendance {
  id: string;
  employeeId: string;
  date: string;
  checkIn: string;
  checkOut?: string;
  location?: {
    latitude: number;
    longitude: number;
  };
  status: 'PRESENT' | 'ABSENT' | 'LATE' | 'VACATION';
}

export interface Invoice {
  id: string;
  folio: string;
  series: string;
  uuid?: string;
  date: string;
  total: number;
  taxAmount: number;
  status: 'VIGENTE' | 'CANCELADO' | 'PENDIENTE';
  pacResponse?: any;
  xmlUrl?: string;
  pdfUrl?: string;
  customerId: string;
  saleId: string;
  usage: string;
  paymentMethod: string;
  paymentForm: string;
}

export interface SatConfig {
  encryptedCSD: string;
  encryptedKey: string;
  businessRFC: string;
  businessName: string;
  pacApiKeys: string;
  taxRegime: string;
  address: string;
  zipCode: string;
}

export interface Commission {
  id: string;
  employeeId: string;
  period: string; // e.g., "2024-03"
  totalSales: number;
  calculatedCommission: number;
  status: 'PAID' | 'PENDING';
  salesIds: string[];
}

export interface OCRInvoiceResult {
  proveedor: {
    nombre: string;
    rfc: string;
    folio: string;
    fecha: string;
  };
  cliente: {
    nombre: string;
    rfc: string;
  };
  productos: {
    cantidad: number;
    unidad: string;
    codigo: string;
    descripcion: string;
    precio_unitario: number;
    importe: number;
  }[];
  totales: {
    subtotal: number;
    iva: number;
    total: number;
  };
  moneda: string;
  tipoDocumento?: string;
}

export interface VirtualAssistant {
  id: string;
  name: string;
  specialty: 'pos' | 'inventory' | 'finance' | 'hr' | 'fiscal' | 'general';
  avatar: string;
  color: string;
  isActive: boolean;
  identity: {
    description: string;
    instructions: string;
  };
  behavior: {
    tone: string;
    language: string;
    quickCommands: string[];
    autonomyLevel: number;
    sessionDuration: number;
    contextMemory: boolean;
  };
  permissions: {
    canAccessInventory: boolean;
    canAccessSales: boolean;
    canAccessCustomers: boolean;
    canAccessReports: boolean;
    canExecuteActions: boolean;
  };
  notifications: {
    enableAlerts: boolean;
    alertTypes: string[];
  };
  createdAt: string;
  updatedAt: string;
  enabledFunctions: string[];
}

export interface AssistantMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
}

export interface AssistantConversation {
  id: string;
  assistantId: string;
  userId: string;
  messages: AssistantMessage[];
  context: any;
  startedAt: string;
  lastActivity: string;
  isActive: boolean;
}

export interface AssistantGlobalSettings {
  autoSwitchByContext: boolean;
  defaultAssistantId: string;
  maxConcurrentAssistants: number;
  allowCustomAssistants: boolean;
}
