import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../utils/supabase/client';

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
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    const getSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) {
          console.error('Error getting session:', error);
        } else {
          setUser(session?.user ?? null);
        }
      } catch (error) {
        console.error('Error getting session:', error);
      } finally {
        setLoading(false);
      }
    };

    getSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.email);
        setUser(session?.user ?? null);
        setLoading(false);
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
        
        // If Supabase signin fails, it might be because the user was created via our server
        // Let's try to create the user in Supabase first, then sign in
        if (error.message.includes('Invalid login credentials')) {
          console.log('Credentials not found in Supabase, attempting to create user...');
          
          // Try to sign up the user first (this will fail if user already exists, which is fine)
          try {
            const { error: signUpError } = await supabase.auth.signUp({
              email,
              password,
            });
            
            if (signUpError && !signUpError.message.includes('already registered')) {
              throw signUpError;
            }
            
            // If signup succeeded or user already exists, try signing in again
            const { data: retryData, error: retryError } = await supabase.auth.signInWithPassword({
              email,
              password,
            });
            
            if (retryError) {
              throw new Error(`Login failed: ${retryError.message}`);
            }
            
            console.log('Retry sign in successful:', retryData.user?.email);
            return;
            
          } catch (retryError) {
            console.error('Retry authentication failed:', retryError);
            throw new Error('Please check your email and password and try again.');
          }
        }
        
        // For other errors, throw a user-friendly message
        if (error.message.includes('Invalid login credentials')) {
          throw new Error('Invalid email or password. Please check your credentials and try again.');
        } else if (error.message.includes('Email not confirmed')) {
          throw new Error('Please confirm your email address before signing in.');
        } else {
          throw new Error(`Sign in failed: ${error.message}`);
        }
      }
      
      console.log('Sign in successful:', data.user?.email);
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
        },
      });
      
      if (error) {
        console.error('Supabase sign up error:', error);
        
        if (error.message.includes('already registered')) {
          // This is not an error - the user exists, they should sign in instead
          throw new Error('An account with this email already exists. Please try signing in instead.');
        } else {
          throw new Error(`Sign up failed: ${error.message}`);
        }
      }
      
      console.log('Supabase sign up result:', data);
      
      // If we have a user but no session, the user needs email confirmation
      if (data.user && !data.session) {
        console.log('User created but needs email confirmation');
        
        // Since we don't have email confirmation set up, let's try to create the user on our server
        // and then automatically sign them in
        try {
          const apiBase = `https://${window.location.hostname.includes('figma') ? 'diyfaspnfqmaybxotzrn.supabase.co' : 'localhost:54321'}`;
          const response = await fetch(`${apiBase}/functions/v1/make-server-fc39f46a/auth/signup`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password, name }),
          });
          
          if (response.ok) {
            console.log('Server user creation successful, attempting automatic sign in...');
            // Try to sign in automatically
            await signIn(email, password);
            return; // Success - user is now signed in
          } else {
            console.log('Server user creation failed, but Supabase user exists');
          }
        } catch (serverError) {
          console.log('Server signup failed:', serverError);
        }
        
        // If server creation failed, this is actually still success for Supabase
        // The user just needs to sign in manually
        console.log('Account created in Supabase successfully');
        return; // Don't throw an error here - this is success
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