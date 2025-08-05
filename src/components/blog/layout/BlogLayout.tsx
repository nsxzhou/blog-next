"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { ToastHelper } from "@/lib/utils/toast";

interface BlogLayoutProps {
  children: React.ReactNode;
}

export function BlogLayout({ children }: BlogLayoutProps) {
  const searchParams = useSearchParams();
  const [hasShownMessage, setHasShownMessage] = useState(false);

  useEffect(() => {
    if (!hasShownMessage) {
      const message = searchParams.get("message");
      if (message) {
        ToastHelper.info(message);
        setHasShownMessage(true);
      }
    }
  }, [searchParams, hasShownMessage]);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8">
        {children}
      </main>
      <Footer />
    </div>
  );
}