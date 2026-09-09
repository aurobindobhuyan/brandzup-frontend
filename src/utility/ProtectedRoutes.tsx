import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useUser } from "../context/UserContext";

const ProtectedRoutes = ({ children }: { children: ReactNode }) => {
  const { user, initializing } = useUser();
  const location = useLocation();

  // The session check has not settled, so we do not know yet whether to let
  // them through. Redirecting here would lose the page they asked for.
  if (initializing) return <h1>Loading...</h1>;

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return children;
};

export default ProtectedRoutes;
