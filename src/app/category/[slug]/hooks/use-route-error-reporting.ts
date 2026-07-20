"use client";

import { useEffect } from "react";

export function useRouteErrorReporting(scope: string, error: Error) {
  useEffect(() => {
    console.error(`${scope} route error:`, error);
  }, [error, scope]);
}
