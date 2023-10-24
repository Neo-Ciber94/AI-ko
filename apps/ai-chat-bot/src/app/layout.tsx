import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { SessionProvider } from "@/components/providers/SessionProvider";
import { appStore } from "@/lib/utils/isomorphic.server";
import { getSession } from "@/lib/auth/utils";
import { IsomorphicStoreProvider } from "next-isomorphic/client";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "AI Chatbot",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  const store = appStore();

  return (
    <html lang="en" className={`${store.state.isDark ? "dark" : ""}`}>
      <body className={inter.className}>
        <SessionProvider session={session}>
          <IsomorphicStoreProvider store={store}>
            {children}
          </IsomorphicStoreProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
