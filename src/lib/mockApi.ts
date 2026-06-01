import {
  type Lead, type Message, type Product, type Order,
  INITIAL_LEADS, INITIAL_MESSAGES, INITIAL_PRODUCTS, INITIAL_ORDERS,
} from '@/lib/mockData';

// Module-level mutable state — simulates a backend
let _leads = [...INITIAL_LEADS];
let _messages: Record<string, Message[]> = JSON.parse(JSON.stringify(INITIAL_MESSAGES));
let _products = [...INITIAL_PRODUCTS];

function delay<T>(val: T, ms = 80): Promise<T> {
  return new Promise(res => setTimeout(() => res(val), ms));
}

export const leadsApi = {
  getAll: () => delay([..._leads]),
  add: (lead: Lead) => {
    _leads = [lead, ..._leads];
    return delay(lead);
  },
  updateStatus: (id: string, status: Lead['status']) => {
    _leads = _leads.map(l => l.id === id ? { ...l, status } : l);
    return delay({ id, status });
  },
  delete: (id: string) => {
    _leads = _leads.filter(l => l.id !== id);
    return delay({ id });
  },
};

export const messagesApi = {
  get: (leadId: string) => delay([...(_messages[leadId] || [])]),
  send: (leadId: string, msg: Message) => {
    _messages[leadId] = [...(_messages[leadId] || []), msg];
    return delay(msg);
  },
};

export const productsApi = {
  getAll: () => delay([..._products]),
  add: (product: Product) => {
    _products = [product, ..._products];
    return delay(product);
  },
  update: (id: string, data: Partial<Product>) => {
    _products = _products.map(p => p.id === id ? { ...p, ...data } : p);
    return delay({ id, ...data });
  },
  delete: (id: string) => {
    _products = _products.filter(p => p.id !== id);
    return delay({ id });
  },
  duplicate: (product: Product) => {
    const copy: Product = { ...product, id: 'P' + Date.now(), name: product.name + ' (copy)' };
    _products = [copy, ..._products];
    return delay(copy);
  },
};

export const ordersApi = {
  getAll: (): Promise<Order[]> => delay([...INITIAL_ORDERS]),
};
