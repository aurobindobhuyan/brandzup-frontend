import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { fetchRequest } from "../components/fetchRequets";

export enum IInviteStatusKind {
  notRequired = "NotRequired",
  pending = "Pending",
  accepted = "Accepted",
  rejected = "Rejected",
}

export interface IInvite {
  token?: string;
  status: IInviteStatusKind;

  createdAt?: string;
  updatedAt?: string;
}

export interface IEntityAccess {
  entityId: string;
  userType: string;
}

export interface IBrandAccess extends IEntityAccess {
  fullBrandAccess: Boolean;
}

export interface IGuidelineAccess extends IEntityAccess {
  brandId: string;
}

export interface IPermission {
  userId: string;
  workspaceNanoId: string;

  access: {
    fullWorkspaceAccess?: boolean;
    userType: string;
    brandAccess?: IBrandAccess[];
    guidelineAccess?: IGuidelineAccess[];
  };

  invite: IInvite;

  isDeleted: boolean;
}

export interface IUser {
  userId: string;
  workspaceId?: null | string;
  permission?: null | IPermission;
}

type User = IUser | null;

type UserContextType = {
  user: User;
  setUser: (user: User) => void;
  initializing: boolean;
  refreshSession: () => Promise<void>;
  logOut: () => Promise<void>;
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
