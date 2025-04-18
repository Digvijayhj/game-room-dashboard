
import { DailyReport, ShiftReport, Transaction } from "@/types";
import { transactionsService } from "./storageService";

// Helper to format date to YYYY-MM-DD
const formatDate = (date: Date): string => {
  return date.toISOString().split('T')[0];
};

// Generate daily report
export const generateDailyReport = (date: Date): DailyReport => {
  // Get start and end of the specified day
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);
  
  // Get transactions for the day
  const transactions = transactionsService.getByDateRange(startOfDay, endOfDay);
  
  // Calculate totals
  const totalAmount = transactions.reduce((sum, transaction) => sum + transaction.amount, 0);
  const cashAmount = transactions
    .filter(transaction => transaction.paymentMethod === 'cash')
    .reduce((sum, transaction) => sum + transaction.amount, 0);
  const cardAmount = transactions
    .filter(transaction => transaction.paymentMethod === 'card')
    .reduce((sum, transaction) => sum + transaction.amount, 0);
  
  // Calculate activity breakdown
  const activityMap = new Map<string, { count: number; amount: number; name: string }>();
  
  transactions.forEach(transaction => {
    const { activityId, activityName, amount } = transaction;
    
    if (!activityMap.has(activityId)) {
      activityMap.set(activityId, { count: 0, amount: 0, name: activityName });
    }
    
    const activity = activityMap.get(activityId)!;
    activity.count += 1;
    activity.amount += amount;
  });
  
  const activityBreakdown = Array.from(activityMap.entries()).map(([activityId, data]) => ({
    activityId,
    activityName: data.name,
    count: data.count,
    amount: data.amount,
  }));
  
  return {
    date: formatDate(date),
    totalTransactions: transactions.length,
    totalAmount,
    cashAmount,
    cardAmount,
    activityBreakdown,
  };
};

// Generate shift report
export const generateShiftReport = (userId: string, date: Date, startTime: string, endTime: string): ShiftReport => {
  // Parse date and times
  const reportDate = new Date(date);
  const [startHour, startMinute] = startTime.split(':').map(Number);
  const [endHour, endMinute] = endTime.split(':').map(Number);
  
  // Create start and end datetime objects
  const shiftStart = new Date(reportDate);
  shiftStart.setHours(startHour, startMinute, 0, 0);
  
  const shiftEnd = new Date(reportDate);
  shiftEnd.setHours(endHour, endMinute, 59, 999);
  
  // Get all transactions
  const allTransactions = transactionsService.getAll();
  
  // Filter transactions for this user and shift time
  const shiftTransactions = allTransactions.filter(transaction => {
    const transactionTime = new Date(transaction.timeStart);
    return (
      transaction.userId === userId &&
      transactionTime >= shiftStart &&
      transactionTime <= shiftEnd
    );
  });
  
  // Find user name from first transaction or use "Unknown"
  const userName = shiftTransactions.length > 0
    ? shiftTransactions[0].userName
    : "Unknown";
  
  // Calculate totals
  const totalAmount = shiftTransactions.reduce((sum, transaction) => sum + transaction.amount, 0);
  const cashAmount = shiftTransactions
    .filter(transaction => transaction.paymentMethod === 'cash')
    .reduce((sum, transaction) => sum + transaction.amount, 0);
  const cardAmount = shiftTransactions
    .filter(transaction => transaction.paymentMethod === 'card')
    .reduce((sum, transaction) => sum + transaction.amount, 0);
  
  return {
    userId,
    userName,
    date: formatDate(reportDate),
    startTime,
    endTime,
    totalTransactions: shiftTransactions.length,
    totalAmount,
    cashAmount,
    cardAmount,
  };
};

// Export report to a file
export const exportReport = (data: any, fileName: string): void => {
  // Create JSON string from data
  const jsonString = JSON.stringify(data, null, 2);
  
  // Create blob and download link
  const blob = new Blob([jsonString], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  
  // Create download link and click it
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  
  // Clean up
  URL.revokeObjectURL(url);
  document.body.removeChild(link);
};
