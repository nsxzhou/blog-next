import type { Metadata } from "next";
import localFont from "next/font/local";
import { ThemeProvider } from "@/components/theme/theme-provider";
import { AuthProvider } from "@/components/auth/auth-provider";
import { QueryProviders } from "@/lib/query/providers";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const hanyiKongShanKai = localFont({
  src: "./fonts/汉仪空山楷.ttf",
  variable: "--font-hanyi-kongshankai",
  weight: "400",
  fallback: ["serif"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Blog Next",
  description: "A Next.js blog application",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={hanyiKongShanKai.variable} suppressHydrationWarning>
      <body
        className="antialiased font-sans"
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <QueryProviders>
            <AuthProvider>
              {children}
              <Toaster />
            </AuthProvider>
          </QueryProviders>
        </ThemeProvider>
      </body>
    </html>
  );
}
