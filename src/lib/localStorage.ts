import { User, Product, Customer, Vendor, Sale, InventoryMovement, Employee, BusinessConfig } from '../types';

const STORAGE_KEYS = {
  USERS: 'farmer_parts_users',
  PRODUCTS: 'farmer_parts_products',
  CUSTOMERS: 'farmer_parts_customers',
  VENDORS: 'farmer_parts_vendors',
  SALES: 'farmer_parts_sales',
  INVENTORY_MOVEMENTS: 'farmer_parts_inventory_movements',
  EMPLOYEES: 'farmer_parts_employees',
  BUSINESS_CONFIG: 'farmer_parts_business_config',
  CURRENT_USER: 'farmer_parts_current_user',
  VIRTUAL_ASSISTANTS: 'farmer_parts_virtual_assistants',
  ASSISTANT_CONVERSATIONS: 'farmer_parts_assistant_conversations',
  ATTENDANCE: 'farmer_parts_attendance',
  COMMISSIONS: 'farmer_parts_commissions',
  INVOICES: 'farmer_parts_invoices',
  SAT_CONFIG: 'farmer_parts_sat_config',
  PENDING_IMPORTS: 'farmer_parts_pending_imports',
  FILTER_TEMPLATES: 'farmer_parts_filter_templates',
};

// Generic LocalStorage helpers
export const storage = {
  get: <T>(key: string): T[] => {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error(`Error reading ${key} from localStorage:`, error);
      return [];
    }
  },

  set: <T>(key: string, data: T[]): void => {
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
      console.error(`Error writing ${key} to localStorage:`, error);
    }
  },

  add: <T extends { id: string }>(key: string, item: T): void => {
    const items = storage.get<T>(key);
    items.push(item);
    storage.set(key, items);
  },

  update: <T extends { id: string }>(key: string, item: T): void => {
    const items = storage.get<T>(key);
    const index = items.findIndex(i => i.id === item.id);
    if (index !== -1) {
      items[index] = item;
      storage.set(key, items);
    }
  },

  delete: (key: string, id: string): void => {
    const items = storage.get<any>(key);
    const filtered = items.filter(i => i.id !== id);
    storage.set(key, filtered);
  },

  getById: <T extends { id: string }>(key: string, id: string): T | null => {
    const items = storage.get<T>(key);
    return items.find(i => i.id === id) || null;
  },

  getCurrentUser: (): User | null => {
    const data = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
    return data ? JSON.parse(data) : null;
  },

  setCurrentUser: (user: User | null): void => {
    if (user) {
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
    } else {
      localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    }
  },
};

// User operations
export const userStorage = {
  getAll: (): User[] => storage.get<User>(STORAGE_KEYS.USERS),
  getById: (id: string): User | null => storage.getById<User>(STORAGE_KEYS.USERS, id),
  add: (user: User) => storage.add(STORAGE_KEYS.USERS, user),
  update: (user: User) => storage.update(STORAGE_KEYS.USERS, user),
  delete: (id: string) => storage.delete(STORAGE_KEYS.USERS, id),
  getCurrentUser: () => storage.getCurrentUser(),
  setCurrentUser: (user: User | null) => storage.setCurrentUser(user),
};

// Product operations
export const productStorage = {
  getAll: (): Product[] => storage.get<Product>(STORAGE_KEYS.PRODUCTS),
  getById: (id: string): Product | null => storage.getById<Product>(STORAGE_KEYS.PRODUCTS, id),
  add: (product: Product) => storage.add(STORAGE_KEYS.PRODUCTS, product),
  update: (product: Product) => storage.update(STORAGE_KEYS.PRODUCTS, product),
  delete: (id: string) => storage.delete(STORAGE_KEYS.PRODUCTS, id),
};

// Customer operations
export const customerStorage = {
  getAll: (): Customer[] => storage.get<Customer>(STORAGE_KEYS.CUSTOMERS),
  getById: (id: string): Customer | null => storage.getById<Customer>(STORAGE_KEYS.CUSTOMERS, id),
  add: (customer: Customer) => storage.add(STORAGE_KEYS.CUSTOMERS, customer),
  update: (customer: Customer) => storage.update(STORAGE_KEYS.CUSTOMERS, customer),
  delete: (id: string) => storage.delete(STORAGE_KEYS.CUSTOMERS, id),
};

// Vendor operations
export const vendorStorage = {
  getAll: (): Vendor[] => storage.get<Vendor>(STORAGE_KEYS.VENDORS),
  getById: (id: string): Vendor | null => storage.getById<Vendor>(STORAGE_KEYS.VENDORS, id),
  add: (vendor: Vendor) => storage.add(STORAGE_KEYS.VENDORS, vendor),
  update: (vendor: Vendor) => storage.update(STORAGE_KEYS.VENDORS, vendor),
  delete: (id: string) => storage.delete(STORAGE_KEYS.VENDORS, id),
};

