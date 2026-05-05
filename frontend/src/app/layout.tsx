import type { Metadata, Viewport } from "next";
import "./globals.css";
import "react-datepicker/dist/react-datepicker.css";
import { AppFooter } from "@/components/layout/AppFooter";
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
        <GoogleProvider>
          <div className="flex-1">{children}</div>
          <AppFooter />
        </GoogleProvider>
      </body>
    </html>
  );
}
