import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import {
  apiGoogleLogin,
  apiLogin,
  apiSignup,
  clearApiTokens,
  getApiAccessToken,
  getApiRefreshToken,
  isApiAuthEnabled,
  restoreApiSession,
  type ApiAuthUser,
} from "@/lib/api-auth";

interface Profile {
  id: string;
  user_id: string;
  email: string | null;
  full_name: string | null;
  avatar_url: string | null;
  provider: string | null;
  telegram_username: string | null;
}

export interface AuthUser {
  id: string;
  email: string | null;
}

export interface AuthSession {
  access_token: string;
  refresh_token: string | null;
}

interface AuthContextType {
  user: AuthUser | null;
  session: AuthSession | null;
  profile: Profile | null;
  loading: boolean;
  signInWithEmail: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUpWithEmail: (
    email: string,
    password: string,
    fullName: string
  ) => Promise<{ error: Error | null }>;
  signInWithGoogle: (idToken: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function toAuthUser(raw: ApiAuthUser | { id: string; email?: string | null } | null): AuthUser | null {
  if (!raw?.id) return null;
  return {
    id: raw.id,
    email: typeof raw.email === "string" ? raw.email : null,
  };
}

function buildProfileFromAuthUser(raw: ApiAuthUser | null): Profile | null {
  if (!raw?.id) return null;
  return {
    id: raw.id,
    user_id: raw.id,
    email: typeof raw.email === "string" ? raw.email : null,
    full_name: typeof raw.full_name === "string" ? raw.full_name : null,
    avatar_url: typeof raw.avatar_url === "string" ? raw.avatar_url : null,
    provider: typeof raw.provider === "string" ? raw.provider : "email",
    telegram_username: null,
  };
}

function buildSessionFromStorage(): AuthSession | null {
  const access = getApiAccessToken();
  if (!access) return null;
  return {
    access_token: access,
    refresh_token: getApiRefreshToken() || null,
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [session, setSession] = useState<AuthSession | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const apiAuthEnabled = isApiAuthEnabled();

  useEffect(() => {
    let active = true;

    if (!apiAuthEnabled) {
      clearApiTokens();
      setUser(null);
      setProfile(null);
      setSession(null);
      setLoading(false);
      return () => {
        active = false;
      };
    }

    (async () => {
      const restored = await restoreApiSession();
      if (!active) return;

      if (restored.user) {
        setUser(toAuthUser(restored.user));
        setProfile(buildProfileFromAuthUser(restored.user));
        setSession(buildSessionFromStorage());
      } else {
        clearApiTokens();
        setUser(null);
        setProfile(null);
        setSession(null);
      }
      setLoading(false);
    })();

    return () => {
      active = false;
    };
  }, [apiAuthEnabled]);

  const signInWithEmail = async (email: string, password: string) => {
    if (!apiAuthEnabled) {
      return { error: new Error("API auth is not configured") };
    }

    const apiResult = await apiLogin(email, password);
    if (apiResult.error) {
      clearApiTokens();
      return { error: apiResult.error };
    }

    setUser(toAuthUser(apiResult.user));
    setProfile(buildProfileFromAuthUser(apiResult.user));
    setSession(buildSessionFromStorage());
    return { error: null };
  };

  const signUpWithEmail = async (
    email: string,
    password: string,
    fullName: string
  ) => {
    if (!apiAuthEnabled) {
      return { error: new Error("API auth is not configured") };
    }

    const apiResult = await apiSignup(email, password, fullName);
    if (apiResult.error) {
      clearApiTokens();
      return { error: apiResult.error };
    }

    setUser(toAuthUser(apiResult.user));
    setProfile(buildProfileFromAuthUser(apiResult.user));
    setSession(buildSessionFromStorage());
    return { error: null };
  };

  const signOut = async () => {
    clearApiTokens();
    setUser(null);
    setSession(null);
    setProfile(null);
  };

  const signInWithGoogle = async (idToken: string) => {
    if (!apiAuthEnabled) {
      return { error: new Error("API auth is not configured") };
    }
    if (!idToken) {
      return { error: new Error("google_id_token_required") };
    }

    const apiResult = await apiGoogleLogin(idToken);
    if (apiResult.error) {
      clearApiTokens();
      return { error: apiResult.error };
    }

    setUser(toAuthUser(apiResult.user));
    setProfile(buildProfileFromAuthUser(apiResult.user));
    setSession(buildSessionFromStorage());
    return { error: null };
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        profile,
        loading,
        signInWithEmail,
        signUpWithEmail,
        signInWithGoogle,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
