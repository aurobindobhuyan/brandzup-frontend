import { useEffect, type ReactNode } from "react";
import { useLocation } from "react-router-dom";
import { getHostWorkspaceId, goToRoot } from "./host";

/** Sends the browser to the same path on the root host. */
export const RootRedirect = ({ to }: { to: string }) => {
  useEffect(() => goToRoot(to), [to]);
  return <h1>Redirecting...</h1>;
};

/**
 * Login, register and workspace selection only live on the root host. Opening
 * them on a workspace host moves the browser to the root host instead.
 */
const RootHostOnly = ({ children }: { children: ReactNode }) => {
  const location = useLocation();

  if (getHostWorkspaceId()) {
    return <RootRedirect to={location.pathname} />;
  }

  return children;
};

export default RootHostOnly;
