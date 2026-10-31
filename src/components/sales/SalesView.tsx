import React, { useState } from 'react';
import { usePOS } from '../../context/POSContext';
import { SaleTransaction } from '../../types';
import { 
  Receipt, 
  Search, 
  Printer, 
  Ban, 
  Banknote, 
  CreditCard, 
  QrCode, 
  UserCheck, 
  X, 
  AlertOctagon,
  Calendar,
  CheckCircle2
} from 'lucide-react';

export const SalesView: React.FC = () => {
  const {
    transactions,
    voidSale,
    setCurrentReceipt,
    settings,
  } = usePOS();

  const [searchQuery, setSearchQuery] = useState('');
  const [methodFilter, setMethodFilter] = useState<string>('all');
  const [voidingTx, setVoidingTx] = useState<SaleTransaction | null>(null);
  const [voidReason, setVoidReason] = useState('Error en cobro o devolución de cliente');

  // Metrics
  const completedSales = transactions.filter((t) => t.status === 'completed');
  const totalRevenue = completedSales.reduce((sum, t) => sum + t.total, 0);
  const totalCashSales = completedSales
    .filter((t) => t.paymentMethod === 'cash')
    .reduce((sum, t) => sum + t.total, 0);
  const totalDigitalSales = completedSales
    .filter((t) => t.paymentMethod === 'card' || t.paymentMethod === 'transfer')
    .reduce((sum, t) => sum + t.total, 0);
  const totalCreditSales = completedSales
    .filter((t) => t.paymentMethod === 'credit')
    .reduce((sum, t) => sum + t.total, 0);

  const filteredTransactions = transactions.filter((tx) => {
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      tx.ticketNumber.toLowerCase().includes(q) ||
      tx.customer.name.toLowerCase().includes(q) ||
      tx.customer.docNumber.includes(q);

    const matchesMethod = methodFilter === 'all' || tx.paymentMethod === methodFilter;
    return matchesSearch && matchesMethod;
  });

  const handleConfirmVoid = (e: React.FormEvent) => {
    e.preventDefault();
    if (!voidingTx) return;
    voidSale(voidingTx.id, voidReason);
    setVoidingTx(null);
  };

  const getMethodBadge = (method: string) => {
    switch (method) {
      case 'cash':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-50 text-[#2E7D32]">
            <Banknote className="w-3 h-3" /> Efectivo
          </span>
        );
      case 'card':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-blue-50 text-[#1976D2]">
            <CreditCard className="w-3 h-3" /> Tarjeta
          </span>
        );
      case 'transfer':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-purple-50 text-purple-700">
            <QrCode className="w-3 h-3" /> Transferencia
          </span>
        );
      case 'credit':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-50 text-[#ED6C02]">
            <UserCheck className="w-3 h-3" /> Fiado
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#F8F9FA] overflow-y-auto pb-20">
      {/* Top Banner / Metrics */}
      <div className="bg-white border-b border-gray-200 p-4">
        <div className="max-w-6xl mx-auto space-y-4">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Historial de Ventas</h2>
            <p className="text-xs text-gray-500">
              Registro de transacciones, reimpresión de comprobantes y anulación con reintegro a inventario.
            </p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3">
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-3">
              <span className="text-[11px] font-bold text-gray-500 uppercase">Ventas Totales</span>
              <div className="text-xl sm:text-2xl font-extrabold text-[#2E7D32] mt-0.5 tnum">
                {settings.currency}{totalRevenue.toFixed(2)}
              </div>
              <div className="text-[11px] text-gray-500 mt-0.5">
                {completedSales.length} comprobantes emitidos
              </div>
            </div>

            <div className="bg-gray-50 border border-gray-200 rounded-xl p-3">
              <span className="text-[11px] font-bold text-gray-500 uppercase">Efectivo Cobrado</span>
              <div className="text-xl sm:text-2xl font-extrabold text-gray-900 mt-0.5 tnum">
                {settings.currency}{totalCashSales.toFixed(2)}
              </div>
              <div className="text-[11px] text-gray-500 mt-0.5">Dinero en caja</div>
            </div>

            <div className="bg-gray-50 border border-gray-200 rounded-xl p-3">
              <span className="text-[11px] font-bold text-gray-500 uppercase">Tarjeta / Transferencia</span>
              <div className="text-xl sm:text-2xl font-extrabold text-[#1976D2] mt-0.5 tnum">
                {settings.currency}{totalDigitalSales.toFixed(2)}
              </div>
              <div className="text-[11px] text-gray-500 mt-0.5">Depósitos electrónicos</div>
            </div>

            <div className="bg-gray-50 border border-gray-200 rounded-xl p-3">
              <span className="text-[11px] font-bold text-gray-500 uppercase">Crédito / Fiados</span>
              <div className="text-xl sm:text-2xl font-extrabold text-[#ED6C02] mt-0.5 tnum">
                {settings.currency}{totalCreditSales.toFixed(2)}
              </div>
              <div className="text-[11px] text-gray-500 mt-0.5">Pendiente de cobro</div>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="max-w-6xl w-full mx-auto p-4 space-y-3">
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar por ticket, cliente o cédula..."
              className="w-full h-11 pl-9 pr-9 bg-white border border-[#D1D5DB] rounded-lg text-sm text-gray-900 focus:ring-2 focus:ring-[#2E7D32]"
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

          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
            {[
              { id: 'all', label: 'Todos los pagos' },
              { id: 'cash', label: 'Efectivo' },
              { id: 'card', label: 'Tarjeta' },
              { id: 'transfer', label: 'Transferencia' },
              { id: 'credit', label: 'Fiado' },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setMethodFilter(f.id)}
                className={`px-3 py-2 text-xs rounded-lg font-medium whitespace-nowrap transition-colors ${
                  methodFilter === f.id
                    ? 'bg-[#2E7D32] text-white font-bold'
                    : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Transactions Table / List */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 font-bold uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Ticket</th>
                  <th className="py-3 px-3">Fecha y Hora</th>
                  <th className="py-3 px-3">Cliente</th>
                  <th className="py-3 px-3">Productos</th>
                  <th className="py-3 px-3">Método</th>
                  <th className="py-3 px-3 text-right">Total</th>
                  <th className="py-3 px-3 text-center">Estado</th>
                  <th className="py-3 px-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredTransactions.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-gray-400">
                      <Receipt className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                      No se encontraron transacciones.
                    </td>
                  </tr>
                ) : (
                  filteredTransactions.map((tx) => {
                    const isVoided = tx.status === 'voided';
                    const dateFormatted = new Date(tx.timestamp).toLocaleString('es-EC', {
                      dateStyle: 'short',
                      timeStyle: 'short',
                    });

                    return (
                      <tr
                        key={tx.id}
                        className={`hover:bg-gray-50/80 transition-colors ${
                          isVoided ? 'bg-red-50/30 opacity-70' : ''
                        }`}
                      >
                        {/* Ticket Number */}
                        <td className="py-3 px-4 font-mono font-bold text-gray-900 whitespace-nowrap">
                          {tx.ticketNumber}
                        </td>

                        {/* Date */}
                        <td className="py-3 px-3 text-gray-600 whitespace-nowrap">
                          {dateFormatted}
                        </td>

                        {/* Customer */}
                        <td className="py-3 px-3">
                          <div className="font-semibold text-gray-900 truncate max-w-[150px]">
                            {tx.customer.name}
                          </div>
                          {tx.customer.docNumber !== '9999999999999' && (
                            <div className="text-[10px] text-gray-500 font-mono">
                              CI: {tx.customer.docNumber}
                            </div>
                          )}
                        </td>

                        {/* Items */}
                        <td className="py-3 px-3 text-gray-600">
                          <span className="font-medium text-gray-900">
                            {tx.items.length} {tx.items.length === 1 ? 'ítem' : 'ítems'}
                          </span>
                          <span className="text-gray-400 text-[11px] block truncate max-w-[180px]">
                            {tx.items.map((i) => i.productName).join(', ')}
                          </span>
                        </td>

                        {/* Payment Method */}
                        <td className="py-3 px-3 whitespace-nowrap">
                          {getMethodBadge(tx.paymentMethod)}
                        </td>

                        {/* Total */}
                        <td className="py-3 px-3 text-right font-extrabold text-gray-900 tnum text-sm whitespace-nowrap">
                          {settings.currency}{tx.total.toFixed(2)}
                        </td>

                        {/* Status */}
                        <td className="py-3 px-3 text-center whitespace-nowrap">
                          {isVoided ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-[#FFEBEE] text-[#D32F2F] uppercase">
                              Anulada
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-[#E8F5E9] text-[#2E7D32] uppercase">
                              <CheckCircle2 className="w-3 h-3" />
                              Completada
                            </span>
                          )}
                        </td>

                        {/* Actions */}
                        <td className="py-3 px-4 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1.5">
                            {/* View / Print Ticket */}
                            <button
                              onClick={() => setCurrentReceipt(tx)}
                              className="px-2 py-1 bg-white hover:bg-gray-100 border border-gray-200 rounded text-gray-700 hover:text-gray-900 font-semibold flex items-center gap-1 transition-colors"
                              title="Ver e imprimir ticket"
                            >
                              <Printer className="w-3.5 h-3.5 text-[#1976D2]" />
                              <span>Ticket</span>
                            </button>

                            {/* Void Sale Button */}
                            {!isVoided && (
                              <button
                                onClick={() => setVoidingTx(tx)}
                                className="p-1.5 rounded text-gray-400 hover:text-[#D32F2F] hover:bg-red-50 transition-colors"
                                title="Anular venta y reingresar stock"
                              >
                                <Ban className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Void Modal Confirmation */}
      {voidingTx && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-2xl border border-gray-200">
            <div className="flex items-center gap-2 text-[#D32F2F] mb-3">
              <AlertOctagon className="w-6 h-6" />
              <h3 className="text-base font-bold text-gray-900">Anular Transacción</h3>
            </div>

            <p className="text-xs text-gray-600 mb-2">
              ¿Estás seguro de anular el ticket <strong>{voidingTx.ticketNumber}</strong> por{' '}
              <strong>{settings.currency}{voidingTx.total.toFixed(2)}</strong>?
            </p>
            <p className="text-[11px] text-gray-500 mb-4 bg-amber-50 p-2 rounded-lg border border-amber-200">
              ⚠️ Se devolverán automáticamente los productos ({voidingTx.items.length}) al inventario.
            </p>

            <form onSubmit={handleConfirmVoid} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Motivo de la Anulación
                </label>
                <input
                  type="text"
                  required
                  value={voidReason}
                  onChange={(e) => setVoidReason(e.target.value)}
                  className="w-full h-10 px-3 bg-white border border-gray-300 rounded-lg text-xs text-gray-900 focus:ring-2 focus:ring-[#D32F2F]"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setVoidingTx(null)}
                  className="flex-1 h-10 border border-gray-300 rounded-lg text-xs font-semibold text-gray-700 hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 h-10 bg-[#D32F2F] hover:bg-[#b71c1c] text-white rounded-lg text-xs font-bold shadow-xs"
                >
                  Confirmar Anulación
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
