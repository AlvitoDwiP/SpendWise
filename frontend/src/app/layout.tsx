import type { Metadata, Viewport } from "next";
import "./globals.css";
import "react-datepicker/dist/react-datepicker.css";
import GoogleProvider from "@/components/providers/GoogleProvider";

export const metadata: Metadata = {
  title: "SpendWise",
  description: "SpendWise frontend",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">
        <GoogleProvider>{children}</GoogleProvider>
      </body>
    </html>
  );
}
