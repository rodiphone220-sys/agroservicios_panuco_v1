import React, { useState, useEffect } from 'react';
import {
  Users,
  Plus,
  Search,
  Edit2,
  Trash2,
  Mail,
  Phone,
  MapPin,
  CreditCard,
  X,
  Save,
  UserCheck,
  UserX,
  AlertCircle,
  Building,
  FileText,
  Percent,
  Calendar
} from 'lucide-react';
import { customerStorage } from '../lib/localStorage';
import { Customer } from '../types';
import { cn, formatCurrency } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

export const Customers: React.FC = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);

  const [formData, setFormData] = useState<Partial<Customer>>({
    name: '',
    type: 'FISICA',
    rfc: '',
    curp: '',
    email: '',
    phone: '',
    address: {
      street: '',
      number: '',
      colony: '',
      zip: '',
      city: '',
      state: ''
    },
    creditLimit: 0,
    creditDays: 0,
    discount: 0,
    priceList: 'General',
    status: 'ACTIVO',
    balance: 0
  });

  useEffect(() => {
    const customers = customerStorage.getAll();
    setCustomers(customers);
  }, []);

  const filteredCustomers = customers.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.rfc.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    const customerData = {
      ...formData,
      id: editingCustomer ? editingCustomer.id : `customer-${Date.now()}`,
      balance: editingCustomer ? editingCustomer.balance : 0,
    } as Customer;

    if (editingCustomer) {
      customerStorage.update(customerData);
    } else {
      customerStorage.add(customerData);
    }

    setCustomers(customerStorage.getAll());
    setIsModalOpen(false);
    setEditingCustomer(null);
  };

  const handleDelete = (customer: Customer) => {
    if (confirm(`¿Estás seguro de eliminar al cliente "${customer.name}"?`)) {
      customerStorage.delete(customer.id);
      setCustomers(customerStorage.getAll());
    }
  };

  const handleEdit = (customer: Customer) => {
    setEditingCustomer(customer);
    setFormData(customer);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
        <div className="relative w-full sm:w-96">
          <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input 
            type="text" 
            placeholder="Buscar por nombre, RFC, email..." 
            className="w-full pl-12 pr-4 py-3 bg-white rounded-xl shadow-sm border border-gray-100 outline-none focus:border-primary transition-all"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <button 
          onClick={() => {
            setEditingCustomer(null);
            setIsModalOpen(true);
          }}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-primary text-white rounded-xl font-semibold shadow-lg shadow-primary/20 hover:opacity-90 transition-all"
        >
          <Plus size={20} />
          Nuevo Cliente
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCustomers.map(customer => (
          <motion.div
            layout
            key={customer.id}
            className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 hover:shadow-xl transition-all group relative"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-gray-100 flex items-center justify-center text-gray-400">
                  <Users size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 leading-tight">{customer.name}</h3>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">{customer.rfc}</p>
                </div>
              </div>
              <div className={cn(
                "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider",
                customer.status === 'ACTIVO' ? "bg-green-100 text-green-600" : 
                customer.status === 'MOROSO' ? "bg-red-100 text-red-600" : "bg-gray-100 text-gray-500"
              )}>
                {customer.status}
              </div>
            </div>

            <div className="space-y-3 mb-6">
              <div className="flex items-center gap-3 text-sm text-gray-500">
                <Mail size={16} className="shrink-0" />
                <span className="truncate">{customer.email}</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-500">
                <Phone size={16} className="shrink-0" />
                <span>{customer.phone}</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-500">
                <MapPin size={16} className="shrink-0" />
                <span className="truncate">{customer.address.city}, {customer.address.state}</span>
              </div>
            </div>

            <div className="pt-4 border-t border-gray-50 flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Saldo Actual</p>
                <p className="text-lg font-black text-primary">{formatCurrency(customer.balance)}</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Crédito</p>
                <p className="text-sm font-bold text-gray-700">{formatCurrency(customer.creditLimit)}</p>
              </div>
            </div>

            <div className="absolute top-4 right-4 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={() => handleEdit(customer)}
                className="p-2 bg-white shadow-lg border border-gray-100 text-gray-400 hover:text-primary rounded-xl transition-all"
              >
                <Edit2 size={16} />
              </button>
              <button
                onClick={() => handleDelete(customer)}
                className="p-2 bg-white shadow-lg border border-gray-100 text-gray-400 hover:text-red-500 rounded-xl transition-all"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Modal Form */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl my-8"
            >
              <div className="p-6 border-b border-gray-50 flex items-center justify-between bg-gradient-to-r from-gray-50/50 to-white sticky top-0 rounded-t-3xl">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Users className="text-primary" size={20} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">
                      {editingCustomer ? 'Editar Cliente' : 'Nuevo Cliente'}
                    </h3>
                    <p className="text-xs text-gray-500">
                      {editingCustomer ? `ID: ${editingCustomer.id}` : 'Registro de cliente nuevo'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-2 text-gray-400 hover:bg-white hover:shadow-lg rounded-xl transition-all"
                >
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handleSave}>
                <div className="p-6 max-h-[70vh] overflow-y-auto">
                  {/* Datos Generales */}
                  <div className="mb-8">
                    <div className="flex items-center gap-2 mb-4">
                      <Building className="text-primary" size={20} />
                      <h4 className="text-lg font-bold text-gray-900">Datos Generales</h4>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="md:col-span-2">
                        <label className="block text-sm font-bold text-gray-700 mb-2">
                          Nombre / Razón Social *
                        </label>
                        <input
                          type="text"
                          required
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          className="w-full px-4 py-3 bg-gray-50 rounded-xl border border-gray-200 outline-none focus:border-primary focus:bg-white transition-all"
                          placeholder="Ej. Juan Pérez o EMPRESA SA DE CV"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">
                          Tipo de Persona *
                        </label>
                        <select
                          value={formData.type}
                          onChange={(e) => setFormData({ ...formData, type: e.target.value as 'FISICA' | 'MORAL' })}
                          className="w-full px-4 py-3 bg-gray-50 rounded-xl border border-gray-200 outline-none focus:border-primary focus:bg-white transition-all"
                        >
                          <option value="FISICA">Persona Física</option>
                          <option value="MORAL">Persona Moral</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">
                          RFC *
                        </label>
                        <input
                          type="text"
                          required
                          value={formData.rfc}
                          onChange={(e) => setFormData({ ...formData, rfc: e.target.value.toUpperCase() })}
                          className="w-full px-4 py-3 bg-gray-50 rounded-xl border border-gray-200 outline-none focus:border-primary focus:bg-white transition-all uppercase"
                          placeholder="Ej. XAXX010101000"
                          maxLength={13}
                        />
                      </div>

                      {formData.type === 'FISICA' && (
                        <div className="md:col-span-2">
                          <label className="block text-sm font-bold text-gray-700 mb-2">
                            CURP
                          </label>
                          <input
                            type="text"
                            value={formData.curp || ''}
                            onChange={(e) => setFormData({ ...formData, curp: e.target.value.toUpperCase() })}
                            className="w-full px-4 py-3 bg-gray-50 rounded-xl border border-gray-200 outline-none focus:border-primary focus:bg-white transition-all uppercase"
                            placeholder="Ej. XAXX010101HDFXXX09"
                            maxLength={18}
                          />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Datos de Contacto */}
                  <div className="mb-8">
                    <div className="flex items-center gap-2 mb-4">
                      <Phone className="text-primary" size={20} />
                      <h4 className="text-lg font-bold text-gray-900">Datos de Contacto</h4>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">
                          Email *
                        </label>
                        <input
                          type="email"
                          required
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          className="w-full px-4 py-3 bg-gray-50 rounded-xl border border-gray-200 outline-none focus:border-primary focus:bg-white transition-all"
                          placeholder="cliente@email.com"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">
                          Teléfono *
                        </label>
                        <input
                          type="tel"
                          required
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          className="w-full px-4 py-3 bg-gray-50 rounded-xl border border-gray-200 outline-none focus:border-primary focus:bg-white transition-all"
                          placeholder="Ej. 55 1234 5678"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Domicilio */}
                  <div className="mb-8">
                    <div className="flex items-center gap-2 mb-4">
                      <MapPin className="text-primary" size={20} />
                      <h4 className="text-lg font-bold text-gray-900">Domicilio</h4>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">
                          Calle *
                        </label>
                        <input
                          type="text"
                          required
                          value={formData.address?.street || ''}
                          onChange={(e) => setFormData({ ...formData, address: { ...formData.address!, street: e.target.value } })}
                          className="w-full px-4 py-3 bg-gray-50 rounded-xl border border-gray-200 outline-none focus:border-primary focus:bg-white transition-all"
                          placeholder="Ej. Av. Principal"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-sm font-bold text-gray-700 mb-2">
                            Número *
                          </label>
                          <input
                            type="text"
                            required
                            value={formData.address?.number || ''}
                            onChange={(e) => setFormData({ ...formData, address: { ...formData.address!, number: e.target.value } })}
                            className="w-full px-4 py-3 bg-gray-50 rounded-xl border border-gray-200 outline-none focus:border-primary focus:bg-white transition-all"
                            placeholder="123"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-bold text-gray-700 mb-2">
                            Colonia *
                          </label>
                          <input
                            type="text"
                            required
                            value={formData.address?.colony || ''}
                            onChange={(e) => setFormData({ ...formData, address: { ...formData.address!, colony: e.target.value } })}
                            className="w-full px-4 py-3 bg-gray-50 rounded-xl border border-gray-200 outline-none focus:border-primary focus:bg-white transition-all"
                            placeholder="Centro"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">
                          Código Postal *
                        </label>
                        <input
                          type="text"
                          required
                          value={formData.address?.zip || ''}
                          onChange={(e) => setFormData({ ...formData, address: { ...formData.address!, zip: e.target.value } })}
                          className="w-full px-4 py-3 bg-gray-50 rounded-xl border border-gray-200 outline-none focus:border-primary focus:bg-white transition-all"
                          placeholder="Ej. 06600"
                          maxLength={5}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">
                          Ciudad *
                        </label>
                        <input
                          type="text"
                          required
                          value={formData.address?.city || ''}
                          onChange={(e) => setFormData({ ...formData, address: { ...formData.address!, city: e.target.value } })}
                          className="w-full px-4 py-3 bg-gray-50 rounded-xl border border-gray-200 outline-none focus:border-primary focus:bg-white transition-all"
                          placeholder="Ej. Ciudad de México"
                        />
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-sm font-bold text-gray-700 mb-2">
                          Estado *
                        </label>
                        <input
                          type="text"
                          required
                          value={formData.address?.state || ''}
                          onChange={(e) => setFormData({ ...formData, address: { ...formData.address!, state: e.target.value } })}
                          className="w-full px-4 py-3 bg-gray-50 rounded-xl border border-gray-200 outline-none focus:border-primary focus:bg-white transition-all"
                          placeholder="Ej. Ciudad de México"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Configuración Comercial */}
                  <div className="mb-6">
                    <div className="flex items-center gap-2 mb-4">
                      <CreditCard className="text-primary" size={20} />
                      <h4 className="text-lg font-bold text-gray-900">Configuración Comercial</h4>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">
                          Límite de Crédito
                        </label>
                        <div className="relative">
                          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-bold">$</span>
                          <input
                            type="number"
                            value={formData.creditLimit}
                            onChange={(e) => setFormData({ ...formData, creditLimit: parseFloat(e.target.value) || 0 })}
                            className="w-full pl-8 pr-4 py-3 bg-gray-50 rounded-xl border border-gray-200 outline-none focus:border-primary focus:bg-white transition-all"
                            placeholder="0.00"
                            step="0.01"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">
                          Días de Crédito
                        </label>
                        <div className="relative">
                          <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                          <input
                            type="number"
                            value={formData.creditDays}
                            onChange={(e) => setFormData({ ...formData, creditDays: parseInt(e.target.value) || 0 })}
                            className="w-full pl-10 pr-4 py-3 bg-gray-50 rounded-xl border border-gray-200 outline-none focus:border-primary focus:bg-white transition-all"
                            placeholder="0"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">
                          Descuento (%)
                        </label>
                        <div className="relative">
                          <Percent className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                          <input
                            type="number"
                            value={formData.discount}
                            onChange={(e) => setFormData({ ...formData, discount: parseFloat(e.target.value) || 0 })}
                            className="w-full pl-10 pr-4 py-3 bg-gray-50 rounded-xl border border-gray-200 outline-none focus:border-primary focus:bg-white transition-all"
                            placeholder="0"
                            step="0.1"
                            max="100"
                          />
                        </div>
                      </div>

                      <div className="md:col-span-3">
                        <label className="block text-sm font-bold text-gray-700 mb-2">
                          Lista de Precios
                        </label>
                        <select
                          value={formData.priceList}
                          onChange={(e) => setFormData({ ...formData, priceList: e.target.value })}
                          className="w-full px-4 py-3 bg-gray-50 rounded-xl border border-gray-200 outline-none focus:border-primary focus:bg-white transition-all"
                        >
                          <option value="General">General</option>
                          <option value="Mayoreo">Mayoreo</option>
                          <option value="Especial">Especial</option>
                          <option value="Promocional">Promocional</option>
                        </select>
                      </div>

                      <div className="md:col-span-3">
                        <label className="block text-sm font-bold text-gray-700 mb-2">
                          Estatus
                        </label>
                        <div className="flex gap-4">
                          {(['ACTIVO', 'INACTIVO', 'MOROSO'] as const).map((status) => (
                            <label key={status} className="flex items-center gap-2 cursor-pointer">
                              <input
                                type="radio"
                                name="status"
                                value={status}
                                checked={formData.status === status}
                                onChange={(e) => setFormData({ ...formData, status: e.target.value as Customer['status'] })}
                                className="w-4 h-4 text-primary"
                              />
                              <span className={cn(
                                "text-sm font-bold",
                                status === 'ACTIVO' ? "text-green-600" :
                                status === 'MOROSO' ? "text-red-600" : "text-gray-500"
                              )}>
                                {status}
                              </span>
                            </label>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer Actions */}
                <div className="p-6 border-t border-gray-50 bg-gray-50/50 rounded-b-3xl flex justify-end gap-3 sticky bottom-0">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-6 py-3 bg-white border-2 border-gray-200 text-gray-700 rounded-xl font-bold hover:bg-gray-50 transition-all"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-xl font-bold shadow-lg shadow-primary/20 hover:opacity-90 transition-all"
                  >
                    <Save size={20} />
                    {editingCustomer ? 'Actualizar Cliente' : 'Guardar Cliente'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