// Sale operations
export const saleStorage = {
  getAll: (): Sale[] => storage.get<Sale>(STORAGE_KEYS.SALES),
  getById: (id: string): Sale | null => storage.getById<Sale>(STORAGE_KEYS.SALES, id),
  add: (sale: Sale) => storage.add(STORAGE_KEYS.SALES, sale),
  update: (sale: Sale) => storage.update(STORAGE_KEYS.SALES, sale),
  delete: (id: string) => storage.delete(STORAGE_KEYS.SALES, id),
};

// Inventory Movement operations
export const inventoryMovementStorage = {
  getAll: (): InventoryMovement[] => storage.get<InventoryMovement>(STORAGE_KEYS.INVENTORY_MOVEMENTS),
  getById: (id: string): InventoryMovement | null => storage.getById<InventoryMovement>(STORAGE_KEYS.INVENTORY_MOVEMENTS, id),
  add: (movement: InventoryMovement) => storage.add(STORAGE_KEYS.INVENTORY_MOVEMENTS, movement),
};

// Employee operations
export const employeeStorage = {
  getAll: (): Employee[] => storage.get<Employee>(STORAGE_KEYS.EMPLOYEES),
  getById: (id: string): Employee | null => storage.getById<Employee>(STORAGE_KEYS.EMPLOYEES, id),
  add: (employee: Employee) => storage.add(STORAGE_KEYS.EMPLOYEES, employee),
  update: (employee: Employee) => storage.update(STORAGE_KEYS.EMPLOYEES, employee),
  delete: (id: string) => storage.delete(STORAGE_KEYS.EMPLOYEES, id),
};

// Business Config operations
export const businessConfigStorage = {
  get: (): BusinessConfig | null => {
    const items = storage.get<BusinessConfig>(STORAGE_KEYS.BUSINESS_CONFIG);
    return items.length > 0 ? items[0] : null;
  },
  set: (config: BusinessConfig) => {
    storage.set(STORAGE_KEYS.BUSINESS_CONFIG, [config]);
  },
};

// Assistant operations
export const assistantStorage = {
  getAll: (): any[] => storage.get<any>(STORAGE_KEYS.VIRTUAL_ASSISTANTS),
  getById: (id: string): any | null => storage.getById<any>(STORAGE_KEYS.VIRTUAL_ASSISTANTS, id),
  add: (assistant: any) => storage.add(STORAGE_KEYS.VIRTUAL_ASSISTANTS, assistant),
  update: (assistant: any) => storage.update(STORAGE_KEYS.VIRTUAL_ASSISTANTS, assistant),
  delete: (id: string) => storage.delete(STORAGE_KEYS.VIRTUAL_ASSISTANTS, id),
};

// Assistant Conversation operations
export const assistantConversationStorage = {
  getAll: (): any[] => storage.get<any>(STORAGE_KEYS.ASSISTANT_CONVERSATIONS),
  getByUserIdAndAssistantId: (userId: string, assistantId: string): any | null => {
    const items = storage.get<any>(STORAGE_KEYS.ASSISTANT_CONVERSATIONS);
    return items.find(i => i.userId === userId && i.assistantId === assistantId) || null;
  },
  add: (conversation: any) => storage.add(STORAGE_KEYS.ASSISTANT_CONVERSATIONS, conversation),
  update: (conversation: any) => storage.update(STORAGE_KEYS.ASSISTANT_CONVERSATIONS, conversation),
};

// Attendance operations
export const attendanceStorage = {
  getAll: (): any[] => storage.get<any>(STORAGE_KEYS.ATTENDANCE),
  getByDate: (date: string): any[] => {
    const items = storage.get<any>(STORAGE_KEYS.ATTENDANCE);
    return items.filter(i => i.date === date);
  },
  add: (attendance: any) => storage.add(STORAGE_KEYS.ATTENDANCE, attendance),
  update: (attendance: any) => storage.update(STORAGE_KEYS.ATTENDANCE, attendance),
};

// Commission operations
export const commissionStorage = {
  getAll: (): any[] => storage.get<any>(STORAGE_KEYS.COMMISSIONS),
  getByPeriod: (period: string): any[] => {
    const items = storage.get<any>(STORAGE_KEYS.COMMISSIONS);
    return items.filter(i => i.period === period);
  },
  add: (commission: any) => storage.add(STORAGE_KEYS.COMMISSIONS, commission),
  update: (commission: any) => storage.update(STORAGE_KEYS.COMMISSIONS, commission),
};

