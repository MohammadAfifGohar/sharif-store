"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LoaderCircleIcon, LogOutIcon } from "lucide-react";

import { Button } from "@/components/ui/button";

export function LogoutButton() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function handleLogout() {
    setBusy(true);
    await fetch("/api/auth/session", { method: "DELETE" }).catch(() => undefined);
    router.replace("/");
    router.refresh();
  }

  return (
    <Button
      type="button"
      variant="outline"
      disabled={busy}
      onClick={handleLogout}
      className="h-10 px-4"
    >
      {busy ? <LoaderCircleIcon className="animate-spin" /> : <LogOutIcon />}
      Log out
    </Button>
  );
}
