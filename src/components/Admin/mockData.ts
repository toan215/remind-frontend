// ===== Mock Data for Admin Dashboard =====

export interface StatCard {
  id: string;
  title: string;
  value: string;
  change: number; // percentage change, positive = growth
  icon: string;
  color: 'primary' | 'success' | 'warning' | 'danger';
}

export interface RevenueDataPoint {
  month: string;
  revenue: number;
  orders: number;
}

export interface Order {
  id: string;
  customer: string;
  email: string;
  product: string;
  amount: number;
  status: 'completed' | 'processing' | 'pending' | 'cancelled';
  date: string;
  avatar: string;
}

export const statsCards: StatCard[] = [
  {
    id: 'revenue',
    title: 'Total Revenue',
    value: '$45,231.89',
    change: 20.1,
    icon: '💰',
    color: 'primary',
  },
  {
    id: 'orders',
    title: 'Total Orders',
    value: '2,350',
    change: 15.3,
    icon: '📦',
    color: 'success',
  },
  {
    id: 'users',
    title: 'Active Users',
    value: '12,234',
    change: 8.2,
    icon: '👥',
    color: 'warning',
  },
  {
    id: 'growth',
    title: 'Growth Rate',
    value: '23.5%',
    change: -2.4,
    icon: '📈',
    color: 'danger',
  },
];

export const revenueData: RevenueDataPoint[] = [
  { month: 'Jan', revenue: 4000, orders: 240 },
  { month: 'Feb', revenue: 3200, orders: 198 },
  { month: 'Mar', revenue: 5800, orders: 340 },
  { month: 'Apr', revenue: 4900, orders: 290 },
  { month: 'May', revenue: 6200, orders: 380 },
  { month: 'Jun', revenue: 7100, orders: 420 },
  { month: 'Jul', revenue: 5900, orders: 350 },
  { month: 'Aug', revenue: 8200, orders: 490 },
  { month: 'Sep', revenue: 7400, orders: 440 },
  { month: 'Oct', revenue: 9100, orders: 530 },
  { month: 'Nov', revenue: 8500, orders: 500 },
  { month: 'Dec', revenue: 10200, orders: 610 },
];

const firstNames = [
  'Nguyễn Văn', 'Trần Thị', 'Lê Hoàng', 'Phạm Minh', 'Hoàng Thu',
  'Vũ Đức', 'Đặng Thùy', 'Bùi Quang', 'Đỗ Thanh', 'Ngô Mai',
  'Lý Hải', 'Phan Anh', 'Dương Bảo', 'Huỳnh Kim', 'Võ Ngọc',
];

const lastNames = [
  'An', 'Bình', 'Chi', 'Dũng', 'Hà',
  'Khoa', 'Linh', 'Minh', 'Nam', 'Phúc',
  'Quỳnh', 'Sơn', 'Tùng', 'Uyên', 'Vinh',
];

const products = [
  'Premium Plan', 'Basic Plan', 'Enterprise License', 'Starter Pack',
  'Pro Subscription', 'Team Plan', 'Annual License', 'Custom Package',
  'Consultation Pack', 'Growth Bundle',
];

const statuses: Order['status'][] = ['completed', 'processing', 'pending', 'cancelled'];

function generateOrders(count: number): Order[] {
  const orders: Order[] = [];

  for (let i = 0; i < count; i++) {
    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
    const name = `${firstName} ${lastName}`;
    const emailBase = name.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'D').replace(/\s+/g, '.').toLowerCase();

    const day = Math.floor(Math.random() * 28) + 1;
    const month = Math.floor(Math.random() * 12);
    const date = new Date(2026, month, day);

    orders.push({
      id: `ORD-${String(1000 + i).padStart(4, '0')}`,
      customer: name,
      email: `${emailBase}@email.com`,
      product: products[Math.floor(Math.random() * products.length)],
      amount: Math.floor(Math.random() * 500) + 29,
      status: statuses[Math.floor(Math.random() * statuses.length)],
      date: date.toISOString().split('T')[0],
      avatar: name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase(),
    });
  }

  return orders.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export const allOrders: Order[] = generateOrders(47);

// Sidebar navigation items
export interface SidebarItem {
  id: string;
  label: string;
  icon: string;
  path: string;
  badge?: number;
}

export const sidebarItems: SidebarItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: 'grid', path: '/admin/dashboard' },
  { id: 'users', label: 'Users', icon: 'users', path: '/admin/users', badge: 12 },
  { id: 'orders', label: 'Orders', icon: 'shopping-bag', path: '/admin/orders', badge: 5 },
  { id: 'products', label: 'Products', icon: 'box', path: '/admin/products' },
  { id: 'reports', label: 'Reports', icon: 'bar-chart-2', path: '/admin/reports' },
  { id: 'settings', label: 'Settings', icon: 'settings', path: '/admin/settings' },
];
