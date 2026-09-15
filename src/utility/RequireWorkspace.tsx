import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useUser } from "../context/UserContext";

const RequireWorkspace = ({ children }: { children: ReactNode }) => {
  const { user } = useUser();

  if (!user?.workspaceId) {
    return <Navigate to="/select-workspace" replace />;
  }

  return children;
};

export default RequireWorkspace;
