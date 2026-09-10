import { Navigate } from "react-router-dom";
import { useUser, type IUser } from "../context/UserContext";
import { rootOrigin, workspaceIdFromHost } from "./origin";
import ExternalRedirect from "./ExternalRedirect";

const WorkspaceGate = ({ children }: { children: React.ReactNode }) => {
  const { user, initializing } = useUser();

  if (initializing) {
    return <h1>Loading...</h1>;
  }

  const hostWorkspaceId = workspaceIdFromHost();

  // The root origin never hosts a workspace; it only lets you pick one.
  if (!hostWorkspaceId) {
    return <Navigate to="/select-workspace" replace />;
  }

  const { workspaceId } = user as IUser;

  // This origin serves one workspace, and the session must be pointed at it.
  // Anything else (switched elsewhere, or the workspace session died) goes
  // back to the root to select again, which re-runs the handoff.
  if (workspaceId !== hostWorkspaceId) {
    return <ExternalRedirect href={`${rootOrigin()}/select-workspace`} />;
  }

  return children;
};

export default WorkspaceGate;
