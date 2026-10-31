import React, { useState } from 'react';
import { usePOS } from '../../context/POSContext';
import { Lock, Delete, LogOut, ShieldAlert } from 'lucide-react';

export const LockScreenModal: React.FC = () => {
  const {
    isTerminalLocked,
    currentUser,
    unlockTerminal,
    logout,
    settings,
    playSound,
  } = usePOS();

  const [pinInput, setPinInput] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  if (!isTerminalLocked || !currentUser) return null;

  const handleKeypadPress = (val: string) => {
    setErrorMsg('');
    playSound('beep');

    if (val === 'C') {
      setPinInput('');
      return;
    }

    if (val === 'backspace') {
      setPinInput((prev) => prev.slice(0, -1));
      return;
    }

    if (pinInput.length >= 4) return;

    const newPin = pinInput + val;
    setPinInput(newPin);

    if (newPin.length === 4) {
      setTimeout(() => {
        const ok = unlockTerminal(newPin);
        if (!ok) {
          setErrorMsg('PIN incorrecto para desbloquear');
          setPinInput('');
        }
      }, 100);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-gray-200 text-center space-y-4">
        {/* Lock Icon & Cashier Profile */}
        <div className="space-y-2">
          <div className="relative inline-block">
            <div className="w-20 h-20 rounded-full overflow-hidden mx-auto border-3 border-[#2E7D32] shadow-md">
              {currentUser.avatar ? (
                <img src={currentUser.avatar} alt={currentUser.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-emerald-100 text-[#2E7D32] flex items-center justify-center text-xl font-bold">
                  {currentUser.name.charAt(0)}
                </div>
              )}
            </div>
            <div className="absolute bottom-0 right-0 w-7 h-7 bg-amber-500 text-white rounded-full flex items-center justify-center border-2 border-white shadow-xs">
              <Lock className="w-3.5 h-3.5" />
            </div>
          </div>

          <div>
            <h2 className="text-lg font-bold text-gray-900">{currentUser.name}</h2>
            <p className="text-xs text-gray-500 font-medium">{settings.storeName} · Terminal Bloqueado</p>
          </div>
        </div>

        {/* PIN Dots */}
        <div className="py-1">
          <p className="text-xs text-gray-500 mb-2">Ingresa tu PIN ({currentUser.pin}) para reanudar:</p>
          <div className="flex items-center justify-center gap-3">
            {[0, 1, 2, 3].map((index) => {
              const isFilled = pinInput.length > index;
              return (
                <div
                  key={index}
                  className={`w-3.5 h-3.5 rounded-full border-2 transition-all ${
                    isFilled ? 'bg-[#2E7D32] border-[#2E7D32] scale-110' : 'bg-gray-100 border-gray-300'
                  }`}
                />
              );
            })}
          </div>
        </div>

        {errorMsg && (
          <div className="text-xs text-[#D32F2F] font-bold flex items-center justify-center gap-1">
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* 3x4 Touch Numeric Keypad */}
        <div className="grid grid-cols-3 gap-2 pt-1">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9', 'C', '0', 'backspace'].map((key) => {
            return (
              <button
                key={key}
                type="button"
                onClick={() => handleKeypadPress(key)}
                className="h-13 bg-white active:bg-gray-100 border border-gray-200 rounded-xl flex items-center justify-center font-bold text-gray-900 shadow-2xs hover:border-gray-300 transition-colors"
                style={{ fontFamily: 'Inter', fontSize: '20px', fontWeight: 600 }}
              >
                {key === 'backspace' ? <Delete className="w-5 h-5 text-gray-600" /> : key === 'C' ? <span className="text-xs text-gray-400">BORRAR</span> : key}
              </button>
            );
          })}
        </div>

        {/* Switch User / Logout */}
        <div className="pt-2 border-t border-gray-100 flex items-center justify-center">
          <button
            onClick={logout}
            className="text-xs text-gray-500 hover:text-[#D32F2F] font-semibold flex items-center gap-1.5 transition-colors py-1 px-3 rounded-lg hover:bg-gray-100"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Cambiar de Cajero / Salir</span>
          </button>
        </div>
      </div>
    </div>
  );
};
