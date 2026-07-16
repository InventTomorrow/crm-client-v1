export type Channel = 'wa' | 'ig' | 'fb' | 'tk';
export type LeadStatus = 'hot' | 'warm' | 'cold' | 'prospect' | 'closed';
export type LeadIntent = 'checkout' | 'inquiry' | 'browse' | 'order' | 'catalog';

export interface Lead {
  id: string;
  name: string;
  city: string;
  channel: Channel;
  status: LeadStatus;
  lastMsg: string;
  time: string;
  unread: number;
  value: number;
  intent: LeadIntent;
  health: number;
}

export type EntityType = 'phone' | 'email' | 'location' | 'intent' | 'money';

export interface MessageEntity {
  type: EntityType;
  val?: string;
  start?: number;
  len?: number;
}

export interface Message {
  id: string;
  from: 'cust' | 'agent';
  t: string;
  text: string;
  ent: MessageEntity[];
  unread?: boolean;
}

/** A food menu variant (size/portion) with its own absolute price. */
export interface FoodVariant {
  id?: string;
  label: string;
  price: number;
  discountPercentage?: number;
  available: boolean;
  variantSku?: string;
}

export interface Product {
  id: string;
  name: string;
  sku: string;
  price: number;
  discountPercentage?: number;
  stock: number;
  inStock?: boolean;
  status: 'in' | 'low' | 'out';
  cat: string;
  size?: string;
  sizes?: string[];
  gender?: string;
  color?: string;
  cuisine?: string;
  dietaryTag?: string[];
  type?: string;
  subType?: string;
  variants?: FoodVariant[];
  desc?: string;
  imageUrls?: string[];
}

export interface Order {
  id: string;
  cust: string;
  total: number;
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered';
  date: string;
}

export interface Notification {
  id: string;
  type: 'hot' | 'order' | 'stock' | 'message' | 'system' | 'team';
  title: string;
  body: string;
  time: string;
  read: boolean;
}

export interface Workspace {
  id: string;
  name: string;
  short: string;
  plan: string;
  planLabel: string;
  members: number;
  leads: number;
  role: string;
  color: string;
}

export interface UserProfile {
  name: string;
  email: string;
  phone: string;
  business: string;
  city: string;
  timezone: string;
}

export interface NotifSettings {
  hotLeads: boolean;
  dailyDigest: boolean;
  weeklyReport: boolean;
  soundOn: boolean;
  push: boolean;
}

export const INITIAL_LEADS: Lead[] = [
  { id: 'L1',  name: 'Ali Hassan',    city: 'Lahore',     channel: 'wa', status: 'hot',      lastMsg: 'Bhai final price kya hai? Karachi delivery?',   time: '2m',  unread: 3, value: 14500, intent: 'checkout', health: 92 },
  { id: 'L2',  name: 'Zara Malik',    city: 'Karachi',    channel: 'ig', status: 'warm',     lastMsg: 'Send me the lawn suit colors please',            time: '12m', unread: 1, value: 8999,  intent: 'browse',   health: 71 },
  { id: 'L3',  name: 'Usman Tariq',   city: 'Islamabad',  channel: 'fb', status: 'hot',      lastMsg: 'COD available? I want 2 pieces',                 time: '24m', unread: 2, value: 18000, intent: 'checkout', health: 88 },
  { id: 'L4',  name: 'Hina Baig',     city: 'Faisalabad', channel: 'wa', status: 'cold',     lastMsg: 'Ok, will see and let you know',                  time: '1h',  unread: 0, value: 0,     intent: 'browse',   health: 38 },
  { id: 'L5',  name: 'Bilal Ahmed',   city: 'Lahore',     channel: 'wa', status: 'warm',     lastMsg: 'Size XL hai? Aur shipping charges?',             time: '1h',  unread: 0, value: 2500,  intent: 'inquiry',  health: 64 },
  { id: 'L6',  name: 'Ayesha Khan',   city: 'Rawalpindi', channel: 'ig', status: 'prospect', lastMsg: 'Beautiful collection 😍',                        time: '3h',  unread: 0, value: 0,     intent: 'browse',   health: 25 },
  { id: 'L7',  name: 'Faisal Iqbal',  city: 'Multan',     channel: 'fb', status: 'warm',     lastMsg: 'Peshawari chappal size 9 available?',            time: '4h',  unread: 0, value: 4500,  intent: 'inquiry',  health: 60 },
  { id: 'L8',  name: 'Nida Sheikh',   city: 'Karachi',    channel: 'wa', status: 'hot',      lastMsg: 'Done, send checkout link please',                time: '6h',  unread: 1, value: 22500, intent: 'checkout', health: 95 },
  { id: 'L9',  name: 'Hamza Raza',    city: 'Sialkot',    channel: 'ig', status: 'prospect', lastMsg: 'Just discovered your page',                      time: '1d',  unread: 0, value: 0,     intent: 'browse',   health: 18 },
  { id: 'L10', name: 'Sana Javed',    city: 'Lahore',     channel: 'wa', status: 'cold',     lastMsg: 'Hmm, thinking about it',                         time: '2d',  unread: 0, value: 0,     intent: 'browse',   health: 40 },
  { id: 'L11', name: 'Rehan Akhtar',  city: 'Quetta',     channel: 'fb', status: 'prospect', lastMsg: 'Saw your ad on facebook',                        time: '2d',  unread: 0, value: 0,     intent: 'browse',   health: 22 },
  { id: 'L12', name: 'Maira Saeed',   city: 'Peshawar',   channel: 'wa', status: 'warm',     lastMsg: 'Kal tak deliver ho jayega?',                     time: '3d',  unread: 0, value: 3200,  intent: 'inquiry',  health: 68 },
];

