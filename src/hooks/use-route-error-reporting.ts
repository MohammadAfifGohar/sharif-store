"use client";

import { useEffect } from "react";

/**
 * Logs a route-segment error once per error instance. Central place to later
 * wire a real reporting sink (Sentry, etc.).
 */
export function useRouteErrorReporting(scope: string, error: Error) {
  useEffect(() => {
    console.error(`${scope} route error:`, error);
  }, [error, scope]);
}
