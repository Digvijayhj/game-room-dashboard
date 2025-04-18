
// Format date to display in the UI
export const formatDisplayDate = (
  dateString: string,
  options: Intl.DateTimeFormatOptions = { 
    year: "numeric", 
    month: "short", 
    day: "numeric" 
  }
): string => {
  return new Date(dateString).toLocaleDateString(undefined, options);
};

// Format time to display in the UI
export const formatDisplayTime = (
  dateString: string,
  options: Intl.DateTimeFormatOptions = { 
    hour: "2-digit", 
    minute: "2-digit" 
  }
): string => {
  return new Date(dateString).toLocaleTimeString(undefined, options);
};

// Format date and time together
export const formatDisplayDateTime = (
  dateString: string,
  options: Intl.DateTimeFormatOptions = { 
    year: "numeric", 
    month: "short", 
    day: "numeric",
    hour: "2-digit", 
    minute: "2-digit" 
  }
): string => {
  return new Date(dateString).toLocaleString(undefined, options);
};

// Calculate duration between two dates in minutes
export const calculateDurationInMinutes = (
  startDateString: string,
  endDateString: string
): number => {
  const start = new Date(startDateString);
  const end = new Date(endDateString);
  return Math.round((end.getTime() - start.getTime()) / (1000 * 60));
};

// Get formatted date for inputs (YYYY-MM-DD)
export const getFormattedDateForInput = (date: Date = new Date()): string => {
  return date.toISOString().split('T')[0];
};

// Get current time formatted for inputs (HH:MM)
export const getCurrentTimeForInput = (): string => {
  const now = new Date();
  return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
};

// Format currency
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
};
