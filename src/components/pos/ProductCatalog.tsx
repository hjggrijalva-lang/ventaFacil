import React, { useState, useMemo } from 'react';
import { usePOS } from '../../context/POSContext';
import { Product, ProductCategory } from '../../types';
import { 
  Search, 
  X, 
  Plus, 
  Package, 
  Sparkles,
  AlertTriangle,
  ScanLine
} from 'lucide-react';

const CATEGORIES: ProductCategory[] = [
  'Todos',
  'Bebidas',
  'Snacks y Dulces',
  'Lácteos y Huevos',
  'Abarrotes y Granos',
  'Panadería',
  'Frutas y Verduras',
  'Limpieza y Hogar',
];

export const ProductCatalog: React.FC = () => {
  const { products, addToCart, setIsScannerModalOpen, settings } = usePOS();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<ProductCategory>('Todos');

  // Quick custom item modal state
  const [isQuickItemOpen, setIsQuickItemOpen] = useState(false);
  const [quickName, setQuickName] = useState('');
  const [quickPrice, setQuickPrice] = useState('');
  const [quickTaxable, setQuickTaxable] = useState(false);

  // Filter products
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesCategory = selectedCategory === 'Todos' || p.category === selectedCategory;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        p.name.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q) ||
        p.barcode.includes(q);
      return matchesCategory && matchesSearch;
    });
  }, [products, selectedCategory, searchQuery]);

  const handleAddQuickItem = (e: React.FormEvent) => {
    e.preventDefault();
    const priceNum = parseFloat(quickPrice);
    if (!quickName.trim() || isNaN(priceNum) || priceNum <= 0) return;

    const customProduct: Product = {
      id: `custom-${Date.now()}`,
      name: quickName.trim(),
      sku: 'MANUAL',
      barcode: '',
      category: 'Abarrotes y Granos',
      price: priceNum,
      cost: priceNum * 0.7,
      stock: 999,
      minStock: 5,
      imageUrl: '',
      unit: 'ud',
      taxable: quickTaxable,
    };

    addToCart(customProduct, 1);
    setQuickName('');
    setQuickPrice('');
    setQuickTaxable(false);
    setIsQuickItemOpen(false);
  };

  return (
    <div className="flex flex-col h-full bg-[#f8f9fa]">
      {/* Search & Actions Bar */}
      <div className="p-3 bg-white border-b border-gray-200 space-y-2.5">
        <div className="flex items-center gap-2">
          {/* Search Input: 48px height, 1px border (#D1D5DB), focus 2px #2E7D32 */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar por nombre, código o SKU..."
              className="w-full h-12 pl-10 pr-9 bg-white border border-[#D1D5DB] rounded-lg text-sm text-gray-900 placeholder:text-gray-400 focus:outline-hidden focus:ring-2 focus:ring-[#2E7D32] focus:border-[#2E7D32] transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
                aria-label="Borrar búsqueda"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Quick Scanner shortcut */}
          <button
            onClick={() => setIsScannerModalOpen(true)}
            className="h-12 px-3 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg border border-gray-300 flex items-center justify-center gap-1.5 text-xs font-semibold shrink-0 transition-colors"
            title="Escanear código de barras"
          >
            <ScanLine className="w-4 h-4 text-[#1976D2]" />
            <span className="hidden sm:inline">Escanear</span>
          </button>

          {/* Quick Item Addition button */}
          <button
            onClick={() => setIsQuickItemOpen(true)}
            className="h-12 px-3 bg-[#E8F5E9] hover:bg-[#C8E6C9] text-[#2E7D32] border border-[#A5D6A7] rounded-lg flex items-center justify-center gap-1 text-xs font-bold shrink-0 transition-colors"
            title="Agregar producto rápido sin registrar previamente"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Manual</span>
          </button>
        </div>

        {/* Category Chips / Segmented Control */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
          {CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 text-xs rounded-lg font-medium whitespace-nowrap transition-all duration-150 shrink-0 ${
                  isSelected
                    ? 'bg-[#2E7D32] text-white shadow-xs font-semibold'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </div>

      {/* Product Grid Area */}
      <div className="flex-1 overflow-y-auto p-3">
        {filteredProducts.length === 0 ? (
          <div className="h-64 flex flex-col items-center justify-center text-center p-6 bg-white rounded-xl border border-gray-200">
            <Package className="w-12 h-12 text-gray-300 mb-2" />
            <p className="text-sm font-semibold text-gray-700">No se encontraron productos</p>
            <p className="text-xs text-gray-400 mt-1 max-w-xs">
              Intenta con otro término de búsqueda o agrega un artículo rápido manual.
            </p>
            <button
              onClick={() => setIsQuickItemOpen(true)}
              className="mt-3 inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-[#2E7D32] bg-[#E8F5E9] rounded-lg hover:bg-[#C8E6C9]"
            >
              <Plus className="w-4 h-4" /> Cobrar Item Manual
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-3">
            {filteredProducts.map((product) => {
              const isOutOfStock = product.stock <= 0;
              const isLowStock = !isOutOfStock && product.stock <= product.minStock;

              return (
                <button
                  key={product.id}
                  onClick={() => addToCart(product, 1)}
                  disabled={isOutOfStock}
                  className={`group relative text-left bg-white rounded-xl border border-[#E5E7EB] p-2.5 flex flex-col justify-between transition-all duration-150 hover:shadow-md hover:border-[#2E7D32]/40 active:scale-[0.98] focus:outline-hidden focus:ring-2 focus:ring-[#2E7D32] ${
                    isOutOfStock ? 'opacity-60 grayscale-[0.6] cursor-not-allowed' : 'cursor-pointer'
                  }`}
                  style={{
                    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.08), 0 1px 2px rgba(0, 0, 0, 0.04)',
                  }}
                >
                  {/* Image & Badges */}
                  <div className="relative w-full aspect-4/3 rounded-lg overflow-hidden bg-gray-100 mb-2">
                    {product.imageUrl ? (
                      <img
                        src={product.imageUrl}
                        alt={product.name}
                        loading="lazy"
                        className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
                        onError={(e) => {
                          (e.currentTarget as HTMLElement).style.display = 'none';
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        <Package className="w-8 h-8" />
                      </div>
                    )}

                    {/* Stock Status Badges conforming to design system */}
                    <div className="absolute top-1.5 right-1.5">
                      {isOutOfStock ? (
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-[#FFEBEE] text-[#D32F2F] uppercase tracking-wider">
                          Agotado
                        </span>
                      ) : isLowStock ? (
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-[#FFF3E0] text-[#ED6C02] uppercase tracking-wider flex items-center gap-0.5">
                          <AlertTriangle className="w-2.5 h-2.5" />
                          {product.stock} {product.unit}
                        </span>
                      ) : (
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-[#E8F5E9] text-[#2E7D32] uppercase tracking-wider">
                          {product.stock} {product.unit}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Product Details */}
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <div className="text-[11px] font-mono text-gray-400 uppercase tracking-wide truncate">
                        {product.sku}
                      </div>
                      <h2 className="text-xs sm:text-sm font-semibold text-gray-900 line-clamp-2 leading-snug mt-0.5">
                        {product.name}
                      </h2>
                    </div>

                    <div className="mt-2.5 pt-1.5 border-t border-gray-100 flex items-center justify-between">
                      <div className="text-sm sm:text-base font-extrabold text-[#2E7D32] tnum">
                        {settings.currency}{product.price.toFixed(2)}
                      </div>
                      <div className="w-7 h-7 rounded-md bg-gray-50 group-hover:bg-[#2E7D32] text-gray-400 group-hover:text-white flex items-center justify-center transition-colors">
                        <Plus className="w-4 h-4" />
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Quick Custom Item Modal */}
      {isQuickItemOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-2xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-2xl border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 text-[#2E7D32] flex items-center justify-center">
                  <Sparkles className="w-4 h-4" />
                </div>
                <h3 className="text-base font-bold text-gray-900">Cobro Rápido / Item Manual</h3>
              </div>
              <button
                onClick={() => setIsQuickItemOpen(false)}
                className="text-gray-400 hover:text-gray-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddQuickItem} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Descripción del Producto
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Pan artesanal, Recarga saldo..."
                  value={quickName}
                  onChange={(e) => setQuickName(e.target.value)}
                  className="w-full h-11 px-3 bg-white border border-gray-300 rounded-lg text-sm text-gray-900 focus:ring-2 focus:ring-[#2E7D32] focus:outline-hidden"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Precio de Venta ({settings.currency})
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-gray-500">
                    {settings.currency}
                  </span>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    required
                    placeholder="0.00"
                    value={quickPrice}
                    onChange={(e) => setQuickPrice(e.target.value)}
                    className="w-full h-11 pl-8 pr-3 bg-white border border-gray-300 rounded-lg text-base font-bold text-gray-900 focus:ring-2 focus:ring-[#2E7D32] focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="taxableCheck"
                  checked={quickTaxable}
                  onChange={(e) => setQuickTaxable(e.target.checked)}
                  className="w-4 h-4 text-[#2E7D32] rounded border-gray-300 focus:ring-[#2E7D32]"
                />
                <label htmlFor="taxableCheck" className="text-xs text-gray-700 select-none">
                  Aplica IVA ({settings.taxRate}%)
                </label>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsQuickItemOpen(false)}
                  className="flex-1 h-11 border border-gray-300 rounded-lg text-xs font-semibold text-gray-700 hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 h-11 bg-[#2E7D32] hover:bg-[#1b6d24] text-white rounded-lg text-xs font-bold shadow-xs transition-colors"
                >
                  Agregar a Caja
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
