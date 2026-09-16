const WORKSPACE_PREFIX = "company";

/** Workspace id from a company.<id>.<root> host, or null on the root host. */
export const getHostWorkspaceId = () => {
  const [prefix, id, ...rest] = window.location.hostname.split(".");
  return prefix === WORKSPACE_PREFIX && id && rest.length ? id : null;
};

/** Full page navigation to a path on the root host (e.g. localhost:3000). */
export const goToRoot = (path: string) => {
  const { protocol, hostname, port } = window.location;
  const root = getHostWorkspaceId()
    ? hostname.split(".").slice(2).join(".")
    : hostname;

  window.location.replace(`${protocol}//${root}${port ? `:${port}` : ""}${path}`);
};
