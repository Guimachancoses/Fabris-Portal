"use client";

import { useEffect, useState } from "react";
import { ThemeProvider } from "next-themes";
import { usePathname } from "next/navigation";
import SplashScreen from "@/src/components/pages/splashPage/splash-screen";

export default function ClientLayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  // true somente para a home "/"
  const isHome = pathname === "/";

  const [loading, setLoading] = useState(isHome);

  useEffect(() => {
    if (!isHome) {
      setLoading(false);
      return;
    }

    const timeout = setTimeout(() => setLoading(false), 1500);
    return () => clearTimeout(timeout);
  }, [isHome]);

  if (loading) {
    return <SplashScreen />;
  }

  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      disableTransitionOnChange
    >
      {children}
    </ThemeProvider>
  );
}
