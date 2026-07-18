import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { flushSync } from 'react-dom';
import { userAuthService, adminAuthService, type AuthUser } from '../services/authService';

const ADMIN_SESSION_KEY = 'tpc_admin_session';

function readCachedAdmin(): AuthUser | null {
  try {
    const raw = sessionStorage.getItem(ADMIN_SESSION_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as AuthUser;
  } catch {
    return null;
  }
}

function writeCachedAdmin(admin: AuthUser | null): void {
  try {
    if (admin) sessionStorage.setItem(ADMIN_SESSION_KEY, JSON.stringify(admin));
    else sessionStorage.removeItem(ADMIN_SESSION_KEY);
  } catch {
    // Ignore quota / private-mode errors
  }
}

interface AuthContextValue {
  isLoading: boolean;
  user: AuthUser | null;
  isUserAuthenticated: boolean;
  userLogin: (email: string, password: string) => Promise<void>;
  userRegister: (name: string, email: string, password: string) => Promise<void>;
  userLogout: () => Promise<void>;
  admin: AuthUser | null;
  isAdminAuthenticated: boolean;
  adminLogin: (email: string, password: string) => Promise<void>;
  adminRegister: (name: string, email: string, password: string) => Promise<void>;
  adminLogout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [admin, setAdmin] = useState<AuthUser | null>(() => readCachedAdmin());
  const [isLoading, setIsLoading] = useState(true);

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
        if (res.success) {
          writeCachedAdmin(res.data);
          setAdmin(res.data);
        }
      } catch {
        try {
          await adminAuthService.refreshToken();
          const res = await adminAuthService.getMe();
          if (res.success) {
            writeCachedAdmin(res.data);
            setAdmin(res.data);
          }
        } catch {
          // Cookie restore failed — keep a same-tab session cache from a fresh login
          const cached = readCachedAdmin();
          setAdmin(cached);
        }
      }

      setIsLoading(false);
    };

    void restoreSession();
  }, []);

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

  const adminLogin = useCallback(async (email: string, password: string) => {
    const res = await adminAuthService.login(email, password);
    writeCachedAdmin(res.data);
    flushSync(() => {
      setAdmin(res.data);
    });
  }, []);

  const adminRegister = useCallback(async (name: string, email: string, password: string) => {
    const res = await adminAuthService.register(name, email, password);
    writeCachedAdmin(res.data);
    flushSync(() => {
      setAdmin(res.data);
    });
  }, []);

  const adminLogout = useCallback(async () => {
    try {
      await adminAuthService.logout();
    } finally {
      writeCachedAdmin(null);
      flushSync(() => {
        setAdmin(null);
      });
    }
  }, []);

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
