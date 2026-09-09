import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useUser } from "../context/UserContext";

type RedirectState = { from?: { pathname?: string } } | null;

const PublicRoutes = ({ children }: { children: ReactNode }) => {
  const { user, initializing } = useUser();
  const location = useLocation();

  if (initializing) return <h1>Loading...</h1>;

  if (user) {
    const from = (location.state as RedirectState)?.from?.pathname ?? "/";
    return <Navigate to={from} replace />;
  }

  return children;
};

export default PublicRoutes;
