/**
 * Workspace URL scheme: `http://company.<nanoId>.localhost:3000`.
 *
 * The `company` label is a fixed namespace so a workspace nanoId can never
 * collide with a future top-level subdomain (api, admin, ...). Everything after
 * it is the root host, so this keeps working on a real domain in production
 * without touching this file.
 */
export const WORKSPACE_SUBDOMAIN_PREFIX = "company";

const splitHost = (hostname: string) => {
  const labels = hostname.split(".");

  // A workspace host is `company.<nanoId>.<root>`, so it needs at least three
  // labels; anything shorter is the plain root host.
  if (labels[0] === WORKSPACE_SUBDOMAIN_PREFIX && labels.length > 2) {
    return { nanoId: labels[1], rootHost: labels.slice(2).join(".") };
  }

  return { nanoId: null, rootHost: hostname };
};

/** The workspace the current tab is scoped to, or null on the root host. */
export const getCurrentWorkspaceNanoId = (): string | null =>
  splitHost(window.location.hostname).nanoId;

/**
 * Absolute URL for a workspace. Built off the current location so the protocol
 * and dev port carry over, and so switching workspaces from an existing
 * workspace host swaps the nanoId instead of stacking another prefix onto it.
 */
export const buildWorkspaceUrl = (nanoId: string, path = "/") => {
  const { protocol, hostname, port } = window.location;
  const { rootHost } = splitHost(hostname);

  const host = `${WORKSPACE_SUBDOMAIN_PREFIX}.${nanoId}.${rootHost}`;

  return `${protocol}//${host}${port ? `:${port}` : ""}${path}`;
};
