import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useUser } from "../context/UserContext";
import { isWorkspaceOrigin, rootOrigin } from "./origin";
import ExternalRedirect from "./ExternalRedirect";

const ProtectedRoutes = ({ children }: { children: ReactNode }) => {
  const { user, initializing } = useUser();
  const location = useLocation();

  // The session check has not settled, so we do not know yet whether to let
  // them through. Redirecting here would lose the page they asked for.
  if (initializing) return <h1>Loading...</h1>;

  if (!user) {
    // A workspace origin has no login of its own: only the root origin holds
    // the parent session. Send them there and let it decide between login
    // and workspace selection.
    if (isWorkspaceOrigin()) {
      return <ExternalRedirect href={`${rootOrigin()}/select-workspace`} />;
    }

    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return children;
};

export default ProtectedRoutes;
