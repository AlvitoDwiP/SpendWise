"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { type CredentialResponse } from "@react-oauth/google";

import { LoginForm } from "@/features/auth/components/LoginForm";
import { googleLogin, login } from "@/features/auth/api";
import type { GoogleTokenPayload } from "@/features/auth/types";
import { setToken } from "@/lib/api/client";

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
      <LoginForm
        email={email}
        error={error}
        isGoogleLoginEnabled={isGoogleLoginEnabled}
        isSubmitting={isSubmitting}
        onEmailChange={setEmail}
        onGoogleError={() => setError("Google login failed. Please try again.")}
        onGoogleSuccess={handleGoogleSuccess}
        onPasswordChange={setPassword}
        onSubmit={handleSubmit}
        password={password}
      />
    </main>
  );
}
