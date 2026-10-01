import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import "./globals.css";
import { BottomNav } from "@/components/BottomNav";
import { PwaRegister } from "@/components/PwaRegister";

export const metadata: Metadata = {
  title: {
    default: "Calo",
    template: "%s · Calo",
  },
  description: "Cuenta tus calorías sin tarjeta ni registro.",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Calo",
  },
};

export const viewport: Viewport = {
  themeColor: "#10b981",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="es">
      <body className="min-h-screen bg-neutral-50 text-neutral-900 antialiased">
        <div className="mx-auto flex min-h-screen w-full max-w-md flex-col">
          <main className="flex-1">{children}</main>
          <BottomNav />
        </div>
        <PwaRegister />
      </body>
    </html>
  );
}
