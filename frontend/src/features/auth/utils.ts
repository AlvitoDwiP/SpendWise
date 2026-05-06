"use client";

import type { CredentialResponse } from "@react-oauth/google";

import type { GoogleTokenPayload } from "@/features/auth/types";

export function decodeGoogleTokenPayload(idToken: string): GoogleTokenPayload | null {
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

export function getGoogleIdToken(
  credentialResponse: CredentialResponse,
): string | null {
  const idToken = credentialResponse.credential?.trim();
  return idToken || null;
}

export function validateLoginForm(input: {
  email: string;
  password: string;
}): string | null {
  if (!input.email.trim() || !input.password) {
    return "Email and password are required.";
  }

  return null;
}

export function validateRegisterForm(input: {
  name: string;
  email: string;
  password: string;
}): string | null {
  if (!input.name.trim() || !input.email.trim() || !input.password) {
    return "Name, email, and password are required.";
  }
  if (input.password.length < 6) {
    return "Password must be at least 6 characters.";
  }

  return null;
}

function decodeBase64Url(value: string): string {
  const base64 = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), "=");
  return atob(padded);
}
