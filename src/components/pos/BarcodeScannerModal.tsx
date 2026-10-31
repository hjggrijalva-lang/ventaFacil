import React, { useState } from 'react';
import { usePOS } from '../../context/POSContext';
import { 
  X, 
  ScanLine, 
  Barcode, 
  Search, 
  CheckCircle, 
  AlertCircle 
} from 'lucide-react';

export const BarcodeScannerModal: React.FC = () => {
  const {
    isScannerModalOpen,
    setIsScannerModalOpen,
    products,
    addToCart,
    playSound,
  } = usePOS();

  const [manualCode, setManualCode] = useState('');
  const [lastScanned, setLastScanned] = useState<{ name: string; price: number } | null>(null);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isScannerModalOpen) return null;

  const triggerScanCode = (code: string) => {
    setErrorMsg('');
    const found = products.find(
      (p) => p.barcode === code.trim() || p.sku.toLowerCase() === code.trim().toLowerCase()
    );

    if (found) {
      if (found.stock <= 0) {
        playSound('alert');
        setErrorMsg(`"${found.name}" está agotado en inventario.`);
        return;
      }
      addToCart(found, 1);
      setLastScanned({ name: found.name, price: found.price });
      setTimeout(() => setLastScanned(null), 3000);
      setManualCode('');
    } else {
      playSound('alert');
      setErrorMsg(`No se encontró producto con código: ${code}`);
    }
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualCode.trim()) return;
    triggerScanCode(manualCode);
  };

  // Sample items to quickly test scanning
  const demoScannableProducts = products.slice(0, 5);

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl border border-gray-200 overflow-hidden flex flex-col my-auto">
        {/* Header */}
        <div className="bg-gray-900 text-white px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ScanLine className="w-5 h-5 text-[#88d982] animate-pulse" />
            <div>
              <h3 className="text-sm font-bold">Escáner de Código de Barras</h3>
              <p className="text-[11px] text-gray-400">Óptico / Cámara / Láser POS</p>
            </div>
          </div>
          <button
            onClick={() => setIsScannerModalOpen(false)}
            className="text-gray-400 hover:text-white p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Viewfinder simulation with laser line */}
        <div className="p-4 bg-gray-950 flex flex-col items-center justify-center">
          <div className="relative w-full max-w-[280px] h-48 rounded-xl border-2 border-emerald-500/60 bg-gray-900/80 flex flex-col items-center justify-center overflow-hidden shadow-inner">
            {/* Viewfinder brackets */}
            <div className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-emerald-400" />
            <div className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-emerald-400" />
            <div className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 border-emerald-400" />
            <div className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-emerald-400" />

            {/* Red laser scanning animation */}
            <div className="absolute inset-x-0 h-0.5 bg-red-500 shadow-[0_0_12px_2px_rgba(239,68,68,0.9)] animate-bounce" />

            <Barcode className="w-20 h-20 text-gray-600 opacity-40 mb-1" />
            <p className="text-[11px] font-mono text-emerald-400 bg-black/60 px-2 py-0.5 rounded">
              Apunta el código al recuadro
            </p>
          </div>

          {/* Feedback Banner */}
          {lastScanned && (
            <div className="mt-3 w-full p-2.5 bg-emerald-950/80 border border-emerald-500/50 rounded-lg text-emerald-200 text-xs flex items-center gap-2 animate-in fade-in">
              <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
              <div className="truncate">
                ¡Agregado!: <strong>{lastScanned.name}</strong> (${lastScanned.price.toFixed(2)})
              </div>
            </div>
          )}

          {errorMsg && (
            <div className="mt-3 w-full p-2.5 bg-red-950/80 border border-red-500/50 rounded-lg text-red-200 text-xs flex items-center gap-2 animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
              <div className="truncate">{errorMsg}</div>
            </div>
          )}
        </div>

        {/* Manual Barcode Entry Form */}
        <div className="p-4 bg-white border-b border-gray-200">
          <form onSubmit={handleManualSubmit} className="space-y-2">
            <label className="block text-xs font-semibold text-gray-700">
              Ingreso Manual de Código o SKU
            </label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Ej: 7861001200101 o BEB-001"
                  value={manualCode}
                  onChange={(e) => setManualCode(e.target.value)}
                  className="w-full h-11 pl-9 pr-3 bg-white border border-gray-300 rounded-lg text-sm text-gray-900 focus:ring-2 focus:ring-[#2E7D32] focus:outline-hidden font-mono"
                  autoFocus
                />
              </div>
              <button
                type="submit"
                className="h-11 px-4 bg-[#2E7D32] hover:bg-[#1b6d24] text-white font-bold text-xs rounded-lg transition-colors shrink-0"
              >
                Agregar
              </button>
            </div>
          </form>
        </div>

        {/* Quick Tap Demo Barcodes (for rapid testing without physical barcode) */}
        <div className="p-4 bg-gray-50 space-y-2">
          <div className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">
            Códigos de Prueba Rápidos (Toca para simular escaneo):
          </div>
          <div className="grid grid-cols-1 gap-1.5 max-h-40 overflow-y-auto pr-1">
            {demoScannableProducts.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => triggerScanCode(p.barcode)}
                className="w-full flex items-center justify-between p-2 rounded-lg bg-white border border-gray-200 hover:border-[#2E7D32] hover:bg-emerald-50/50 text-left transition-colors text-xs group"
              >
                <div className="min-w-0 pr-2">
                  <div className="font-semibold text-gray-900 truncate">{p.name}</div>
                  <div className="text-[10px] text-gray-500 font-mono flex items-center gap-1.5">
                    <Barcode className="w-3 h-3 text-gray-400" />
                    <span>{p.barcode}</span>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <span className="font-bold text-[#2E7D32]">${p.price.toFixed(2)}</span>
                  <span className="block text-[10px] text-gray-400 group-hover:text-[#2E7D32] font-semibold">
                    Simular Escaneo →
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 bg-white border-t border-gray-200 flex justify-end">
          <button
            onClick={() => setIsScannerModalOpen(false)}
            className="h-10 px-4 bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-bold rounded-lg transition-colors"
          >
            Listo / Volver a Caja
          </button>
        </div>
      </div>
    </div>
  );
};
