import React, { useState } from 'react';
import { usePOS } from '../../context/POSContext';
import { 
  CircleDollarSign, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Lock, 
  Unlock, 
  Plus, 
  Printer, 
  CheckCircle2, 
  AlertTriangle,
  History,
  FileText
} from 'lucide-react';

export const CashRegisterView: React.FC = () => {
  const {
    cashShift,
    cashMovements,
    addCashMovement,
    closeShift,
    openShift,
    expectedCashInDrawer,
    transactions,
    settings,
    playSound,
  } = usePOS();

  // Cash movement modal
  const [isMovementModalOpen, setIsMovementModalOpen] = useState(false);
  const [movementType, setMovementType] = useState<'in' | 'out'>('out');
  const [movementAmount, setMovementAmount] = useState('');
  const [movementReason, setMovementReason] = useState('');

  // Cash count / reconciliation state
  const [countedCash, setCountedCash] = useState<string>('');
  const [isOpeningModalOpen, setIsOpeningModalOpen] = useState(false);
  const [openInitialAmount, setOpenInitialAmount] = useState('50.00');

  // Completed cash sales
  const cashSales = transactions.filter(
    (tx) => tx.status === 'completed' && tx.paymentMethod === 'cash'
  );
  const totalCashSales = cashSales.reduce((sum, tx) => sum + tx.total, 0);

  const totalIn = cashMovements
    .filter((m) => m.type === 'in')
    .reduce((sum, m) => sum + m.amount, 0);

  const totalOut = cashMovements
    .filter((m) => m.type === 'out')
    .reduce((sum, m) => sum + m.amount, 0);

  const countedNum = parseFloat(countedCash);
  const difference = !isNaN(countedNum) ? Number((countedNum - expectedCashInDrawer).toFixed(2)) : null;

  const handleAddMovement = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(movementAmount);
    if (isNaN(amount) || amount <= 0 || !movementReason.trim()) return;

    addCashMovement(movementType, amount, movementReason.trim());
    setMovementAmount('');
    setMovementReason('');
    setIsMovementModalOpen(false);
  };

  const handleOpenNewShift = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(openInitialAmount);
    if (isNaN(amt) || amt < 0) return;
    openShift(amt, 'Apertura de nuevo turno');
    setIsOpeningModalOpen(false);
  };

  const handlePrintZReport = () => {
    playSound('beep');
    window.print();
  };

  return (
    <div className="flex flex-col h-full bg-[#F8F9FA] overflow-y-auto pb-20">
      {/* Top Banner */}
      <div className="bg-white border-b border-gray-200 p-4">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-gray-900">Arqueo y Control de Caja</h2>
              {cashShift.isOpen ? (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-[#E8F5E9] text-[#2E7D32]">
                  <Unlock className="w-3 h-3" /> Turno Abierto
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-[#FFEBEE] text-[#D32F2F]">
                  <Lock className="w-3 h-3" /> Turno Cerrado
                </span>
              )}
            </div>
            <p className="text-xs text-gray-500 mt-0.5">
              Cajero: <strong className="text-gray-700">{cashShift.cashier}</strong> · Apertura:{' '}
              {new Date(cashShift.openedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsMovementModalOpen(true)}
              className="h-10 px-3.5 bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-bold rounded-lg border border-gray-300 flex items-center gap-1.5 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Gasto / Ingreso</span>
            </button>

            {cashShift.isOpen ? (
              <button
                onClick={() => {
                  if (confirm('¿Cerrar el turno actual y realizar el arqueo final?')) {
                    closeShift();
                  }
                }}
                className="h-10 px-3.5 bg-[#D32F2F] hover:bg-[#b71c1c] text-white text-xs font-bold rounded-lg flex items-center gap-1.5 transition-colors shadow-2xs"
              >
                <Lock className="w-4 h-4" />
                <span>Cerrar Turno</span>
              </button>
            ) : (
              <button
                onClick={() => setIsOpeningModalOpen(true)}
                className="h-10 px-3.5 bg-[#2E7D32] hover:bg-[#1b6d24] text-white text-xs font-bold rounded-lg flex items-center gap-1.5 transition-colors shadow-2xs"
              >
                <Unlock className="w-4 h-4" />
                <span>Abrir Turno</span>
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-4xl w-full mx-auto p-4 space-y-4">
        {/* Main Balance Calculation Board */}
        <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-gray-100">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
              Flujo de Efectivo en Gaveta
            </span>
            <button
              onClick={handlePrintZReport}
              className="text-xs font-semibold text-[#1976D2] hover:underline flex items-center gap-1"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Imprimir Corte X/Z</span>
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 py-4 border-b border-gray-100">
            <div>
              <span className="text-[11px] text-gray-500 block">Fondo Inicial</span>
              <span className="text-lg font-bold text-gray-800 tnum">
                {settings.currency}{cashShift.initialCash.toFixed(2)}
              </span>
            </div>

            <div>
              <span className="text-[11px] text-gray-500 block">Ventas en Efectivo</span>
              <span className="text-lg font-bold text-[#2E7D32] tnum">
                +{settings.currency}{totalCashSales.toFixed(2)}
              </span>
            </div>

            <div>
              <span className="text-[11px] text-gray-500 block">Ingresos Manuales</span>
              <span className="text-lg font-bold text-blue-600 tnum">
                +{settings.currency}{totalIn.toFixed(2)}
              </span>
            </div>

            <div>
              <span className="text-[11px] text-gray-500 block">Gastos / Retiros</span>
              <span className="text-lg font-bold text-[#D32F2F] tnum">
                -{settings.currency}{totalOut.toFixed(2)}
              </span>
            </div>
          </div>

          {/* Expected vs Counted Cash */}
          <div className="pt-4 grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
            <div className="bg-emerald-50/60 border border-emerald-200 rounded-xl p-4">
              <span className="text-xs font-bold text-[#2E7D32] uppercase tracking-wider block">
                Saldo Teórico Esperado en Caja
              </span>
              <div className="text-3xl font-extrabold text-[#2E7D32] tnum mt-1">
                {settings.currency}{expectedCashInDrawer.toFixed(2)}
              </div>
              <p className="text-[11px] text-emerald-800 mt-1">
                Total de dinero que debe estar físicamente en la gaveta.
              </p>
            </div>

            {/* Cash Verification Input */}
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 space-y-2">
              <label className="text-xs font-bold text-gray-700 block">
                Conteo Físico Real (Dinero Contado)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-gray-400">
                  {settings.currency}
                </span>
                <input
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={countedCash}
                  onChange={(e) => setCountedCash(e.target.value)}
                  className="w-full h-11 pl-8 pr-3 bg-white border border-gray-300 rounded-lg text-lg font-extrabold text-gray-900 focus:ring-2 focus:ring-[#2E7D32]"
                />
              </div>

              {difference !== null && (
                <div
                  className={`p-2 rounded-lg text-xs font-bold flex items-center justify-between ${
                    difference === 0
                      ? 'bg-emerald-100 text-[#2E7D32]'
                      : difference > 0
                      ? 'bg-blue-100 text-[#1976D2]'
                      : 'bg-red-100 text-[#D32F2F]'
                  }`}
                >
                  <span className="flex items-center gap-1">
                    {difference === 0 ? (
                      <CheckCircle2 className="w-4 h-4" />
                    ) : (
                      <AlertTriangle className="w-4 h-4" />
                    )}
                    {difference === 0
                      ? '¡Caja cuadrada perfectamente!'
                      : difference > 0
                      ? 'Sobrante en caja'
                      : 'Faltante en caja'}
                  </span>
                  <span className="tnum font-extrabold">
                    {difference > 0 ? `+${settings.currency}${difference.toFixed(2)}` : `${settings.currency}${difference.toFixed(2)}`}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Movements History */}
        <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-gray-900 flex items-center gap-1.5">
              <History className="w-4 h-4 text-gray-500" />
              <span>Movimientos de Caja Menor (Gastos / Ingresos)</span>
            </h3>
            <span className="text-xs text-gray-500">{cashMovements.length} movimientos</span>
          </div>

          <div className="divide-y divide-gray-100 border border-gray-100 rounded-xl overflow-hidden">
            {cashMovements.length === 0 ? (
              <div className="p-6 text-center text-xs text-gray-400">
                No hay movimientos manuales registrados en este turno.
              </div>
            ) : (
              cashMovements.map((mov) => {
                const isOut = mov.type === 'out';
                const time = new Date(mov.timestamp).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                });

                return (
                  <div key={mov.id} className="p-3 flex items-center justify-between text-xs hover:bg-gray-50">
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${
                          isOut ? 'bg-red-50 text-[#D32F2F]' : 'bg-blue-50 text-[#1976D2]'
                        }`}
                      >
                        {isOut ? <ArrowDownLeft className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
                      </div>
                      <div>
                        <span className="font-bold text-gray-900">{mov.reason}</span>
                        <div className="text-[11px] text-gray-400">
                          {time} · Por: {mov.cashier}
                        </div>
                      </div>
                    </div>

                    <div
                      className={`font-bold text-sm tnum ${
                        isOut ? 'text-[#D32F2F]' : 'text-[#1976D2]'
                      }`}
                    >
                      {isOut ? '-' : '+'}{settings.currency}{mov.amount.toFixed(2)}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Movement Modal */}
      {isMovementModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-2xl border border-gray-200">
            <h3 className="text-base font-bold text-gray-900 mb-3">Registrar Movimiento de Caja</h3>

            <div className="grid grid-cols-2 gap-2 mb-4">
              <button
                type="button"
                onClick={() => setMovementType('out')}
                className={`py-2 px-3 rounded-lg text-xs font-bold border transition-colors ${
                  movementType === 'out'
                    ? 'bg-[#FFEBEE] border-[#D32F2F] text-[#D32F2F]'
                    : 'bg-white border-gray-300 text-gray-600'
                }`}
              >
                Salida / Gasto
              </button>
              <button
                type="button"
                onClick={() => setMovementType('in')}
                className={`py-2 px-3 rounded-lg text-xs font-bold border transition-colors ${
                  movementType === 'in'
                    ? 'bg-[#E8F5E9] border-[#2E7D32] text-[#2E7D32]'
                    : 'bg-white border-gray-300 text-gray-600'
                }`}
              >
                Entrada / Ingreso
              </button>
            </div>

            <form onSubmit={handleAddMovement} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Monto ({settings.currency})
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  required
                  placeholder="0.00"
                  value={movementAmount}
                  onChange={(e) => setMovementAmount(e.target.value)}
                  className="w-full h-11 px-3 bg-white border border-gray-300 rounded-lg text-lg font-bold text-gray-900 focus:ring-2 focus:ring-[#2E7D32]"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Motivo / Concepto
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Pago de panadería, compra de fundas..."
                  value={movementReason}
                  onChange={(e) => setMovementReason(e.target.value)}
                  className="w-full h-11 px-3 bg-white border border-gray-300 rounded-lg text-xs text-gray-900 focus:ring-2 focus:ring-[#2E7D32]"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsMovementModalOpen(false)}
                  className="flex-1 h-10 border border-gray-300 rounded-lg text-xs font-semibold text-gray-700"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 h-10 bg-[#2E7D32] hover:bg-[#1b6d24] text-white rounded-lg text-xs font-bold"
                >
                  Registrar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Shift Open Modal */}
      {isOpeningModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-2xl border border-gray-200">
            <h3 className="text-base font-bold text-gray-900 mb-2">Apertura de Turno</h3>
            <p className="text-xs text-gray-500 mb-4">
              Ingresa el fondo de efectivo inicial asignado a la gaveta.
            </p>

            <form onSubmit={handleOpenNewShift} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Fondo Inicial ({settings.currency})
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  required
                  value={openInitialAmount}
                  onChange={(e) => setOpenInitialAmount(e.target.value)}
                  className="w-full h-11 px-3 bg-white border border-gray-300 rounded-lg text-lg font-bold text-gray-900 focus:ring-2 focus:ring-[#2E7D32]"
                  autoFocus
                />
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsOpeningModalOpen(false)}
                  className="flex-1 h-10 border border-gray-300 rounded-lg text-xs font-semibold text-gray-700"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 h-10 bg-[#2E7D32] hover:bg-[#1b6d24] text-white rounded-lg text-xs font-bold"
                >
                  Abrir Caja
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
