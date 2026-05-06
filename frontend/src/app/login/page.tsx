"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import { type CredentialResponse } from "@react-oauth/google";

import { AuthBackdrop } from "@/features/auth/components/AuthBackdrop";
import { AuthModal } from "@/features/auth/components/AuthModal";
import { LoginForm } from "@/features/auth/components/LoginForm";
import { googleLogin, login } from "@/features/auth/api";
import {
  getGoogleIdToken,
  validateLoginForm,
} from "@/features/auth/utils";
import { GuestDashboardPreview } from "@/features/dashboard/components/GuestDashboardPreview";
import { getToken, setToken } from "@/lib/api/client";

export default function LoginPage() {
  const router = useRouter();
  const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID?.trim();
  const isGoogleLoginEnabled = Boolean(googleClientId);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (getToken()) {
      router.replace("/dashboard");
    }
  }, [router]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    const validationError = validateLoginForm({ email, password });
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await login({
        email: email.trim(),
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
    const idToken = getGoogleIdToken(credentialResponse);
    if (!idToken) {
      setError("Google login failed: token not found.");
      return;
    }

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
    <>
      <AuthBackdrop>
        <GuestDashboardPreview />
      </AuthBackdrop>
      <AuthModal>
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
      </AuthModal>
    </>
  );
}
