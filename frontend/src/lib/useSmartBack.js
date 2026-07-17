import { useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";

// History-aware "back": returns to the ACTUAL previous page when there is one,
// and only falls back to a fixed route on a cold load (deep link / hard refresh
// / new tab).
//
// Under BrowserRouter, React Router stamps the first entry of a freshly loaded
// document with key === "default"; any client-side navigation within the SPA
// produces a non-default key. So `key && key !== "default"` is an exact proxy
// for "there is an in-app entry behind us", which guarantees navigate(-1) can
// never escape the app to an external page.
export function useSmartBack(fallback = "/app") {
  const navigate = useNavigate();
  const { key } = useLocation();
  const canGoBack = key && key !== "default";
  return useCallback(() => {
    if (canGoBack) navigate(-1);
    else navigate(fallback, { replace: true });
  }, [canGoBack, fallback, navigate]);
}
