import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../utils/supabase/client';
import { projectId } from '../utils/supabase/info';
import { mockAuth } from '../utils/mockAuth';

interface User {
  id: string;
  email?: string;
  user_metadata?: {
    name?: string;
  };
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const local = mockAuth.getCurrentUser();
      return (local as any) ?? null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    const getSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) {
          console.error('Error getting session:', error);
        } else {
          if (session?.user) {
            setUser(session.user as any);
          } else {
            const local = mockAuth.getCurrentUser();
            setUser((local as any) ?? null);
          }
        }
      } catch (error) {
        console.error('Error getting session:', error);
        const local = mockAuth.getCurrentUser();
        setUser((local as any) ?? null);
      }
      setLoading(false);
    };

    getSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.email);
        if (session?.user) {
          setUser(session.user as any);
        } else {
          const local = mockAuth.getCurrentUser();
          setUser((local as any) ?? null);
        }
        setLoading(false);
        try {
          if (session?.user) {
            localStorage.setItem('ppc_last_user', JSON.stringify(session.user));
          } else {
            localStorage.removeItem('ppc_last_user');
          }
        } catch {}
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    console.log('Attempting to sign in with:', email);
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        console.error('Supabase sign in error:', error);
        
        const isInvalid = /Invalid login credentials/i.test(error.message || '');
        const needsConfirm = /Email not confirmed/i.test(error.message || '');

        // If the account doesn't exist yet or is not confirmed, auto-create/confirm via Edge Function, then retry
        try {
          const apiBase = `https://${projectId}.supabase.co`;
          await fetch(`${apiBase}/functions/v1/make-server-fc39f46a/auth/signup`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password, name: email.split('@')[0] || 'User' }),
          });
          // Retry sign-in after auto-create/confirm
          const retry = await supabase.auth.signInWithPassword({ email, password });
          if (!retry.error) {
            return;
          }
        } catch (e) {
          // ignore and fall back
        }

        // Dev fallback: try local mock store so first browser can continue
        try {
          const res = await mockAuth.signIn(email, password);
          setUser(res.user as any);
          return;
        } catch {}

        if (isInvalid) {
          throw new Error('Invalid email or password. If you signed up earlier in a different browser, use "Forgot password" to set a real password.');
        }
        if (needsConfirm) {
          throw new Error('Please confirm your email address or use "Forgot password" to activate your account.');
        }
        throw new Error(`Sign in failed: ${error.message}`);
      }
      
      console.log('Sign in successful:', data.user?.email);
      if (data.user) {
        setUser(data.user as any);
        try {
          localStorage.setItem('ppc_last_user', JSON.stringify(data.user));
        } catch {}
      }
    } catch (error) {
      console.error('Sign in process error:', error);
      throw error;
    }
  };

  const signUp = async (email: string, password: string, name: string) => {
    console.log('Attempting to sign up with:', email, name);
    
    try {
      // First, try to sign up with Supabase
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
          },
          emailRedirectTo: typeof window !== 'undefined' ? `${window.location.origin}` : undefined,
        },
      });
      
      if (error) {
        console.error('Supabase sign up error:', error);
        
        if (error.message.includes('already registered')) {
          // This is not an error - the user exists, they should sign in instead
          throw new Error('An account with this email already exists. Please try signing in instead.');
        } else {
          // Fallback to local mock auth for development
          try {
            const res = await mockAuth.signUp(email, password, name);
            setUser(res.user as any);
            return;
          } catch (e: any) {
            throw new Error(`Sign up failed: ${error.message}`);
          }
        }
      }
      
      console.log('Supabase sign up result:', data);
      
      // If we have a user but no session, the user needs email confirmation
      if (data.user && !data.session) {
        // If email confirmation is required and not configured, fallback to admin auto-confirm in our edge function
        try {
          const apiBase = `https://${window.location.hostname.includes('figma') ? 'diyfaspnfqmaybxotzrn.supabase.co' : 'diyfaspnfqmaybxotzrn.supabase.co'}`;
          const response = await fetch(`${apiBase}/functions/v1/make-server-fc39f46a/auth/signup`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password, name }),
          });
          if (response.ok) {
            await signIn(email, password);
            return;
          }
        } catch {}
        // If still no session, ask user to sign in manually
        // As a development fallback, also persist to local mock store so user can proceed
        try {
          const res = await mockAuth.signUp(email, password, name);
          setUser(res.user as any);
        } catch {}
        return;
      }
      
      // If we have both user and session, signup was successful
      if (data.user && data.session) {
        console.log('Sign up successful with immediate session:', data.user.email);
        return; // Success
      }
      
    } catch (error: any) {
      console.error('Sign up process error:', error);
      // Re-throw the error but make sure it's properly formatted
      throw error;
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Sign out error:', error);
        throw new Error(`Sign out failed: ${error.message}`);
      }
      // Ensure local mock state is also cleared to avoid fallback re-login
      try {
        await mockAuth.signOut();
      } catch {}
      try {
        localStorage.removeItem('ppc_last_user');
      } catch {}
      setUser(null);
      console.log('Sign out successful');
    } catch (error) {
      console.error('Sign out process error:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};