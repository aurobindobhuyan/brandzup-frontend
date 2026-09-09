import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { getCurrentWorkspaceNanoId } from "./workspace";

/**
 * The dashboard is the home page of a workspace host. Reaching it on the root
 * host means no workspace is selected, so send them to the picker.
 */
const RequireWorkspace = ({ children }: { children: ReactNode }) => {
  if (!getCurrentWorkspaceNanoId()) {
    return <Navigate to="/select-workspace" replace />;
  }

  return children;
};

export default RequireWorkspace;
