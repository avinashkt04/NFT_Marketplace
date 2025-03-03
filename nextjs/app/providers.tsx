"use client";

import * as React from "react";

import { useRouter } from "next/navigation";

import { NextUIProvider } from "@nextui-org/system";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { ThemeProviderProps } from "next-themes/dist/types";


export interface ProvidersProps {
  children: React.ReactNode;
  themeProps?: ThemeProviderProps;
}

export function Providers({ children, themeProps }: ProvidersProps) {
  const router = useRouter();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null; // Avoid SSR issues with next-themes

  return (
    <NextUIProvider navigate={router.push}>
      <NextThemesProvider enableSystem={false} {...themeProps}>
        {children}
      </NextThemesProvider>
    </NextUIProvider>
  );
}
