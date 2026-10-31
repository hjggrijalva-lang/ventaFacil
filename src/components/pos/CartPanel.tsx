import React, { useState } from 'react';
import { usePOS } from '../../context/POSContext';
import { 
  Trash2, 
  Plus, 
  Minus, 
  ShoppingBag, 
  User, 
  PauseCircle, 
  ChevronRight,
  ArrowRight,
  Percent,
  ReceiptText
} from 'lucide-react';

export const CartPanel: React.FC = () => {
  const {
    cart,
    updateCartQuantity,
    removeFromCart,
    clearCart,
    cartSubtotal,
    cartTax,
    cartDiscount,
    cartTotal,
    cartItemCount,
    activeCustomer,
    setActiveCustomer,
    customers,
    parkCurrentCart,
    setIsPaymentModalOpen,
    settings,
    updateCartItemDiscount,
  } = usePOS();

  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
  const [editingDiscountId, setEditingDiscountId] = useState<string | null>(null);

  return (
    <div className="flex flex-col h-full bg-white border-l border-gray-200">
      {/* Header: Customer Selector */}
      <div className="p-3 bg-gray-50 border-b border-gray-200">
        <button
          onClick={() => setIsCustomerModalOpen(true)}
          className="w-full flex items-center justify-between p-2.5 bg-white border border-gray-200 rounded-lg hover:border-[#1976D2] transition-colors text-left group"
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-full bg-blue-50 text-[#1976D2] flex items-center justify-center shrink-0">
              <User className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                Cliente
              </div>
              <div className="text-xs sm:text-sm font-bold text-gray-900 truncate">
                {activeCustomer.name}
              </div>
              {activeCustomer.docNumber && activeCustomer.docNumber !== '9999999999999' && (
                <div className="text-[10px] text-gray-500 font-mono">
                  ID: {activeCustomer.docNumber}
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center text-xs text-[#1976D2] font-semibold shrink-0 group-hover:translate-x-0.5 transition-transform">
            <span>Cambiar</span>
            <ChevronRight className="w-4 h-4 ml-0.5" />
          </div>
        </button>
      </div>

      {/* Cart Items List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {cart.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 text-gray-400">
            <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-3">
              <ShoppingBag className="w-8 h-8 text-gray-300" />
            </div>
            <p className="text-sm font-semibold text-gray-600">Carrito vacío</p>
            <p className="text-xs text-gray-400 mt-1 max-w-xs">
              Toca o escanea productos del catálogo para comenzar la venta.
            </p>
          </div>
        ) : (
          cart.map((item) => {
            const unitPrice = item.customPrice ?? item.product.price;
            const lineSub = unitPrice * item.quantity;
            const lineDiscount = item.discountPercent ? (lineSub * item.discountPercent) / 100 : 0;
            const lineTotal = lineSub - lineDiscount;

            return (
              <div
                key={item.product.id}
                className="bg-white rounded-xl border border-gray-200 p-2.5 shadow-2xs hover:border-gray-300 transition-colors"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <h3 className="text-xs sm:text-sm font-bold text-gray-900 truncate">
                      {item.product.name}
                    </h3>
                    <div className="flex items-center gap-1.5 text-xs text-gray-500 mt-0.5">
                      <span className="font-medium tnum">
                        {settings.currency}{unitPrice.toFixed(2)}
                      </span>
                      <span>·</span>
                      <span className="text-[11px] uppercase text-gray-400 font-mono">
                        {item.product.sku}
                      </span>
                      {item.product.taxable && settings.enableTax && (
                        <span className="text-[10px] text-emerald-700 bg-emerald-50 px-1 rounded">
                          +IVA
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Line Total */}
                  <div className="text-right shrink-0">
                    <div className="text-sm font-extrabold text-gray-900 tnum">
                      {settings.currency}{lineTotal.toFixed(2)}
                    </div>
                    {item.discountPercent ? (
                      <div className="text-[10px] font-semibold text-[#D32F2F]">
                        -{item.discountPercent}% ({settings.currency}{lineDiscount.toFixed(2)})
                      </div>
                    ) : null}
                  </div>
                </div>

                {/* Controls: Quantity +/- and Discount/Delete */}
                <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-100">
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() =>
                        setEditingDiscountId(
                          editingDiscountId === item.product.id ? null : item.product.id
                        )
                      }
                      className={`px-2 py-1 rounded text-[11px] font-semibold flex items-center gap-1 transition-colors ${
                        item.discountPercent
                          ? 'bg-amber-100 text-amber-900 border border-amber-300'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                      title="Aplicar descuento a este item"
                    >
                      <Percent className="w-3 h-3" />
                      <span>{item.discountPercent ? `${item.discountPercent}% desc` : 'Desc.'}</span>
                    </button>

                    <button
                      onClick={() => removeFromCart(item.product.id)}
                      className="p-1 rounded text-gray-400 hover:text-[#D32F2F] hover:bg-red-50 transition-colors"
                      title="Quitar producto"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Stepper buttons (min 36px touch target) */}
                  <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg p-0.5">
                    <button
                      onClick={() => updateCartQuantity(item.product.id, item.quantity - 1)}
                      className="w-7 h-7 rounded-md bg-white hover:bg-gray-100 border border-gray-200 flex items-center justify-center text-gray-700 active:scale-95 transition-transform"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="w-6 text-center text-xs font-bold text-gray-900 tnum">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateCartQuantity(item.product.id, item.quantity + 1)}
                      className="w-7 h-7 rounded-md bg-white hover:bg-gray-100 border border-gray-200 flex items-center justify-center text-gray-700 active:scale-95 transition-transform"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Inline discount editor */}
                {editingDiscountId === item.product.id && (
                  <div className="mt-2 p-2 bg-amber-50 rounded-lg border border-amber-200 flex items-center gap-2">
                    <span className="text-xs font-medium text-amber-900">Descuento:</span>
                    {[0, 5, 10, 15, 20].map((pct) => (
                      <button
                        key={pct}
                        onClick={() => {
                          updateCartItemDiscount(item.product.id, pct);
                          setEditingDiscountId(null);
                        }}
                        className={`px-2 py-0.5 rounded text-xs font-bold ${
                          (item.discountPercent || 0) === pct
                            ? 'bg-[#ED6C02] text-white'
                            : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-100'
                        }`}
                      >
                        {pct}%
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Footer / Summary and Checkout CTA */}
      <div className="p-3 bg-gray-50 border-t border-gray-200 space-y-2.5">
        {/* Breakdown */}
        <div className="space-y-1 text-xs">
          <div className="flex justify-between text-gray-600">
            <span>Subtotal ({cartItemCount} items)</span>
            <span className="font-semibold text-gray-900 tnum">
              {settings.currency}{cartSubtotal.toFixed(2)}
            </span>
          </div>

          {cartDiscount > 0 && (
            <div className="flex justify-between text-[#D32F2F]">
              <span>Descuento aplicado</span>
              <span className="font-bold tnum">
                -{settings.currency}{cartDiscount.toFixed(2)}
              </span>
            </div>
          )}

          {settings.enableTax && (
            <div className="flex justify-between text-gray-600">
              <span>IVA ({settings.taxRate}%)</span>
              <span className="font-semibold text-gray-900 tnum">
                {settings.currency}{cartTax.toFixed(2)}
              </span>
            </div>
          )}

          <div className="pt-2 border-t border-gray-200 flex items-baseline justify-between">
            <span className="text-sm font-bold text-gray-900">Total a Pagar</span>
            <span className="text-2xl sm:text-3xl font-extrabold text-gray-900 tnum tracking-tight">
              {settings.currency}{cartTotal.toFixed(2)}
            </span>
          </div>
        </div>

        {/* Secondary Utility Actions */}
        <div className="grid grid-cols-2 gap-2 pt-1">
          <button
            onClick={() => parkCurrentCart()}
            disabled={cart.length === 0}
            className="h-10 px-2 rounded-lg border border-[#ED6C02]/40 bg-amber-50 hover:bg-amber-100 text-[#ED6C02] text-xs font-bold flex items-center justify-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            title="Guardar ticket en espera para atender a otro cliente"
          >
            <PauseCircle className="w-4 h-4" />
            <span>Poner en Espera</span>
          </button>

          <button
            onClick={clearCart}
            disabled={cart.length === 0}
            className="h-10 px-2 rounded-lg border border-gray-200 bg-white hover:bg-red-50 text-gray-600 hover:text-[#D32F2F] hover:border-red-200 text-xs font-semibold flex items-center justify-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            title="Vaciar carrito actual"
          >
            <Trash2 className="w-4 h-4" />
            <span>Vaciar Carrito</span>
          </button>
        </div>

        {/* Primary Checkout CTA (Minimum height 56px, Solid #2E7D32, White Text, label-lg) */}
        <button
          onClick={() => setIsPaymentModalOpen(true)}
          disabled={cart.length === 0}
          className="w-full h-14 bg-[#2E7D32] hover:bg-[#1b6d24] active:bg-[#005312] disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-bold text-base sm:text-lg rounded-xl shadow-md flex items-center justify-between px-4 transition-all duration-150 cursor-pointer"
        >
          <div className="flex items-center gap-2">
            <ReceiptText className="w-5 h-5 text-white/90" />
            <span>Cobrar</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xl sm:text-2xl font-extrabold tnum">
              {settings.currency}{cartTotal.toFixed(2)}
            </span>
            <ArrowRight className="w-5 h-5" />
          </div>
        </button>
      </div>

      {/* Customer Selection Modal */}
      {isCustomerModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-2xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-2xl border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-gray-900">Seleccionar Cliente</h3>
              <button
                onClick={() => setIsCustomerModalOpen(false)}
                className="text-xs font-semibold text-gray-500 hover:text-gray-800"
              >
                Cerrar
              </button>
            </div>

            <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
              {customers.map((cust) => {
                const isSelected = activeCustomer.id === cust.id;
                return (
                  <button
                    key={cust.id}
                    onClick={() => {
                      setActiveCustomer(cust);
                      setIsCustomerModalOpen(false);
                    }}
                    className={`w-full text-left p-3 rounded-xl border transition-all flex items-center justify-between ${
                      isSelected
                        ? 'border-[#2E7D32] bg-emerald-50 text-gray-900'
                        : 'border-gray-200 hover:border-gray-300 bg-white'
                    }`}
                  >
                    <div>
                      <div className="text-xs sm:text-sm font-bold text-gray-900">{cust.name}</div>
                      <div className="text-[11px] text-gray-500 font-mono">
                        Doc: {cust.docNumber} · Tel: {cust.phone}
                      </div>
                      {cust.creditBalance > 0 && (
                        <div className="text-[11px] text-amber-700 font-semibold mt-0.5">
                          Saldo pendiente: {settings.currency}{cust.creditBalance.toFixed(2)}
                        </div>
                      )}
                    </div>
                    {isSelected && (
                      <span className="w-5 h-5 rounded-full bg-[#2E7D32] text-white flex items-center justify-center text-xs font-bold">
                        ✓
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
