import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { fetchRequest } from "../../components/fetchRequets";
import { useUser } from "../../context/UserContext";
import { rootOrigin } from "../../utility/origin";

export interface IWorkspaceDetails {
  name: string;
  nanoId: string;
  description: string;
  ownerId: string;
  logo?: string;
}

const WorkspaceContext = createContext<IWorkspaceDetails | undefined>(
  undefined,
);

export function useWorkspace() {
  const context = useContext(WorkspaceContext);
  if (!context) {
    throw new Error("useWorkspace must be used within a WorkspaceContainer");
  }
  return context;
}

type Status =
  | { kind: "loading" }
  | { kind: "error"; message: string }
  | { kind: "ready"; workspace: IWorkspaceDetails };

/**
 * Loads the workspace the session currently points at and exposes it through
 * useWorkspace(). Rendered under WorkspaceGate, so the session is known to
 * carry a workspace that matches this origin by the time it mounts.
 */
const WorkspaceContainer = ({ children }: { children: ReactNode }) => {
  const { user } = useUser();
  const [status, setStatus] = useState<Status>({ kind: "loading" });

  const workspaceId = user?.workspaceId;

  useEffect(() => {
    const controller = new AbortController();

    async function load() {
      const response = await fetchRequest<IWorkspaceDetails>({
        url: "/org/workspace/current",
        signal: controller.signal,
      });

      if (controller.signal.aborted) return;

      setStatus(
        response.success
          ? { kind: "ready", workspace: response.data }
          : { kind: "error", message: response.message },
      );
    }

    setStatus({ kind: "loading" });
    void load();

    return () => controller.abort();
  }, [workspaceId]);

  if (status.kind === "loading") {
    return <h1>Loading workspace...</h1>;
  }

  if (status.kind === "error") {
    return (
      <div className="mx-auto max-w-md px-6 py-16 text-center">
        <h1 className="text-xl font-semibold text-gray-900">
          Couldn&apos;t load this workspace
        </h1>
        <p className="mt-2 text-sm text-gray-500">{status.message}</p>
        <a
          href={`${rootOrigin()}/select-workspace`}
          className="mt-6 inline-block rounded-lg bg-black px-4 py-2 text-sm text-white hover:bg-gray-800"
        >
          Choose a workspace
        </a>
      </div>
    );
  }

  return (
    <WorkspaceContext.Provider value={status.workspace}>
      {children}
    </WorkspaceContext.Provider>
  );
};

export default WorkspaceContainer;
