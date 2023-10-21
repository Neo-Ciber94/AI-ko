import "./globals.css";
import * as context from "next/headers";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { SessionProvider } from "@/components/providers/SessionProvider";
import { auth } from "@/lib/auth/lucia";
import Layout from "@/components/layout/Layout";

import { appStore } from "@/lib/utils/isomorphic.server";
import { IsomorphicStoreProvider } from "@/components/isomorphic/client";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "AI Chatbot",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const authRequest = auth.handleRequest("GET", context);
  const session = await authRequest.validate();

  return (
    <html lang="en">
      <body className={inter.className}>
        <SessionProvider session={session}>
          <IsomorphicStoreProvider store={appStore()}>
            <Layout>{children}</Layout>
          </IsomorphicStoreProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
