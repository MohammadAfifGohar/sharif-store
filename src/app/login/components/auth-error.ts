/** Maps Firebase error codes to messages a shopper can act on. */
export function getAuthErrorMessage(error: unknown) {
  const code = (error as { code?: string })?.code ?? "";
  if (code === "auth/popup-closed-by-user" || code === "auth/cancelled-popup-request") {
    return "";
  }
  if (code === "auth/invalid-verification-code") return "That OTP is incorrect. Please check and try again.";
  if (code === "auth/code-expired") return "That OTP has expired. Please request a new one.";
  if (code === "auth/too-many-requests") return "Too many attempts. Please wait a while and try again.";
  if (code === "auth/invalid-phone-number") return "Enter a valid 10-digit mobile number.";
  if (code === "auth/popup-blocked") return "Your browser blocked the Google window. Please allow pop-ups and try again.";
  if (code === "auth/network-request-failed") return "Network problem. Check your connection and try again.";
  if (
    code === "auth/invalid-credential" ||
    code === "auth/wrong-password" ||
    code === "auth/user-not-found" ||
    code === "auth/invalid-login-credentials"
  ) {
    return "Incorrect email or password.";
  }
  if (code === "auth/email-already-in-use") {
    return "An account with this email already exists. Log in instead, or continue with Google.";
  }
  if (code === "auth/invalid-email") return "Enter a valid email address.";
  if (code === "auth/weak-password") return "Choose a stronger password of at least 8 characters.";
  if (code === "auth/user-disabled") return "This account has been disabled. Please contact us.";
  return error instanceof Error && !code ? error.message : "Something went wrong. Please try again.";
}
