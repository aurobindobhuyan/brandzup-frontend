import { useCallback, useEffect, useState } from "react";
import CreateWorkspaceModal, {
  type CreatedWorkspace,
} from "../components/CreateWorkspaceModal";
import { fetchRequest } from "../components/fetchRequets";
import { useUser } from "../context/UserContext";
import { buildWorkspaceUrl } from "../utility/workspace";

/** Mirrors IInviteStatusKind on the organization service. */
const INVITE_STATUS = {
  notRequired: "NotRequired",
  pending: "Pending",
  accepted: "Accepted",
  rejected: "Rejected",
} as const;

type WorkspaceSummary = {
  nanoId: string;
  name?: string;
  description?: string;
  logo?: string;
};

/**
 * `/org/workspace/list-all` returns the caller's permission rows, not
 * workspaces. `workspaceNanoId` is a bare string today because the Permission
 * schema declares it as a String with no `ref`, so the `.populate()` on it is a
 * no-op — we accept either shape so this page starts showing real names the
 * moment that populate is fixed on the backend.
 */
type PermissionRow = {
  _id: string;
  workspaceNanoId: string | WorkspaceSummary;
  invite?: { status?: string };
};

const toWorkspace = (row: PermissionRow): WorkspaceSummary | null => {
  const source = row.workspaceNanoId;

  if (typeof source === "string") {
    return source ? { nanoId: source } : null;
  }

  return source?.nanoId ? source : null;
};

/** A pending or rejected invite is not access yet, so it is not selectable. */
const hasAccess = (row: PermissionRow) => {
  const status = row.invite?.status;

  return (
    !status ||
    status === INVITE_STATUS.notRequired ||
    status === INVITE_STATUS.accepted
  );
};

const SelectWorkspace = () => {
  const { user, logOut } = useUser();
  const [workspaces, setWorkspaces] = useState<WorkspaceSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);

  const loadWorkspaces = useCallback(async (signal?: AbortSignal) => {
    setLoading(true);
    setError(null);

    const response = await fetchRequest<PermissionRow[]>({
      url: "/org/workspace/list-all",
      signal,
    });

    if (signal?.aborted) return;

    if (!response.success) {
      setError(response.message);
      setLoading(false);
      return;
    }

    const rows = Array.isArray(response.data) ? response.data : [];

    setWorkspaces(
      rows.filter(hasAccess).map(toWorkspace).filter(Boolean) as WorkspaceSummary[],
    );
    setLoading(false);
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    void loadWorkspaces(controller.signal);
    return () => controller.abort();
  }, [loadWorkspaces]);

  // A workspace lives on its own origin, so this is a full document load rather
  // than a client-side route change.
  const openWorkspace = (nanoId: string) => {
    window.location.assign(buildWorkspaceUrl(nanoId));
  };

  // A brand new workspace has nowhere else to go, so drop straight into it
  // rather than making them pick it out of the list they just came from.
  const handleCreated = (workspace: CreatedWorkspace) => {
    setCreating(false);

    if (workspace?.nanoId) {
      openWorkspace(workspace.nanoId);
      return;
    }

    void loadWorkspaces();
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-[#f1f1f1] font-sans">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute bottom-[-768px] left-1/2 size-[933px] -translate-x-1/2 rounded-full bg-[#ffdbdb] blur-[210px]"
      />

      <div className="relative mx-auto flex min-h-screen w-full max-w-[560px] flex-col justify-center px-6 py-16">
        <p className="text-[22px] leading-[24.5px] font-semibold tracking-[-0.437px] text-[#0a0a0a]">
          Brandverse
        </p>

        <h1 className="mt-[22px] text-[32px] leading-[38px] text-[#383838]">
          Choose a workspace
        </h1>
        <p className="mt-2 text-[16px] leading-6 text-[rgba(98,98,98,0.76)]">
          {user?.email
            ? `Signed in as ${user.email}`
            : "Pick a workspace to continue"}
        </p>

        <div className="mt-8 rounded-[16.757px] border-[1.314px] border-[rgba(255,255,255,0.27)] bg-[#fcfcfc] p-[27.6px]">
          {loading && (
            <p className="text-[15px] leading-6 text-[rgba(98,98,98,0.76)]">
              Loading your workspaces...
            </p>
          )}

          {!loading && error && (
            <div>
              <p className="text-[15px] leading-6 text-red-600">{error}</p>
              <button
                type="button"
                onClick={() => void loadWorkspaces()}
                className="mt-4 flex h-[41.4px] items-center justify-center rounded-[8.871px] bg-black px-6 text-[15.408px] leading-6 text-white"
              >
                Try again
              </button>
            </div>
          )}

          {!loading && !error && workspaces.length === 0 && (
            <p className="text-[15px] leading-6 text-[rgba(98,98,98,0.76)]">
              You don&apos;t have access to any workspace yet. Create one below,
              or ask an owner to invite you.
            </p>
          )}

          {!loading && !error && workspaces.length > 0 && (
            <ul className="flex flex-col gap-3">
              {workspaces.map((workspace) => (
                <li key={workspace.nanoId}>
                  <button
                    type="button"
                    onClick={() => openWorkspace(workspace.nanoId)}
                    className="flex w-full items-center gap-4 rounded-[8.871px] border border-[#e4e4e4] px-4 py-3 text-left hover:border-black"
                  >
                    {workspace.logo ? (
                      <img
                        src={workspace.logo}
                        alt=""
                        className="size-10 shrink-0 rounded-[8px] object-cover"
                      />
                    ) : (
                      <span className="flex size-10 shrink-0 items-center justify-center rounded-[8px] bg-[#ffdbdb] text-[16px] text-black uppercase">
                        {(workspace.name ?? workspace.nanoId).charAt(0)}
                      </span>
                    )}

                    <span className="min-w-0">
                      <span className="block truncate text-[15.408px] leading-6 text-black">
                        {workspace.name ?? workspace.nanoId}
                      </span>
                      {workspace.description && (
                        <span className="block truncate text-[13px] leading-5 text-[rgba(98,98,98,0.76)]">
                          {workspace.description}
                        </span>
                      )}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <button
          type="button"
          onClick={() => setCreating(true)}
          className="mt-6 flex h-[41.4px] w-full items-center justify-center rounded-[8.871px] bg-black text-[15.408px] leading-6 text-white"
        >
          Create workspace
        </button>

        <button
          type="button"
          onClick={logOut}
          className="mt-6 self-start text-[15.155px] leading-6 text-black hover:underline"
        >
          Sign out
        </button>
      </div>

      <CreateWorkspaceModal
        open={creating}
        onClose={() => setCreating(false)}
        onCreated={handleCreated}
      />
    </div>
  );
};

export default SelectWorkspace;
