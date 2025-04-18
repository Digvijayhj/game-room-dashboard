
import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from 'sonner';
import { UserRole } from '@/types';

// Define user interface
interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

// Define auth context interface
interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  hasPermission: (requiredRole: UserRole | UserRole[]) => boolean;
}

// Mock users for demonstration
const MOCK_USERS = [
  {
    id: '1',
    name: 'Admin User',
    email: 'admin@example.com',
    role: 'admin' as UserRole,
    password: 'admin123',
  },
  {
    id: '2',
    name: 'Developer User',
    email: 'dev@example.com',
    role: 'developer' as UserRole,
    password: 'dev123',
  },
  {
    id: '3',
    name: 'Attendant User',
    email: 'attendant@example.com',
    role: 'attendant' as UserRole,
    password: 'attendant123',
  },
];

// Create the auth context with a default value
const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  login: async () => {},
  logout: () => {},
  hasPermission: () => false,
});

// Custom hook for using the auth context - moved inside the file scope
export const useAuth = () => useContext(AuthContext);

// Authentication provider component
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check for existing session on mount
  useEffect(() => {
    const checkAuth = () => {
      const storedUser = localStorage.getItem('gameRoomUser');
      if (storedUser) {
        try {
          // Parse and set the user from localStorage
          const userData = JSON.parse(storedUser);
          setUser(userData);
        } catch (error) {
          console.error('Failed to parse stored user data:', error);
          localStorage.removeItem('gameRoomUser');
        }
      }
      setIsLoading(false);
    };

    checkAuth();
  }, []);

  // Mock login function - in a real app this would call a backend API
  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Find user by email and password
      const foundUser = MOCK_USERS.find(
        (u) => u.email === email && u.password === password
      );

      if (!foundUser) {
        throw new Error('Invalid credentials');
      }

      // Create user object without the password
      const { password: _, ...userWithoutPassword } = foundUser;
      
      // Store user in state and localStorage
      setUser(userWithoutPassword);
      localStorage.setItem('gameRoomUser', JSON.stringify(userWithoutPassword));
      
      toast.success(`Welcome, ${userWithoutPassword.name}!`);
    } catch (error) {
      toast.error('Login failed: ' + (error instanceof Error ? error.message : 'Unknown error'));
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Logout function
  const logout = () => {
    setUser(null);
    localStorage.removeItem('gameRoomUser');
    toast.info('You have been logged out');
  };

  // Check if user has required permission(s)
  const hasPermission = (requiredRole: UserRole | UserRole[]) => {
    if (!user) return false;
    
    if (Array.isArray(requiredRole)) {
      return requiredRole.includes(user.role);
    }
    
    return user.role === requiredRole || user.role === 'admin';
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
        hasPermission,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