// Invoice operations
export const invoiceStorage = {
  getAll: (): any[] => storage.get<any>(STORAGE_KEYS.INVOICES),
  getByPeriod: (period: string): any[] => {
    const items = storage.get<any>(STORAGE_KEYS.INVOICES);
    return items.filter(i => i.date.startsWith(period));
  },
  add: (invoice: any) => storage.add(STORAGE_KEYS.INVOICES, invoice),
  update: (invoice: any) => storage.update(STORAGE_KEYS.INVOICES, invoice),
};

// SAT Config operations
export const satConfigStorage = {
  get: (): any => {
    const items = storage.get<any>(STORAGE_KEYS.SAT_CONFIG);
    return items.length > 0 ? items[0] : null;
  },
  set: (config: any) => {
    storage.set(STORAGE_KEYS.SAT_CONFIG, [config]);
  },
};

// Pending Import operations
export const pendingImportStorage = {
  getAll: (): any[] => storage.get<any>(STORAGE_KEYS.PENDING_IMPORTS),
  add: (item: any) => storage.add(STORAGE_KEYS.PENDING_IMPORTS, item),
  update: (item: any) => storage.update(STORAGE_KEYS.PENDING_IMPORTS, item),
  delete: (id: string) => storage.delete(STORAGE_KEYS.PENDING_IMPORTS, id),
};

// Filter Templates operations
export const filterTemplateStorage = {
  getAll: (): any[] => storage.get<any>(STORAGE_KEYS.FILTER_TEMPLATES),
  add: (template: any) => storage.add(STORAGE_KEYS.FILTER_TEMPLATES, template),
  delete: (id: string) => storage.delete(STORAGE_KEYS.FILTER_TEMPLATES, id),
};

