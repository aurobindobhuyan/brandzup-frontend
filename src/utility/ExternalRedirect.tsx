import { useEffect } from "react";

/**
 * Full-page redirect to another origin. React Router's <Navigate> can only
 * move within the current origin, so crossing between the root app and a
 * workspace origin has to go through the browser.
 */
const ExternalRedirect = ({ href }: { href: string }) => {
  useEffect(() => {
    window.location.replace(href);
  }, [href]);

  return <h1>Redirecting...</h1>;
};

export default ExternalRedirect;
