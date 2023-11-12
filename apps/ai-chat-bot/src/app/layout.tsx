import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { SessionProvider } from "@/components/providers/SessionProvider";
import { appStore } from "@/lib/utils/isomorphic.server";
import { getSession } from "@/lib/auth/utils";
import { IsomorphicStoreProvider } from "next-isomorphic/client";
import { Toaster } from "react-hot-toast";
import { breakpoints } from "@/lib/common/constants";
import Script from "next/script";

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
      <body className={inter.className}>
        <CheckSidebarScript />
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

function CheckSidebarScript() {
  return (
    <Script id="check-sidebar">{`
    const sideBarShouldBeOpen = window.matchMedia("(max-width: ${breakpoints.sm})");

    if (sideBarShouldBeOpen.matches) {
      console.log("matches")
      document.cookie = "ai-ko/isSidebarOpen=false;path=/"
    }
`}</Script>
  );
}
