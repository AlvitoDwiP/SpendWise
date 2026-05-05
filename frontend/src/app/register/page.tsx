"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

import { RegisterForm } from "@/features/auth/components/RegisterForm";
import { register } from "@/features/auth/api";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    const trimmedName = name.trim();
    const trimmedEmail = email.trim();
    if (!trimmedName || !trimmedEmail || !password) {
      setError("Name, email, and password are required.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setIsSubmitting(true);
    try {
      await register({
        name: trimmedName,
        email: trimmedEmail,
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
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-6 py-12 text-slate-950">
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
    </main>
  );
}