// Initialize demo data
export const initializeDemoData = () => {
  // Initialize demo user if not exists
  const users = userStorage.getAll();
  if (users.length === 0) {
    const demoUser: User = {
      id: 'demo-user',
      name: 'Usuario Demo',
      email: 'demo@farmerparts.com',
      role: 'ADMIN',
    };
    userStorage.add(demoUser);
  }

  // Initialize default business config if not exists
  const config = businessConfigStorage.get();
  if (!config) {
    businessConfigStorage.set({
      name: 'Farmer Parts',
      logo: '',
      primaryColor: '#22c55e',
      secondaryColor: '#16a34a',
      rfc: 'FPA850101ABC',
      address: 'Dirección Fiscal, México',
      terms: 'Términos y condiciones',
    });
  }

  // Initialize demo assistants
  const assistants = assistantStorage.getAll();
  if (assistants.length === 0) {
    const demoAssistants = [
      {
        id: 'asst-sales',
        name: 'Salvador',
        specialty: 'Asesor de Ventas',
        avatar: 'sparkles',
        color: '#22c55e',
        isActive: true,
        identity: {
          description: 'Experto en refacciones agrícolas, modelos de tractores y cierre de ventas.',
          instructions: 'Ayuda a identificar piezas por modelo y sugiere productos relacionados.'
        },
        behavior: {
          tone: 'persuasivo y profesional',
          quickCommands: ['Más Vendidos', 'Recomendar Kit']
        }
      },
      {
        id: 'asst-inventory',
        name: 'Isabela',
        specialty: 'Gestión de Inventario',
        avatar: 'robot',
        color: '#3b82f6',
        isActive: true,
        identity: {
          description: 'Especialista en logística, stock crítico y análisis de rotación de SKU.',
          instructions: 'Brinda alertas sobre productos agotados y ayuda en la recepción de mercancía.'
        },
        behavior: {
          tone: 'metódico y analítico',
          quickCommands: ['Stock Bajo', 'Valor de Inv.']
        }
      },
      {
        id: 'asst-finance',
        name: 'Fabio',
        specialty: 'Especialista Financiero',
        avatar: 'target',
        color: '#8b5cf6',
        isActive: true,
        identity: {
          description: 'Analista de rentabilidad, flujo de caja y balances financieros.',
          instructions: 'Explica el estado de la utilidad neta y detecta desviaciones en gastos.'
        },
        behavior: {
          tone: 'serio y detallista',
          quickCommands: ['Margen del Mes', 'Corte de Caja']
        }
      },
      {
        id: 'asst-hr',
        name: 'Hugo',
        specialty: 'Recursos Humanos',
        avatar: 'users',
        color: '#f59e0b',
        isActive: true,
        identity: {
          description: 'Gestor de talento, nómina y cumplimiento de asistencia laboral.',
          instructions: 'Ayuda con cálculos de comisiones para empleados y registros de entrada/salida.'
        },
        behavior: {
          tone: 'cálculo y humano',
          quickCommands: ['Faltas de Hoy', 'Monto de Nómina']
        }
      },
      {
        id: 'asst-tax',
        name: 'Teresa',
        specialty: 'Asesor Fiscal',
        avatar: 'file',
        color: '#ef4444',
        isActive: true,
        identity: {
          description: 'Experta en CFDI 4.0, declaraciones ante el SAT y cumplimiento fiscal mexicano.',
          instructions: 'Verifica la validez de RFCs y asiste en la configuración de regímenes fiscales.'
        },
        behavior: {
          tone: 'preciso y regulatorio',
          quickCommands: ['Validar RFC', 'Status CFDI']
        }
      }
    ];
    demoAssistants.forEach(a => assistantStorage.add(a));
  }

  // Seeding Products
  if (productStorage.getAll().length === 0) {
    [
      { id: '1', pieceNumber: "1660114M91", description: "Bomba de Agua Massey Ferguson 285/290", brand: "MF", model: "285, 290", category: "Motor", purchasePrice: 850, salePrice: 1450, stock: 15, minStock: 5, maxStock: 30, location: "P1-E2-C5", barcode: "750123456789" },
      { id: '2', pieceNumber: "RE504836", description: "Filtro de Aceite John Deere 6403/6603", brand: "JD", model: "6403, 6603", category: "Motor", purchasePrice: 120, salePrice: 245, stock: 45, minStock: 10, maxStock: 100, location: "P2-E1-C1", barcode: "750987654321" },
      { id: '3', pieceNumber: "87300195", description: "Disco de Freno New Holland TS6000", brand: "NH", model: "TS6000, TS6020", category: "Frenos", purchasePrice: 1200, salePrice: 2100, stock: 8, minStock: 4, maxStock: 20, location: "P3-E4-C2", barcode: "750555444333" },
      { id: '4', pieceNumber: "C5NE9430B", description: "Múltiple de Escape Ford 6600", brand: "Ford", model: "6600, 6610", category: "Motor", purchasePrice: 1800, salePrice: 3200, stock: 4, minStock: 2, maxStock: 10, location: "P1-E5-C8", barcode: "750111222333" },
      { id: '5', pieceNumber: "AL156331", description: "Alternador 12V 90A John Deere", brand: "JD", model: "6403, 6603, 7515", category: "Eléctrico", purchasePrice: 2200, salePrice: 3850, stock: 6, minStock: 2, maxStock: 12, location: "P4-E1-C3", barcode: "750222333444" },
    ].forEach(p => productStorage.add(p as any));
  }

  // Seeding Customers
  if (customerStorage.getAll().length === 0) {
    [
      { id: 'c1', name: "Rancho El Porvenir", type: "MORAL", rfc: "RPO123456ABC", email: "contacto@elporvenir.com", phone: "4421234567", balance: 12500, status: "ACTIVO" },
      { id: 'c2', name: "Juan Pérez Agrícola", type: "FISICA", rfc: "PEAJ800101XYZ", email: "juan.perez@gmail.com", phone: "4429876543", balance: 0, status: "ACTIVO" },
    ].forEach(c => customerStorage.add(c as any));
  }

  // Seeding Vendors
  if (vendorStorage.getAll().length === 0) {
    [
      { id: 'v1', name: "Refacciones Agrícolas del Bajío", rfc: "RAB950101G34", contact: "Ing. Alberto Ruiz", phone: "4611234567", rating: 5 },
      { id: 'v2', name: "Tractopartes Importadas S.A.", rfc: "TIM051212H89", contact: "Lic. Martha Sánchez", phone: "8677112233", rating: 4 },
    ].forEach(v => vendorStorage.add(v as any));
  }

  // Seeding Sales
  if (saleStorage.getAll().length === 0) {
    [
      { id: 's1', subtotal: 2900, tax: 464, total: 3364, paymentMethod: 'EFECTIVO', status: 'COMPLETED', timestamp: new Date(Date.now() - 86400000).toISOString(), items: [{ productId: "1", pieceNumber: "1660114M91", description: "Bomba de Agua Massey Ferguson 285/290", quantity: 2, price: 1450, subtotal: 2900 }] },
      { id: 's2', subtotal: 3850, tax: 616, total: 4466, paymentMethod: 'TARJETA', status: 'COMPLETED', timestamp: new Date().toISOString(), items: [{ productId: "5", pieceNumber: "AL156331", description: "Alternador 12V 90A John Deere", quantity: 1, price: 3850, subtotal: 3850 }] },
    ].forEach(s => saleStorage.add(s as any));
  }
};
