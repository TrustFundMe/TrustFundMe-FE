'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { authService } from '@/services/authService';

interface BEUserInfo {
  id: number;
  email: string;
  fullName: string;
  phoneNumber?: string;
  avatarUrl?: string;
  role: string;
  verified?: boolean;
}

interface AuthContextType {
  user: BEUserInfo | null;
  isAuthenticated: boolean;
  isVerified: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string, firstName: string, lastName: string) => Promise<{ error: any }>;
  logout: () => Promise<void>;
  updateUser: (updates: Partial<BEUserInfo>) => void;
  resendVerificationEmail: (email: string) => Promise<{ error: any }>;
  signInWithGoogle: () => Promise<{ error: any }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<BEUserInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Initialize auth state
  useEffect(() => {
    const initAuth = async () => {
      try {
        // Load BE user from localStorage if available
        const storedUser = localStorage.getItem('be_user');
        if (storedUser) {
          try {
            const parsedUser = JSON.parse(storedUser);
            setUser(parsedUser);
          } catch (e) {
            console.warn('Failed to parse stored user:', e);
          }
        }

        // Verify session with BE
        const { session: currentSession, user: currentUser } = await authService.getSession();
        
        if (currentSession && currentUser) {
          setUser(currentUser);
          // Update localStorage
          localStorage.setItem('be_user', JSON.stringify(currentUser));
        } else {
          // Clear invalid session
          setUser(null);
          localStorage.removeItem('be_user');
        }
      } catch (error) {
        console.error('Failed to initialize auth:', error);
        setUser(null);
        localStorage.removeItem('be_user');
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (email: string, password: string) => {
    const result = await authService.login(email, password);

    if (result.success && result.user) {
      setUser(result.user);
      localStorage.setItem('be_user', JSON.stringify(result.user));
      return { error: null };
    }

    return { error: { message: result.error || 'Login failed' } };
  };

  const signUp = async (email: string, password: string, firstName: string, lastName: string) => {
    const result = await authService.signUp(email, password, firstName, lastName);

    if (result.success && result.user) {
      setUser(result.user);
      localStorage.setItem('be_user', JSON.stringify(result.user));
      return { error: null };
    }

    // Handle error - result.error could be string or undefined
    const errorMessage = typeof result.error === 'string' 
      ? result.error 
      : result.error?.message || 'Signup failed';
    
    return { error: { message: errorMessage } };
  };

  const logout = async () => {
    await authService.logout();
    setUser(null);
    localStorage.removeItem('be_user');
    router.push('/sign-in');
  };

  const updateUser = (updates: Partial<BEUserInfo>) => {
    if (user) {
      const updated = { ...user, ...updates };
      setUser(updated);
      localStorage.setItem('be_user', JSON.stringify(updated));
    }
  };

  const resendVerificationEmail = async (email: string) => {
    const result = await authService.resendVerificationEmail(email);
    return { error: result.error ? { message: result.error } : null };
  };

  const signInWithGoogle = async () => {
    try {
      // TODO: Integrate Google OAuth client library
      // For now, return error indicating it needs frontend OAuth flow
      // Once Google OAuth is set up, get idToken from Google and call authService.signInWithGoogle(idToken)
      return { error: { message: 'Google OAuth requires frontend OAuth setup. Please contact support.' } };
    } catch (error: any) {
      return { error: { message: error?.message || 'Google OAuth failed' } };
    }
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isVerified: user?.verified ?? false,
    loading,
    login,
    signUp,
    logout,
    updateUser,
    resendVerificationEmail,
    signInWithGoogle,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
