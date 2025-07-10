/**
 * 统一的动效配置
 * 基于 CLAUDE.md 设计规范
 */

export const animations = {
  // 呼吸动画
  breathe: {
    duration: 4000,
    easing: 'ease-in-out',
    keyframes: [
      { transform: 'scale(1)', opacity: 1 },
      { transform: 'scale(1.02)', opacity: 0.95 },
      { transform: 'scale(1)', opacity: 1 },
    ],
  },

  // 流动过渡
  flow: {
    duration: 800,
    easing: 'cubic-bezier(0.23, 1, 0.32, 1)',
    stagger: 50, // 依次动画延迟
  },

  // 空间移动
  space: {
    duration: 1200,
    easing: 'cubic-bezier(0.85, 0, 0.15, 1)',
    perspective: 1000,
  },

  // 快速过渡
  fast: {
    duration: 150,
    easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
  },

  // 标准过渡
  normal: {
    duration: 300,
    easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
  },

  // 缓慢过渡
  slow: {
    duration: 500,
    easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
  },
};

// Framer Motion 预设动画配置
export const motionPresets = {
  // 淡入动画
  fadeIn: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
    transition: { duration: animations.normal.duration / 1000 },
  },

  // 从底部淡入
  fadeInUp: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: 20 },
    transition: { 
      duration: animations.flow.duration / 1000,
      ease: [0.23, 1, 0.32, 1],
    },
  },

  // 从左侧滑入
  slideInLeft: {
    initial: { opacity: 0, x: -20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 },
    transition: { 
      duration: animations.flow.duration / 1000,
      ease: [0.23, 1, 0.32, 1],
    },
  },

  // 缩放淡入
  scaleIn: {
    initial: { opacity: 0, scale: 0.95 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.95 },
    transition: { 
      duration: animations.normal.duration / 1000,
      ease: [0.4, 0, 0.2, 1],
    },
  },

  // 呼吸效果
  breathe: {
    animate: {
      scale: [1, 1.02, 1],
      opacity: [1, 0.95, 1],
    },
    transition: {
      duration: animations.breathe.duration / 1000,
      ease: animations.breathe.easing,
      repeat: Infinity,
    },
  },

  // 悬浮效果
  hover: {
    whileHover: {
      scale: 1.02,
      transition: {
        duration: animations.fast.duration / 1000,
        ease: [0.4, 0, 0.2, 1],
      },
    },
    whileTap: {
      scale: 0.98,
      transition: {
        duration: animations.fast.duration / 1000,
        ease: [0.4, 0, 0.2, 1],
      },
    },
  },

  // 卡片悬浮效果
  cardHover: {
    whileHover: {
      y: -4,
      boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
      transition: {
        duration: animations.normal.duration / 1000,
        ease: [0.4, 0, 0.2, 1],
      },
    },
  },

  // 容器动画（子元素依次出现）
  container: {
    initial: { opacity: 0 },
    animate: { 
      opacity: 1,
      transition: {
        when: 'beforeChildren',
        staggerChildren: animations.flow.stagger / 1000,
      },
    },
  },

  // 列表项动画
  item: {
    initial: { opacity: 0, y: 20 },
    animate: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: animations.flow.duration / 1000,
        ease: [0.23, 1, 0.32, 1],
      },
    },
  },
};

// 页面过渡动画配置
export const pageTransition = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
  transition: {
    duration: animations.flow.duration / 1000,
    ease: [0.23, 1, 0.32, 1],
  },
};

// 滚动动画触发配置
export const scrollAnimationConfig = {
  viewport: { once: true, margin: '-100px' },
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  transition: {
    duration: animations.flow.duration / 1000,
    ease: [0.23, 1, 0.32, 1],
  },
};

// 微交互配置
export const microInteractions = {
  // 按钮交互
  button: {
    rest: { scale: 1 },
    hover: { scale: 1.05 },
    pressed: { scale: 0.95 },
    transition: {
      type: 'spring',
      stiffness: 400,
      damping: 17,
    },
  },

  // 链接下划线动画
  link: {
    initial: { width: '0%' },
    hover: { width: '100%' },
    transition: {
      duration: animations.normal.duration / 1000,
      ease: [0.4, 0, 0.2, 1],
    },
  },

  // 输入框聚焦
  input: {
    focus: {
      boxShadow: '0 0 0 3px rgba(var(--ring), 0.1)',
      borderColor: 'hsl(var(--ring))',
      transition: {
        duration: animations.fast.duration / 1000,
      },
    },
  },
};

// 检查用户是否偏好减少动画
export const shouldReduceMotion = () => {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};

// 获取动画配置（考虑减少动画偏好）
export const getAnimationConfig = (config: any) => {
  if (shouldReduceMotion()) {
    return {
      ...config,
      transition: { duration: 0 },
    };
  }
  return config;
};