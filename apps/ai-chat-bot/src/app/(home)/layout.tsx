import Header from "@/components/Header";
import React from "react";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <main className="flex h-screen flex-row overflow-hidden">
      <div className="relative flex flex-grow flex-col">
        <Header showLogout />
        {children}
      </div>
    </main>
  );
}
