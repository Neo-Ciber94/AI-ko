import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { SessionProvider } from "@/components/providers/SessionProvider";
import { appStore } from "@/lib/utils/isomorphic.server";
import { getSession } from "@/lib/auth/utils";
import { IsomorphicStoreProvider } from "next-isomorphic/client";
import { Toaster } from "react-hot-toast";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "AI Chatbot",
  manifest: "/manifest.json",
  applicationName: "AI Chatbot",
  description: "An AI chatbot to have a good conversation with",
  openGraph: {
    type: "website",
    title: "AI Chatbot",
  },
  twitter: {
    card: "summary",
    title: "AI Chatbot",
    description: "An AI chatbot to have a good conversation with",
  },
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
      <head>
        <link rel="icon" href="favicon.ico" />
      </head>
      <body className={inter.className}>
        <SessionProvider session={session}>
          <IsomorphicStoreProvider store={store}>
            {children}
          </IsomorphicStoreProvider>
        </SessionProvider>
        <Toaster />
      </body>
    </html>
  );
}
