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
    <section className="auth-modal-content p-7 sm:p-9">
      <div className="mb-8 pr-10">
        <p className="auth-kicker">SpendWise</p>
        <h1 className="auth-modal-title mt-3">Sign in to SpendWise</h1>
        <p className="auth-modal-description mt-3">
          Manage your income, expenses, and financial reports with more clarity.
        </p>
      </div>

      {isGoogleLoginEnabled ? (
        <div className="auth-google-wrap mb-5">
          <GoogleLogin
            onError={onGoogleError}
            onSuccess={onGoogleSuccess}
            shape="pill"
            size="large"
            text="continue_with"
            theme="filled_black"
            width="100%"
          />
        </div>
      ) : (
        <button className="auth-social-btn mb-5 w-full" disabled type="button">
          Continue with Google
        </button>
      )}

      <div className="auth-divider">
        <span />
        <span>OR</span>
        <span />
      </div>

      <form className="space-y-4" onSubmit={onSubmit}>
        <div>
          <input
            autoComplete="email"
            className="auth-input"
            id="email"
            name="email"
            onChange={(event) => onEmailChange(event.target.value)}
            placeholder="Email address"
            type="email"
            value={email}
          />
        </div>

        <div>
          <input
            autoComplete="current-password"
            className="auth-input"
            id="password"
            name="password"
            onChange={(event) => onPasswordChange(event.target.value)}
            placeholder="Password"
            type="password"
            value={password}
          />
        </div>

        {error ? (
          <p className="alert-error">
            {error}
          </p>
        ) : null}

        <button
          className="auth-submit-btn w-full"
          disabled={isSubmitting}
          type="submit"
        >
          {isSubmitting ? "Processing..." : "Sign In"}
        </button>
      </form>

      <p className="mt-6 text-center font-sans text-sm text-[var(--text-secondary)]">
        Don&apos;t have an account?{" "}
        <Link className="font-semibold text-[var(--accent-cream)]" href="/register">
          Register
        </Link>
      </p>
    </section>
  );
}
