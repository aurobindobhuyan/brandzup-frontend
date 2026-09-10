/**
 * The app is served from two kinds of origin:
 *
 *   root        localhost:3000                 login, register, pick a workspace
 *   workspace   company.<nanoId>.localhost:3000  everything inside a workspace
 *
 * Cookies are scoped per host, so each origin carries its own session cookie
 * to the gateway. These helpers tell the two apart and build cross-origin
 * URLs without hard-coding hosts.
 */

const WORKSPACE_HOST_PREFIX = "company.";

/** The workspace id embedded in a workspace host, or null on the root host. */
export function workspaceIdFromHost(
  hostname: string = window.location.hostname,
): string | null {
  if (!hostname.startsWith(WORKSPACE_HOST_PREFIX)) return null;

  const rest = hostname.slice(WORKSPACE_HOST_PREFIX.length);
  const dot = rest.indexOf(".");

  return dot > 0 ? rest.slice(0, dot) : null;
}

export const isWorkspaceOrigin = () => workspaceIdFromHost() !== null;

/** The root host this page belongs to: `localhost` for `company.abc.localhost`. */
export function rootHost(hostname: string = window.location.hostname): string {
  const id = workspaceIdFromHost(hostname);

  return id
    ? hostname.slice(WORKSPACE_HOST_PREFIX.length + id.length + 1)
    : hostname;
}

const withPort = (host: string, port: string) => (port ? `${host}:${port}` : host);

export const rootOrigin = () =>
  `${window.location.protocol}//${withPort(rootHost(), window.location.port)}`;

export const workspaceOrigin = (workspaceId: string) =>
  `${window.location.protocol}//${withPort(
    `${WORKSPACE_HOST_PREFIX}${workspaceId}.${rootHost()}`,
    window.location.port,
  )}`;

/**
 * Where API requests go. When the configured API host is the root app host,
 * the API is swapped onto the hostname the page was served from, so a
 * workspace origin talks to `company.<id>.<host>:<apiPort>` and sends its own
 * cookie. An API on an unrelated host (api.example.com) is left untouched.
 */
export function apiBaseUrl(): string {
  const configured = import.meta.env.VITE_SERVER_URL as string | undefined;

  if (!configured) return "";

  const url = new URL(configured);

  if (url.hostname === rootHost()) {
    url.hostname = window.location.hostname;
  }

  return url.toString().replace(/\/$/, "");
}