export const INITIAL_MESSAGES: Record<string, Message[]> = {
  L1: [
    { id: 'm1', from: 'cust',  t: '10:14', text: 'Assalam o alaikum, lawn suit 3-piece available hai?', ent: [] },
    { id: 'm2', from: 'agent', t: '10:15', text: 'Walaikum salam Ali bhai, ji bilkul. Rs. 8,999 hai unstitched.', ent: [{ type: 'money', val: 'Rs. 8,999' }] },
    { id: 'm3', from: 'cust',  t: '10:18', text: 'Karachi delivery kitne din mein aati hai? Mera number 0321-4567890 hai', ent: [{ type: 'location', val: 'Karachi' }, { type: 'phone', val: '0321-4567890' }] },
    { id: 'm4', from: 'agent', t: '10:19', text: '2–3 working days. COD bhi available hai.', ent: [] },
    { id: 'm5', from: 'cust',  t: '10:24', text: 'Ok, 2 pieces order karna hai. Pink aur teal.', ent: [{ type: 'intent', val: 'order' }] },
    { id: 'm6', from: 'agent', t: '10:25', text: 'Mashallah! Total Rs. 17,998 + shipping Rs. 250.', ent: [{ type: 'money', val: 'Rs. 17,998' }] },
    { id: 'm7', from: 'cust',  t: '10:31', text: 'Bhai final price kya hai? Karachi delivery confirm karein.', ent: [{ type: 'location', val: 'Karachi' }], unread: true },
  ],
  L2: [
    { id: 'm1', from: 'cust',  t: '09:02', text: 'Hi! Saw the new lawn collection on instagram', ent: [] },
    { id: 'm2', from: 'agent', t: '09:05', text: 'Hi Zara! Yes, just launched. Which print did you like?', ent: [] },
    { id: 'm3', from: 'cust',  t: '09:18', text: 'Send me the lawn suit colors please. zara.malik@gmail.com pe bhi mail kar dein', ent: [{ type: 'email', val: 'zara.malik@gmail.com' }, { type: 'intent', val: 'catalog' }], unread: true },
  ],
  L3: [
    { id: 'm1', from: 'cust',  t: '08:40', text: 'Karahi non-stick set ka kya rate hai?', ent: [] },
    { id: 'm2', from: 'agent', t: '08:42', text: 'Rs. 9,000 for the full 4-piece set. Lifetime warranty.', ent: [{ type: 'money', val: 'Rs. 9,000' }] },
    { id: 'm3', from: 'cust',  t: '08:50', text: 'COD available? I want 2 pieces. Deliver to F-10 Islamabad.', ent: [{ type: 'location', val: 'Islamabad' }, { type: 'intent', val: 'order' }], unread: true },
  ],
  L8: [
    { id: 'm1', from: 'cust',  t: '14:10', text: 'Embroidered kurti XL chahiye 2 pieces', ent: [{ type: 'intent', val: 'order' }] },
    { id: 'm2', from: 'agent', t: '14:11', text: 'Available! Rs. 11,250 each. Total 22,500.', ent: [{ type: 'money', val: 'Rs. 11,250' }] },
    { id: 'm3', from: 'cust',  t: '14:15', text: 'Done, send checkout link please. nida.s@outlook.com', ent: [{ type: 'email', val: 'nida.s@outlook.com' }, { type: 'intent', val: 'checkout' }], unread: true },
  ],
};

