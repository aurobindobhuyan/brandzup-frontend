import { useCallback, useEffect, useState } from "react";
import { fetchRequest } from "../../components/fetchRequets";
import { IInviteStatusKind } from "../../context/UserContext";
import CreateWorkspace from "./CreateWorkspace";

type Workspaces = {
  invite: {
    status: IInviteStatusKind;
    token: string;
  };
  userId: string;
  workspace: {
    name: string;
    description: string;
    nanoId: string;
    ownerId: string;
  };
};

const statusStyles: Record<IInviteStatusKind, string> = {
  [IInviteStatusKind.notRequired]:
    "shrink-0 rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600",
  [IInviteStatusKind.pending]:
    "shrink-0 rounded-full bg-amber-100 px-2 py-0.5 text-xs text-amber-700",
  [IInviteStatusKind.accepted]:
    "shrink-0 rounded-full bg-green-100 px-2 py-0.5 text-xs text-green-700",
  [IInviteStatusKind.rejected]:
    "shrink-0 rounded-full bg-red-100 px-2 py-0.5 text-xs text-red-700",
};

const SelectWorkspace = () => {
  const [workspaces, setWorkspaces] = useState<Workspaces[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectError, setSelectError] = useState("");

  const loadWorkspaces = useCallback(async () => {
    try {
      const response = await fetchRequest<Workspaces[]>({
        url: "/org/workspace/list-all",
        method: "GET",
      });

      if (response.success) {
        setWorkspaces(response.data);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadWorkspaces();
  }, [loadWorkspaces]);

  // Asks the gateway for a one-time handoff token, then moves the browser to
  // the workspace origin, which trades the token for its own session cookie.
  async function selectWorkspace({ workspaceId }: { workspaceId: string }) {
    setSelectError("");

    const response = await fetchRequest<{ token: string }>({
      url: "/select-workspace",
      method: "POST",
      body: { workspaceId },
    });

    if (!response.success) {
      setSelectError(response.message);
      return;
    }

    const token = encodeURIComponent(response.data.token);

    window.location.assign(
      `http://company.${workspaceId}.localhost:3000/auth/consume?token=${token}`,
    );
  }

  if (isLoading) {
    return <h1>Loading...</h1>;
  }

  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
      <header className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">
            Select a workspace
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            {workspaces.length === 0
              ? "You don't belong to any workspace yet."
              : `You have access to ${workspaces.length} workspace${
                  workspaces.length === 1 ? "" : "s"
                }.`}
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsCreateOpen(true)}
          className="shrink-0 rounded-lg bg-black px-4 py-2 text-sm text-white transition hover:bg-gray-800"
        >
          Create workspace
        </button>
      </header>

      {selectError && (
        <p role="alert" className="mb-6 text-sm text-red-600">
          {selectError}
        </p>
      )}

      {workspaces.length === 0 ? (
        <div className="rounded-lg border border-dashed border-gray-300 p-12 text-center">
          <p className="text-sm text-gray-500">
            Nothing here yet. Create a workspace or ask for an invite.
          </p>
          <button
            type="button"
            onClick={() => setIsCreateOpen(true)}
            className="mt-4 rounded-lg bg-black px-4 py-2 text-sm text-white transition hover:bg-gray-800"
          >
            Create workspace
          </button>
        </div>
      ) : (
        <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {workspaces.map(({ workspace, invite, userId }) => (
            <li key={workspace.nanoId}>
              <button
                type="button"
                onClick={() =>
                  selectWorkspace({ workspaceId: workspace.nanoId })
                }
                className="cursor-pointer flex h-full w-full flex-col items-start rounded-lg border border-gray-200 bg-white p-5 text-left transition hover:border-gray-400 hover:shadow-sm"
              >
                <div className="flex w-full items-start justify-between gap-3">
                  <h2 className="truncate font-medium text-gray-900">
                    {workspace.name}
                  </h2>
                  <span className={statusStyles[invite.status]}>
                    {invite.status}
                  </span>
                </div>

                <p className="mt-2 line-clamp-2 text-sm text-gray-600">
                  {workspace.description || "No description"}
                </p>

                <div className="mt-4 flex flex-wrap gap-x-3 gap-y-1 text-xs text-gray-400">
                  <span>ID: {workspace.nanoId}</span>
                  {workspace.ownerId === userId && (
                    <span className="font-medium text-gray-500">Owner</span>
                  )}
                </div>
              </button>
            </li>
          ))}
        </ul>
      )}

      <CreateWorkspace
        open={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onCreated={() => void loadWorkspaces()}
      />
    </div>
  );
};

export default SelectWorkspace;
