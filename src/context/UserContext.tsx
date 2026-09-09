import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { fetchRequest } from "../components/fetchRequets";

export interface IUser {
  _id: string;
  name: string;
  email: string;
  profilePic: string;
}

type User = IUser | null;

type UserContextType = {
  user: User;
  setUser: (user: User) => void;
  initializing: boolean;
  refreshSession: () => Promise<void>;
  logOut: () => void;
};

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User>(null);
  const [initializing, setInitializing] = useState(true);

  const loadSession = useCallback(async (signal?: AbortSignal) => {
    const response = await fetchRequest<IUser>({ url: "/user/me", signal });

    if (signal?.aborted) return;

    // Any failure (401 session expired, or an unreachable server) means we
    // cannot vouch for a session, so the user is treated as logged out.
    setUser(response.success ? response.data : null);
    setInitializing(false);
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    void loadSession(controller.signal);
    return () => controller.abort();
  }, [loadSession]);

  const refreshSession = useCallback(() => loadSession(), [loadSession]);

  const logOut = async () => {
    await fetchRequest({ url: "/user/logout", method: "POST" });

    setUser(null);
  };

  return (
    <UserContext.Provider
      value={{ user, setUser, initializing, refreshSession, logOut }}
    >
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
}
