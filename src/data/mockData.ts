
import { Activity, Transaction, User, UserRole } from "@/types";

// Helper function to generate a random ID
export const generateId = () => Math.random().toString(36).substring(2, 10);

// Helper function to get a random date in the last 30 days
export const getRandomDate = (days = 30) => {
  const date = new Date();
  date.setDate(date.getDate() - Math.floor(Math.random() * days));
  return date.toISOString();
};

// Mock activities data
export const mockActivities: Activity[] = [
  {
    id: "act1",
    name: "Billiards Table 1",
    description: "Professional 8-foot billiards table",
    imageUrl: "https://images.unsplash.com/photo-1626023772800-eadff10c0f9d?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8YmlsbGlhcmRzfGVufDB8fDB8fHww",
    pricePerHalfHour: 2,
    pricePerHour: 4,
    available: 4,
    isActive: true,
    createdAt: getRandomDate(90),
  },
  {
    id: "act2",
    name: "Nintendo Switch",
    description: "Nintendo Switch console with popular games",
    imageUrl: "https://images.unsplash.com/photo-1589240303594-7b5a9a90d0b7?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8bm9udGVuZG8lMjBzd2l0Y2h8ZW58MHx8MHx8fDA%3D",
    pricePerHalfHour: 2,
    pricePerHour: 4,
    available: 2,
    isActive: true,
    createdAt: getRandomDate(60),
  },
  {
    id: "act3",
    name: "PlayStation 5",
    description: "PS5 console with latest games",
    imageUrl: "https://images.unsplash.com/photo-1607853202273-797f1c22a38e?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8cHM1fGVufDB8fDB8fHww",
    pricePerHalfHour: 2,
    pricePerHour: 4,
    available: 1,
    isActive: true,
    createdAt: getRandomDate(45),
  },
  {
    id: "act4",
    name: "PlayStation 4",
    description: "PS4 console with various games",
    imageUrl: "https://images.unsplash.com/photo-1486401899868-0e435ed85128?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8cGxheXN0YXRpb24lMjA0fGVufDB8fDB8fHww",
    pricePerHalfHour: 2,
    pricePerHour: 4,
    available: 1,
    isActive: true,
    createdAt: getRandomDate(30),
  },
  {
    id: "act5",
    name: "Xbox Series X",
    description: "Xbox Series X with Game Pass games",
    imageUrl: "https://images.unsplash.com/photo-1621259182978-fbf93132d53d?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8eGJveCUyMHNlcmllcyUyMHh8ZW58MHx8MHx8fDA%3D",
    pricePerHalfHour: 2,
    pricePerHour: 4,
    available: 1,
    isActive: true,
    createdAt: getRandomDate(20),
  },
];

// Mock users data
export const mockUsers: User[] = [
  {
    id: "user1",
    name: "Admin User",
    email: "admin@example.com",
    role: "admin" as UserRole,
    createdAt: getRandomDate(120),
  },
  {
    id: "user2",
    name: "Developer User",
    email: "dev@example.com",
    role: "developer" as UserRole,
    createdAt: getRandomDate(90),
  },
  {
    id: "user3",
    name: "Attendant Smith",
    email: "attendant1@example.com",
    role: "attendant" as UserRole,
    createdAt: getRandomDate(60),
  },
  {
    id: "user4",
    name: "Attendant Johnson",
    email: "attendant2@example.com",
    role: "attendant" as UserRole,
    createdAt: getRandomDate(30),
  },
];

// Generate random transactions for the mock data
export const generateMockTransactions = (count = 50): Transaction[] => {
  const transactions: Transaction[] = [];
  
  for (let i = 0; i < count; i++) {
    // Select random activity and user
    const activity = mockActivities[Math.floor(Math.random() * mockActivities.length)];
    const user = mockUsers.filter(u => u.role === "attendant")[
      Math.floor(Math.random() * mockUsers.filter(u => u.role === "attendant").length)
    ];
    
    // Generate random start time in the last 14 days
    const timeStart = new Date();
    timeStart.setDate(timeStart.getDate() - Math.floor(Math.random() * 14));
    timeStart.setHours(Math.floor(Math.random() * 12) + 8, Math.floor(Math.random() * 60)); // Between 8AM and 8PM
    
    // Duration: either 30 or 60 minutes
    const duration = Math.random() > 0.5 ? 60 : 30;
    
    // Calculate end time
    const timeEnd = new Date(timeStart);
    timeEnd.setMinutes(timeEnd.getMinutes() + duration);
    
    // Calculate amount based on duration
    const amount = duration === 30 ? activity.pricePerHalfHour : activity.pricePerHour;
    
    // Create transaction
    transactions.push({
      id: `tr${i + 1}`,
      activityId: activity.id,
      activityName: activity.name,
      timeStart: timeStart.toISOString(),
      timeEnd: timeEnd.toISOString(),
      duration,
      amount,
      paymentMethod: Math.random() > 0.3 ? "cash" : "card", // 70% cash, 30% card
      userId: user.id,
      userName: user.name,
      createdAt: timeStart.toISOString(),
    });
  }
  
  // Sort by timeStart, most recent first
  return transactions.sort((a, b) => 
    new Date(b.timeStart).getTime() - new Date(a.timeStart).getTime()
  );
};

// Export mock transactions
export const mockTransactions = generateMockTransactions(50);
