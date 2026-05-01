"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { CredentialResponse, GoogleLogin } from "@react-oauth/google";

import { googleLogin, login, setToken } from "../../lib/api";

type GoogleTokenPayload = {
  aud?: string;
  iss?: string;
  exp?: number;
};

function decodeBase64Url(value: string): string {
  const base64 = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), "=");
  return atob(padded);
}

function decodeGoogleTokenPayload(idToken: string): GoogleTokenPayload | null {
  const parts = idToken.split(".");
  if (parts.length !== 3) {
    return null;
  }

  try {
    const decoded = decodeBase64Url(parts[1]);
    return JSON.parse(decoded) as GoogleTokenPayload;
  } catch {
    return null;
  }
}

export default function LoginPage() {
  const router = useRouter();
  const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID?.trim();
  const isGoogleLoginEnabled = Boolean(googleClientId);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    const trimmedEmail = email.trim();
    if (!trimmedEmail || !password) {
      setError("Email and password are required.");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await login({
        email: trimmedEmail,
        password,
      });
      setToken(response.token);
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleGoogleSuccess(credentialResponse: CredentialResponse) {
    const idToken = credentialResponse.credential?.trim();
    if (!idToken) {
      setError("Google login failed: token not found.");
      return;
    }
    const payload = decodeGoogleTokenPayload(idToken);
    console.log("GOOGLE_TOKEN_AUD:", payload?.aud);
    console.log("GOOGLE_TOKEN_ISS:", payload?.iss);
    console.log("GOOGLE_TOKEN_EXP:", payload?.exp);

    setError("");
    setIsSubmitting(true);
    try {
      const response = await googleLogin({ id_token: idToken });
      setToken(response.token);
      router.push("/dashboard");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Google login failed. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-6 py-12 text-slate-950">
      <section className="w-full max-w-md rounded-lg border border-slate-200 bg-white p-8 shadow-sm">
        <div className="mb-8">
          <p className="text-sm font-medium text-emerald-700">SpendWise</p>
          <h1 className="mt-2 text-2xl font-semibold">Sign in</h1>
          <p className="mt-2 text-sm text-slate-600">
            Continue to your spending dashboard.
          </p>
        </div>

        <form className="space-y-5" onSubmit={handleSubmit}>
          <div>
            <label
              className="mb-2 block text-sm font-medium text-slate-700"
              htmlFor="email"
            >
              Email
            </label>
            <input
              autoComplete="email"
              className="h-11 w-full rounded-md border border-slate-300 px-3 text-sm outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
              id="email"
              name="email"
              onChange={(event) => setEmail(event.target.value)}
              type="email"
              value={email}
            />
          </div>

          <div>
            <label
              className="mb-2 block text-sm font-medium text-slate-700"
              htmlFor="password"
            >
              Password
            </label>
            <input
              autoComplete="current-password"
              className="h-11 w-full rounded-md border border-slate-300 px-3 text-sm outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
              id="password"
              name="password"
              onChange={(event) => setPassword(event.target.value)}
              type="password"
              value={password}
            />
          </div>

          {error ? (
            <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </p>
          ) : null}

          <button
            className="h-11 w-full rounded-md bg-emerald-700 px-4 text-sm font-semibold text-white transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:bg-slate-300"
            disabled={isSubmitting}
            type="submit"
          >
            {isSubmitting ? "Signing in..." : "Sign in"}
          </button>
        </form>
        <div className="my-4 flex items-center gap-3 text-xs text-slate-400">
          <span className="h-px flex-1 bg-slate-200" />
          <span>OR</span>
          <span className="h-px flex-1 bg-slate-200" />
        </div>
        {isGoogleLoginEnabled ? (
          <div className="flex justify-center">
            <GoogleLogin
              onError={() => setError("Google login failed. Please try again.")}
              onSuccess={handleGoogleSuccess}
              text="continue_with"
            />
          </div>
        ) : (
          <p className="text-center text-xs text-slate-500">
            Google login is unavailable. Please configure{" "}
            <code>NEXT_PUBLIC_GOOGLE_CLIENT_ID</code>.
          </p>
        )}

        <p className="mt-6 text-center text-sm text-slate-600">
          New to SpendWise?{" "}
          <Link className="font-medium text-emerald-700" href="/register">
            Create an account
          </Link>
        </p>
      </section>
    </main>
  );
}