export const INITIAL_PRODUCTS: Product[] = [
  { id: 'P1', name: 'Lawn Suit 3-Piece Unstitched', sku: 'LWN-3P-001', price: 8999,  stock: 47, status: 'in',  cat: 'Apparel' },
  { id: 'P2', name: "Men's Peshawari Chappal",      sku: 'PSH-CHP-09', price: 4500,  stock: 12, status: 'low', cat: 'Footwear' },
  { id: 'P3', name: 'Karahi Non-Stick Set 4-pc',    sku: 'KAR-NS-04',  price: 8999,  stock: 28, status: 'in',  cat: 'Kitchen'  },
  { id: 'P4', name: 'Embroidered Kurti XL',          sku: 'EMB-KRT-XL', price: 11250, stock: 6,  status: 'low', cat: 'Apparel'  },
  { id: 'P5', name: 'Khaadi Dupatta — Saffron',      sku: 'DUP-SF-22',  price: 2500,  stock: 0,  status: 'out', cat: 'Apparel'  },
  { id: 'P6', name: 'Sialkot Leather Wallet',        sku: 'WAL-LTR-11', price: 3200,  stock: 88, status: 'in',  cat: 'Accessories' },
];

export const INITIAL_ORDERS: Order[] = [
  { id: '#5821', cust: 'Ali Hassan',   total: 17998, status: 'pending',   date: 'Today' },
  { id: '#5820', cust: 'Nida Sheikh',  total: 22500, status: 'confirmed', date: 'Today' },
  { id: '#5819', cust: 'Bilal Ahmed',  total: 2500,  status: 'shipped',   date: 'Yesterday' },
  { id: '#5818', cust: 'Faisal Iqbal', total: 4500,  status: 'delivered', date: '2d ago' },
  { id: '#5817', cust: 'Maira Saeed',  total: 3200,  status: 'delivered', date: '3d ago' },
];

export const INITIAL_NOTIFICATIONS: Notification[] = [
  { id: 'N1', type: 'hot',     title: 'Hot lead: Ali Hassan',      body: 'Checkout intent detected · Karachi · Rs. 17,998', time: '2m',  read: false },
  { id: 'N2', type: 'order',   title: 'New order #5821',           body: 'Ali Hassan · 2× Lawn Suit',                       time: '8m',  read: false },
  { id: 'N3', type: 'stock',   title: 'Low stock alert',           body: "Men's Peshawari Chappal · 12 left",               time: '32m', read: false },
  { id: 'N4', type: 'message', title: 'Zara Malik replied',        body: 'Send me the lawn suit colors please',             time: '1h',  read: false },
  { id: 'N5', type: 'system',  title: 'Shopify sync completed',    body: '142 products updated · 0 errors',                 time: '3h',  read: true  },
  { id: 'N6', type: 'team',    title: 'Sara Khan accepted invite', body: 'Joined as Manager',                               time: '1d',  read: true  },
];

export const INITIAL_WORKSPACES: Workspace[] = [
  { id: 'W1', name: 'AsaanRabta Boutique', short: 'SB', plan: 'Tier 3', planLabel: 'Storefront API', members: 8,  leads: 142, role: 'Owner',   color: 'linear-gradient(135deg,#4FC3F7,#7C3AED)' },
  { id: 'W2', name: 'Lahore Lawns Co.',  short: 'LL', plan: 'Tier 2', planLabel: 'URL Sync',        members: 3,  leads: 64,  role: 'Manager', color: 'linear-gradient(135deg,#22D3EE,#0EA5E9)' },
  { id: 'W3', name: 'Karachi Karahi',    short: 'KK', plan: 'Tier 1', planLabel: 'Manual Catalog',  members: 2,  leads: 28,  role: 'Agent',   color: 'linear-gradient(135deg,#F472B6,#7C3AED)' },
];

export const INITIAL_PROFILE: UserProfile = {
  name: 'Ahmed Raza',
  email: 'ahmed@saleflow.pk',
  phone: '+92 321 4567890',
  business: 'AsaanRabta Boutique',
  city: 'Lahore',
  timezone: 'PKT (UTC+5)',
};

export const INITIAL_NOTIF_SETTINGS: NotifSettings = {
  hotLeads: true,
  dailyDigest: true,
  weeklyReport: false,
  soundOn: true,
  push: true,
};

export const CATEGORIES = ['Apparel', 'Footwear', 'Kitchen', 'Accessories', 'Beauty', 'Electronics'] as const;
export type Category = typeof CATEGORIES[number];

export function sparkData(n: number, base: number, vol: number): number[] {
  return Array.from({ length: n }, (_, i) =>
    base + Math.round(Math.sin(i / 1.4) * vol) + Math.round((Math.random() - 0.5) * vol * 0.6)
  );
}
