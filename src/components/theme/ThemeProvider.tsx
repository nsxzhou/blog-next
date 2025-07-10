"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { Theme, ThemeConfig, defaultThemeConfig, THEME_STORAGE_KEY, getCurrentTheme, applyTheme, getSystemTheme } from '@/lib/theme';

interface ThemeContextType {
  config: ThemeConfig;
  setTheme: (theme: Theme) => void;
  setRadius: (radius: number) => void;
  resolvedTheme: 'light' | 'dark';
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

interface ThemeProviderProps {
  children: React.ReactNode;
  defaultTheme?: Theme;
  storageKey?: string;
}

export function ThemeProvider({
  children,
  defaultTheme = 'system',
  storageKey = THEME_STORAGE_KEY,
}: ThemeProviderProps) {
  // 初始化时避免闪烁
  const [isInitialized, setIsInitialized] = useState(false);
  const [config, setConfig] = useState<ThemeConfig>(() => {
    // 初始化时从 localStorage 读取配置
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        try {
          return JSON.parse(stored);
        } catch (e) {
          console.error('Failed to parse theme config:', e);
        }
      }
    }
    return { ...defaultThemeConfig, theme: defaultTheme };
  });

  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>(() => 
    getCurrentTheme(config.theme)
  );

  // 设置主题
  const setTheme = (theme: Theme) => {
    const newConfig = { ...config, theme };
    setConfig(newConfig);
    
    // 保存到 localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem(storageKey, JSON.stringify(newConfig));
    }
  };

  // 设置圆角
  const setRadius = (radius: number) => {
    const newConfig = { ...config, radius };
    setConfig(newConfig);
    
    // 保存到 localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem(storageKey, JSON.stringify(newConfig));
      // 更新 CSS 变量
      document.documentElement.style.setProperty('--radius', `${radius}rem`);
    }
  };

  // 初始化
  useEffect(() => {
    setIsInitialized(true);
  }, []);

  // 监听系统主题变化
  useEffect(() => {
    if (!isInitialized) return;
    
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleChange = () => {
      if (config.theme === 'system') {
        const newResolvedTheme = getSystemTheme();
        setResolvedTheme(newResolvedTheme);
        applyTheme(newResolvedTheme);
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [config.theme, isInitialized]);

  // 应用主题
  useEffect(() => {
    if (!isInitialized) return;
    
    const theme = getCurrentTheme(config.theme);
    setResolvedTheme(theme);
    applyTheme(theme);
  }, [config.theme, isInitialized]);

  // 应用圆角设置
  useEffect(() => {
    if (typeof window !== 'undefined' && config.radius !== undefined) {
      document.documentElement.style.setProperty('--radius', `${config.radius}rem`);
    }
  }, [config.radius]);

  return (
    <ThemeContext.Provider
      value={{
        config,
        setTheme,
        setRadius,
        resolvedTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}