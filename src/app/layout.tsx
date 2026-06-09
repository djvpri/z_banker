// src/app/layout.tsx
import type { Metadata } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { SessionProvider } from "@/components/layout/SessionProvider";
import "./globals.css";

export const metadata: Metadata = {
  title: "Z Banker — Bank Manager Simulator",
  description: "Kelola bank dari cabang kecil hingga empire perbankan Indonesia",
  keywords: ["bank", "simulator", "game", "indonesia", "perbankan"],
  openGraph: {
    title: "Z Banker",
    description: "Bank Manager Simulator — Indonesia",
    type: "website",
  },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  return (
    <html lang="id" suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
        <meta name="theme-color" content="#080810" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Z Banker" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/icon-192.svg" />
      </head>
      <body className="antialiased">
        <SessionProvider session={session}>
          {children}
        </SessionProvider>
      </body>
    </html>
  );
}
