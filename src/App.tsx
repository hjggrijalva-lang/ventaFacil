import React, { useState } from 'react';
import { POSProvider, usePOS } from './context/POSContext';
import { Header } from './components/Header';
import { BottomNav } from './components/BottomNav';
import { ProductCatalog } from './components/pos/ProductCatalog';
import { CartPanel } from './components/pos/CartPanel';
import { PaymentModal } from './components/pos/PaymentModal';
import { ReceiptModal } from './components/pos/ReceiptModal';
import { BarcodeScannerModal } from './components/pos/BarcodeScannerModal';
import { HeldCartsModal } from './components/pos/HeldCartsModal';
import { InventoryView } from './components/inventory/InventoryView';
import { SalesView } from './components/sales/SalesView';
import { CashRegisterView } from './components/cash/CashRegisterView';
import { CustomersView } from './components/customers/CustomersView';
import { SettingsView } from './components/settings/SettingsView';
import { LoginView } from './components/auth/LoginView';
import { LockScreenModal } from './components/auth/LockScreenModal';
import { ShoppingBag, Grid } from 'lucide-react';

const POSMainContent: React.FC = () => {
  const {
    currentUser,
    activeTab,
    isMobileFramed,
    cartItemCount,
    cartTotal,
    settings,
  } = usePOS();

  // In mobile view, toggle between catalog and cart view
  const [mobilePOSSubTab, setMobilePOSSubTab] = useState<'catalog' | 'cart'>('catalog');

  // If user is not logged in, show Login Screen
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-[#F0F2F5] flex flex-col items-center justify-center select-none">
        <div
          className={`w-full h-screen flex flex-col bg-white overflow-hidden ${
            isMobileFramed
              ? 'max-w-[430px] max-h-[920px] rounded-[36px] shadow-2xl border-[8px] border-gray-900 relative my-auto'
              : 'max-w-full'
          }`}
        >
          {isMobileFramed && (
            <div className="bg-gray-900 h-6 w-full flex items-center justify-center shrink-0">
              <div className="w-24 h-4 bg-black rounded-b-xl flex items-center justify-center">
                <div className="w-2.5 h-2.5 rounded-full bg-gray-800 mr-2" />
                <div className="w-8 h-1 rounded-full bg-gray-800" />
              </div>
            </div>
          )}
          <LoginView />
        </div>
      </div>
    );
  }

  const renderActiveScreen = () => {
    switch (activeTab) {
      case 'inventory':
        return <InventoryView />;
      case 'sales':
        return <SalesView />;
      case 'cash':
        return <CashRegisterView />;
      case 'customers':
        return <CustomersView />;
      case 'settings':
        return <SettingsView />;
      case 'pos':
      default:
        return (
          <div className="flex-1 flex flex-col h-full overflow-hidden">
            {/* Desktop / Tablet: Dual pane side-by-side */}
            <div className={`flex-1 hidden md:flex h-full overflow-hidden ${isMobileFramed ? '!hidden' : ''}`}>
              <div className="flex-1 h-full overflow-hidden border-r border-gray-200">
                <ProductCatalog />
              </div>
              <div className="w-[380px] lg:w-[420px] h-full overflow-hidden shrink-0">
                <CartPanel />
              </div>
            </div>

            {/* Mobile / Framed Mode: Tabbed interface with sticky bottom bar */}
            <div className={`flex-1 flex flex-col h-full overflow-hidden ${!isMobileFramed ? 'md:hidden' : ''}`}>
              {/* Mobile Sub-Navigation Header Switcher */}
              <div className="bg-white border-b border-gray-200 px-3 py-1.5 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-1 p-1 bg-gray-100 rounded-lg w-full">
                  <button
                    onClick={() => setMobilePOSSubTab('catalog')}
                    className={`flex-1 py-1.5 px-3 rounded-md text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                      mobilePOSSubTab === 'catalog'
                        ? 'bg-white text-gray-900 shadow-xs'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <Grid className="w-3.5 h-3.5" />
                    <span>Catálogo</span>
                  </button>
                  <button
                    onClick={() => setMobilePOSSubTab('cart')}
                    className={`flex-1 py-1.5 px-3 rounded-md text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                      mobilePOSSubTab === 'cart'
                        ? 'bg-[#2E7D32] text-white shadow-xs'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <ShoppingBag className="w-3.5 h-3.5" />
                    <span>Carrito</span>
                    {cartItemCount > 0 && (
                      <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-extrabold ${
                        mobilePOSSubTab === 'cart' ? 'bg-white text-[#2E7D32]' : 'bg-[#2E7D32] text-white'
                      }`}>
                        {cartItemCount}
                      </span>
                    )}
                  </button>
                </div>
              </div>

              {/* Sub-view Content */}
              <div className="flex-1 overflow-hidden relative">
                {mobilePOSSubTab === 'catalog' ? (
                  <div className="h-full flex flex-col">
                    <div className="flex-1 overflow-hidden">
                      <ProductCatalog />
                    </div>

                    {/* Floating mini checkout bar if cart has items */}
                    {cartItemCount > 0 && (
                      <div className="p-2.5 bg-white border-t border-gray-200 shrink-0">
                        <button
                          onClick={() => setMobilePOSSubTab('cart')}
                          className="w-full h-12 bg-[#2E7D32] hover:bg-[#1b6d24] text-white rounded-xl px-4 flex items-center justify-between shadow-md font-bold text-sm active:scale-[0.99] transition-transform"
                        >
                          <div className="flex items-center gap-2">
                            <span className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-xs">
                              {cartItemCount}
                            </span>
                            <span>Ver Carrito</span>
                          </div>
                          <span className="text-base font-extrabold tnum">
                            {settings.currency}{cartTotal.toFixed(2)} →
                          </span>
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <CartPanel />
                )}
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-[#F0F2F5] flex flex-col items-center justify-center select-none">
      {/* Device frame container */}
      <div
        className={`w-full h-screen flex flex-col bg-white overflow-hidden ${
          isMobileFramed
            ? 'max-w-[430px] max-h-[920px] rounded-[36px] shadow-2xl border-[8px] border-gray-900 relative my-auto'
            : 'max-w-full'
        }`}
      >
        {/* Smartphone top notch bar simulation in framed mode */}
        {isMobileFramed && (
          <div className="bg-gray-900 h-6 w-full flex items-center justify-center shrink-0">
            <div className="w-24 h-4 bg-black rounded-b-xl flex items-center justify-center">
              <div className="w-2.5 h-2.5 rounded-full bg-gray-800 mr-2" />
              <div className="w-8 h-1 rounded-full bg-gray-800" />
            </div>
          </div>
        )}

        {/* Top Header */}
        <Header />

        {/* Main Content Area (padded at bottom for 64px fixed nav) */}
        <main className="flex-1 overflow-hidden flex flex-col pb-16">
          {renderActiveScreen()}
        </main>

        {/* Global Modals */}
        <PaymentModal />
        <ReceiptModal />
        <BarcodeScannerModal />
        <HeldCartsModal />
        <LockScreenModal />

        {/* Bottom Navigation Bar (64px) */}
        <BottomNav />
      </div>
    </div>
  );
};

export default function App() {
  return (
    <POSProvider>
      <POSMainContent />
    </POSProvider>
  );
}
