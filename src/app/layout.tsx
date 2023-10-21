import "./globals.css";
import * as context from "next/headers";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { SessionProvider } from "@/components/providers/SessionProvider";
import { auth } from "@/lib/auth/lucia";
import Layout from "@/components/layout/Layout";
import { SidebarProvider } from "@/components/providers/SidebarContext";
import { COOKIE_SIDEBAR_OPEN } from "@/lib/common/constants";
import { IsomorphicStoreProvider } from "@/components/isomorphic/server";
import { store } from "@/lib/utils/isomorphic.server";

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

  const sidebarCookie = context.cookies().get(COOKIE_SIDEBAR_OPEN)?.value;
  const isSidebarOpen = sidebarCookie ? sidebarCookie === "true" : undefined;

  return (
    <html lang="en">
      <body className={inter.className}>
        <SessionProvider session={session}>
          <IsomorphicStoreProvider store={store}>
            <SidebarProvider isOpen={isSidebarOpen}>
              <Layout>{children}</Layout>
            </SidebarProvider>
          </IsomorphicStoreProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
