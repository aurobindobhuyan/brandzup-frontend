import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useUser } from "../context/UserContext";
import { getHostWorkspaceId } from "./host";
import { RootRedirect } from "./RootHostOnly";

/**
 * Workspace pages only render on their own host (company.<id>.localhost).
 * On the root host, or on a host that is not the session's current workspace,
 * the user goes back to workspace selection on the root host.
 */
const RequireWorkspace = ({ children }: { children: ReactNode }) => {
  const { user } = useUser();
  const hostWorkspaceId = getHostWorkspaceId();

  if (!hostWorkspaceId) {
    return <Navigate to="/select-workspace" replace />;
  }

  if (user?.workspaceId !== hostWorkspaceId) {
    return <RootRedirect to="/select-workspace" />;
  }

  return children;
};

export default RequireWorkspace;
