import React from 'react';
import { usePOS, ActiveTab } from '../context/POSContext';
import { 
  Calculator, 
  Package, 
  Receipt, 
  CircleDollarSign, 
  Users, 
  Settings 
} from 'lucide-react';

export const BottomNav: React.FC = () => {
  const { activeTab, setActiveTab, cartItemCount, products, transactions } = usePOS();

  // Low stock counter for inventory tab badge
  const lowStockCount = products.filter((p) => p.stock <= p.minStock).length;
  const todayTransactionsCount = transactions.length;

  const navItems: { id: ActiveTab; label: string; icon: React.ComponentType<{ className?: string }>; badge?: number; badgeColor?: string }[] = [
    {
      id: 'pos',
      label: 'Caja',
      icon: Calculator,
      badge: cartItemCount > 0 ? cartItemCount : undefined,
      badgeColor: 'bg-[#2E7D32]',
    },
    {
      id: 'inventory',
      label: 'Inventario',
      icon: Package,
      badge: lowStockCount > 0 ? lowStockCount : undefined,
      badgeColor: 'bg-[#ED6C02]',
    },
    {
      id: 'sales',
      label: 'Ventas',
      icon: Receipt,
      badge: todayTransactionsCount > 0 ? todayTransactionsCount : undefined,
      badgeColor: 'bg-[#1976D2]',
    },
    {
      id: 'cash',
      label: 'Arqueo',
      icon: CircleDollarSign,
    },
    {
      id: 'customers',
      label: 'Clientes',
      icon: Users,
    },
    {
      id: 'settings',
      label: 'Ajustes',
      icon: Settings,
    },
  ];

  return (
    <nav 
      aria-label="Navegación principal"
      className="fixed bottom-0 left-0 right-0 z-40 h-16 bg-white border-t border-gray-200 flex items-center justify-around px-1 select-none"
      style={{
        boxShadow: '0 -2px 10px rgba(0, 0, 0, 0.05)',
      }}
    >
      <div className="w-full max-w-4xl mx-auto flex items-center justify-around h-full">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`relative flex flex-col items-center justify-center flex-1 h-full py-1 text-xs font-semibold transition-all duration-150 focus:outline-hidden ${
                isActive ? 'text-[#2E7D32]' : 'text-[#6B7280] hover:text-gray-900'
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 transition-transform ${isActive ? 'scale-110 text-[#2E7D32]' : ''}`} />
                {item.badge !== undefined && (
                  <span
                    className={`absolute -top-1.5 -right-2.5 min-w-4 h-4 px-1 rounded-full text-[10px] font-bold text-white flex items-center justify-center leading-none ${
                      item.badgeColor || 'bg-[#2E7D32]'
                    }`}
                  >
                    {item.badge > 99 ? '99+' : item.badge}
                  </span>
                )}
              </div>
              <span className={`text-[11px] mt-1 tracking-tight ${isActive ? 'font-bold' : 'font-normal'}`}>
                {item.label}
              </span>
              {isActive && (
                <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-0.75 bg-[#2E7D32] rounded-t-full" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
