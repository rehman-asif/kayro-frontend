import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { userAuthService, adminAuthService, type AuthUser } from '../services/authService';

// ─── Types ────────────────────────────────────────────────────────────────────
interface AuthContextValue {
  // Shared state
  isLoading: boolean;

  // User Auth
  user: AuthUser | null;
  isUserAuthenticated: boolean;
  userLogin: (email: string, password: string) => Promise<void>;
  userRegister: (name: string, email: string, password: string) => Promise<void>;
  userLogout: () => Promise<void>;

  // Admin Auth
  admin: AuthUser | null;
  isAdminAuthenticated: boolean;
  adminLogin: (email: string, password: string) => Promise<void>;
  adminRegister: (name: string, email: string, password: string) => Promise<void>;
  adminLogout: () => Promise<void>;
}

// ─── Context ──────────────────────────────────────────────────────────────────
const AuthContext = createContext<AuthContextValue | null>(null);

// ─── Provider ─────────────────────────────────────────────────────────────────
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [admin, setAdmin] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true); // Start true to check session on mount

  // ── On mount: restore session from cookie (validate with /me endpoints) ──────
  useEffect(() => {
    const restoreSession = async () => {
      setIsLoading(true);
      try {
        const res = await userAuthService.getMe();
        if (res.success) setUser(res.data);
      } catch {
        try {
          await userAuthService.refreshToken();
          const res = await userAuthService.getMe();
          if (res.success) setUser(res.data);
        } catch {
          // No valid user session
        }
      }
      try {
        const res = await adminAuthService.getMe();
        if (res.success) setAdmin(res.data);
      } catch {
        try {
          await adminAuthService.refreshToken();
          const res = await adminAuthService.getMe();
          if (res.success) setAdmin(res.data);
        } catch {
          // No valid admin session
        }
      }
      setIsLoading(false);
    };

    void restoreSession();
  }, []);

  // ── User Actions ──────────────────────────────────────────────────────────────
  const userLogin = useCallback(async (email: string, password: string) => {
    const res = await userAuthService.login(email, password);
    setUser(res.data);
  }, []);

  const userRegister = useCallback(async (name: string, email: string, password: string) => {
    const res = await userAuthService.register(name, email, password);
    setUser(res.data);
  }, []);

  const userLogout = useCallback(async () => {
    await userAuthService.logout();
    setUser(null);
  }, []);

  // ── Admin Actions ─────────────────────────────────────────────────────────────
  const adminLogin = useCallback(async (email: string, password: string) => {
    const res = await adminAuthService.login(email, password);
    setAdmin(res.data);
  }, []);

  const adminRegister = useCallback(async (name: string, email: string, password: string) => {
    const res = await adminAuthService.register(name, email, password);
    setAdmin(res.data);
  }, []);

  const adminLogout = useCallback(async () => {
    await adminAuthService.logout();
    setAdmin(null);
  }, []);

  // ── Context Value ──────────────────────────────────────────────────────────────
  const value = useMemo<AuthContextValue>(
    () => ({
      isLoading,
      user,
      isUserAuthenticated: !!user,
      userLogin,
      userRegister,
      userLogout,
      admin,
      isAdminAuthenticated: !!admin,
      adminLogin,
      adminRegister,
      adminLogout,
    }),
    [isLoading, user, userLogin, userRegister, userLogout, admin, adminLogin, adminRegister, adminLogout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// ─── Hooks ────────────────────────────────────────────────────────────────────
export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

export function useUser() {
  const { user, isUserAuthenticated, userLogin, userRegister, userLogout, isLoading } = useAuth();
  return { user, isUserAuthenticated, userLogin, userRegister, userLogout, isLoading };
}

export function useAdmin() {
  const { admin, isAdminAuthenticated, adminLogin, adminRegister, adminLogout, isLoading } = useAuth();
  return { admin, isAdminAuthenticated, adminLogin, adminRegister, adminLogout, isLoading };
}
