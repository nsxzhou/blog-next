"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const footerLinks = [
  { name: "GitHub", href: "https://github.com", external: true },
  { name: "Twitter", href: "https://twitter.com", external: true },
  { name: "RSS", href: "/rss.xml" },
];

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="mt-auto">
      {/* 流动的分隔线 */}
      <div className="relative overflow-hidden">
        <motion.div
          initial={{ x: "-100%" }}
          animate={{ x: "100%" }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "linear",
          }}
          className="absolute inset-0 h-px bg-gradient-to-r from-transparent via-border to-transparent"
        />
        <div className="h-px bg-border/20" />
      </div>

      <div className="container mx-auto px-6 lg:px-8 py-12">
        <div className="flex flex-col items-center space-y-8">
          {/* 极简的链接 */}
          <nav className="flex items-center space-x-8">
            {footerLinks.map((link) => (
              <motion.div
                key={link.name}
                whileHover={{ y: -2 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
              >
                <Link
                  href={link.href}
                  target={link.external ? "_blank" : undefined}
                  rel={link.external ? "noopener noreferrer" : undefined}
                  className={cn(
                    "text-sm font-light transition-colors",
                    "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {link.name}
                </Link>
              </motion.div>
            ))}
          </nav>

          {/* 优雅的版权信息 */}
          <div className="text-center space-y-2">
            <p className="text-xs text-muted-foreground/70 font-light">
              © {currentYear} 思维笔记
            </p>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-xs text-muted-foreground/50 font-light"
            >
              用心记录，让思想自由流动
            </motion.p>
          </div>

          {/* 可选的装饰元素 */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{
              delay: 0.8,
              type: "spring",
              stiffness: 200,
              damping: 15,
            }}
            className="w-1 h-1 rounded-full bg-primary/30"
          />
        </div>
      </div>
    </footer>
  );
}