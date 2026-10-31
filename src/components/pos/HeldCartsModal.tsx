import React from 'react';
import { usePOS } from '../../context/POSContext';
import { 
  X, 
  PauseCircle, 
  Play, 
  Trash2, 
  Clock, 
  User, 
  ShoppingBag 
} from 'lucide-react';

export const HeldCartsModal: React.FC = () => {
  const {
    isHeldCartsModalOpen,
    setIsHeldCartsModalOpen,
    heldCarts,
    resumeHeldCart,
    deleteHeldCart,
    settings,
  } = usePOS();

  if (!isHeldCartsModalOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl border border-gray-200 overflow-hidden flex flex-col my-auto">
        {/* Header */}
        <div className="bg-white px-4 py-3 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-amber-100 text-[#ED6C02] flex items-center justify-center">
              <PauseCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-900">Tickets en Espera</h3>
              <p className="text-xs text-gray-500">
                {heldCarts.length} {heldCarts.length === 1 ? 'ticket guardado' : 'tickets guardados'}
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsHeldCartsModalOpen(false)}
            className="text-gray-400 hover:text-gray-700 p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* List of Held Carts */}
        <div className="p-4 overflow-y-auto max-h-[60vh] space-y-2.5">
          {heldCarts.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <ShoppingBag className="w-12 h-12 mx-auto text-gray-300 mb-2" />
              <p className="text-sm font-semibold text-gray-700">No hay tickets en espera</p>
              <p className="text-xs text-gray-400 mt-1 max-w-xs mx-auto">
                Puedes poner en pausa una venta activa en cualquier momento usando el botón &quot;Poner en Espera&quot; en el carrito.
              </p>
            </div>
          ) : (
            heldCarts.map((held) => {
              const totalItems = held.items.reduce((sum, item) => sum + item.quantity, 0);
              const estTotal = held.items.reduce(
                (sum, item) => sum + (item.customPrice ?? item.product.price) * item.quantity,
                0
              );
              const timeStr = new Date(held.timestamp).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              });

              return (
                <div
                  key={held.id}
                  className="bg-white border border-gray-200 rounded-xl p-3 shadow-2xs hover:border-[#ED6C02] transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-gray-900">{held.name}</h4>
                      <div className="flex items-center gap-2 text-xs text-gray-500 mt-0.5">
                        <span className="flex items-center gap-1">
                          <User className="w-3 h-3 text-gray-400" />
                          {held.customer.name}
                        </span>
                        <span>·</span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-gray-400" />
                          {timeStr}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-base font-extrabold text-gray-900 tnum">
                        {settings.currency}{estTotal.toFixed(2)}
                      </div>
                      <div className="text-[11px] text-gray-500">{totalItems} productos</div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="mt-3 pt-2.5 border-t border-gray-100 flex items-center justify-between gap-2">
                    <button
                      onClick={() => deleteHeldCart(held.id)}
                      className="px-2.5 py-1.5 rounded-lg text-gray-400 hover:text-[#D32F2F] hover:bg-red-50 text-xs font-semibold flex items-center gap-1 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Descartar</span>
                    </button>

                    <button
                      onClick={() => resumeHeldCart(held.id)}
                      className="px-4 py-2 rounded-lg bg-[#2E7D32] hover:bg-[#1b6d24] text-white text-xs font-bold flex items-center gap-1.5 shadow-2xs transition-colors"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>Reanudar Venta</span>
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-gray-50 border-t border-gray-200 flex justify-end">
          <button
            onClick={() => setIsHeldCartsModalOpen(false)}
            className="px-4 py-2 bg-white hover:bg-gray-100 border border-gray-300 rounded-lg text-xs font-semibold text-gray-700"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
