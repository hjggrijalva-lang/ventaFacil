import React, { useState } from 'react';
import { usePOS } from '../../context/POSContext';
import { 
  Printer, 
  Share2, 
  Check, 
  X, 
  MessageCircle, 
  Copy,
  Receipt as ReceiptIcon,
  ShoppingBag
} from 'lucide-react';

export const ReceiptModal: React.FC = () => {
  const { currentReceipt, setCurrentReceipt, settings, playSound } = usePOS();
  const [copied, setCopied] = useState(false);

  if (!currentReceipt) return null;

  const handlePrint = () => {
    playSound('beep');
    window.print();
  };

  const handleShareWhatsApp = () => {
    playSound('beep');
    const itemsText = currentReceipt.items
      .map((i) => `• ${i.quantity}x ${i.productName} - ${settings.currency}${i.total.toFixed(2)}`)
      .join('\n');

    const message = 
`🧾 *COMPROBANTE DE VENTA - ${settings.storeName.toUpperCase()}*
*Ticket N°:* ${currentReceipt.ticketNumber}
*Fecha:* ${new Date(currentReceipt.timestamp).toLocaleString()}
*Cliente:* ${currentReceipt.customer.name} (${currentReceipt.customer.docNumber})

*DETALLE DE COMPRA:*
${itemsText}

--------------------------
*Subtotal:* ${settings.currency}${currentReceipt.subtotal.toFixed(2)}
${currentReceipt.discount > 0 ? `*Descuento:* -${settings.currency}${currentReceipt.discount.toFixed(2)}\n` : ''}*IVA (${currentReceipt.taxRate}%):* ${settings.currency}${currentReceipt.tax.toFixed(2)}
*TOTAL PAGADO:* ${settings.currency}${currentReceipt.total.toFixed(2)}
*Método:* ${currentReceipt.paymentMethod.toUpperCase()}
${currentReceipt.paymentMethod === 'cash' ? `*Recibido:* ${settings.currency}${currentReceipt.amountReceived.toFixed(2)}\n*Cambio:* ${settings.currency}${currentReceipt.change.toFixed(2)}\n` : ''}
_${settings.receiptFooterMessage}_`;

    const encoded = encodeURIComponent(message);
    const phone = currentReceipt.customer.phone ? currentReceipt.customer.phone.replace(/[^0-9]/g, '') : '';
    window.open(`https://wa.me/${phone}?text=${encoded}`, '_blank');
  };

  const handleCopyText = () => {
    playSound('beep');
    const text = `Ticket: ${currentReceipt.ticketNumber} | Total: ${settings.currency}${currentReceipt.total.toFixed(2)} | ${settings.storeName}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formattedDate = new Date(currentReceipt.timestamp).toLocaleString('es-EC', {
    dateStyle: 'short',
    timeStyle: 'medium',
  });

  return (
    <div className="fixed inset-0 z-50 bg-black/65 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl w-full max-w-sm sm:max-w-md shadow-2xl border border-gray-200 overflow-hidden flex flex-col my-auto animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header Actions */}
        <div className="bg-gray-100 px-4 py-3 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-bold text-gray-700">
            <ReceiptIcon className="w-4 h-4 text-[#2E7D32]" />
            <span>Ticket Emitido con Éxito</span>
          </div>
          <button
            onClick={() => setCurrentReceipt(null)}
            className="text-gray-400 hover:text-gray-700 p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Printable Thermal Receipt Card */}
        <div className="p-4 sm:p-6 bg-gray-50 flex justify-center">
          <div 
            id="printable-receipt"
            className="w-full bg-white p-5 rounded-lg border border-gray-200 shadow-xs font-mono text-xs text-gray-800 space-y-3"
            style={{
              fontFamily: "'JetBrains Mono', 'Courier New', Courier, monospace",
            }}
          >
            {/* Header / Store Identity */}
            <div className="text-center space-y-0.5 border-b border-dashed border-gray-300 pb-3">
              <h3 className="font-extrabold text-sm text-gray-900 tracking-wide">
                {settings.storeName.toUpperCase()}
              </h3>
              <p className="text-[11px] text-gray-600">RUC: {settings.ruc}</p>
              <p className="text-[11px] text-gray-600">{settings.address}</p>
              <p className="text-[11px] text-gray-600">Tel: {settings.phone}</p>
            </div>

            {/* Ticket Info */}
            <div className="text-[11px] space-y-1 border-b border-dashed border-gray-300 pb-2">
              <div className="flex justify-between">
                <span className="font-bold">COMPROBANTE:</span>
                <span className="font-bold">{currentReceipt.ticketNumber}</span>
              </div>
              <div className="flex justify-between">
                <span>FECHA:</span>
                <span>{formattedDate}</span>
              </div>
              <div className="flex justify-between">
                <span>CAJERO:</span>
                <span>{currentReceipt.cashierName}</span>
              </div>
              <div className="flex justify-between">
                <span>CLIENTE:</span>
                <span className="font-semibold truncate max-w-[170px] text-right">
                  {currentReceipt.customer.name}
                </span>
              </div>
              <div className="flex justify-between">
                <span>CI/RUC:</span>
                <span>{currentReceipt.customer.docNumber}</span>
              </div>
            </div>

            {/* Items Table */}
            <div className="border-b border-dashed border-gray-300 pb-2">
              <div className="flex justify-between font-bold text-[10px] text-gray-500 uppercase mb-1">
                <span className="w-8">CANT</span>
                <span className="flex-1 px-1">DESCRIPCIÓN</span>
                <span className="w-14 text-right">TOTAL</span>
              </div>
              <div className="space-y-1">
                {currentReceipt.items.map((item, idx) => (
                  <div key={idx} className="flex justify-between text-[11px] leading-tight">
                    <span className="w-8">{item.quantity}x</span>
                    <span className="flex-1 px-1 truncate">{item.productName}</span>
                    <span className="w-14 text-right font-medium tnum">
                      {settings.currency}{item.total.toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Totals Breakdown */}
            <div className="space-y-1 text-[11px] border-b border-dashed border-gray-300 pb-2">
              <div className="flex justify-between">
                <span>SUBTOTAL:</span>
                <span className="tnum">{settings.currency}{currentReceipt.subtotal.toFixed(2)}</span>
              </div>
              {currentReceipt.discount > 0 && (
                <div className="flex justify-between text-red-600">
                  <span>DESCUENTO:</span>
                  <span className="tnum">-{settings.currency}{currentReceipt.discount.toFixed(2)}</span>
                </div>
              )}
              {currentReceipt.tax > 0 && (
                <div className="flex justify-between">
                  <span>IVA ({currentReceipt.taxRate}%):</span>
                  <span className="tnum">{settings.currency}{currentReceipt.tax.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between font-extrabold text-sm pt-1 border-t border-gray-200">
                <span>TOTAL A PAGAR:</span>
                <span className="tnum">{settings.currency}{currentReceipt.total.toFixed(2)}</span>
              </div>
            </div>

            {/* Payment info */}
            <div className="text-[11px] space-y-0.5 border-b border-dashed border-gray-300 pb-2">
              <div className="flex justify-between">
                <span>MÉTODO DE PAGO:</span>
                <span className="font-bold uppercase">{currentReceipt.paymentMethod}</span>
              </div>
              {currentReceipt.paymentMethod === 'cash' && (
                <>
                  <div className="flex justify-between">
                    <span>VALOR RECIBIDO:</span>
                    <span className="tnum">{settings.currency}{currentReceipt.amountReceived.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-[#2E7D32]">
                    <span>CAMBIO / VUELTO:</span>
                    <span className="tnum">{settings.currency}{currentReceipt.change.toFixed(2)}</span>
                  </div>
                </>
              )}
            </div>

            {/* QR / Barcode simulation & Footer */}
            <div className="text-center pt-2 space-y-1.5">
              <div className="inline-block p-1 bg-white border border-gray-300 rounded">
                {/* Visual barcode stripes */}
                <div className="flex items-center justify-center gap-0.5 h-7 px-2">
                  {[2, 1, 3, 1, 2, 4, 1, 3, 2, 1, 4, 2, 1, 3, 1, 2, 3, 1, 2].map((w, i) => (
                    <span
                      key={i}
                      className="h-full bg-gray-900 inline-block"
                      style={{ width: `${w * 1.5}px` }}
                    />
                  ))}
                </div>
                <p className="text-[9px] text-gray-500 font-mono tracking-widest mt-0.5">
                  *{currentReceipt.ticketNumber}*
                </p>
              </div>

              <p className="text-[10px] text-gray-500 font-sans italic">
                {settings.receiptFooterMessage}
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons Toolbar */}
        <div className="p-4 bg-white border-t border-gray-200 space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={handlePrint}
              className="h-11 bg-white hover:bg-gray-50 border border-gray-300 rounded-lg text-xs font-bold text-gray-800 flex items-center justify-center gap-2 transition-colors"
            >
              <Printer className="w-4 h-4 text-[#1976D2]" />
              <span>Imprimir Ticket</span>
            </button>

            <button
              onClick={handleShareWhatsApp}
              className="h-11 bg-[#25D366] hover:bg-[#20ba59] text-white rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-colors shadow-2xs"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Enviar WhatsApp</span>
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={handleCopyText}
              className="h-10 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-[#2E7D32]" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copiado' : 'Copiar Resumen'}</span>
            </button>

            <button
              onClick={() => setCurrentReceipt(null)}
              className="h-10 bg-[#2E7D32] hover:bg-[#1b6d24] text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-colors shadow-xs"
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>Nueva Venta</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
