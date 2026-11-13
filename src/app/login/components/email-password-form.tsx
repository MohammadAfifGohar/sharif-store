"use client";

import { FormEvent, useEffect, useState } from "react";
import { LoaderCircleIcon } from "lucide-react";
import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  type User,
} from "firebase/auth";

import { Button } from "@/components/ui/button";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { getFirebaseAuth } from "@/lib/firebase-client";

import { getAuthErrorMessage } from "./auth-error";

type Mode = "login" | "signup" | "verify" | "reset" | "reset-sent";

const MIN_PASSWORD_LENGTH = 8;
const RESEND_COOLDOWN_SECONDS = 60;
const inputClassName = "h-12 rounded-sm focus-visible:ring-1!";
const linkClassName =
  "text-sm font-medium text-muted-foreground underline-offset-4 hover:text-foreground hover:underline disabled:opacity-50";

/** After clicking the email link, Firebase's page offers a button back here. */
function getVerificationSettings() {
  return { url: `${window.location.origin}/login` };
}

/**
 * Sends an account email through our own server (branded, with a button).
 * Returns false when the server isn't set up for it (503), so the caller can
 * fall back to Firebase's built-in email.
 */
async function sendViaServer(path: string, body: Record<string, string>) {
  const response = await fetch(path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (response.status === 503) return false;
  if (!response.ok) {
    const data = (await response.json().catch(() => ({}))) as { message?: string };
    throw new Error(data.message || "We couldn't send the email. Please try again.");
  }
  return true;
}

async function sendVerification(user: User) {
  const sent = await sendViaServer("/api/auth/email-verification", {
    idToken: await user.getIdToken(true),
  });
  if (!sent) await sendEmailVerification(user, getVerificationSettings());
}

async function sendPasswordReset(email: string) {
  const sent = await sendViaServer("/api/auth/password-reset", { email });
  if (!sent) {
    await sendPasswordResetEmail(getFirebaseAuth(), email, getVerificationSettings());
  }
}

/**
 * Email + password login. Accounts must verify their email before they can
 * log in: the account page shows past orders matched by email, so an
 * unverified address must never be trusted (the server enforces this too).
 */
export function EmailPasswordForm({
  disabled,
  onSignedIn,
}: {
  disabled: boolean;
  onSignedIn: (user: User) => Promise<void>;
}) {
  const [mode, setMode] = useState<Mode>("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [pendingUser, setPendingUser] = useState<User | null>(null);
  const [busy, setBusy] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [notice, setNotice] = useState("");
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setTimeout(() => setCooldown((seconds) => seconds - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  function switchMode(next: Mode) {
    setMode(next);
    setErrorMessage("");
    setNotice("");
    setPassword("");
  }

  async function run(action: () => Promise<void>) {
    setErrorMessage("");
    setNotice("");
    setBusy(true);
    try {
      await action();
    } catch (error) {
      setErrorMessage(getAuthErrorMessage(error));
    } finally {
      setBusy(false);
    }
  }

  async function askToVerify(user: User) {
    await sendVerification(user);
    setPendingUser(user);
    setCooldown(RESEND_COOLDOWN_SECONDS);
    setMode("verify");
  }

  function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void run(async () => {
      const { user } = await signInWithEmailAndPassword(
        getFirebaseAuth(),
        email.trim(),
        password,
      );
      if (user.emailVerified) {
        await onSignedIn(user);
        return;
      }
      await askToVerify(user);
    });
  }

  function handleSignup(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (password.length < MIN_PASSWORD_LENGTH) {
      setErrorMessage(`Use at least ${MIN_PASSWORD_LENGTH} characters for your password.`);
      return;
    }
    void run(async () => {
      const { user } = await createUserWithEmailAndPassword(
        getFirebaseAuth(),
        email.trim(),
        password,
      );
      if (name.trim()) await updateProfile(user, { displayName: name.trim() });
      await askToVerify(user);
    });
  }

  function handleVerified() {
    if (!pendingUser) return;
    void run(async () => {
      await pendingUser.reload();
      if (!pendingUser.emailVerified) {
        setErrorMessage("Your email isn't verified yet. Open the link we sent, then try again.");
        return;
      }
      // Refresh the token so it carries email_verified: true.
      await pendingUser.getIdToken(true);
      await onSignedIn(pendingUser);
    });
  }

  function handleResend() {
    if (!pendingUser || cooldown > 0) return;
    void run(async () => {
      await sendVerification(pendingUser);
      setCooldown(RESEND_COOLDOWN_SECONDS);
      setNotice("We sent a new link. Check your inbox and spam folder.");
    });
  }

  function handleUseDifferentEmail() {
    void signOut(getFirebaseAuth()).catch(() => undefined);
    setPendingUser(null);
    switchMode("login");
  }

  function handleReset(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void run(async () => {
      await sendPasswordReset(email.trim());
      setMode("reset-sent");
    });
  }

  const isDisabled = disabled || busy;
  const spinner = busy ? <LoaderCircleIcon className="animate-spin" /> : null;

  const messages = (
    <>
      {errorMessage ? (
        <p role="alert" className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {errorMessage}
        </p>
      ) : null}
      {notice ? (
        <p role="status" className="rounded-lg bg-muted/50 px-3 py-2 text-sm text-foreground">
          {notice}
        </p>
      ) : null}
    </>
  );

  const emailField = (
    <Field>
      <FieldLabel htmlFor="email">Email</FieldLabel>
      <Input
        id="email"
        name="email"
        type="email"
        autoComplete="email"
        required
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        className={inputClassName}
      />
    </Field>
  );

  if (mode === "verify") {
    return (
      <div className="flex flex-col gap-4">
        <div className="rounded-xl border border-border bg-muted/30 p-4 text-sm leading-6">
          <p className="font-semibold">Verify your email</p>
          <p className="mt-1 text-muted-foreground">
            We sent a link to <span className="font-medium text-foreground">{pendingUser?.email ?? email}</span>.
            Open it to confirm your email, then come back and continue. Check your spam folder if
            you don&apos;t see it.
          </p>
        </div>
        <Button type="button" disabled={isDisabled} onClick={handleVerified} className="h-12 text-base">
          {spinner}
          I&apos;ve verified, continue
        </Button>
        <div className="flex flex-wrap justify-between gap-2">
          <button type="button" disabled={isDisabled || cooldown > 0} onClick={handleResend} className={linkClassName}>
            {cooldown > 0 ? `Resend link in ${cooldown}s` : "Resend link"}
          </button>
          <button type="button" disabled={isDisabled} onClick={handleUseDifferentEmail} className={linkClassName}>
            Use a different email
          </button>
        </div>
        {messages}
      </div>
    );
  }

  if (mode === "reset-sent") {
    return (
      <div className="flex flex-col gap-4">
        <p className="rounded-xl border border-border bg-muted/30 p-4 text-sm leading-6 text-muted-foreground">
          If an account exists for <span className="font-medium text-foreground">{email.trim()}</span>, we&apos;ve
          sent a link to reset your password. Check your inbox and spam folder.
        </p>
        <button type="button" onClick={() => switchMode("login")} className={linkClassName}>
          Back to log in
        </button>
      </div>
    );
  }

  if (mode === "reset") {
    return (
      <form onSubmit={handleReset} className="flex flex-col gap-4">
        <p className="text-sm text-muted-foreground">
          Enter your email and we&apos;ll send you a link to set a new password.
        </p>
        {emailField}
        <Button type="submit" disabled={isDisabled} className="h-12 text-base">
          {spinner}
          Send reset link
        </Button>
        <button type="button" onClick={() => switchMode("login")} className={linkClassName}>
          Back to log in
        </button>
        {messages}
      </form>
    );
  }

  const isSignup = mode === "signup";

  return (
    <form onSubmit={isSignup ? handleSignup : handleLogin} className="flex flex-col gap-4">
      {isSignup ? (
        <Field>
          <FieldLabel htmlFor="name">Name</FieldLabel>
          <Input
            id="name"
            name="name"
            autoComplete="name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            className={inputClassName}
          />
        </Field>
      ) : null}
      {emailField}
      <Field>
        <div className="flex items-center justify-between">
          <FieldLabel htmlFor="password">Password</FieldLabel>
          {isSignup ? null : (
            <button type="button" onClick={() => switchMode("reset")} className={linkClassName}>
              Forgot password?
            </button>
          )}
        </div>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete={isSignup ? "new-password" : "current-password"}
          required
          minLength={isSignup ? MIN_PASSWORD_LENGTH : undefined}
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          className={inputClassName}
        />
      </Field>
      <Button type="submit" disabled={isDisabled} className="h-12 text-base">
        {spinner}
        {isSignup ? "Create account" : "Log in"}
      </Button>
      <p className="text-center text-sm text-muted-foreground">
        {isSignup ? "Already have an account?" : "New here?"}{" "}
        <button
          type="button"
          onClick={() => switchMode(isSignup ? "login" : "signup")}
          className="font-semibold text-foreground underline-offset-4 hover:underline"
        >
          {isSignup ? "Log in" : "Create an account"}
        </button>
      </p>
      {messages}
    </form>
  );
}
