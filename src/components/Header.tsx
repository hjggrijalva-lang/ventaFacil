import React, { useState } from 'react';
import { usePOS } from '../context/POSContext';
import { 
  Store, 
  ScanLine, 
  PauseCircle, 
  Smartphone, 
  Monitor, 
  DollarSign, 
  Wifi,
  Lock,
  LogOut,
  User as UserIcon,
  ChevronDown
} from 'lucide-react';

export const Header: React.FC = () => {
  const {
    settings,
    cashShift,
    heldCarts,
    setIsScannerModalOpen,
    setIsHeldCartsModalOpen,
    isMobileFramed,
    setIsMobileFramed,
    expectedCashInDrawer,
    setActiveTab,
    currentUser,
    lockTerminal,
    logout,
  } = usePOS();

  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-gray-200 px-3 sm:px-4 py-2.5 shadow-xs">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-2 sm:gap-4">
        {/* Brand & Status */}
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-9 h-9 rounded-lg bg-[#2E7D32] flex items-center justify-center text-white shadow-xs shrink-0">
            <Store className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <h1 className="text-sm sm:text-base font-bold text-gray-900 truncate leading-tight">
                {settings.storeName}
              </h1>
              <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-[#2E7D32] border border-emerald-200/60 shrink-0">
                <Wifi className="w-2.5 h-2.5 mr-1 animate-pulse" />
                POS En Línea
              </span>
            </div>
            <div className="flex items-center gap-2 text-[11px] text-gray-500 truncate">
              <span>{cashShift.isOpen ? `Turno Activo: ${currentUser?.name || cashShift.cashier}` : 'Caja Cerrada'}</span>
              <span aria-hidden="true">·</span>
              <span className="text-gray-700 font-medium">RUC: {settings.ruc}</span>
            </div>
          </div>
        </div>

        {/* Action Controls & Indicators */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Cash In Drawer Quick Pill */}
          <button
            onClick={() => setActiveTab('cash')}
            title="Ver saldo actual en caja"
            className="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-gray-50 hover:bg-gray-100 border border-gray-200 text-xs font-medium text-gray-700 transition-colors"
          >
            <DollarSign className="w-3.5 h-3.5 text-[#2E7D32]" />
            <span>En Caja:</span>
            <span className="font-bold text-gray-900 tnum">
              {settings.currency}{expectedCashInDrawer.toFixed(2)}
            </span>
          </button>

          {/* Held Carts Button with Badge */}
          <button
            onClick={() => setIsHeldCartsModalOpen(true)}
            className="relative p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 border border-gray-200 transition-colors flex items-center gap-1.5 text-xs font-medium"
            title="Tickets en espera / Carritos guardados"
          >
            <PauseCircle className="w-4 h-4 text-[#ED6C02]" />
            <span className="hidden sm:inline">En Espera</span>
            {heldCarts.length > 0 && (
              <span className="absolute -top-1 -right-1 sm:static sm:top-auto sm:right-auto px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-[#ED6C02] text-white">
                {heldCarts.length}
              </span>
            )}
          </button>

          {/* Barcode Scanner Trigger */}
          <button
            onClick={() => setIsScannerModalOpen(true)}
            className="flex items-center gap-1.5 px-2.5 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-semibold border border-gray-200 transition-colors"
            title="Escanear código de barras con cámara o láser"
          >
            <ScanLine className="w-4 h-4 text-[#1976D2]" />
            <span className="hidden sm:inline">Escanear</span>
          </button>

          {/* Lock Terminal Button */}
          {currentUser && (
            <button
              onClick={lockTerminal}
              className="p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 border border-gray-200 transition-colors"
              title="Bloquear pantalla de terminal (requiere PIN)"
            >
              <Lock className="w-4 h-4 text-amber-600" />
            </button>
          )}

          {/* User Account / Cashier Profile Chip */}
          {currentUser && (
            <div className="relative">
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center gap-1.5 p-1 pr-2 rounded-lg hover:bg-gray-100 border border-gray-200 transition-colors text-left"
              >
                <div className="w-7 h-7 rounded-full overflow-hidden bg-gray-100 shrink-0 border border-gray-300">
                  {currentUser.avatar ? (
                    <img src={currentUser.avatar} alt={currentUser.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-500 font-bold text-xs">
                      {currentUser.name.charAt(0)}
                    </div>
                  )}
                </div>
                <div className="hidden sm:block text-left min-w-0">
                  <div className="text-xs font-bold text-gray-900 truncate leading-tight">
                    {currentUser.name.split(' ')[0]}
                  </div>
                  <div className="text-[10px] text-gray-500 capitalize leading-tight">
                    {currentUser.role}
                  </div>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
              </button>

              {/* User Dropdown Menu */}
              {isUserMenuOpen && (
                <div className="absolute right-0 mt-1.5 w-48 bg-white rounded-xl shadow-xl border border-gray-200 py-1.5 z-50 animate-in fade-in zoom-in-95">
                  <div className="px-3 py-2 border-b border-gray-100">
                    <p className="text-xs font-bold text-gray-900 truncate">{currentUser.name}</p>
                    <p className="text-[10px] text-gray-500 truncate">{currentUser.email}</p>
                    <span className="inline-block mt-1 px-1.5 py-0.2 rounded text-[9px] font-bold uppercase bg-emerald-50 text-[#2E7D32]">
                      Rol: {currentUser.role}
                    </span>
                  </div>

                  <button
                    onClick={() => {
                      setIsUserMenuOpen(false);
                      lockTerminal();
                    }}
                    className="w-full px-3 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-2 text-left"
                  >
                    <Lock className="w-3.5 h-3.5 text-amber-600" />
                    <span>Bloquear Terminal</span>
                  </button>

                  <button
                    onClick={() => {
                      setIsUserMenuOpen(false);
                      logout();
                    }}
                    className="w-full px-3 py-2 text-xs font-bold text-[#D32F2F] hover:bg-red-50 flex items-center gap-2 text-left"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Cerrar Sesión</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Device Frame Viewport Toggle (Desktop preview helper) */}
          <button
            onClick={() => setIsMobileFramed((prev) => !prev)}
            className="hidden lg:flex items-center gap-1.5 px-2.5 py-2 rounded-lg bg-white hover:bg-gray-50 border border-gray-300 text-xs font-medium text-gray-700 shadow-2xs transition-colors"
            title={isMobileFramed ? "Cambiar a pantalla ancha (Tablet/PC)" : "Ver en formato móvil (Smartphone)"}
          >
            {isMobileFramed ? (
              <>
                <Monitor className="w-3.5 h-3.5 text-gray-600" />
                <span className="hidden xl:inline">Vista Completa</span>
              </>
            ) : (
              <>
                <Smartphone className="w-3.5 h-3.5 text-gray-600" />
                <span className="hidden xl:inline">Vista Móvil</span>
              </>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
