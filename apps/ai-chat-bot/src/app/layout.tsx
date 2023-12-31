import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { SessionProvider } from "@/components/providers/SessionProvider";
import { appStore } from "@/lib/utils/isomorphic.server";
import { getSession } from "@/lib/auth/utils";
import { IsomorphicStoreProvider } from "next-isomorphic/client";
import { Toaster } from "react-hot-toast";

const inter = Inter({ subsets: ["latin"] });
const metadataBase = process.env.VERCEL_URL
  ? new URL(`https://${process.env.VERCEL_URL}`)
  : new URL(`http://localhost:${process.env.PORT || 3000}`);

export const metadata: Metadata = {
  title: "AIko",
  manifest: "/manifest.json",
  metadataBase,
  applicationName: "AIko",
  description: "An AIko to have a good conversation with",
  icons: ["/favicon.ico"],
  openGraph: {
    type: "website",
    title: "AIko",
  },
  twitter: {
    card: "summary",
    title: "AIko",
    description: "An AIko to have a good conversation with",
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
        <meta name="theme-color" content="#0f172a" />
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
