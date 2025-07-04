/**
 * Authentication context and hook
 * Provides auth state management across the app
 */

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { Session, User } from "@supabase/supabase-js";
import { authService, UserProfileData } from "@/services/api/auth";

// Auth context types
interface AuthContextType {
  // Auth state
  user: User | null;
  session: Session | null;
  userProfile: UserProfileData | null;
  isLoading: boolean;
  isAuthenticated: boolean;

  // Auth actions
  signUp: (
    email: string,
    password: string,
    fullName?: string
  ) => Promise<{ error: any | null }>;
  signIn: (email: string, password: string) => Promise<{ error: any | null }>;
  signOut: () => Promise<{ error: any | null }>;
  resetPassword: (email: string) => Promise<{ error: any | null }>;
  updatePassword: (newPassword: string) => Promise<{ error: any | null }>;
  updateProfile: (updates: any) => Promise<{ error: any | null }>;
  refreshProfile: () => Promise<void>;
}

// Create context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Auth provider props
interface AuthProviderProps {
  children: ReactNode;
}

// Auth provider component
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfileData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Derived state
  const isAuthenticated = !!user && !!session;

  // Initialize auth state
  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      try {
        // Get current session
        const { session: currentSession } = await authService.getSession();

        if (mounted) {
          setSession(currentSession);
          setUser(currentSession?.user || null);

          // Load user profile if authenticated
          if (currentSession?.user) {
            await loadUserProfile(currentSession.user.id);
          }

          setIsLoading(false);
        }
      } catch (error) {
        console.error("Auth initialization error:", error);
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    initializeAuth();

    // Listen for auth changes
    const {
      data: { subscription },
    } = authService.onAuthStateChange(async (event, newSession) => {
      console.log("Auth state changed:", event, newSession?.user?.email);

      if (mounted) {
        setSession(newSession);
        setUser(newSession?.user || null);

        if (newSession?.user) {
          await loadUserProfile(newSession.user.id);
        } else {
          setUserProfile(null);
        }

        setIsLoading(false);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  // Load user profile data
  const loadUserProfile = async (userId: string) => {
    try {
      const profile = await authService.getUserProfile(userId);
      setUserProfile(profile);
    } catch (error) {
      console.error("Error loading user profile:", error);
    }
  };

  // Sign up function
  const signUp = async (email: string, password: string, fullName?: string) => {
    setIsLoading(true);
    try {
      const { user: newUser, error } = await authService.signUp({
        email,
        password,
        fullName,
      });

      if (!error && newUser) {
        // Profile will be loaded automatically via auth state change
        return { error: null };
      }

      return { error };
    } catch (error) {
      console.error("Sign up error:", error);
      return { error };
    } finally {
      setIsLoading(false);
    }
  };

  // Sign in function
  const signIn = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const { user: signedInUser, error } = await authService.signIn({
        email,
        password,
      });

      if (!error && signedInUser) {
        // Profile will be loaded automatically via auth state change
        return { error: null };
      }

      return { error };
    } catch (error) {
      console.error("Sign in error:", error);
      return { error };
    } finally {
      setIsLoading(false);
    }
  };

  // Sign out function
  const signOut = async () => {
    setIsLoading(true);
    try {
      const { error } = await authService.signOut();

      if (!error) {
        // State will be cleared automatically via auth state change
        return { error: null };
      }

      return { error };
    } catch (error) {
      console.error("Sign out error:", error);
      return { error };
    } finally {
      setIsLoading(false);
    }
  };

  // Reset password function
  const resetPassword = async (email: string) => {
    try {
      const { error } = await authService.resetPassword(email);
      return { error };
    } catch (error) {
      console.error("Reset password error:", error);
      return { error };
    }
  };

  // Update password function
  const updatePassword = async (newPassword: string) => {
    try {
      const { error } = await authService.updatePassword(newPassword);
      return { error };
    } catch (error) {
      console.error("Update password error:", error);
      return { error };
    }
  };

  // Update profile function
  const updateProfile = async (updates: any) => {
    if (!user) {
      return { error: "No user authenticated" };
    }

    try {
      const { error } = await authService.updateUserProfile(user.id, updates);

      if (!error) {
        // Refresh profile data
        await loadUserProfile(user.id);
      }

      return { error };
    } catch (error) {
      console.error("Update profile error:", error);
      return { error };
    }
  };

  // Refresh profile function
  const refreshProfile = async () => {
    if (user) {
      await loadUserProfile(user.id);
    }
  };

  // Context value
  const value: AuthContextType = {
    // State
    user,
    session,
    userProfile,
    isLoading,
    isAuthenticated,

    // Actions
    signUp,
    signIn,
    signOut,
    resetPassword,
    updatePassword,
    updateProfile,
    refreshProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook to use auth context
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
};

// Helper hooks for common auth checks
export const useRequireAuth = () => {
  const { isAuthenticated, isLoading } = useAuth();

  return {
    isAuthenticated,
    isLoading,
    requiresAuth: !isAuthenticated && !isLoading,
  };
};

export const useAuthUser = () => {
  const { user, userProfile, isLoading } = useAuth();

  return {
    user,
    userProfile,
    isLoading,
    hasProfile: !!userProfile,
  };
};

export default useAuth;
