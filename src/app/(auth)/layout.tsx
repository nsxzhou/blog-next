"use client";

import { ReactNode } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export default function AuthLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <>
      {/* 认证页面的主内容 */}
      <div className="flex-1 flex items-center justify-center px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.5,
            ease: [0.23, 1, 0.32, 1],
          }}
          className="w-full max-w-md"
        >
          {/* 认证表单容器 */}
          <div className="relative">
            {/* 毛玻璃背景 */}
            <div className="absolute inset-0 bg-background/60 backdrop-blur-sm border border-border/50 rounded-2xl" />
            
            {/* 内容 */}
            <div className="relative p-8">
              {children}
            </div>
          </div>
        </motion.div>
      </div>
    </>
  );
}