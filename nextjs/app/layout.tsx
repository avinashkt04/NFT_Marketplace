import "@/styles/globals.css";
import { Metadata } from "next";
import clsx from "clsx";

import { Providers } from "./providers";

import { siteConfig } from "@/config/site";
import { fontSans } from "@/config/fonts";
import { Navbar } from "@/components/Navbar";
import { MetamaskProvider } from "@/context/MetamaskContext";
import NextTopLoader from "nextjs-toploader";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export const metadata: Metadata = {
  title: {
    default: siteConfig.name,
    template: `%s - ${siteConfig.name}`,
  },
  description: siteConfig.description,
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html suppressHydrationWarning lang="en">
      <head />
      <body
        className={clsx(
          "min-h-screen bg-background font-sans antialiased",
          fontSans.variable
        )}
      >
        <Providers themeProps={{ attribute: "class", defaultTheme: "dark" }}>
          <MetamaskProvider>
            <div className="relative flex flex-col h-screen">
              <NextTopLoader />
              <ToastContainer />
              <Navbar />
              <main className="container mx-auto max-w-7xl pt-8 md:pt-12 px-6 flex-grow">
                {children}
              </main>
            </div>
          </MetamaskProvider>
        </Providers>
        <script
          src="https://kit.fontawesome.com/a018c6b503.js"
          crossOrigin="anonymous"
        ></script>
      </body>
    </html>
  );
}
