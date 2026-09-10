import { useEffect, useRef, useState } from "react";
import { fetchRequest } from "../../components/fetchRequets";
import { rootOrigin } from "../../utility/origin";

const GENERIC_FAILURE = "The link expired or was already used.";

export default function ConsumeToken() {
  const [failure, setFailure] = useState<string | null>(null);
  const fired = useRef(false);

  useEffect(() => {
    if (fired.current) return;
    fired.current = true;

    const token = new URLSearchParams(window.location.search).get("token");
    if (!token) return setFailure(GENERIC_FAILURE);

    async function makeRequest() {
      try {
        const response = await fetchRequest({
          url: "/auth/consume",
          method: "POST",
          body: { token },
        });

        // The workspace cookie is now set for this origin; a full reload of
        // "/" boots the app against it and lands on the dashboard.
        if (response.success) {
          window.location.replace("/");
          return;
        }

        // Surface the server's reason: an expired token, a wrong origin and
        // an unreachable gateway all need different fixes.
        setFailure(response.message || GENERIC_FAILURE);
      } catch (_err) {
        setFailure(GENERIC_FAILURE);
      } finally {
        // Never leave the token sitting in the address bar.
        window.history.replaceState({}, "", "/auth/consume");
      }
    }

    makeRequest();
  }, []);

  if (failure)
    return (
      <div className="mx-auto max-w-md px-6 py-16 text-center">
        <h1 className="text-xl font-semibold text-gray-900">
          Couldn&apos;t open this workspace
        </h1>
        <p className="mt-2 text-sm text-gray-500">{failure}</p>
        <a
          href={`${rootOrigin()}/select-workspace`}
          className="mt-6 inline-block rounded-lg bg-black px-4 py-2 text-sm text-white hover:bg-gray-800"
        >
          Choose a workspace
        </a>
      </div>
    );

  return <h1>Loading Workspace...</h1>;
}
