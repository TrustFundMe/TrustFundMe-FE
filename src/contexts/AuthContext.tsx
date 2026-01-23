'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session, AuthError } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';

interface UserMetadata {
  fullName?: string;
  firstName?: string;
  lastName?: string;
  avatarUrl?: string;
  phone?: string;
  birthday?: string;
  [key: string]: unknown;
}

interface AuthUser {
  id: string;
  email: string;
  emailVerified: boolean;
  emailConfirmedAt: string | null;
  metadata: UserMetadata;
  raw: User;
}

interface AuthContextType {
  user: AuthUser | null;
  session: Session | null;
  isAuthenticated: boolean;
  isEmailVerified: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ error: AuthError | null }>;
  signUp: (email: string, password: string, firstName: string, lastName: string) => Promise<{ error: AuthError | null }>;
  logout: () => Promise<void>;
  updateUser: (updates: Partial<AuthUser>) => void;
  resendVerificationEmail: (email: string) => Promise<{ error: AuthError | null }>;
  signInWithGoogle: () => Promise<{ error: AuthError | null }>;
  exchangeTokenForBEJWT: (accessToken: string) => Promise<{ error: Error | null }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Transform Supabase User to AuthUser
  const transformUser = (supabaseUser: User | null): AuthUser | null => {
    if (!supabaseUser) return null;

    const metadata = (supabaseUser.user_metadata || {}) as UserMetadata;
    
    return {
      id: supabaseUser.id,
      email: supabaseUser.email || '',
      emailVerified: !!supabaseUser.email_confirmed_at,
      emailConfirmedAt: supabaseUser.email_confirmed_at || null,
      metadata: {
        fullName: metadata.fullName || `${metadata.firstName || ''} ${metadata.lastName || ''}`.trim() || undefined,
        firstName: metadata.firstName,
        lastName: metadata.lastName,
        avatarUrl: metadata.avatarUrl,
        phone: metadata.phone,
        birthday: metadata.birthday,
        ...metadata,
      },
      raw: supabaseUser,
    };
  };

  // Initialize auth state
  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(transformUser(session?.user ?? null));
      setLoading(false);

      // If we have a session, exchange token for BE JWT
      if (session?.access_token) {
        exchangeTokenForBEJWT(session.access_token).catch((error) => {
          console.error('Failed to exchange token for BE JWT:', error);
        });
      }
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      setSession(session);
      setUser(transformUser(session?.user ?? null));

      if (event === 'SIGNED_IN' && session?.access_token) {
        // Exchange Supabase token for BE JWT
        await exchangeTokenForBEJWT(session.access_token);
      } else if (event === 'SIGNED_OUT') {
        // Clear BE session
        try {
          await fetch('/api/auth/logout', {
            method: 'POST',
            credentials: 'include',
          });
        } catch (error) {
          console.error('Failed to logout from BE:', error);
        }
      }

      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (!error && data.session) {
      setSession(data.session);
      setUser(transformUser(data.user));
      
      // Exchange token for BE JWT
      if (data.session.access_token) {
        await exchangeTokenForBEJWT(data.session.access_token);
      }
    }

    return { error };
  };

  const signUp = async (email: string, password: string, firstName: string, lastName: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          firstName,
          lastName,
          fullName: `${firstName} ${lastName}`,
        },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (!error && data.session) {
      setSession(data.session);
      setUser(transformUser(data.user));
      
      // Exchange token for BE JWT if session exists
      if (data.session?.access_token) {
        await exchangeTokenForBEJWT(data.session.access_token);
      }
    }

    return { error };
  };

  const logout = async () => {
    // Logout from Supabase
    await supabase.auth.signOut();
    
    // Clear BE session
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });
    } catch (error) {
      console.error('Failed to logout from BE:', error);
    }

    setSession(null);
    setUser(null);
    router.push('/sign-in');
  };

  const updateUser = (updates: Partial<AuthUser>) => {
    if (user) {
      setUser({ ...user, ...updates });
    }
  };

  const resendVerificationEmail = async (email: string) => {
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email,
    });
    return { error };
  };

  const signInWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    return { error };
  };

  const exchangeTokenForBEJWT = async (accessToken: string) => {
    try {
      const response = await fetch('/api/auth/exchange-supabase-token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ accessToken }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to exchange token');
      }

      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  };

  const value: AuthContextType = {
    user,
    session,
    isAuthenticated: !!user,
    isEmailVerified: user?.emailVerified ?? false,
    loading,
    login,
    signUp,
    logout,
    updateUser,
    resendVerificationEmail,
    signInWithGoogle,
    exchangeTokenForBEJWT,
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
