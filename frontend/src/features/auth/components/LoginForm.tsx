"use client";

import type { FormEvent } from "react";
import Link from "next/link";
import { GoogleLogin, type CredentialResponse } from "@react-oauth/google";

type LoginFormProps = {
  email: string;
  error: string;
  isGoogleLoginEnabled: boolean;
  isSubmitting: boolean;
  password: string;
  onEmailChange: (value: string) => void;
  onGoogleError: () => void;
  onGoogleSuccess: (credentialResponse: CredentialResponse) => void;
  onPasswordChange: (value: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
};

export function LoginForm({
  email,
  error,
  isGoogleLoginEnabled,
  isSubmitting,
  password,
  onEmailChange,
  onGoogleError,
  onGoogleSuccess,
  onPasswordChange,
  onSubmit,
}: LoginFormProps) {
  return (
    <section className="w-full max-w-md rounded-lg border border-slate-200 bg-white p-8 shadow-sm">
      <div className="mb-8">
        <p className="text-sm font-medium text-emerald-700">SpendWise</p>
        <h1 className="mt-2 text-2xl font-semibold">Sign in</h1>
        <p className="mt-2 text-sm text-slate-600">
          Continue to your spending dashboard.
        </p>
      </div>

      <form className="space-y-5" onSubmit={onSubmit}>
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700" htmlFor="email">
            Email
          </label>
          <input
            autoComplete="email"
            className="h-11 w-full rounded-md border border-slate-300 px-3 text-sm outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
            id="email"
            name="email"
            onChange={(event) => onEmailChange(event.target.value)}
            type="email"
            value={email}
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700" htmlFor="password">
            Password
          </label>
          <input
            autoComplete="current-password"
            className="h-11 w-full rounded-md border border-slate-300 px-3 text-sm outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
            id="password"
            name="password"
            onChange={(event) => onPasswordChange(event.target.value)}
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
          <GoogleLogin onError={onGoogleError} onSuccess={onGoogleSuccess} text="continue_with" />
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
  );
}
