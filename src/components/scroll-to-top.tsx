"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

export function ScrollToTop() {
  const pathname = usePathname();

  useEffect(() => {
    const hash = window.location.hash;

    if (hash) {
      const target = document.getElementById(
        decodeURIComponent(hash.slice(1)),
      );

      if (target) {
        target.scrollIntoView();
        return;
      }
    }

    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [pathname]);

  return null;
}
