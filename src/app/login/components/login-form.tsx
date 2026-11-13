"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { LoaderCircleIcon } from "lucide-react";
import {
  GoogleAuthProvider,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  signInWithPopup,
  signOut,
  type ConfirmationResult,
  type User,
} from "firebase/auth";

import { Button } from "@/components/ui/button";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { normalizeIndianPhone } from "@/lib/auth";
import { getFirebaseAuth } from "@/lib/firebase-client";

import { getAuthErrorMessage } from "./auth-error";
import { EmailPasswordForm } from "./email-password-form";

type Busy = "google" | "send-otp" | "verify-otp" | null;

const inputClassName = "h-12 rounded-sm focus-visible:ring-1!";

/**
 * Mobile OTP sends a paid SMS per login, so it stays off until
 * NEXT_PUBLIC_PHONE_LOGIN_ENABLED=true; Google login is always offered.
 */
const isPhoneLoginEnabled = process.env.NEXT_PUBLIC_PHONE_LOGIN_ENABLED === "true";

export function LoginForm({ redirectTo }: { redirectTo: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState<Busy>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [confirmation, setConfirmation] = useState<ConfirmationResult | null>(null);
  const recaptchaRef = useRef<RecaptchaVerifier | null>(null);

  useEffect(() => () => recaptchaRef.current?.clear(), []);

  /** Swaps the Firebase login for our own session cookie, then leaves. */
  async function finishLogin(user: User) {
    const idToken = await user.getIdToken();
    const response = await fetch("/api/auth/session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ idToken }),
    });
    // Our cookie is the session from here on; no need to keep Firebase's.
    await signOut(getFirebaseAuth()).catch(() => undefined);

    if (!response.ok) {
      const data = (await response.json().catch(() => ({}))) as { message?: string };
      throw new Error(data.message || "We couldn't log you in. Please try again.");
    }

    router.replace(redirectTo);
    router.refresh();
  }

  async function run(kind: Exclude<Busy, null>, action: () => Promise<void>) {
    setErrorMessage("");
    setBusy(kind);
    try {
      await action();
    } catch (error) {
      setErrorMessage(getAuthErrorMessage(error));
      setBusy(null);
      return;
    }
    // On success the page navigates away; only clear for the OTP step.
    if (kind === "send-otp") setBusy(null);
  }

  function handleGoogle() {
    void run("google", async () => {
      const result = await signInWithPopup(getFirebaseAuth(), new GoogleAuthProvider());
      await finishLogin(result.user);
    });
  }

  function handleSendOtp(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const number = normalizeIndianPhone(phone);
    if (!number) {
      setErrorMessage("Enter a valid 10-digit mobile number.");
      return;
    }

    void run("send-otp", async () => {
      const auth = getFirebaseAuth();
      recaptchaRef.current ??= new RecaptchaVerifier(auth, "recaptcha-container", {
        size: "invisible",
      });
      try {
        setConfirmation(
          await signInWithPhoneNumber(auth, `+91${number}`, recaptchaRef.current),
        );
        setOtp("");
      } catch (error) {
        // A used/expired reCAPTCHA can't be reused for the next attempt.
        recaptchaRef.current.clear();
        recaptchaRef.current = null;
        throw error;
      }
    });
  }

  function handleVerifyOtp(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!confirmation) return;
    if (!/^\d{6}$/.test(otp)) {
      setErrorMessage("Enter the 6-digit OTP.");
      return;
    }

    void run("verify-otp", async () => {
      const result = await confirmation.confirm(otp);
      await finishLogin(result.user);
    });
  }

  return (
    <div className="mt-8 flex flex-col gap-6">
      {!isPhoneLoginEnabled ? null : confirmation ? (
        <form onSubmit={handleVerifyOtp} className="flex flex-col gap-4">
          <Field>
            <FieldLabel htmlFor="otp">
              Enter the OTP sent to +91 {normalizeIndianPhone(phone)}
            </FieldLabel>
            <Input
              id="otp"
              name="otp"
              inputMode="numeric"
              autoComplete="one-time-code"
              pattern="[0-9]{6}"
              maxLength={6}
              autoFocus
              value={otp}
              onChange={(event) => setOtp(event.target.value.replace(/\D/g, ""))}
              className={`${inputClassName} text-center text-lg tracking-[0.5em]`}
            />
          </Field>
          <Button type="submit" disabled={busy !== null} className="h-12 text-base">
            {busy === "verify-otp" ? <LoaderCircleIcon className="animate-spin" /> : null}
            Verify & log in
          </Button>
          <button
            type="button"
            disabled={busy !== null}
            onClick={() => {
              setConfirmation(null);
              setErrorMessage("");
            }}
            className="text-sm font-medium text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
          >
            Change number or resend OTP
          </button>
        </form>
      ) : (
        <form onSubmit={handleSendOtp} className="flex flex-col gap-4">
          <Field>
            <FieldLabel htmlFor="phone">Mobile number</FieldLabel>
            <div className="flex">
              <span className="flex h-12 items-center rounded-l-sm border border-r-0 border-input bg-muted/40 px-3 text-sm text-muted-foreground">
                +91
              </span>
              <Input
                id="phone"
                name="phone"
                type="tel"
                inputMode="tel"
                autoComplete="tel-national"
                placeholder="10-digit mobile"
                maxLength={14}
                value={phone}
                onChange={(event) => setPhone(event.target.value)}
                className={`${inputClassName} rounded-l-none`}
              />
            </div>
          </Field>
          <Button type="submit" disabled={busy !== null} className="h-12 text-base">
            {busy === "send-otp" ? <LoaderCircleIcon className="animate-spin" /> : null}
            Send OTP
          </Button>
        </form>
      )}

      {isPhoneLoginEnabled ? <div id="recaptcha-container" /> : null}

      <EmailPasswordForm disabled={busy !== null} onSignedIn={finishLogin} />

      {errorMessage ? (
        <p role="alert" className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {errorMessage}
        </p>
      ) : null}

      <div className="flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
        <span className="h-px flex-1 bg-border" />
        or
        <span className="h-px flex-1 bg-border" />
      </div>

      <Button
        type="button"
        variant="outline"
        disabled={busy !== null}
        onClick={handleGoogle}
        className="h-12 text-base"
      >
        {busy === "google" ? (
          <LoaderCircleIcon className="animate-spin" />
        ) : (
          <svg aria-hidden="true" viewBox="0 0 24 24" className="size-5">
            <path fill="#EA4335" d="M12 10.2v3.9h5.5c-.24 1.4-1.7 4.1-5.5 4.1-3.3 0-6-2.7-6-6.1s2.7-6.1 6-6.1c1.9 0 3.2.8 3.9 1.5l2.7-2.6C16.9 3.3 14.7 2.3 12 2.3 6.6 2.3 2.3 6.6 2.3 12s4.3 9.7 9.7 9.7c5.6 0 9.3-3.9 9.3-9.5 0-.6-.1-1.1-.2-1.6H12z" />
          </svg>
        )}
        Continue with Google
      </Button>
    </div>
  );
}
