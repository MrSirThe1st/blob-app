import { authService, UserProfileData } from "@/services/api/auth";
import { Session, User } from "@supabase/supabase-js";
import React, {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";

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

  // Initialize authentication state
  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      try {
        console.log("🔐 Initializing authentication...");

        // Get current session
        const { session: currentSession, error: sessionError } =
          await authService.getSession();

        if (sessionError) {
          console.error("❌ Session error:", sessionError);
          return;
        }

        if (mounted) {
          if (currentSession?.user) {
            console.log(
              "✅ Found existing session for:",
              currentSession.user.email
            );
            setUser(currentSession.user);
            setSession(currentSession);

            // Load user profile
            await loadUserProfile(currentSession.user.id);
          } else {
            console.log("ℹ️ No existing session found");
          }
        }
      } catch (error) {
        console.error("❌ Auth initialization error:", error);
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    initializeAuth();

    // Set up auth state listener
    const {
      data: { subscription },
    } = authService.onAuthStateChange(async (event, session) => {
      console.log("🔄 Auth state changed:", event, session?.user?.email);

      if (mounted) {
        if (session?.user) {
          setUser(session.user);
          setSession(session);
          await loadUserProfile(session.user.id);
        } else {
          setUser(null);
          setSession(null);
          setUserProfile(null);
        }
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  // Load user profile helper
  const loadUserProfile = async (userId: string) => {
    try {
      console.log("👤 Loading user profile for:", userId);
      const profile = await authService.getUserProfile(userId);

      if (profile) {
        console.log(
          "✅ Profile loaded:",
          profile.email,
          "- Onboarding:",
          profile.onboardingCompleted
        );
        setUserProfile(profile);
      } else {
        console.log("⚠️ No profile found, creating default profile");
        // Create default profile if none exists
        await authService.createUserProfile(userId);
        // Retry loading
        const newProfile = await authService.getUserProfile(userId);
        setUserProfile(newProfile);
      }
    } catch (error) {
      console.error("❌ Error loading user profile:", error);
    }
  };

  // Auth actions
  const signUp = async (email: string, password: string, fullName?: string) => {
    console.log("📝 Signing up user:", email);

    try {
      const result = await authService.signUp({ email, password, fullName });

      if (result.error) {
        console.error("❌ Signup failed:", result.error.message);
        return { error: result.error };
      }

      console.log("✅ Signup successful for:", email);
      // Auth state change will be handled by the listener
      return { error: null };
    } catch (error) {
      console.error("❌ Signup exception:", error);
      return { error };
    }
  };

  const signIn = async (email: string, password: string) => {
    console.log("🔑 Signing in user:", email);

    try {
      const result = await authService.signIn({ email, password });

      if (result.error) {
        console.error("❌ Signin failed:", result.error.message);
        return { error: result.error };
      }

      console.log("✅ Signin successful for:", email);
      // Auth state change will be handled by the listener
      return { error: null };
    } catch (error) {
      console.error("❌ Signin exception:", error);
      return { error };
    }
  };

  const signOut = async () => {
    console.log("🚪 Signing out user");

    try {
      const { error } = await authService.signOut();

      if (error) {
        console.error("❌ Signout failed:", error.message);
        return { error };
      }

      console.log("✅ Signout successful");
      // Auth state change will be handled by the listener
      return { error: null };
    } catch (error) {
      console.error("❌ Signout exception:", error);
      return { error };
    }
  };

  const resetPassword = async (email: string) => {
    console.log("🔄 Resetting password for:", email);

    try {
      const { error } = await authService.resetPassword(email);

      if (error) {
        console.error("❌ Password reset failed:", error.message);
        return { error };
      }

      console.log("✅ Password reset email sent to:", email);
      return { error: null };
    } catch (error) {
      console.error("❌ Password reset exception:", error);
      return { error };
    }
  };

  const updatePassword = async (newPassword: string) => {
    console.log("🔒 Updating password");

    try {
      const { error } = await authService.updatePassword(newPassword);

      if (error) {
        console.error("❌ Password update failed:", error.message);
        return { error };
      }

      console.log("✅ Password updated successfully");
      return { error: null };
    } catch (error) {
      console.error("❌ Password update exception:", error);
      return { error };
    }
  };

  const updateProfile = async (updates: Partial<UserProfileData>) => {
    if (!user?.id) {
      const error = new Error("No user logged in");
      console.error("❌ Profile update failed:", error.message);
      return { error };
    }

    console.log("👤 Updating profile for:", user.email, updates);

    try {
      const updatedProfile = await authService.updateUserProfile(
        user.id,
        updates
      );

      if (updatedProfile) {
        console.log("✅ Profile updated successfully");
        setUserProfile(updatedProfile);
        return { error: null };
      } else {
        const error = new Error("Failed to update profile");
        console.error("❌ Profile update failed:", error.message);
        return { error };
      }
    } catch (error) {
      console.error("❌ Profile update exception:", error);
      return { error };
    }
  };

  const refreshProfile = async () => {
    if (!user?.id) {
      console.log("⚠️ Cannot refresh profile: no user logged in");
      return;
    }

    console.log("🔄 Refreshing profile for:", user.email);
    await loadUserProfile(user.id);
  };

  // Debug logging for development
  useEffect(() => {
    if (!isLoading) {
      console.log("🔍 Auth State Summary:", {
        isAuthenticated,
        userEmail: user?.email,
        hasProfile: !!userProfile,
        onboardingComplete: userProfile?.onboardingCompleted,
      });
    }
  }, [isLoading, isAuthenticated, user, userProfile]);

  const contextValue: AuthContextType = {
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

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
};

// Hook to use auth context
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
};

export default useAuth;
