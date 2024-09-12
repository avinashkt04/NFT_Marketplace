"use client";

import { RequireWalletProvider } from "@/provider/ReactWalletProvider";

export default function BlogLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RequireWalletProvider>
      <section className="py-8 md:py-10">
        {children}
      </section>
    </RequireWalletProvider>
  );
}
