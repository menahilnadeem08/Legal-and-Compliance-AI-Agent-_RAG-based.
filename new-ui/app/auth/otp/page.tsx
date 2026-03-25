"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Sparkles, Mail, CheckCircle2, AlertCircle, X, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { setAuth } from "@/app/utils/auth";
import { ThemeToggleButton } from "@/app/components/ThemeToggleButton";

const RESEND_COOLDOWN = 30;

export default function OtpPage() {
  const router = useRouter();
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [verified, setVerified] = useState(false);
  const [error, setError] = useState("");
  const [resendCountdown, setResendCountdown] = useState(RESEND_COOLDOWN);
  const [resendLoading, setResendLoading] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Countdown timer
  useEffect(() => {
    if (resendCountdown <= 0) return;
    const t = setTimeout(() => setResendCountdown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [resendCountdown]);

  const filled = otp.filter((d) => d !== "").length;

  const handleChange = (i: number, val: string) => {
    if (!/^\d*$/.test(val)) return;
    const next = [...otp];
    next[i] = val.slice(-1);
    setOtp(next);
    setError("");

    if (val && i < 5) {
      inputRefs.current[i + 1]?.focus();
    }

    // Auto-submit when all 6 filled
    if (val && i === 5 && next.every((d) => d !== "")) {
      handleVerify(next);
    }
  };

  const handleKeyDown = (i: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[i] && i > 0) {
      const next = [...otp];
      next[i - 1] = "";
      setOtp(next);
      inputRefs.current[i - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (pasted.length === 6) {
      const next = pasted.split("");
      setOtp(next);
      inputRefs.current[5]?.focus();
      handleVerify(next);
    } else if (pasted.length > 0) {
      // Partial paste — fill what we have
      const next = [...otp];
      pasted.split("").forEach((d, i) => { next[i] = d; });
      setOtp(next);
      inputRefs.current[Math.min(pasted.length, 5)]?.focus();
    }
  };

  const handleVerify = async (digits = otp) => {
    if (digits.some((d) => d === "")) {
      setError("Please enter all 6 digits.");
      return;
    }
    setError("");
    setLoading(true);

    // 3-second mock loading
    await new Promise((res) => setTimeout(res, 3000));

    setLoading(false);
    setVerified(true);

    const email = localStorage.getItem("registration-email") || "admin@acme.com";
    const name = localStorage.getItem("registration-name") || "Admin User";
    const user = { email, name, role: "admin" };
    setAuth("mock-otp-" + Date.now(), user);
    localStorage.removeItem("registration-email");
    localStorage.removeItem("registration-name");

    toast.success("Email verified!", {
      description: "Your account is now active. Redirecting...",
      duration: 3000,
    });

    setTimeout(() => router.push("/dashboard"), 2500);
  };

  const handleResend = async () => {
    setResendLoading(true);
    setOtp(["", "", "", "", "", ""]);
    setError("");
    await new Promise((res) => setTimeout(res, 1000));
    setResendLoading(false);
    setResendCountdown(RESEND_COOLDOWN);
    inputRefs.current[0]?.focus();
    toast.info("Code resent", {
      description: "A new verification code has been sent to your email.",
    });
  };

  return (
    <div className="min-h-screen flex bg-white dark:bg-slate-950 relative">
      <ThemeToggleButton className="absolute top-4 right-4 z-50" />
      {/* ── Left decorative panel ── */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900 dark:to-blue-950 flex-col justify-between p-12">
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />
        <div className="absolute -bottom-20 right-0 w-96 h-96 bg-indigo-500 rounded-full blur-[130px] opacity-25" />
        <div className="absolute top-10 left-10 w-64 h-64 bg-blue-400 rounded-full blur-[100px] opacity-20" />

        <div className="relative z-10 flex items-center gap-2">
          <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-blue-900" />
          </div>
          <span className="text-blue-900 dark:text-white font-bold text-xl tracking-tight">Legal and Compliance Rag</span>
        </div>

        <div className="relative z-10">
          <div className="w-16 h-16 bg-blue-800/60 border border-blue-600/40 rounded-2xl flex items-center justify-center mb-6">
            <Mail className="w-8 h-8 text-blue-200" />
          </div>
          <h2 className="text-5xl font-bold text-blue-900 dark:text-white leading-tight mb-4">
            Almost
            <br />
            there.
          </h2>
          <p className="text-blue-700 dark:text-blue-200 text-lg leading-relaxed max-w-sm">
            One last step — verify your email to activate your account and get started.
          </p>
        </div>

        <div className="relative z-10 flex items-center gap-2 text-blue-600 dark:text-blue-300 text-sm">
          <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
          Your account is ready to activate
        </div>
      </div>

      {/* ── Right form panel ── */}
      <div className="flex-1 flex items-center justify-center p-6 bg-gradient-to-b from-slate-50 to-white dark:from-slate-950 dark:to-slate-900">
        <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl p-8">
          {/* Mobile logo */}
          <div className="flex items-center gap-2 mb-10 lg:hidden">
            <div className="w-8 h-8 bg-blue-600 dark:bg-blue-900 rounded-lg flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="text-slate-900 dark:text-white font-bold text-xl tracking-tight">Legal and Compliance Rag</span>
          </div>

          {!verified && (
            <Link
              href="/auth/admin/signup"
              className="flex items-center gap-1.5 text-slate-500 hover:text-slate-700 dark:text-gray-400 dark:hover:text-gray-200 text-sm mb-8 transition-colors w-fit"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to register
            </Link>
          )}

          {/* ── Verified state ── */}
          {verified ? (
            <div className="text-center py-12 animate-[fadeIn_0.4s_ease]">
              <div className="w-20 h-20 bg-emerald-500/10 border border-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-5">
                <CheckCircle2 className="w-10 h-10 text-emerald-500 dark:text-emerald-400" />
              </div>
              <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2 tracking-tight">Verified!</h1>
              <p className="text-slate-600 dark:text-gray-400 mb-1">Your email has been confirmed.</p>
              <p className="text-slate-500 dark:text-gray-500 text-sm">Redirecting you to sign in...</p>
              <div className="mt-6 flex justify-center">
                <div className="w-6 h-6 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
              </div>
            </div>
          ) : (
            <>
              <div className="mb-8">
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2 tracking-tight">
                  Verify your email
                </h1>
                <p className="text-slate-600 dark:text-gray-400">
                  Enter the 6-digit code we sent to your email address.
                </p>
              </div>

              {/* Progress bar */}
              <div className="flex gap-1 mb-8">
                {otp.map((_, i) => (
                  <div
                    key={i}
                    className={`h-0.5 flex-1 rounded-full transition-all duration-300 ${
                      i < filled ? "bg-blue-600 dark:bg-blue-500" : "bg-slate-200 dark:bg-slate-700"
                    }`}
                  />
                ))}
              </div>

              <div className="space-y-6">
                {/* Error alert */}
                {error && (
                  <div className="flex items-start gap-2.5 bg-red-100 dark:bg-red-950/40 border border-red-300 dark:border-red-800/50 rounded-xl px-4 py-3 animate-[fadeIn_0.2s_ease]">
                    <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                    <p className="text-red-700 dark:text-red-300 text-sm flex-1">{error}</p>
                    <button
                      type="button"
                      onClick={() => setError("")}
                      className="text-red-600 hover:text-red-500 dark:text-red-500 dark:hover:text-red-300 transition-colors"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}

                {/* OTP inputs */}
                <div>
                  <div className="flex gap-2.5" onPaste={handlePaste}>
                    {otp.map((digit, i) => (
                      <input
                        key={i}
                        ref={(el) => { inputRefs.current[i] = el; }}
                        id={`otp-${i}`}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleChange(i, e.target.value)}
                        onKeyDown={(e) => handleKeyDown(i, e)}
                        autoFocus={i === 0}
                        disabled={loading}
                        aria-label={`Digit ${i + 1}`}
                        className={`w-full aspect-square text-center text-2xl font-bold bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                          digit
                            ? "border-blue-500 focus:border-blue-500 focus:ring-blue-500/30 bg-blue-50/70 dark:bg-blue-950/30"
                            : "focus:border-blue-500 focus:ring-blue-500/30"
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-2.5 text-center">
                    You can also paste the code directly
                  </p>
                </div>

                {/* Verify button */}
                <button
                  onClick={() => handleVerify()}
                  disabled={loading || filled < 6}
                  className="w-full bg-blue-600 hover:bg-blue-700 active:bg-blue-800 dark:bg-blue-900 dark:hover:bg-blue-800 dark:active:bg-blue-950 text-white font-semibold py-3 px-4 rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed relative overflow-hidden"
                >
                  {loading && (
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full animate-shimmer" />
                  )}
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Verifying...</span>
                    </>
                  ) : (
                    "Verify email"
                  )}
                </button>

                {/* Resend */}
                <div className="text-center">
                  {resendCountdown > 0 ? (
                    <p className="text-sm text-slate-500 dark:text-gray-500">
                      Resend code in{" "}
                      <span className="text-slate-400 dark:text-gray-400 font-medium tabular-nums">
                        0:{resendCountdown.toString().padStart(2, "0")}
                      </span>
                    </p>
                  ) : (
                    <button
                      onClick={handleResend}
                      disabled={resendLoading}
                      className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors flex items-center gap-1.5 mx-auto disabled:opacity-50"
                    >
                      {resendLoading ? (
                        <div className="w-3.5 h-3.5 border-2 border-blue-600/30 border-t-blue-600 dark:border-blue-400/30 dark:border-t-blue-400 rounded-full animate-spin" />
                      ) : (
                        <RefreshCw className="w-3.5 h-3.5" />
                      )}
                      Resend code
                    </button>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}