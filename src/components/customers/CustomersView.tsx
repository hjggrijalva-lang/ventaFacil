import React, { useState } from 'react';
import { usePOS } from '../../context/POSContext';
import { Customer } from '../../types';
import { 
  Users, 
  Plus, 
  Search, 
  Phone, 
  CreditCard, 
  CheckCircle2, 
  X, 
  DollarSign, 
  UserPlus,
  MessageCircle
} from 'lucide-react';

export const CustomersView: React.FC = () => {
  const {
    customers,
    addCustomer,
    updateCustomerCredit,
    settings,
    playSound,
  } = usePOS();

  const [searchQuery, setSearchQuery] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [payingCustomer, setPayingCustomer] = useState<Customer | null>(null);
  const [paymentAmount, setPaymentAmount] = useState('');

  // New Customer Form State
  const [name, setName] = useState('');
  const [docNumber, setDocNumber] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');

  const totalCreditOutstanding = customers.reduce((sum, c) => sum + c.creditBalance, 0);

  const filteredCustomers = customers.filter((c) => {
    const q = searchQuery.toLowerCase().trim();
    return (
      !q ||
      c.name.toLowerCase().includes(q) ||
      c.docNumber.includes(q) ||
      c.phone.includes(q)
    );
  });

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !docNumber.trim()) return;

    addCustomer({
      name: name.trim(),
      docNumber: docNumber.trim(),
      phone: phone.trim(),
      email: email.trim(),
      address: address.trim(),
    });

    setName('');
    setDocNumber('');
    setPhone('');
    setEmail('');
    setAddress('');
    setIsAddModalOpen(false);
  };

  const handlePayCreditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!payingCustomer) return;
    const amt = parseFloat(paymentAmount);
    if (isNaN(amt) || amt <= 0) return;

    // Deduct from customer's credit balance
    updateCustomerCredit(payingCustomer.id, -amt);
    setPaymentAmount('');
    setPayingCustomer(null);
    playSound('success');
  };

  return (
    <div className="flex flex-col h-full bg-[#F8F9FA] overflow-y-auto pb-20">
      {/* Top Banner */}
      <div className="bg-white border-b border-gray-200 p-4">
        <div className="max-w-5xl mx-auto space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Directorio de Clientes</h2>
              <p className="text-xs text-gray-500">
                Gestión de cuentas corrientes, control de fiados y datos de facturación.
              </p>
            </div>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="h-11 px-4 bg-[#1976D2] hover:bg-[#1565C0] text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 shadow-xs transition-colors shrink-0"
            >
              <UserPlus className="w-4 h-4" />
              <span>Nuevo Cliente</span>
            </button>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-3">
              <span className="text-[11px] font-bold text-gray-500 uppercase">Clientes Registrados</span>
              <div className="text-2xl font-extrabold text-gray-900 mt-0.5 tnum">
                {customers.length}
              </div>
            </div>

            <div className="bg-amber-50/60 border border-amber-200 rounded-xl p-3">
              <span className="text-[11px] font-bold text-amber-800 uppercase">Total en Fiados / Créditos</span>
              <div className="text-2xl font-extrabold text-[#ED6C02] mt-0.5 tnum">
                {settings.currency}{totalCreditOutstanding.toFixed(2)}
              </div>
            </div>

            <div className="bg-gray-50 border border-gray-200 rounded-xl p-3 col-span-2 sm:col-span-1">
              <span className="text-[11px] font-bold text-gray-500 uppercase">Clientes con Saldo Deudor</span>
              <div className="text-2xl font-extrabold text-gray-900 mt-0.5 tnum">
                {customers.filter((c) => c.creditBalance > 0).length}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Search & List */}
      <div className="max-w-5xl w-full mx-auto p-4 space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar cliente por nombre, cédula o teléfono..."
            className="w-full h-11 pl-9 pr-9 bg-white border border-[#D1D5DB] rounded-lg text-sm text-gray-900 focus:ring-2 focus:ring-[#1976D2]"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Customers Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filteredCustomers.map((cust) => {
            const hasDebt = cust.creditBalance > 0;
            return (
              <div
                key={cust.id}
                className="bg-white rounded-xl border border-gray-200 p-4 shadow-2xs hover:shadow-md transition-shadow flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <h3 className="text-sm font-bold text-gray-900 truncate">{cust.name}</h3>
                      <div className="text-xs text-gray-500 font-mono mt-0.5">
                        CI/RUC: {cust.docNumber}
                      </div>
                    </div>
                    {hasDebt ? (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#FFF3E0] text-[#ED6C02] shrink-0 uppercase">
                        Debe
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#E8F5E9] text-[#2E7D32] shrink-0 uppercase">
                        Al día
                      </span>
                    )}
                  </div>

                  <div className="mt-3 space-y-1 text-xs text-gray-600">
                    {cust.phone && (
                      <div className="flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 text-gray-400" />
                        <span>{cust.phone}</span>
                      </div>
                    )}
                    {cust.address && (
                      <div className="text-[11px] text-gray-400 truncate">
                        {cust.address}
                      </div>
                    )}
                  </div>

                  <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between text-xs">
                    <div>
                      <span className="text-[10px] text-gray-400 block uppercase">Total Comprado</span>
                      <span className="font-bold text-gray-800 tnum">
                        {settings.currency}{cust.totalSpent.toFixed(2)}
                      </span>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] text-gray-400 block uppercase">Saldo Fiado</span>
                      <span
                        className={`font-extrabold text-sm tnum ${
                          hasDebt ? 'text-[#ED6C02]' : 'text-gray-400'
                        }`}
                      >
                        {settings.currency}{cust.creditBalance.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="mt-3 pt-2.5 border-t border-gray-100 flex items-center gap-2">
                  {cust.phone && cust.phone !== '0999999999' && (
                    <a
                      href={`https://wa.me/${cust.phone.replace(/[^0-9]/g, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-[#2E7D32] transition-colors"
                      title="Enviar mensaje por WhatsApp"
                    >
                      <MessageCircle className="w-4 h-4" />
                    </a>
                  )}

                  {hasDebt && (
                    <button
                      onClick={() => {
                        setPayingCustomer(cust);
                        setPaymentAmount(cust.creditBalance.toFixed(2));
                      }}
                      className="flex-1 h-9 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <DollarSign className="w-3.5 h-3.5" />
                      <span>Abonar Deuda</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Add Customer Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-2xl border border-gray-200">
            <h3 className="text-base font-bold text-gray-900 mb-3">Registrar Nuevo Cliente</h3>

            <form onSubmit={handleAddSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Nombre Completo *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Juan Pérez Morales"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full h-10 px-3 bg-white border border-gray-300 rounded-lg text-xs text-gray-900 focus:ring-2 focus:ring-[#1976D2]"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Cédula / RUC / Pasaporte *
                </label>
                <input
                  type="text"
                  required
                  placeholder="1710000000"
                  value={docNumber}
                  onChange={(e) => setDocNumber(e.target.value)}
                  className="w-full h-10 px-3 bg-white border border-gray-300 rounded-lg text-xs font-mono text-gray-900 focus:ring-2 focus:ring-[#1976D2]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Teléfono / Celular (WhatsApp)
                </label>
                <input
                  type="tel"
                  placeholder="0991234567"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full h-10 px-3 bg-white border border-gray-300 rounded-lg text-xs text-gray-900 focus:ring-2 focus:ring-[#1976D2]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Dirección
                </label>
                <input
                  type="text"
                  placeholder="Calle y número de casa"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full h-10 px-3 bg-white border border-gray-300 rounded-lg text-xs text-gray-900 focus:ring-2 focus:ring-[#1976D2]"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="flex-1 h-10 border border-gray-300 rounded-lg text-xs font-semibold text-gray-700 hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 h-10 bg-[#1976D2] hover:bg-[#1565C0] text-white rounded-lg text-xs font-bold"
                >
                  Guardar Cliente
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Pay Credit Modal */}
      {payingCustomer && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xs w-full p-5 shadow-2xl border border-gray-200">
            <h3 className="text-base font-bold text-gray-900 mb-1">Abonar a Cuenta</h3>
            <p className="text-xs text-gray-500 mb-3">{payingCustomer.name}</p>

            <div className="p-3 bg-amber-50 rounded-lg border border-amber-200 mb-3 text-xs">
              <span className="text-amber-800">Saldo pendiente total:</span>
              <div className="text-lg font-bold text-amber-900 tnum">
                {settings.currency}{payingCustomer.creditBalance.toFixed(2)}
              </div>
            </div>

            <form onSubmit={handlePayCreditSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Monto a Abonar ({settings.currency})
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  max={payingCustomer.creditBalance}
                  required
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                  className="w-full h-11 px-3 bg-white border border-gray-300 rounded-lg text-lg font-bold text-gray-900 focus:ring-2 focus:ring-[#2E7D32]"
                  autoFocus
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setPayingCustomer(null)}
                  className="flex-1 h-10 border border-gray-300 rounded-lg text-xs font-semibold text-gray-700 hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 h-10 bg-[#2E7D32] hover:bg-[#1b6d24] text-white rounded-lg text-xs font-bold"
                >
                  Confirmar Abono
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
