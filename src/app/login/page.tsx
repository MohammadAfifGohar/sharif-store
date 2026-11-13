import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { getSafeRedirectPath } from "@/lib/auth";
import { getSessionUser, isLoginConfigured } from "@/lib/auth-session";

import { LoginForm } from "./components/login-form";

export const metadata: Metadata = {
  title: "Log in",
  description: "Log in to see your orders and check out faster.",
  robots: { index: false, follow: false },
};

type PageProps = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function LoginPage({ searchParams }: PageProps) {
  const { next } = await searchParams;
  const redirectTo = getSafeRedirectPath(typeof next === "string" ? next : null);

  if (await getSessionUser()) redirect(redirectTo);

  return (
    <main className="flex-1 bg-[#fffdfb]">
      <div className="mx-auto w-full max-w-md px-4 py-12 sm:py-16">
        <p className="flex items-center gap-3 text-[11px] font-bold uppercase tracking-[0.24em] text-[#e80071] sm:text-xs">
          <span className="h-px w-9 bg-[#ff4d9b]" />
          Your account
        </p>
        <h1 className="mt-4 font-heading text-4xl font-semibold tracking-[-0.03em]">
          Log in
        </h1>
        <p className="mt-3 text-sm leading-6 text-muted-foreground">
          Track your orders and check out faster with your saved address.
        </p>

        {isLoginConfigured() ? (
          <LoginForm redirectTo={redirectTo} />
        ) : (
          <p className="mt-8 rounded-xl border border-border bg-muted/30 p-4 text-sm text-muted-foreground">
            Login is not available right now. You can still place orders as a
            guest.
          </p>
        )}
      </div>
    </main>
  );
}
