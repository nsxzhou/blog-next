"use client";

import { Suspense } from "react";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { SearchParamsHandler } from "./SearchParamsHandler";

interface BlogLayoutProps {
  children: React.ReactNode;
}

export function BlogLayout({ children }: BlogLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8">
        {children}
      </main>
      <Footer />
      <Suspense fallback={null}>
        <SearchParamsHandler />
      </Suspense>
    </div>
  );
}