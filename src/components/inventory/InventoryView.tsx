import React, { useState, useMemo } from 'react';
import { usePOS } from '../../context/POSContext';
import { Product, ProductCategory } from '../../types';
import { 
  Package, 
  Plus, 
  Search, 
  AlertTriangle, 
  XCircle, 
  Edit3, 
  Trash2, 
  X, 
  Save,
  CheckCircle,
  TrendingUp,
  DollarSign
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
  'Cuidado Personal',
];

export const InventoryView: React.FC = () => {
  const {
    products,
    addProduct,
    updateProduct,
    deleteProduct,
    adjustStock,
    setExactStock,
    settings,
    playSound,
  } = usePOS();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<ProductCategory>('Todos');
  const [statusFilter, setStatusFilter] = useState<'all' | 'low' | 'out'>('all');

  // Modal state
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Stock quick adjustment popup
  const [adjustingProduct, setAdjustingProduct] = useState<Product | null>(null);
  const [quickStockVal, setQuickStockVal] = useState<string>('');

  // Form states for Add/Edit
  const [formData, setFormData] = useState<Omit<Product, 'id'>>({
    name: '',
    sku: '',
    barcode: '',
    category: 'Abarrotes y Granos',
    price: 1.0,
    cost: 0.7,
    stock: 10,
    minStock: 5,
    imageUrl: '',
    unit: 'ud',
    taxable: true,
  });

  // Calculate metrics
  const totalStockCount = products.reduce((sum, p) => sum + p.stock, 0);
  const totalCostValuation = products.reduce((sum, p) => sum + p.cost * p.stock, 0);
  const totalRetailValuation = products.reduce((sum, p) => sum + p.price * p.stock, 0);
  const lowStockCount = products.filter((p) => p.stock > 0 && p.stock <= p.minStock).length;
  const outOfStockCount = products.filter((p) => p.stock <= 0).length;

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesCategory = selectedCategory === 'Todos' || p.category === selectedCategory;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        p.name.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q) ||
        p.barcode.includes(q);

      let matchesStatus = true;
      if (statusFilter === 'low') matchesStatus = p.stock > 0 && p.stock <= p.minStock;
      if (statusFilter === 'out') matchesStatus = p.stock <= 0;

      return matchesCategory && matchesSearch && matchesStatus;
    });
  }, [products, selectedCategory, searchQuery, statusFilter]);

  const openAddModal = () => {
    setEditingProduct(null);
    setFormData({
      name: '',
      sku: `SKU-${Math.floor(100 + Math.random() * 900)}`,
      barcode: `786${Math.floor(1000000000 + Math.random() * 9000000000)}`,
      category: 'Abarrotes y Granos',
      price: 1.5,
      cost: 1.0,
      stock: 20,
      minStock: 5,
      imageUrl: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=300&q=80',
      unit: 'ud',
      taxable: true,
    });
    setIsEditModalOpen(true);
  };

  const openEditModal = (prod: Product) => {
    setEditingProduct(prod);
    setFormData({
      name: prod.name,
      sku: prod.sku,
      barcode: prod.barcode,
      category: prod.category,
      price: prod.price,
      cost: prod.cost,
      stock: prod.stock,
      minStock: prod.minStock,
      imageUrl: prod.imageUrl,
      unit: prod.unit,
      taxable: prod.taxable,
    });
    setIsEditModalOpen(true);
  };

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    if (editingProduct) {
      updateProduct({
        ...formData,
        id: editingProduct.id,
      });
    } else {
      addProduct(formData);
    }
    setIsEditModalOpen(false);
  };

  const handleQuickStockSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!adjustingProduct) return;
    const val = parseInt(quickStockVal, 10);
    if (!isNaN(val) && val >= 0) {
      setExactStock(adjustingProduct.id, val);
      setAdjustingProduct(null);
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#F8F9FA] overflow-y-auto pb-20">
      {/* Top Banner / Summary Stats */}
      <div className="bg-white border-b border-gray-200 p-4">
        <div className="max-w-6xl mx-auto space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Control de Inventario</h2>
              <p className="text-xs text-gray-500">
                Monitorea existencias, alertas de stock mínimo y valoriza tu mercadería.
              </p>
            </div>
            <button
              onClick={openAddModal}
              className="h-11 px-4 bg-[#2E7D32] hover:bg-[#1b6d24] text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 shadow-xs transition-colors shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Nuevo Producto</span>
            </button>
          </div>

          {/* Metric Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3">
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-3">
              <span className="text-[11px] font-bold text-gray-500 uppercase">Productos Activos</span>
              <div className="text-xl sm:text-2xl font-extrabold text-gray-900 mt-0.5 tnum">
                {products.length} <span className="text-xs font-normal text-gray-500">({totalStockCount} uds)</span>
              </div>
            </div>

            <div className="bg-gray-50 border border-gray-200 rounded-xl p-3">
              <span className="text-[11px] font-bold text-gray-500 uppercase">Valor Inventario (PVP)</span>
              <div className="text-xl sm:text-2xl font-extrabold text-[#2E7D32] mt-0.5 tnum">
                {settings.currency}{totalRetailValuation.toFixed(2)}
              </div>
            </div>

            <button
              onClick={() => setStatusFilter(statusFilter === 'low' ? 'all' : 'low')}
              className={`p-3 rounded-xl border text-left transition-colors cursor-pointer ${
                statusFilter === 'low'
                  ? 'bg-amber-100 border-[#ED6C02] ring-1 ring-[#ED6C02]'
                  : 'bg-amber-50/60 border-amber-200 hover:bg-amber-100/60'
              }`}
            >
              <span className="text-[11px] font-bold text-amber-800 uppercase flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5 text-[#ED6C02]" />
                Stock Bajo
              </span>
              <div className="text-xl sm:text-2xl font-extrabold text-[#ED6C02] mt-0.5 tnum">
                {lowStockCount} <span className="text-xs font-normal text-amber-700">artículos</span>
              </div>
            </button>

            <button
              onClick={() => setStatusFilter(statusFilter === 'out' ? 'all' : 'out')}
              className={`p-3 rounded-xl border text-left transition-colors cursor-pointer ${
                statusFilter === 'out'
                  ? 'bg-red-100 border-[#D32F2F] ring-1 ring-[#D32F2F]'
                  : 'bg-red-50/60 border-red-200 hover:bg-red-100/60'
              }`}
            >
              <span className="text-[11px] font-bold text-red-800 uppercase flex items-center gap-1">
                <XCircle className="w-3.5 h-3.5 text-[#D32F2F]" />
                Agotados
              </span>
              <div className="text-xl sm:text-2xl font-extrabold text-[#D32F2F] mt-0.5 tnum">
                {outOfStockCount} <span className="text-xs font-normal text-red-700">artículos</span>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="max-w-6xl w-full mx-auto p-4 space-y-3">
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar por nombre, código de barras o SKU..."
              className="w-full h-11 pl-9 pr-9 bg-white border border-[#D1D5DB] rounded-lg text-sm text-gray-900 placeholder:text-gray-400 focus:outline-hidden focus:ring-2 focus:ring-[#2E7D32]"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-2 text-xs rounded-lg font-medium whitespace-nowrap transition-colors ${
                  selectedCategory === cat
                    ? 'bg-[#1976D2] text-white font-bold shadow-xs'
                    : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Table / Card List */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 font-bold uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Producto</th>
                  <th className="py-3 px-3">Categoría</th>
                  <th className="py-3 px-3 text-right">Costo</th>
                  <th className="py-3 px-3 text-right">PVP (Venta)</th>
                  <th className="py-3 px-3 text-center">Margen</th>
                  <th className="py-3 px-3 text-center">Estado / Stock</th>
                  <th className="py-3 px-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredProducts.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-gray-400">
                      <Package className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                      No se encontraron productos con los filtros seleccionados.
                    </td>
                  </tr>
                ) : (
                  filteredProducts.map((p) => {
                    const margin = p.cost > 0 ? (((p.price - p.cost) / p.cost) * 100).toFixed(0) : '0';
                    const isOutOfStock = p.stock <= 0;
                    const isLowStock = !isOutOfStock && p.stock <= p.minStock;

                    return (
                      <tr key={p.id} className="hover:bg-gray-50/80 transition-colors">
                        {/* Name & SKU */}
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-gray-100 overflow-hidden shrink-0 border border-gray-200">
                              {p.imageUrl ? (
                                <img
                                  src={p.imageUrl}
                                  alt={p.name}
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    (e.currentTarget as HTMLElement).style.display = 'none';
                                  }}
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-400">
                                  <Package className="w-5 h-5" />
                                </div>
                              )}
                            </div>
                            <div className="min-w-0">
                              <div className="font-bold text-gray-900 truncate max-w-xs sm:max-w-sm">
                                {p.name}
                              </div>
                              <div className="text-[11px] text-gray-500 font-mono flex items-center gap-2">
                                <span>SKU: {p.sku}</span>
                                {p.barcode && <span>· Barcode: {p.barcode}</span>}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Category */}
                        <td className="py-3 px-3 text-gray-600 font-medium whitespace-nowrap">
                          {p.category}
                        </td>

                        {/* Cost */}
                        <td className="py-3 px-3 text-right font-medium text-gray-600 tnum whitespace-nowrap">
                          {settings.currency}{p.cost.toFixed(2)}
                        </td>

                        {/* Price */}
                        <td className="py-3 px-3 text-right font-bold text-[#2E7D32] tnum text-sm whitespace-nowrap">
                          {settings.currency}{p.price.toFixed(2)}
                        </td>

                        {/* Margin */}
                        <td className="py-3 px-3 text-center whitespace-nowrap">
                          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[11px] font-semibold bg-blue-50 text-[#1976D2]">
                            +{margin}%
                          </span>
                        </td>

                        {/* Stock Badges matching design system */}
                        <td className="py-3 px-3 text-center whitespace-nowrap">
                          {isOutOfStock ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-[#FFEBEE] text-[#D32F2F] uppercase">
                              <XCircle className="w-3 h-3" />
                              Agotado (0 {p.unit})
                            </span>
                          ) : isLowStock ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-[#FFF3E0] text-[#ED6C02] uppercase">
                              <AlertTriangle className="w-3 h-3" />
                              Bajo ({p.stock} {p.unit})
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-[#E8F5E9] text-[#2E7D32] uppercase">
                              <CheckCircle className="w-3 h-3" />
                              {p.stock} {p.unit}
                            </span>
                          )}
                        </td>

                        {/* Actions */}
                        <td className="py-3 px-4 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1.5">
                            {/* Fast +/- adjustment */}
                            <button
                              onClick={() => adjustStock(p.id, -1)}
                              disabled={p.stock <= 0}
                              className="w-7 h-7 rounded border border-gray-200 bg-white hover:bg-gray-100 flex items-center justify-center font-bold text-gray-700 disabled:opacity-40"
                              title="Restar 1 unidad"
                            >
                              -
                            </button>
                            <button
                              onClick={() => {
                                setAdjustingProduct(p);
                                setQuickStockVal(String(p.stock));
                              }}
                              className="px-2 h-7 rounded border border-gray-200 bg-gray-50 hover:bg-gray-100 font-bold text-gray-800 text-[11px]"
                              title="Fijar cantidad exacta"
                            >
                              {p.stock}
                            </button>
                            <button
                              onClick={() => adjustStock(p.id, 1)}
                              className="w-7 h-7 rounded border border-gray-200 bg-white hover:bg-gray-100 flex items-center justify-center font-bold text-gray-700"
                              title="Sumar 1 unidad"
                            >
                              +
                            </button>

                            {/* Edit */}
                            <button
                              onClick={() => openEditModal(p)}
                              className="p-1.5 rounded text-gray-400 hover:text-[#1976D2] hover:bg-blue-50 transition-colors ml-1"
                              title="Editar producto"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>

                            {/* Delete */}
                            <button
                              onClick={() => {
                                if (confirm(`¿Eliminar producto "${p.name}"?`)) {
                                  deleteProduct(p.id);
                                }
                              }}
                              className="p-1.5 rounded text-gray-400 hover:text-[#D32F2F] hover:bg-red-50 transition-colors"
                              title="Eliminar producto"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Quick Stock Modal */}
      {adjustingProduct && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xs w-full p-5 shadow-2xl border border-gray-200">
            <h3 className="text-base font-bold text-gray-900 mb-1">Ajustar Stock Rápido</h3>
            <p className="text-xs text-gray-500 mb-4">{adjustingProduct.name}</p>

            <form onSubmit={handleQuickStockSave} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Nueva Cantidad en Existencia ({adjustingProduct.unit})
                </label>
                <input
                  type="number"
                  min="0"
                  required
                  value={quickStockVal}
                  onChange={(e) => setQuickStockVal(e.target.value)}
                  className="w-full h-11 px-3 bg-white border border-gray-300 rounded-lg text-lg font-bold text-gray-900 focus:ring-2 focus:ring-[#2E7D32]"
                  autoFocus
                />
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setAdjustingProduct(null)}
                  className="flex-1 h-10 border border-gray-300 rounded-lg text-xs font-semibold text-gray-700 hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 h-10 bg-[#2E7D32] hover:bg-[#1b6d24] text-white rounded-lg text-xs font-bold"
                >
                  Guardar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add / Edit Product Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full p-5 sm:p-6 shadow-2xl border border-gray-200 my-auto">
            <div className="flex items-center justify-between pb-3 border-b border-gray-200 mb-4">
              <h3 className="text-base font-bold text-gray-900">
                {editingProduct ? 'Editar Producto' : 'Nuevo Producto en Catálogo'}
              </h3>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Nombre del Producto *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Aceite de Girasol 900ml"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full h-11 px-3 bg-white border border-gray-300 rounded-lg text-sm text-gray-900 focus:ring-2 focus:ring-[#2E7D32] focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Código de Barras
                  </label>
                  <input
                    type="text"
                    placeholder="786100..."
                    value={formData.barcode}
                    onChange={(e) => setFormData({ ...formData, barcode: e.target.value })}
                    className="w-full h-11 px-3 bg-white border border-gray-300 rounded-lg text-xs font-mono text-gray-900 focus:ring-2 focus:ring-[#2E7D32]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    SKU Interno
                  </label>
                  <input
                    type="text"
                    placeholder="ABA-001"
                    value={formData.sku}
                    onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                    className="w-full h-11 px-3 bg-white border border-gray-300 rounded-lg text-xs font-mono text-gray-900 focus:ring-2 focus:ring-[#2E7D32]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Categoría
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) =>
                      setFormData({ ...formData, category: e.target.value as ProductCategory })
                    }
                    className="w-full h-11 px-3 bg-white border border-gray-300 rounded-lg text-xs text-gray-900 focus:ring-2 focus:ring-[#2E7D32]"
                  >
                    {CATEGORIES.filter((c) => c !== 'Todos').map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Unidad de Medida
                  </label>
                  <select
                    value={formData.unit}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                    className="w-full h-11 px-3 bg-white border border-gray-300 rounded-lg text-xs text-gray-900 focus:ring-2 focus:ring-[#2E7D32]"
                  >
                    <option value="ud">Unidad (ud)</option>
                    <option value="kg">Kilogramo (kg)</option>
                    <option value="lb">Libra (lb)</option>
                    <option value="pq">Paquete (pq)</option>
                    <option value="lt">Litro (lt)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Costo de Compra ({settings.currency})
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={formData.cost}
                    onChange={(e) => setFormData({ ...formData, cost: parseFloat(e.target.value) || 0 })}
                    className="w-full h-11 px-3 bg-white border border-gray-300 rounded-lg text-sm font-semibold text-gray-900 focus:ring-2 focus:ring-[#2E7D32]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Precio de Venta PVP ({settings.currency}) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    required
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                    className="w-full h-11 px-3 bg-white border border-gray-300 rounded-lg text-sm font-bold text-[#2E7D32] focus:ring-2 focus:ring-[#2E7D32]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Stock Actual
                  </label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: parseInt(e.target.value, 10) || 0 })}
                    className="w-full h-11 px-3 bg-white border border-gray-300 rounded-lg text-sm text-gray-900 focus:ring-2 focus:ring-[#2E7D32]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Alerta Stock Mínimo
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={formData.minStock}
                    onChange={(e) => setFormData({ ...formData, minStock: parseInt(e.target.value, 10) || 0 })}
                    className="w-full h-11 px-3 bg-white border border-gray-300 rounded-lg text-sm text-gray-900 focus:ring-2 focus:ring-[#2E7D32]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  URL de Imagen (Unsplash o Web)
                </label>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/..."
                  value={formData.imageUrl}
                  onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                  className="w-full h-11 px-3 bg-white border border-gray-300 rounded-lg text-xs text-gray-900 focus:ring-2 focus:ring-[#2E7D32]"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="prodTaxable"
                  checked={formData.taxable}
                  onChange={(e) => setFormData({ ...formData, taxable: e.target.checked })}
                  className="w-4 h-4 text-[#2E7D32] rounded border-gray-300 focus:ring-[#2E7D32]"
                />
                <label htmlFor="prodTaxable" className="text-xs text-gray-700 select-none">
                  Aplica IVA ({settings.taxRate}%)
                </label>
              </div>

              <div className="flex gap-2 pt-3 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="flex-1 h-11 border border-gray-300 rounded-xl text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 h-11 bg-[#2E7D32] hover:bg-[#1b6d24] text-white rounded-xl text-xs font-bold shadow-xs transition-colors flex items-center justify-center gap-1.5"
                >
                  <Save className="w-4 h-4" />
                  <span>Guardar Producto</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
