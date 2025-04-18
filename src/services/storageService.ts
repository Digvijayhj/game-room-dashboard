
import { Activity, Transaction, User } from "@/types";
import { mockActivities, mockTransactions, mockUsers, generateId } from "@/data/mockData";

// Storage keys
const ACTIVITIES_KEY = 'gameroom-activities';
const TRANSACTIONS_KEY = 'gameroom-transactions';
const USERS_KEY = 'gameroom-users';

// Initialize local storage with mock data if empty
const initializeStorage = () => {
  if (!localStorage.getItem(ACTIVITIES_KEY)) {
    localStorage.setItem(ACTIVITIES_KEY, JSON.stringify(mockActivities));
  }
  
  if (!localStorage.getItem(TRANSACTIONS_KEY)) {
    localStorage.setItem(TRANSACTIONS_KEY, JSON.stringify(mockTransactions));
  }
  
  if (!localStorage.getItem(USERS_KEY)) {
    localStorage.setItem(USERS_KEY, JSON.stringify(mockUsers));
  }
};

// Call initialization
initializeStorage();

// Generic fetch function
const getItems = <T>(key: string): T[] => {
  const items = localStorage.getItem(key);
  return items ? JSON.parse(items) : [];
};

// Generic save function
const saveItems = <T>(key: string, items: T[]): void => {
  localStorage.setItem(key, JSON.stringify(items));
};

// Activities CRUD
export const activitiesService = {
  getAll: (): Activity[] => getItems<Activity>(ACTIVITIES_KEY),
  
  getById: (id: string): Activity | undefined => {
    const activities = getItems<Activity>(ACTIVITIES_KEY);
    return activities.find(activity => activity.id === id);
  },
  
  create: (activity: Omit<Activity, 'id' | 'createdAt'>): Activity => {
    const activities = getItems<Activity>(ACTIVITIES_KEY);
    const newActivity: Activity = {
      ...activity,
      id: generateId(),
      createdAt: new Date().toISOString(),
    };
    
    saveItems(ACTIVITIES_KEY, [...activities, newActivity]);
    return newActivity;
  },
  
  update: (id: string, updates: Partial<Activity>): Activity => {
    const activities = getItems<Activity>(ACTIVITIES_KEY);
    const index = activities.findIndex(activity => activity.id === id);
    
    if (index === -1) {
      throw new Error(`Activity with id ${id} not found`);
    }
    
    const updatedActivity = { ...activities[index], ...updates };
    activities[index] = updatedActivity;
    
    saveItems(ACTIVITIES_KEY, activities);
    return updatedActivity;
  },
  
  delete: (id: string): void => {
    const activities = getItems<Activity>(ACTIVITIES_KEY);
    saveItems(
      ACTIVITIES_KEY,
      activities.filter(activity => activity.id !== id)
    );
  },
};

// Transactions CRUD
export const transactionsService = {
  getAll: (): Transaction[] => getItems<Transaction>(TRANSACTIONS_KEY),
  
  getById: (id: string): Transaction | undefined => {
    const transactions = getItems<Transaction>(TRANSACTIONS_KEY);
    return transactions.find(transaction => transaction.id === id);
  },
  
  create: (transaction: Omit<Transaction, 'id' | 'createdAt'>): Transaction => {
    const transactions = getItems<Transaction>(TRANSACTIONS_KEY);
    const newTransaction: Transaction = {
      ...transaction,
      id: generateId(),
      createdAt: new Date().toISOString(),
    };
    
    saveItems(TRANSACTIONS_KEY, [newTransaction, ...transactions]);
    return newTransaction;
  },
  
  update: (id: string, updates: Partial<Transaction>): Transaction => {
    const transactions = getItems<Transaction>(TRANSACTIONS_KEY);
    const index = transactions.findIndex(transaction => transaction.id === id);
    
    if (index === -1) {
      throw new Error(`Transaction with id ${id} not found`);
    }
    
    const updatedTransaction = { ...transactions[index], ...updates };
    transactions[index] = updatedTransaction;
    
    saveItems(TRANSACTIONS_KEY, transactions);
    return updatedTransaction;
  },
  
  delete: (id: string): void => {
    const transactions = getItems<Transaction>(TRANSACTIONS_KEY);
    saveItems(
      TRANSACTIONS_KEY,
      transactions.filter(transaction => transaction.id !== id)
    );
  },
  
  // Get transactions by date range
  getByDateRange: (startDate: Date, endDate: Date): Transaction[] => {
    const transactions = getItems<Transaction>(TRANSACTIONS_KEY);
    return transactions.filter(transaction => {
      const transactionDate = new Date(transaction.timeStart);
      return transactionDate >= startDate && transactionDate <= endDate;
    });
  },
  
  // Get transactions by user
  getByUser: (userId: string): Transaction[] => {
    const transactions = getItems<Transaction>(TRANSACTIONS_KEY);
    return transactions.filter(transaction => transaction.userId === userId);
  },
};

// Users CRUD
export const usersService = {
  getAll: (): User[] => getItems<User>(USERS_KEY),
  
  getById: (id: string): User | undefined => {
    const users = getItems<User>(USERS_KEY);
    return users.find(user => user.id === id);
  },
  
  create: (user: Omit<User, 'id' | 'createdAt'>): User => {
    const users = getItems<User>(USERS_KEY);
    const newUser: User = {
      ...user,
      id: generateId(),
      createdAt: new Date().toISOString(),
    };
    
    saveItems(USERS_KEY, [...users, newUser]);
    return newUser;
  },
  
  update: (id: string, updates: Partial<User>): User => {
    const users = getItems<User>(USERS_KEY);
    const index = users.findIndex(user => user.id === id);
    
    if (index === -1) {
      throw new Error(`User with id ${id} not found`);
    }
    
    const updatedUser = { ...users[index], ...updates };
    users[index] = updatedUser;
    
    saveItems(USERS_KEY, users);
    return updatedUser;
  },
  
  delete: (id: string): void => {
    const users = getItems<User>(USERS_KEY);
    saveItems(
      USERS_KEY,
      users.filter(user => user.id !== id)
    );
  },
};
