"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";

import { AuthBackdrop } from "@/features/auth/components/AuthBackdrop";
import { AuthModal } from "@/features/auth/components/AuthModal";
import { RegisterForm } from "@/features/auth/components/RegisterForm";
import { register } from "@/features/auth/api";
import { validateRegisterForm } from "@/features/auth/utils";
import { GuestDashboardPreview } from "@/features/dashboard/components/GuestDashboardPreview";
import { getToken } from "@/lib/api/client";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
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

    const validationError = validateRegisterForm({ name, email, password });
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsSubmitting(true);
    try {
      await register({
        name: name.trim(),
        email: email.trim(),
        password,
      });
      router.push("/login");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed.");
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
        <RegisterForm
          email={email}
          error={error}
          isSubmitting={isSubmitting}
          name={name}
          onEmailChange={setEmail}
          onNameChange={setName}
          onPasswordChange={setPassword}
          onSubmit={handleSubmit}
          password={password}
        />
      </AuthModal>
    </>
  );
}
