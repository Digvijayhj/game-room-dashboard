
// User related types
export type UserRole = 'admin' | 'developer' | 'attendant';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt: string;
}

// Activity related types
export interface Activity {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  pricePerHalfHour: number;
  pricePerHour: number;
  available: number;
  isActive: boolean;
  createdAt: string;
}

// Transaction related types
export type PaymentMethod = 'cash' | 'card';

export interface Transaction {
  id: string;
  activityId: string;
  activityName: string;
  timeStart: string;
  timeEnd: string;
  duration: number; // in minutes
  amount: number;
  paymentMethod: PaymentMethod;
  userId: string;
  userName: string;
  createdAt: string;
  isRefund?: boolean; // New field to track refunds
}

// Report related types
export interface DailyReport {
  date: string;
  totalTransactions: number;
  totalAmount: number;
  cashAmount: number;
  cardAmount: number;
  activityBreakdown: {
    activityId: string;
    activityName: string;
    count: number;
    amount: number;
  }[];
}

export interface ShiftReport {
  userId: string;
  userName: string;
  date: string;
  startTime: string;
  endTime: string;
  totalTransactions: number;
  totalAmount: number;
  cashAmount: number;
  cardAmount: number;
}
