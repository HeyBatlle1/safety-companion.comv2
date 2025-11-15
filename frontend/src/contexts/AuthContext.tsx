import { createContext, useContext, ReactNode } from 'react';

interface User {
  id: string;
  email: string;
  name: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  // Mock authenticated user
  const mockUser: User = {
    id: 'test-user-123',
    email: 'test@example.com',
    name: 'Test User'
  };

  const mockAuth: AuthContextType = {
    user: mockUser,
    isLoading: false,
    signIn: async () => { console.log('Mock sign in'); },
    signOut: async () => { console.log('Mock sign out'); }
  };

  return (
    <AuthContext.Provider value={mockAuth}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
