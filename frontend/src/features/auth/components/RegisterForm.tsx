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
    <section className="w-full max-w-md rounded-lg border border-slate-200 bg-white p-8 shadow-sm">
      <div className="mb-8">
        <p className="text-sm font-medium text-emerald-700">SpendWise</p>
        <h1 className="mt-2 text-2xl font-semibold">Create account</h1>
        <p className="mt-2 text-sm text-slate-600">
          Start tracking your spending in one place.
        </p>
      </div>

      <form className="space-y-5" onSubmit={onSubmit}>
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700" htmlFor="name">
            Name
          </label>
          <input
            autoComplete="name"
            className="h-11 w-full rounded-md border border-slate-300 px-3 text-sm outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
            id="name"
            name="name"
            onChange={(event) => onNameChange(event.target.value)}
            type="text"
            value={name}
          />
        </div>

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
            autoComplete="new-password"
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
          {isSubmitting ? "Creating account..." : "Create account"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-600">
        Already have an account?{" "}
        <Link className="font-medium text-emerald-700" href="/login">
          Sign in
        </Link>
      </p>
    </section>
  );
}
