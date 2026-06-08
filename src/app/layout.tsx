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
      <body className="antialiased">
        <SessionProvider session={session}>
          {children}
        </SessionProvider>
      </body>
    </html>
  );
}
