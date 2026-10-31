import React, { useState } from 'react';
import { usePOS } from '../../context/POSContext';
import { UserRole } from '../../types';
import { 
  Store, 
  Receipt, 
  Percent, 
  Save, 
  RotateCcw, 
  Volume2, 
  CheckCircle2,
  Users,
  Plus,
  KeyRound,
  LogOut,
  X
} from 'lucide-react';

export const SettingsView: React.FC = () => {
  const {
    settings,
    updateSettings,
    resetAllData,
    playSound,
    users,
    addUser,
    currentUser,
    logout,
  } = usePOS();

  const [form, setForm] = useState(settings);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // New User Modal State
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserPin, setNewUserPin] = useState('');
  const [newUserRole, setNewUserRole] = useState<UserRole>('cashier');

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings(form);
    playSound('success');
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleResetData = () => {
    if (confirm('¿Restablecer todos los datos a la configuración inicial de demostración? Se reiniciarán productos, transacciones, usuarios y carritos.')) {
      resetAllData();
      setForm(settings);
    }
  };

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserName.trim() || !newUserPin.trim() || newUserPin.length !== 4) return;

    addUser({
      name: newUserName.trim(),
      email: newUserEmail.trim() || `${newUserName.toLowerCase().replace(/\s+/g, '')}@ventafacil.com`,
      pin: newUserPin.trim(),
      password: newUserPin.trim(),
      role: newUserRole,
    });

    setNewUserName('');
    setNewUserEmail('');
    setNewUserPin('');
    setNewUserRole('cashier');
    setIsAddUserOpen(false);
    playSound('success');
  };

  return (
    <div className="flex flex-col h-full bg-[#F8F9FA] overflow-y-auto pb-20">
      <div className="bg-white border-b border-gray-200 p-4">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Configuración del Sistema</h2>
            <p className="text-xs text-gray-500">
              Personaliza los datos de tu negocio, impuestos, cajeros y preferencias del POS.
            </p>
          </div>
          {currentUser && (
            <button
              onClick={logout}
              className="px-3 py-2 bg-red-50 hover:bg-red-100 text-[#D32F2F] font-bold text-xs rounded-xl border border-red-200 flex items-center gap-1.5 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Cerrar Sesión</span>
            </button>
          )}
        </div>
      </div>

      <div className="max-w-3xl w-full mx-auto p-4 space-y-4">
        {savedSuccess && (
          <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-xl text-emerald-800 text-xs font-bold flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-[#2E7D32]" />
            <span>Configuración guardada correctamente.</span>
          </div>
        )}

        {/* Cashier & Users Management Card */}
        <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-gray-100">
            <div className="flex items-center gap-2 text-sm font-bold text-gray-900">
              <Users className="w-4 h-4 text-[#1976D2]" />
              <span>Cajeros y Usuarios Autorizados</span>
            </div>
            <button
              type="button"
              onClick={() => setIsAddUserOpen(true)}
              className="px-2.5 py-1.5 bg-[#E8F5E9] hover:bg-[#C8E6C9] text-[#2E7D32] border border-[#A5D6A7] rounded-lg text-xs font-bold flex items-center gap-1 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Nuevo Cajero</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {users.map((u) => {
              const isCurrent = currentUser?.id === u.id;
              return (
                <div
                  key={u.id}
                  className={`p-3 rounded-xl border flex items-center justify-between text-xs ${
                    isCurrent ? 'border-[#2E7D32] bg-emerald-50/50' : 'border-gray-200 bg-white'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-100 border border-gray-300 shrink-0">
                      {u.avatar ? (
                        <img src={u.avatar} alt={u.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center font-bold text-gray-500">
                          {u.name.charAt(0)}
                        </div>
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="font-bold text-gray-900 truncate">{u.name}</div>
                      <div className="text-[10px] text-gray-500 capitalize">{u.role}</div>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="font-mono text-[11px] font-bold text-gray-600 bg-gray-100 px-1.5 py-0.5 rounded flex items-center gap-1">
                      <KeyRound className="w-2.5 h-2.5 text-gray-400" />
                      {u.pin}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          {/* Business Info Card */}
          <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-xs space-y-4">
            <div className="flex items-center gap-2 text-sm font-bold text-gray-900 pb-2 border-b border-gray-100">
              <Store className="w-4 h-4 text-[#2E7D32]" />
              <span>Datos del Comercio / Facturación</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Nombre Comercial del Establecimiento
                </label>
                <input
                  type="text"
                  required
                  value={form.storeName}
                  onChange={(e) => setForm({ ...form, storeName: e.target.value })}
                  className="w-full h-11 px-3 bg-white border border-gray-300 rounded-lg text-sm font-bold text-gray-900 focus:ring-2 focus:ring-[#2E7D32]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  RUC / Identificación Fiscal
                </label>
                <input
                  type="text"
                  required
                  value={form.ruc}
                  onChange={(e) => setForm({ ...form, ruc: e.target.value })}
                  className="w-full h-11 px-3 bg-white border border-gray-300 rounded-lg text-xs font-mono text-gray-900 focus:ring-2 focus:ring-[#2E7D32]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Dirección del Local
                </label>
                <input
                  type="text"
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                  className="w-full h-11 px-3 bg-white border border-gray-300 rounded-lg text-xs text-gray-900 focus:ring-2 focus:ring-[#2E7D32]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Teléfono de Contacto (Para WhatsApp)
                </label>
                <input
                  type="text"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className="w-full h-11 px-3 bg-white border border-gray-300 rounded-lg text-xs text-gray-900 focus:ring-2 focus:ring-[#2E7D32]"
                />
              </div>
            </div>
          </div>

          {/* Taxes & Currency Card */}
          <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-xs space-y-4">
            <div className="flex items-center gap-2 text-sm font-bold text-gray-900 pb-2 border-b border-gray-100">
              <Percent className="w-4 h-4 text-[#1976D2]" />
              <span>Impuestos y Moneda</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Símbolo de Moneda
                </label>
                <input
                  type="text"
                  maxLength={3}
                  value={form.currency}
                  onChange={(e) => setForm({ ...form, currency: e.target.value })}
                  className="w-full h-11 px-3 bg-white border border-gray-300 rounded-lg text-sm font-bold text-gray-900 focus:ring-2 focus:ring-[#2E7D32]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Tarifa IVA General (%)
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={form.taxRate}
                  onChange={(e) => setForm({ ...form, taxRate: parseFloat(e.target.value) || 0 })}
                  className="w-full h-11 px-3 bg-white border border-gray-300 rounded-lg text-sm font-bold text-gray-900 focus:ring-2 focus:ring-[#2E7D32]"
                />
              </div>

              <div className="flex flex-col justify-end">
                <label className="flex items-center gap-2 cursor-pointer p-3 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors">
                  <input
                    type="checkbox"
                    checked={form.enableTax}
                    onChange={(e) => setForm({ ...form, enableTax: e.target.checked })}
                    className="w-4 h-4 text-[#2E7D32] rounded border-gray-300 focus:ring-[#2E7D32]"
                  />
                  <span className="text-xs font-semibold text-gray-800">
                    Calcular IVA Automáticamente
                  </span>
                </label>
              </div>
            </div>
          </div>

          {/* Ticket Receipt Customization */}
          <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-xs space-y-4">
            <div className="flex items-center gap-2 text-sm font-bold text-gray-900 pb-2 border-b border-gray-100">
              <Receipt className="w-4 h-4 text-[#ED6C02]" />
              <span>Mensaje al Pie del Ticket Térmico</span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Texto de Agradecimiento
              </label>
              <textarea
                rows={2}
                value={form.receiptFooterMessage}
                onChange={(e) => setForm({ ...form, receiptFooterMessage: e.target.value })}
                className="w-full p-3 bg-white border border-gray-300 rounded-lg text-xs text-gray-900 focus:ring-2 focus:ring-[#2E7D32]"
                placeholder="¡Gracias por su preferencia! Vuelva pronto."
              />
            </div>
          </div>

          {/* Audio Feedback Test */}
          <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-xs flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-emerald-50 text-[#2E7D32] flex items-center justify-center">
                <Volume2 className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-gray-900">Efectos de Sonido Táctil</h4>
                <p className="text-[11px] text-gray-500">
                  Sonidos de pitido de escaneo POS y confirmación de cobro.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => playSound('success')}
              className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg text-xs font-bold transition-colors"
            >
              Probar Timbre
            </button>
          </div>

          {/* Submit Actions */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button
              type="submit"
              className="flex-1 h-12 bg-[#2E7D32] hover:bg-[#1b6d24] text-white font-bold text-sm rounded-xl flex items-center justify-center gap-2 shadow-xs transition-colors"
            >
              <Save className="w-4 h-4" />
              <span>Guardar Cambios</span>
            </button>

            <button
              type="button"
              onClick={handleResetData}
              className="h-12 px-4 bg-white hover:bg-red-50 text-[#D32F2F] hover:border-red-300 border border-gray-300 font-semibold text-xs rounded-xl flex items-center justify-center gap-2 transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Restablecer Datos Demo</span>
            </button>
          </div>
        </form>
      </div>

      {/* Add Cashier User Modal */}
      {isAddUserOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-2xl border border-gray-200">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-3">
              <h3 className="text-sm font-bold text-gray-900">Registrar Nuevo Cajero / Usuario</h3>
              <button onClick={() => setIsAddUserOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-gray-700 mb-1">Nombre Completo *</label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Daniel Paredes"
                  value={newUserName}
                  onChange={(e) => setNewUserName(e.target.value)}
                  className="w-full h-10 px-3 bg-white border border-gray-300 rounded-lg text-xs font-bold text-gray-900 focus:ring-2 focus:ring-[#2E7D32]"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Correo Electrónico</label>
                <input
                  type="email"
                  placeholder="daniel@ventafacil.com"
                  value={newUserEmail}
                  onChange={(e) => setNewUserEmail(e.target.value)}
                  className="w-full h-10 px-3 bg-white border border-gray-300 rounded-lg text-xs text-gray-900 focus:ring-2 focus:ring-[#2E7D32]"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">PIN (4 dígitos) *</label>
                  <input
                    type="password"
                    maxLength={4}
                    required
                    placeholder="1234"
                    value={newUserPin}
                    onChange={(e) => setNewUserPin(e.target.value.replace(/[^0-9]/g, ''))}
                    className="w-full h-10 px-3 bg-white border border-gray-300 rounded-lg text-base font-mono font-bold text-center tracking-widest text-gray-900 focus:ring-2 focus:ring-[#2E7D32]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Rol / Permisos</label>
                  <select
                    value={newUserRole}
                    onChange={(e) => setNewUserRole(e.target.value as UserRole)}
                    className="w-full h-10 px-2 bg-white border border-gray-300 rounded-lg text-xs font-semibold text-gray-900 focus:ring-2 focus:ring-[#2E7D32]"
                  >
                    <option value="cashier">Cajero</option>
                    <option value="supervisor">Supervisor</option>
                    <option value="admin">Administrador</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-2 pt-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsAddUserOpen(false)}
                  className="flex-1 h-10 border border-gray-300 rounded-lg font-semibold text-gray-700"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 h-10 bg-[#2E7D32] hover:bg-[#1b6d24] text-white rounded-lg font-bold"
                >
                  Guardar Cajero
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
