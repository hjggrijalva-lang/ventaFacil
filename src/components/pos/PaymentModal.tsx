import React, { useState, useEffect } from 'react';
import { usePOS } from '../../context/POSContext';
import { PaymentMethod } from '../../types';
import { 
  X, 
  Banknote, 
  CreditCard, 
  QrCode, 
  UserCheck, 
  Delete, 
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

export const PaymentModal: React.FC = () => {
  const {
    isPaymentModalOpen,
    setIsPaymentModalOpen,
    cartTotal,
    completeSale,
    settings,
    activeCustomer,
    playSound,
  } = usePOS();

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash');
  const [amountReceivedStr, setAmountReceivedStr] = useState<string>('');

  // Default to exact amount or empty on modal open
  useEffect(() => {
    if (isPaymentModalOpen) {
      setPaymentMethod('cash');
      setAmountReceivedStr('');
    }
  }, [isPaymentModalOpen]);

  if (!isPaymentModalOpen) return null;

  const amountReceived = paymentMethod === 'cash' 
    ? (parseFloat(amountReceivedStr) || 0)
    : cartTotal;

  const change = Math.max(0, Number((amountReceived - cartTotal).toFixed(2)));
  const isInsufficient = paymentMethod === 'cash' && amountReceived < cartTotal;

  // Keypad click handler
  const handleKeypadPress = (val: string) => {
    playSound('beep');
    if (val === 'C') {
      setAmountReceivedStr('');
      return;
    }
    if (val === 'backspace') {
      setAmountReceivedStr((prev) => prev.slice(0, -1));
      return;
    }
    if (val === '.') {
      if (!amountReceivedStr.includes('.')) {
        setAmountReceivedStr((prev) => (prev === '' ? '0.' : prev + '.'));
      }
      return;
    }
    // Limit to 2 decimals
    if (amountReceivedStr.includes('.')) {
      const parts = amountReceivedStr.split('.');
      if (parts[1] && parts[1].length >= 2) return;
    }
    setAmountReceivedStr((prev) => prev + val);
  };

  const setQuickCash = (val: number) => {
    playSound('beep');
    setAmountReceivedStr(val.toFixed(2));
  };

  const handleConfirm = () => {
    if (isInsufficient) {
      playSound('alert');
      return;
    }
    completeSale(paymentMethod, amountReceived);
  };

  // Quick cash bill recommendations based on total
  const bills = [5, 10, 20, 50, 100].filter((b) => b >= cartTotal || b === 5 || b === 10 || b === 20);

  return (
    <div className="fixed inset-0 z-50 bg-black/65 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div 
        className="bg-[#F8F9FA] rounded-2xl w-full max-w-lg shadow-2xl border border-gray-200 overflow-hidden flex flex-col my-auto"
        style={{
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2), 0 10px 10px -5px rgba(0, 0, 0, 0.08)',
        }}
      >
        {/* Top Header */}
        <div className="bg-white px-4 py-3 border-b border-gray-200 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-gray-900">Cobro de Ticket</h2>
            <p className="text-xs text-gray-500">
              Cliente: <span className="font-semibold text-gray-700">{activeCustomer.name}</span>
            </p>
          </div>
          <button
            onClick={() => setIsPaymentModalOpen(false)}
            className="w-9 h-9 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Payment Method Selector */}
        <div className="p-3 bg-white border-b border-gray-200">
          <div className="grid grid-cols-4 gap-2">
            {[
              { id: 'cash', label: 'Efectivo', icon: Banknote },
              { id: 'card', label: 'Tarjeta', icon: CreditCard },
              { id: 'transfer', label: 'Transfer/QR', icon: QrCode },
              { id: 'credit', label: 'Fiado/Crédito', icon: UserCheck },
            ].map((method) => {
              const Icon = method.icon;
              const isActive = paymentMethod === method.id;
              return (
                <button
                  key={method.id}
                  onClick={() => {
                    playSound('beep');
                    setPaymentMethod(method.id as PaymentMethod);
                    if (method.id !== 'cash') {
                      setAmountReceivedStr(cartTotal.toFixed(2));
                    }
                  }}
                  className={`flex flex-col items-center justify-center p-2.5 rounded-xl border text-xs font-bold transition-all ${
                    isActive
                      ? 'border-[#2E7D32] bg-[#E8F5E9] text-[#2E7D32] shadow-xs ring-1 ring-[#2E7D32]'
                      : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <Icon className={`w-5 h-5 mb-1 ${isActive ? 'text-[#2E7D32]' : 'text-gray-500'}`} />
                  <span className="leading-tight text-center">{method.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Monetary Display Cards */}
        <div className="p-4 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            {/* Total a Cobrar */}
            <div className="bg-white rounded-xl p-3 border border-gray-200 shadow-2xs">
              <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500">
                Total a Cobrar
              </span>
              <div 
                className="text-2xl sm:text-3xl font-extrabold text-gray-900 tnum tracking-tight mt-0.5"
                style={{ fontFamily: 'Inter', fontWeight: 800 }}
              >
                {settings.currency}{cartTotal.toFixed(2)}
              </div>
            </div>

            {/* Monto Recibido / Cambio */}
            <div className={`rounded-xl p-3 border shadow-2xs transition-colors ${
              paymentMethod === 'cash' && isInsufficient && amountReceivedStr !== ''
                ? 'bg-red-50 border-red-200'
                : 'bg-white border-gray-200'
            }`}>
              <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500">
                {paymentMethod === 'cash' ? 'Cambio / Vuelto' : 'Estado de Pago'}
              </span>
              <div 
                className={`text-2xl sm:text-3xl font-extrabold tnum tracking-tight mt-0.5 ${
                  paymentMethod !== 'cash' 
                    ? 'text-[#2E7D32]' 
                    : isInsufficient && amountReceivedStr !== ''
                    ? 'text-[#D32F2F]'
                    : 'text-[#2E7D32]'
                }`}
                style={{ fontFamily: 'Inter', fontWeight: 800 }}
              >
                {paymentMethod === 'cash' ? (
                  isInsufficient && amountReceivedStr !== '' ? (
                    <span className="text-sm font-bold flex items-center gap-1 text-[#D32F2F]">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      Faltan {settings.currency}{(cartTotal - amountReceived).toFixed(2)}
                    </span>
                  ) : (
                    `${settings.currency}${change.toFixed(2)}`
                  )
                ) : (
                  <span className="text-base font-bold flex items-center gap-1 text-[#2E7D32]">
                    <CheckCircle2 className="w-5 h-5 shrink-0" />
                    Exacto
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Cash input field with quick bill suggestions (Only in cash mode) */}
          {paymentMethod === 'cash' && (
            <div className="space-y-2">
              <div className="relative bg-white rounded-xl border border-gray-300 p-2.5 flex items-center justify-between shadow-2xs focus-within:ring-2 focus-within:ring-[#2E7D32] focus-within:border-[#2E7D32]">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold uppercase text-gray-500">Recibido:</span>
                  <span className="text-xl font-bold text-gray-400">{settings.currency}</span>
                </div>
                <div className="text-2xl font-extrabold text-gray-900 tnum tracking-wide">
                  {amountReceivedStr || '0.00'}
                </div>
              </div>

              {/* Quick Cash Buttons */}
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
                <button
                  type="button"
                  onClick={() => setQuickCash(cartTotal)}
                  className="px-3 py-1.5 bg-[#E8F5E9] hover:bg-[#C8E6C9] text-[#2E7D32] font-bold text-xs rounded-lg border border-[#A5D6A7] whitespace-nowrap transition-colors"
                >
                  Exacto ({settings.currency}{cartTotal.toFixed(2)})
                </button>
                {bills.slice(0, 4).map((bill) => (
                  <button
                    key={bill}
                    type="button"
                    onClick={() => setQuickCash(bill)}
                    className="px-3 py-1.5 bg-white hover:bg-gray-100 text-gray-800 font-bold text-xs rounded-lg border border-gray-300 whitespace-nowrap transition-colors"
                  >
                    {settings.currency}{bill}
                  </button>
                ))}
              </div>

              {/* 3x4 Touch Numeric Keypad per Design Spec:
                  - 3x4 grid structure embedded directly into POS checkout views
                  - Individual keys have explicit #FFFFFF background, subtle border, and 56px height
                  - Direct feedback state: background shifts to #F3F4F6 instantly on tap
                  - 8px radius
              */}
              <div className="grid grid-cols-3 gap-2 pt-1">
                {['1', '2', '3', '4', '5', '6', '7', '8', '9', '.', '0', 'backspace'].map((key) => {
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => handleKeypadPress(key)}
                      className="h-14 bg-white active:bg-[#F3F4F6] border border-gray-200 rounded-lg flex items-center justify-center font-bold text-gray-900 shadow-2xs hover:border-gray-300 transition-colors cursor-pointer select-none"
                      style={{
                        fontFamily: 'Inter',
                        fontSize: '22px',
                        fontWeight: 600,
                      }}
                    >
                      {key === 'backspace' ? (
                        <Delete className="w-6 h-6 text-gray-600" />
                      ) : (
                        key
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Credit notice if fiado selected */}
          {paymentMethod === 'credit' && (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-900">
              <p className="font-bold">Venta a Crédito / Fiado</p>
              <p className="mt-0.5">
                Se registrará una deuda de{' '}
                <strong className="text-gray-900">
                  {settings.currency}{cartTotal.toFixed(2)}
                </strong>{' '}
                a la cuenta de <strong>{activeCustomer.name}</strong>.
              </p>
            </div>
          )}

          {/* Transfer notice */}
          {paymentMethod === 'transfer' && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900 flex items-center gap-3">
              <div className="w-12 h-12 bg-white rounded-lg p-1 border border-emerald-300 shrink-0 flex items-center justify-center">
                <QrCode className="w-10 h-10 text-emerald-700" />
              </div>
              <div>
                <p className="font-bold">Escanea QR Deuna / Transferencia</p>
                <p className="text-[11px] text-emerald-800">
                  Banco Pichincha / Guayaquil · Titular: Venta Fácil Cía.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer / Action CTA (56px high, #2E7D32, label-lg typography) */}
        <div className="p-4 bg-white border-t border-gray-200 flex gap-2">
          <button
            type="button"
            onClick={() => setIsPaymentModalOpen(false)}
            className="h-14 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-sm rounded-xl border border-gray-300 transition-colors"
          >
            Volver
          </button>

          <button
            type="button"
            onClick={handleConfirm}
            disabled={isInsufficient}
            className="flex-1 h-14 bg-[#2E7D32] hover:bg-[#1b6d24] active:bg-[#005312] disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-bold text-base sm:text-lg rounded-xl shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <CheckCircle2 className="w-5 h-5" />
            <span>Confirmar Pago & Emitir Ticket</span>
          </button>
        </div>
      </div>
    </div>
  );
};
