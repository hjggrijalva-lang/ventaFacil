import React, { useState } from 'react';
import { usePOS } from '../../context/POSContext';
import { User, UserRole } from '../../types';
import { 
  Store, 
  KeyRound, 
  Mail, 
  Lock, 
  Delete, 
  ShieldCheck, 
  UserCheck, 
  Sparkles,
  Eye,
  EyeOff,
  AlertCircle
} from 'lucide-react';

export const LoginView: React.FC = () => {
  const {
    users,
    loginWithPin,
    loginWithEmail,
    settings,
    playSound,
  } = usePOS();

  const [authMode, setAuthMode] = useState<'pin' | 'email'>('pin');
  const [selectedUser, setSelectedUser] = useState<User | null>(users[0] || null);
  const [pinInput, setPinInput] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');

  // Email form state
  const [emailInput, setEmailInput] = useState<string>('cajera@ventafacil.com');
  const [passwordInput, setPasswordInput] = useState<string>('123');
  const [showPassword, setShowPassword] = useState<boolean>(false);

  // Handle keypad press for PIN
  const handleKeypadPress = (val: string) => {
    setErrorMessage('');
    playSound('beep');

    if (val === 'C') {
      setPinInput('');
      return;
    }

    if (val === 'backspace') {
      setPinInput((prev) => prev.slice(0, -1));
      return;
    }

    if (pinInput.length >= 6) return;

    const newPin = pinInput + val;
    setPinInput(newPin);

    // Auto-verify when 4 digits are reached if a user is selected or general
    if (newPin.length === 4) {
      setTimeout(() => {
        const success = loginWithPin(newPin, selectedUser?.id);
        if (!success) {
          setErrorMessage('PIN incorrecto. Intenta de nuevo.');
          setPinInput('');
        }
      }, 100);
    }
  };

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    const success = loginWithEmail(emailInput, passwordInput);
    if (!success) {
      setErrorMessage('Credenciales inválidas. Verifica tu correo o contraseña.');
    }
  };

  const fillQuickDemo = (user: User) => {
    playSound('beep');
    setSelectedUser(user);
    setEmailInput(user.email);
    setPasswordInput(user.password || user.pin);
    setPinInput(user.pin);
    setErrorMessage('');
    // Auto login
    setTimeout(() => {
      loginWithPin(user.pin, user.id);
    }, 200);
  };

  const getRoleLabel = (role: UserRole) => {
    switch (role) {
      case 'admin':
        return { text: 'Administrador', bg: 'bg-emerald-50 text-[#2E7D32] border-emerald-200' };
      case 'supervisor':
        return { text: 'Supervisor', bg: 'bg-blue-50 text-[#1976D2] border-blue-200' };
      case 'cashier':
      default:
        return { text: 'Cajero', bg: 'bg-gray-100 text-gray-700 border-gray-200' };
    }
  };

  return (
    <div className="min-h-full flex flex-col justify-between bg-[#F8F9FA] p-4 sm:p-6 overflow-y-auto">
      <div className="w-full max-w-md mx-auto my-auto space-y-5">
        {/* Brand & Store Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex w-16 h-16 rounded-2xl bg-[#2E7D32] text-white items-center justify-center shadow-md shadow-emerald-900/10 mb-1">
            <Store className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">
            Venta Fácil POS
          </h1>
          <p className="text-xs text-gray-500 font-medium">
            {settings.storeName} · Terminal de Ventas
          </p>
        </div>

        {/* Auth Mode Segmented Control Tabs */}
        <div className="flex bg-gray-200/80 p-1 rounded-xl">
          <button
            type="button"
            onClick={() => {
              setAuthMode('pin');
              setErrorMessage('');
            }}
            className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              authMode === 'pin'
                ? 'bg-white text-gray-900 shadow-xs'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <KeyRound className="w-4 h-4 text-[#2E7D32]" />
            <span>PIN de Acceso</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setAuthMode('email');
              setErrorMessage('');
            }}
            className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              authMode === 'email'
                ? 'bg-white text-gray-900 shadow-xs'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Mail className="w-4 h-4 text-[#1976D2]" />
            <span>Correo y Clave</span>
          </button>
        </div>

        {/* Error notification banner */}
        {errorMessage && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-[#D32F2F] font-bold flex items-center gap-2 animate-in fade-in">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Mode 1: Fast Cashier PIN Login */}
        {authMode === 'pin' ? (
          <div className="bg-white rounded-2xl border border-gray-200 p-4 sm:p-5 shadow-xs space-y-4">
            {/* User Profile Selector */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-2">
                Seleccionar Cajero / Turno:
              </label>
              <div className="grid grid-cols-3 gap-2">
                {users.map((u) => {
                  const isSelected = selectedUser?.id === u.id;
                  const roleBadge = getRoleLabel(u.role);
                  return (
                    <button
                      key={u.id}
                      type="button"
                      onClick={() => {
                        setSelectedUser(u);
                        setPinInput('');
                        setErrorMessage('');
                        playSound('beep');
                      }}
                      className={`p-2.5 rounded-xl border text-center transition-all flex flex-col items-center justify-center gap-1.5 relative ${
                        isSelected
                          ? 'border-[#2E7D32] bg-emerald-50/70 ring-2 ring-[#2E7D32]/30'
                          : 'border-gray-200 hover:border-gray-300 bg-white'
                      }`}
                    >
                      <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-100 border border-gray-200 shrink-0">
                        {u.avatar ? (
                          <img src={u.avatar} alt={u.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400 font-bold text-xs">
                            {u.name.charAt(0)}
                          </div>
                        )}
                      </div>
                      <span className="text-xs font-bold text-gray-900 truncate w-full text-center">
                        {u.name.split(' ')[0]}
                      </span>
                      <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded-full border ${roleBadge.bg}`}>
                        {roleBadge.text}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* PIN Code Dots Display */}
            <div className="text-center py-2 space-y-2">
              <span className="text-xs text-gray-500">
                Ingresa tu PIN de 4 dígitos para{' '}
                <strong className="text-gray-900">{selectedUser?.name || 'acceder'}</strong>:
              </span>

              <div className="flex items-center justify-center gap-3.5 py-2">
                {[0, 1, 2, 3].map((index) => {
                  const isFilled = pinInput.length > index;
                  return (
                    <div
                      key={index}
                      className={`w-4 h-4 rounded-full border-2 transition-all duration-150 ${
                        isFilled
                          ? 'bg-[#2E7D32] border-[#2E7D32] scale-110 shadow-xs'
                          : 'bg-gray-100 border-gray-300'
                      }`}
                    />
                  );
                })}
              </div>
            </div>

            {/* Tactile 3x4 Numeric Keypad */}
            <div className="grid grid-cols-3 gap-2 pt-1">
              {['1', '2', '3', '4', '5', '6', '7', '8', '9', 'C', '0', 'backspace'].map((key) => {
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => handleKeypadPress(key)}
                    className="h-13 sm:h-14 bg-white active:bg-[#F3F4F6] border border-gray-200 rounded-xl flex items-center justify-center font-bold text-gray-900 shadow-2xs hover:border-gray-300 transition-colors cursor-pointer select-none"
                    style={{
                      fontFamily: 'Inter',
                      fontSize: '22px',
                      fontWeight: 600,
                    }}
                  >
                    {key === 'backspace' ? (
                      <Delete className="w-5 h-5 text-gray-600" />
                    ) : key === 'C' ? (
                      <span className="text-sm font-bold text-gray-400">BORRAR</span>
                    ) : (
                      key
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ) : (
          /* Mode 2: Standard Email & Password */
          <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-xs">
            <form onSubmit={handleEmailSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Correo Electrónico
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="email"
                    required
                    placeholder="cajero@ventafacil.com"
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    className="w-full h-12 pl-10 pr-3 bg-white border border-[#D1D5DB] rounded-xl text-sm text-gray-900 focus:ring-2 focus:ring-[#2E7D32] focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Contraseña o PIN
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="••••••••"
                    value={passwordInput}
                    onChange={(e) => setPasswordInput(e.target.value)}
                    className="w-full h-12 pl-10 pr-10 bg-white border border-[#D1D5DB] rounded-xl text-sm text-gray-900 focus:ring-2 focus:ring-[#2E7D32] focus:outline-hidden"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="w-full h-14 bg-[#2E7D32] hover:bg-[#1b6d24] active:bg-[#005312] text-white font-bold text-base rounded-xl shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <UserCheck className="w-5 h-5" />
                <span>Ingresar al Sistema POS</span>
              </button>
            </form>
          </div>
        )}

        {/* Demo Fast Access Bar */}
        <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-xl p-3 space-y-2">
          <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#2E7D32] uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Acceso Rápido de Prueba (1 Toque):</span>
          </div>

          <div className="grid grid-cols-3 gap-1.5">
            {users.map((u) => (
              <button
                key={u.id}
                type="button"
                onClick={() => fillQuickDemo(u)}
                className="py-1.5 px-2 bg-white hover:bg-emerald-100 text-gray-800 text-[11px] font-bold rounded-lg border border-emerald-300 shadow-2xs transition-colors truncate"
              >
                {u.name.split(' ')[0]} ({u.pin})
              </button>
            ))}
          </div>
        </div>

        {/* Terminal Info Footer */}
        <div className="text-center text-[11px] text-gray-400">
          Terminal Seguro POS · Conexión Cifrada Local
        </div>
      </div>
    </div>
  );
};
