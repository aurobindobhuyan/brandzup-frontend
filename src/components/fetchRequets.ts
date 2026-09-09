const BASE_URL = import.meta.env.VITE_SERVER_URL;

export const METHOD = {
  GET: "GET",
  POST: "POST",
  PUT: "PUT",
  PATCH: "PATCH",
  DELETE: "DELETE",
} as const;

export type Method = (typeof METHOD)[keyof typeof METHOD];

type FetchRequestOptions = {
  url: string;
  method?: Method;
  body?: unknown;
  headers?: Record<string, string>;
  query?: Record<string, string | number | boolean | null | undefined>;
  signal?: AbortSignal;
};

/**
 * Both keys exist on both branches, so `result.data` is always reachable
 * (as `T | undefined`) even before checking `success`. Checking `success`
 * still narrows it to `T`.
 */
export type FetchResult<T> =
  | { success: true; data: T; message?: undefined; status: number }
  | { success: false; data?: undefined; message: string; status: number };

const buildUrl = (url: string, query?: FetchRequestOptions["query"]) => {
  const base = /^https?:\/\//.test(url)
    ? url
    : `${BASE_URL}${url.startsWith("/") ? url : `/${url}`}`;

  if (!query) return base;

  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value !== undefined && value !== null) params.set(key, String(value));
  }

  const queryString = params.toString();
  if (!queryString) return base;

  return `${base}${base.includes("?") ? "&" : "?"}${queryString}`;
};

const readMessage = (payload: unknown, status: number) => {
  if (payload && typeof payload === "object") {
    const { message, data } = payload as { message?: unknown; data?: unknown };
    if (typeof message === "string" && message) return message;
    if (typeof data === "string" && data) return data;
  }

  if (typeof payload === "string" && payload) return payload;

  return `Request failed with status ${status}`;
};

export async function fetchRequest<T = unknown>({
  url,
  method = METHOD.GET,
  body,
  headers,
  query,
  signal,
}: FetchRequestOptions): Promise<FetchResult<T>> {
  const isFormData = typeof FormData !== "undefined" && body instanceof FormData;

  const requestInit: RequestInit = {
    method,
    credentials: "include",
    headers: {
      Accept: "application/json",
      ...(body !== undefined && !isFormData
        ? { "Content-Type": "application/json" }
        : {}),
      ...headers,
    },
    signal,
  };

  if (body !== undefined) {
    requestInit.body = isFormData ? (body as FormData) : JSON.stringify(body);
  }

  let response: Response;
  try {
    response = await fetch(buildUrl(url, query), requestInit);
  } catch (error) {
    const message =
      error instanceof DOMException && error.name === "AbortError"
        ? "Request cancelled"
        : "Unable to reach the server. Check your connection and try again.";

    return { success: false, message, status: 0 };
  }

  const status = response.status;

  let payload: unknown = null;
  if (status !== 204) {
    const text = await response.text();
    if (text) {
      try {
        payload = JSON.parse(text);
      } catch {
        payload = text;
      }
    }
  }

  if (!response.ok) {
    return { success: false, message: readMessage(payload, status), status };
  }

  // A 2xx can still carry success:false from errorResponse().
  if (payload && typeof payload === "object" && "success" in payload) {
    const envelope = payload as { success: boolean; data?: unknown };
    if (!envelope.success) {
      return { success: false, message: readMessage(payload, status), status };
    }

    return { success: true, data: envelope.data as T, status };
  }

  return { success: true, data: payload as T, status };
}
