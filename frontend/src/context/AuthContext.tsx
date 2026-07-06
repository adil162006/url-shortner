import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { useQueryClient } from "@tanstack/react-query";
import { loginApi, logoutApi, meApi, registerApi } from "../api/auth";
import type { LoginPayload, RegisterPayload, User } from "../types/auth.types";
import { isAxiosError } from "axios";

interface AuthContextValue {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean; // true only during the initial "am I logged in?" check
  login: (payload: LoginPayload) => Promise<void>;
  register: (payload: RegisterPayload) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const queryClient = useQueryClient();

  // On app load / hard refresh, ask the server "who am I?" using whatever
  // cookies the browser already has. This is the only reliable way to
  // restore auth state since the tokens are httpOnly.
  useEffect(() => {
    let isMounted = true;

    const hydrate = async () => {
      try {
        const { user } = await meApi();
        if (isMounted) setUser(user);
      } catch {
        if (isMounted) setUser(null);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    hydrate();

    // Fired by the axios interceptor when a refresh attempt fails,
    // meaning the refresh token itself is invalid/expired.
    const handleForceLogout = () => {
      setUser(null);
      queryClient.clear();
    };

    window.addEventListener("auth:logout", handleForceLogout);
    return () => {
      isMounted = false;
      window.removeEventListener("auth:logout", handleForceLogout);
    };
  }, [queryClient]);

  const login = async (payload: LoginPayload) => {
    const { user } = await loginApi(payload);
    setUser(user);
  };

  const register = async (payload: RegisterPayload) => {
    const { user } = await registerApi(payload);
    setUser(user);
  };

  const logout = async () => {
    try {
      await logoutApi();
    } catch (err) {
      // Even if the network call fails, don't trap the user in a logged-in
      // looking UI — clear local state regardless.
      if (isAxiosError(err)) {
        console.error("Logout request failed:", err.message);
      }
    } finally {
      setUser(null);
      queryClient.clear();
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: Boolean(user),
        isLoading,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = (): AuthContextValue => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within an <AuthProvider>");
  }
  return ctx;
};