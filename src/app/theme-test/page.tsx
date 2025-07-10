"use client";

import { useState, useEffect } from "react";

export default function ThemeTestPage() {
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const savedTheme = localStorage.getItem("theme");
    const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    const initialTheme = (savedTheme as "light" | "dark") || systemTheme;
    
    setTheme(initialTheme);
    if (initialTheme === "dark") {
      document.documentElement.classList.add("dark");
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    
    if (newTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-foreground">
            主题切换测试页面
          </h1>
          
          <p className="text-lg text-muted-foreground">
            当前主题：<span className="font-semibold text-foreground">{theme === "light" ? "浅色" : "深色"}</span>
          </p>

          <button
            onClick={toggleTheme}
            className="btn btn-primary"
          >
            切换到 {theme === "light" ? "深色" : "浅色"} 模式
          </button>
        </div>

        {/* 颜色展示 */}
        <div className="space-y-6">
          <h2 className="text-2xl font-semibold text-foreground">颜色系统</h2>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <div className="h-24 bg-background border border-border rounded-lg"></div>
              <p className="text-sm text-muted-foreground">Background</p>
            </div>
            <div className="space-y-2">
              <div className="h-24 bg-foreground rounded-lg"></div>
              <p className="text-sm text-muted-foreground">Foreground</p>
            </div>
            <div className="space-y-2">
              <div className="h-24 bg-card border border-border rounded-lg"></div>
              <p className="text-sm text-muted-foreground">Card</p>
            </div>
            <div className="space-y-2">
              <div className="h-24 bg-primary rounded-lg"></div>
              <p className="text-sm text-muted-foreground">Primary</p>
            </div>
            <div className="space-y-2">
              <div className="h-24 bg-secondary border border-border rounded-lg"></div>
              <p className="text-sm text-muted-foreground">Secondary</p>
            </div>
            <div className="space-y-2">
              <div className="h-24 bg-muted border border-border rounded-lg"></div>
              <p className="text-sm text-muted-foreground">Muted</p>
            </div>
            <div className="space-y-2">
              <div className="h-24 bg-accent border border-border rounded-lg"></div>
              <p className="text-sm text-muted-foreground">Accent</p>
            </div>
            <div className="space-y-2">
              <div className="h-24 bg-destructive rounded-lg"></div>
              <p className="text-sm text-muted-foreground">Destructive</p>
            </div>
          </div>
        </div>

        {/* 组件展示 */}
        <div className="space-y-6">
          <h2 className="text-2xl font-semibold text-foreground">组件展示</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="card p-6">
              <h3 className="text-xl font-semibold text-card-foreground mb-2">
                卡片标题
              </h3>
              <p className="text-muted-foreground">
                这是一个卡片组件，展示了 card 和 card-foreground 的配色。
                在暗色模式下，背景和文字颜色会自动调整。
              </p>
            </div>
            
            <div className="card-hover p-6">
              <h3 className="text-xl font-semibold text-card-foreground mb-2">
                悬停卡片
              </h3>
              <p className="text-muted-foreground">
                这个卡片在鼠标悬停时会有动画效果。
                试试将鼠标移到这个卡片上。
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground">按钮样式</h3>
            <div className="flex flex-wrap gap-4">
              <button className="btn btn-primary">主要按钮</button>
              <button className="btn btn-secondary">次要按钮</button>
              <button className="btn btn-ghost">幽灵按钮</button>
              <button className="btn btn-danger">危险按钮</button>
              <button className="btn btn-primary" disabled>禁用按钮</button>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground">输入框样式</h3>
            <div className="max-w-md space-y-4">
              <input
                type="text"
                placeholder="普通输入框..."
                className="input"
              />
              <input
                type="text"
                placeholder="错误状态输入框..."
                className="input input-error"
              />
            </div>
          </div>
        </div>

        {/* 文字样式 */}
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold text-foreground">文字样式</h2>
          <p className="text-foreground">这是 foreground 颜色的文字</p>
          <p className="text-muted-foreground">这是 muted-foreground 颜色的文字</p>
          <p className="text-primary">这是 primary 颜色的文字</p>
          <p className="text-destructive">这是 destructive 颜色的文字</p>
        </div>

        {/* 边框展示 */}
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold text-foreground">边框样式</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 border border-border rounded-lg">
              <p className="text-muted-foreground">标准边框</p>
            </div>
            <div className="p-4 border-2 border-input rounded-lg">
              <p className="text-muted-foreground">输入框边框</p>
            </div>
            <div className="p-4 border-2 border-ring rounded-lg">
              <p className="text-muted-foreground">聚焦环边框</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}