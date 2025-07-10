/**
 * 主题系统配置
 * 基于 CLAUDE.md 设计规范
 */

// 主题类型定义
export type Theme = 'light' | 'dark' | 'system';

// 主题配置接口
export interface ThemeConfig {
  theme: Theme;
  radius: number;
  primaryColor?: string;
  fontFamily?: string;
}

// 默认主题配置
export const defaultThemeConfig: ThemeConfig = {
  theme: 'system',
  radius: 0.5,
};

// 主题存储键名
export const THEME_STORAGE_KEY = 'blog-theme-config';

// 获取系统主题
export const getSystemTheme = (): 'light' | 'dark' => {
  if (typeof window === 'undefined') return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};

// 获取当前主题
export const getCurrentTheme = (theme: Theme): 'light' | 'dark' => {
  if (theme === 'system') {
    return getSystemTheme();
  }
  return theme;
};

// 应用主题到 DOM
export const applyTheme = (theme: 'light' | 'dark') => {
  const root = document.documentElement;
  
  if (theme === 'dark') {
    root.classList.add('dark');
  } else {
    root.classList.remove('dark');
  }
  
  // 设置主题色到 meta 标签
  const themeColor = theme === 'dark' ? '#020817' : '#ffffff';
  const metaThemeColor = document.querySelector('meta[name="theme-color"]');
  if (metaThemeColor) {
    metaThemeColor.setAttribute('content', themeColor);
  }
};

// 主题颜色预设
export const themeColors = {
  light: {
    background: '0 0% 100%',
    foreground: '222.2 84% 4.9%',
    card: '0 0% 100%',
    cardForeground: '222.2 84% 4.9%',
    popover: '0 0% 100%',
    popoverForeground: '222.2 84% 4.9%',
    primary: '221.2 83.2% 53.3%',
    primaryForeground: '210 40% 98%',
    secondary: '210 40% 96.1%',
    secondaryForeground: '222.2 47.4% 11.2%',
    muted: '210 40% 96.1%',
    mutedForeground: '215.4 16.3% 46.9%',
    accent: '210 40% 96.1%',
    accentForeground: '222.2 47.4% 11.2%',
    destructive: '0 84.2% 60.2%',
    destructiveForeground: '210 40% 98%',
    border: '214.3 31.8% 91.4%',
    input: '214.3 31.8% 91.4%',
    ring: '221.2 83.2% 53.3%',
  },
  dark: {
    background: '222.2 84% 4.9%',
    foreground: '210 40% 98%',
    card: '222.2 84% 4.9%',
    cardForeground: '210 40% 98%',
    popover: '222.2 84% 4.9%',
    popoverForeground: '210 40% 98%',
    primary: '217.2 91.2% 59.8%',
    primaryForeground: '222.2 47.4% 11.2%',
    secondary: '217.2 32.6% 17.5%',
    secondaryForeground: '210 40% 98%',
    muted: '217.2 32.6% 17.5%',
    mutedForeground: '215 20.2% 65.1%',
    accent: '217.2 32.6% 17.5%',
    accentForeground: '210 40% 98%',
    destructive: '0 62.8% 30.6%',
    destructiveForeground: '210 40% 98%',
    border: '217.2 32.6% 17.5%',
    input: '217.2 32.6% 17.5%',
    ring: '217.2 91.2% 59.8%',
  },
};

// 主题相关的类名
export const themeClassNames = {
  // 背景
  background: 'bg-background',
  foreground: 'text-foreground',
  
  // 卡片
  card: 'bg-card text-card-foreground',
  cardHover: 'hover:bg-accent hover:text-accent-foreground',
  
  // 按钮
  buttonPrimary: 'bg-primary text-primary-foreground hover:bg-primary/90',
  buttonSecondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
  buttonGhost: 'hover:bg-accent hover:text-accent-foreground',
  buttonDestructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
  
  // 输入框
  input: 'bg-background text-foreground border-input focus:border-ring',
  
  // 边框
  border: 'border-border',
  
  // 文本
  mutedText: 'text-muted-foreground',
  
  // 焦点
  focusRing: 'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
};

// 断点配置
export const breakpoints = {
  // 内容优先断点
  compact: '45ch',
  comfortable: '45ch',
  spacious: '75ch',
  immersive: '100ch',
  
  // 传统断点
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
};

// 媒体查询辅助函数
export const mediaQuery = {
  // 内容优先
  compact: `(max-width: ${breakpoints.compact})`,
  comfortable: `(min-width: ${breakpoints.comfortable})`,
  spacious: `(min-width: ${breakpoints.spacious})`,
  immersive: `(min-width: ${breakpoints.immersive})`,
  
  // 传统断点
  sm: `(min-width: ${breakpoints.sm})`,
  md: `(min-width: ${breakpoints.md})`,
  lg: `(min-width: ${breakpoints.lg})`,
  xl: `(min-width: ${breakpoints.xl})`,
  '2xl': `(min-width: ${breakpoints['2xl']})`,
  
  // 特殊查询
  hover: '(hover: hover)',
  touch: '(hover: none)',
  motion: '(prefers-reduced-motion: no-preference)',
  reducedMotion: '(prefers-reduced-motion: reduce)',
  dark: '(prefers-color-scheme: dark)',
  light: '(prefers-color-scheme: light)',
};