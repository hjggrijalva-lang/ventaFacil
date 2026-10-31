export type ProductCategory = 
  | 'Todos'
  | 'Bebidas'
  | 'Snacks y Dulces'
  | 'Lácteos y Huevos'
  | 'Abarrotes y Granos'
  | 'Panadería'
  | 'Frutas y Verduras'
  | 'Limpieza y Hogar'
  | 'Cuidado Personal';

export type StockStatus = 'in-stock' | 'low-stock' | 'out-of-stock';

export interface Product {
  id: string;
  name: string;
  sku: string;
  barcode: string;
  category: ProductCategory;
  price: number;
  cost: number;
  stock: number;
  minStock: number;
  imageUrl: string;
  unit: string; // 'ud', 'kg', 'lb', 'pq'
  taxable: boolean;
}

export interface CartItem {
  product: Product;
  quantity: number;
  discountPercent?: number;
  customPrice?: number;
  note?: string;
}

export type PaymentMethod = 'cash' | 'card' | 'transfer' | 'credit';

export interface Customer {
  id: string;
  name: string;
  docNumber: string; // Cédula o RUC
  phone: string;
  email?: string;
  address?: string;
  totalSpent: number;
  creditBalance: number; // Saldo adeudado (fiados)
}

export interface SaleTransaction {
  id: string;
  ticketNumber: string;
  timestamp: string; // ISO string
  items: {
    productId: string;
    productName: string;
    unitPrice: number;
    quantity: number;
    total: number;
  }[];
  subtotal: number;
  tax: number;
  taxRate: number;
  discount: number;
  total: number;
  paymentMethod: PaymentMethod;
  amountReceived: number;
  change: number;
  customer: Customer;
  cashierName: string;
  status: 'completed' | 'voided';
  voidReason?: string;
}

export interface HeldCart {
  id: string;
  name: string;
  timestamp: string;
  items: CartItem[];
  customer: Customer;
}

export interface CashMovement {
  id: string;
  timestamp: string;
  type: 'in' | 'out'; // 'in' = entrada/ingreso manual, 'out' = salida/gasto
  amount: number;
  reason: string;
  cashier: string;
}

export interface CashShift {
  id: string;
  openedAt: string;
  closedAt?: string;
  initialCash: number;
  cashier: string;
  isOpen: boolean;
  notes?: string;
}

export interface StoreSettings {
  storeName: string;
  ruc: string;
  address: string;
  phone: string;
  currency: string;
  taxRate: number; // e.g. 15 for 15%
  enableTax: boolean;
  receiptFooterMessage: string;
}

export type UserRole = 'admin' | 'cashier' | 'supervisor';

export interface User {
  id: string;
  name: string;
  email: string;
  pin: string; // 4-digit PIN for rapid tactile POS unlock
  password?: string;
  role: UserRole;
  avatar?: string;
  phone?: string;
}

