"use client";

import type { FormEvent } from "react";
import Link from "next/link";

type RegisterFormProps = {
  email: string;
  error: string;
  isSubmitting: boolean;
  name: string;
  password: string;
  onEmailChange: (value: string) => void;
  onNameChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
};

export function RegisterForm({
  email,
  error,
  isSubmitting,
  name,
  password,
  onEmailChange,
  onNameChange,
  onPasswordChange,
  onSubmit,
}: RegisterFormProps) {
  return (
    <section className="auth-modal-content p-7 sm:p-9">
      <div className="mb-8 pr-10">
        <p className="auth-kicker">SpendWise</p>
        <h1 className="auth-modal-title mt-3">Create your SpendWise account</h1>
        <p className="auth-modal-description mt-3">
          Start tracking transactions and monitoring your finances in one place.
        </p>
      </div>

      <button className="auth-social-btn mb-5 w-full" disabled type="button">
        Continue with Google
      </button>

      <div className="auth-divider">
        <span />
        <span>OR</span>
        <span />
      </div>

      <form className="space-y-4" onSubmit={onSubmit}>
        <div>
          <input
            autoComplete="name"
            className="auth-input"
            id="name"
            name="name"
            onChange={(event) => onNameChange(event.target.value)}
            placeholder="Name"
            type="text"
            value={name}
          />
        </div>

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
            autoComplete="new-password"
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
          {isSubmitting ? "Processing..." : "Register"}
        </button>
      </form>

      <p className="mt-6 text-center font-sans text-sm text-[var(--text-secondary)]">
        Already have an account?{" "}
        <Link className="font-semibold text-[var(--accent-cream)]" href="/login">
          Sign In
        </Link>
      </p>
    </section>
  );
}
