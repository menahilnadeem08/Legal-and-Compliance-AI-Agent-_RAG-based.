export type UserFacingErrorContext = {
  /** Optional HTTP status code if known */
  status?: number;
  /** Optional endpoint, for debugging only */
  endpoint?: string;
  /** Optional error code returned by API / auth layer */
  code?: string;
};

function looksLikeInternalMessage(msg: string): boolean {
  const s = msg.toLowerCase();
  return (
    s.includes("syntaxerror") ||
    s.includes("typeerror") ||
    s.includes("referenceerror") ||
    s.includes("fetch") ||
    s.includes("ecconn") ||
    s.includes("econn") ||
    s.includes("stack") ||
    s.includes("jwt") ||
    s.includes("nextauth") ||
    s.includes("oauth") ||
    s.includes("prisma") ||
    s.includes("postgres") ||
    s.includes("sql") ||
    s.includes("undefined") ||
    s.includes("null") ||
    s.includes("unexpected token") ||
    s.includes("cannot read") ||
    s.includes("failed to") ||
    s.includes("not a function") ||
    s.includes("internal server error")
  );
}

export function friendlyAuthError(raw: string): string {
  const code = (raw || "").trim();
  if (!code) return "";
  const map: Record<string, string> = {
    OAuthSignin: "Google sign-in couldn’t start. Please try again.",
    OAuthCallback: "Google sign-in was cancelled or failed. Please try again.",
    OAuthCreateAccount: "We couldn’t create your account with Google. Please try again.",
    OAuthAccountNotLinked:
      "This email is already registered with a different sign-in method. Use the original login method.",
    AccessDenied: "Access denied. Please contact your administrator if you think this is a mistake.",
    Configuration: "Sign-in is temporarily unavailable. Please try again later.",
    Verification: "This sign-in link is invalid or has expired. Please try again.",
    Default: "Sign-in failed. Please try again.",
  };
  if (map[code]) return map[code];
  if (code.toLowerCase().includes("callback")) return map.OAuthCallback;
  if (code.toLowerCase().includes("oauth")) return map.Default;
  return map.Default;
}

/**
 * Convert any raw error/message into a user-friendly string.
 * Never returns the raw input verbatim unless it looks clearly user-facing.
 */
export function toUserFriendlyErrorMessage(
  raw: unknown,
  ctx: UserFacingErrorContext = {}
): string {
  const rawStr =
    typeof raw === "string"
      ? raw
      : raw && typeof raw === "object" && "message" in raw && typeof (raw as { message?: unknown }).message === "string"
        ? (raw as { message: string }).message
        : "";

  const msg = rawStr.trim();

  // Status-based defaults
  if (ctx.status === 401) return "Your session has expired. Please sign in again.";
  if (ctx.status === 403) return "You don’t have permission to do that.";
  if (ctx.status === 404) return "We couldn’t find what you were looking for.";
  if (ctx.status === 413) return "That file is too large. Please upload a smaller file.";
  if (ctx.status === 429) return "Too many attempts. Please try again later.";
  if (ctx.status && ctx.status >= 500) return "Something went wrong on our side. Please try again.";

  // Known auth-style codes passed around as strings
  if (ctx.endpoint?.includes("/auth") && msg) {
    const authMapped = friendlyAuthError(msg);
    if (authMapped) return authMapped;
  }

  // Common network errors
  if (msg.toLowerCase() === "failed to fetch" || msg.toLowerCase().includes("networkerror")) {
    return "Could not reach the server. Please check your connection and try again.";
  }

  // If the message looks internal/technical, hide it.
  if (!msg || looksLikeInternalMessage(msg)) {
    return "Something went wrong. Please try again.";
  }

  // Otherwise keep it (assume backend provided user-facing copy)
  return msg;
}

