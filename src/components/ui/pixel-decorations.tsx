'use client'

import React from 'react'
import { motion } from 'framer-motion'

// 像素游戏机组件
export const PixelGameboy = ({ className = "" }: { className?: string }) => {
  return (
    <motion.div
      animate={{ 
        rotate: [-5, 5, -5],
      }}
      transition={{ 
        duration: 4,
        repeat: Infinity,
        ease: "easeInOut"
      }}
      className={`relative ${className}`}
    >
      <div className="relative">
        {/* 游戏机主体 */}
        <div className="w-16 h-24 bg-gray-300 rounded-sm relative">
          {/* 屏幕 */}
          <div className="absolute top-2 left-2 right-2 h-10 bg-green-200 rounded-sm">
            <div className="absolute top-1 left-1 right-1 bottom-1 bg-green-300"></div>
          </div>
          {/* 方向键 */}
          <div className="absolute bottom-6 left-2">
            <div className="w-2 h-6 bg-gray-600 absolute left-2"></div>
            <div className="w-6 h-2 bg-gray-600 absolute top-2"></div>
          </div>
          {/* A/B按钮 */}
          <div className="absolute bottom-7 right-2 flex gap-1">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

// 像素猫组件
export const PixelCat = ({ className = "" }: { className?: string }) => {
  return (
    <motion.div
      animate={{ 
        y: [0, -5, 0],
      }}
      transition={{ 
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut"
      }}
      className={`relative ${className}`}
    >
      <div className="relative">
        {/* 耳朵 */}
        <div className="flex gap-4 justify-center mb-[-4px]">
          <div className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-b-[8px] border-b-gray-800"></div>
          <div className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-b-[8px] border-b-gray-800"></div>
        </div>
        {/* 头部 */}
        <div className="w-12 h-10 bg-gray-800 rounded-t-lg relative">
          {/* 眼睛 */}
          <div className="absolute top-3 left-2 w-2 h-2 bg-green-400"></div>
          <div className="absolute top-3 right-2 w-2 h-2 bg-green-400"></div>
          {/* 鼻子 */}
          <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-[3px] border-l-transparent border-r-[3px] border-r-transparent border-t-[3px] border-t-pink-400"></div>
        </div>
        {/* 身体 */}
        <div className="w-10 h-8 bg-gray-800 rounded-b mx-auto">
          {/* 肚子 */}
          <div className="w-6 h-4 bg-gray-300 rounded mx-auto mt-1"></div>
        </div>
        {/* 尾巴 */}
        <motion.div 
          animate={{ rotate: [-10, 10, -10] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="absolute -right-3 bottom-2 w-8 h-2 bg-gray-800 rounded-full origin-left"
        ></motion.div>
      </div>
    </motion.div>
  )
}

// 像素蘑菇组件（马里奥风格）
export const PixelMushroom = ({ className = "" }: { className?: string }) => {
  return (
    <motion.div
      animate={{ 
        scale: [1, 1.1, 1],
      }}
      transition={{ 
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut"
      }}
      className={`relative ${className}`}
    >
      <div className="relative">
        {/* 蘑菇帽 */}
        <div className="w-12 h-8 bg-red-500 rounded-t-2xl relative overflow-hidden">
          {/* 白点 */}
          <div className="absolute top-1 left-2 w-3 h-3 bg-white rounded-full"></div>
          <div className="absolute top-2 right-1 w-2 h-2 bg-white rounded-full"></div>
          <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-white rounded-full"></div>
        </div>
        {/* 蘑菇柄 */}
        <div className="w-8 h-6 bg-yellow-100 rounded-b mx-auto">
          {/* 脸 */}
          <div className="flex justify-center gap-2 pt-1">
            <div className="w-1 h-2 bg-black"></div>
            <div className="w-1 h-2 bg-black"></div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

// 像素星星（改进版）
export const PixelStar = ({ className = "", size = "md" }: { className?: string; size?: "sm" | "md" | "lg" }) => {
  const sizeConfig = {
    sm: { container: "w-8 h-8", inner: "w-1 h-1" },
    md: { container: "w-12 h-12", inner: "w-2 h-2" },
    lg: { container: "w-16 h-16", inner: "w-3 h-3" }
  }
  
  const config = sizeConfig[size]
  
  return (
    <motion.div
      animate={{ 
        rotate: [0, 360],
        scale: [1, 1.2, 1]
      }}
      transition={{ 
        rotate: { duration: 20, repeat: Infinity, ease: "linear" },
        scale: { duration: 2, repeat: Infinity, ease: "easeInOut" }
      }}
      className={`relative ${config.container} ${className}`}
    >
      <div className="absolute inset-0 flex items-center justify-center">
        {/* 中心 */}
        <div className={`${config.inner} bg-yellow-400`}></div>
        {/* 四个角 */}
        <div className={`${config.inner} bg-yellow-300 absolute top-0 left-1/2 transform -translate-x-1/2`}></div>
        <div className={`${config.inner} bg-yellow-300 absolute bottom-0 left-1/2 transform -translate-x-1/2`}></div>
        <div className={`${config.inner} bg-yellow-300 absolute left-0 top-1/2 transform -translate-y-1/2`}></div>
        <div className={`${config.inner} bg-yellow-300 absolute right-0 top-1/2 transform -translate-y-1/2`}></div>
      </div>
    </motion.div>
  )
}

// 像素云朵（改进版）
export const PixelCloud = ({ className = "", delay = 0 }: { className?: string; delay?: number }) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: -50 }}
      animate={{ 
        opacity: 1,
        x: [0, 30, 0]
      }}
      transition={{ 
        opacity: { duration: 0.5 },
        x: { duration: 20, repeat: Infinity, delay, ease: "easeInOut" }
      }}
      className={`relative ${className}`}
    >
      <div className="relative">
        {/* 云朵主体由多个圆形组成 */}
        <div className="flex">
          <div className="w-8 h-8 bg-blue-500 rounded-full shadow-md"></div>
          <div className="w-10 h-10 bg-blue-500 rounded-full shadow-md -ml-4 -mt-1"></div>
          <div className="w-12 h-12 bg-blue-500 rounded-full shadow-md -ml-4"></div>
          <div className="w-10 h-10 bg-blue-500 rounded-full shadow-md -ml-4 mt-1"></div>
          <div className="w-8 h-8 bg-blue-500 rounded-full shadow-md -ml-4 mt-2"></div>
        </div>
        {/* 底部 */}
        <div className="absolute bottom-0 left-2 right-2 h-4 bg-blue-500 rounded-full shadow-md"></div>
      </div>
    </motion.div>
  )
}

// 像素心形（改进版）
export const PixelHeart = ({ className = "", animate = true }: { className?: string; animate?: boolean }) => {
  const heartElement = (
    <div className="relative w-12 h-10">
      {/* 左半边 */}
      <div className="absolute top-0 left-0 w-6 h-6 bg-red-500 rounded-full"></div>
      {/* 右半边 */}
      <div className="absolute top-0 right-0 w-6 h-6 bg-red-500 rounded-full"></div>
      {/* 底部三角形 */}
      <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-[12px] border-l-transparent border-r-[12px] border-r-transparent border-t-[12px] border-t-red-500"></div>
    </div>
  )

  if (animate) {
    return (
      <motion.div
        animate={{ 
          scale: [1, 1.2, 1],
        }}
        transition={{ 
          duration: 1,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className={className}
      >
        {heartElement}
      </motion.div>
    )
  }

  return <div className={className}>{heartElement}</div>
}

// 像素树组件
export const PixelTree = ({ className = "" }: { className?: string }) => {
  return (
    <motion.div
      animate={{ 
        rotate: [-2, 2, -2],
      }}
      transition={{ 
        duration: 5,
        repeat: Infinity,
        ease: "easeInOut"
      }}
      className={`relative ${className}`}
    >
      <div className="relative">
        {/* 树冠 - 三层 */}
        <div className="w-0 h-0 border-l-[15px] border-l-transparent border-r-[15px] border-r-transparent border-b-[20px] border-b-green-500 mx-auto"></div>
        <div className="w-0 h-0 border-l-[20px] border-l-transparent border-r-[20px] border-r-transparent border-b-[20px] border-b-green-600 mx-auto -mt-3"></div>
        <div className="w-0 h-0 border-l-[25px] border-l-transparent border-r-[25px] border-r-transparent border-b-[20px] border-b-green-700 mx-auto -mt-3"></div>
        {/* 树干 */}
        <div className="w-6 h-8 bg-amber-700 mx-auto"></div>
      </div>
    </motion.div>
  )
}

// 像素钻石组件
export const PixelDiamond = ({ className = "" }: { className?: string }) => {
  return (
    <motion.div
      animate={{ 
        rotate: [0, 360],
        scale: [0.8, 1, 0.8]
      }}
      transition={{ 
        rotate: { duration: 10, repeat: Infinity, ease: "linear" },
        scale: { duration: 2, repeat: Infinity, ease: "easeInOut" }
      }}
      className={`relative ${className}`}
    >
      <div className="relative w-10 h-12">
        {/* 上部分 */}
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-[20px] border-l-transparent border-r-[20px] border-r-transparent border-b-[15px] border-b-cyan-400"></div>
        {/* 下部分 */}
        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-[20px] border-l-transparent border-r-[20px] border-r-transparent border-t-[25px] border-t-cyan-500"></div>
        {/* 闪光效果 */}
        <motion.div
          animate={{ opacity: [0.3, 1, 0.3] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="absolute top-2 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-white rounded-full"
        ></motion.div>
      </div>
    </motion.div>
  )
}

// 像素火箭组件
export const PixelRocket = ({ className = "" }: { className?: string }) => {
  return (
    <motion.div
      animate={{ 
        y: [-5, 5, -5],
        rotate: [-5, 5, -5]
      }}
      transition={{ 
        duration: 3,
        repeat: Infinity,
        ease: "easeInOut"
      }}
      className={`relative ${className}`}
    >
      <div className="relative">
        {/* 火箭头 */}
        <div className="w-0 h-0 border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent border-b-[15px] border-b-red-500 mx-auto"></div>
        {/* 火箭身 */}
        <div className="w-8 h-16 bg-gray-200 mx-auto relative">
          {/* 窗口 */}
          <div className="absolute top-2 left-1/2 transform -translate-x-1/2 w-4 h-4 bg-blue-400 rounded-full"></div>
        </div>
        {/* 火箭翼 */}
        <div className="absolute bottom-0 -left-2 w-0 h-0 border-t-[10px] border-t-transparent border-b-[10px] border-b-transparent border-r-[8px] border-r-red-600"></div>
        <div className="absolute bottom-0 -right-2 w-0 h-0 border-t-[10px] border-t-transparent border-b-[10px] border-b-transparent border-l-[8px] border-l-red-600"></div>
        {/* 火焰 */}
        <motion.div
          animate={{ scaleY: [1, 1.3, 1], opacity: [0.8, 1, 0.8] }}
          transition={{ duration: 0.3, repeat: Infinity }}
          className="absolute -bottom-4 left-1/2 transform -translate-x-1/2"
        >
          <div className="w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-t-[12px] border-t-orange-500"></div>
          <div className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[8px] border-t-yellow-400 -mt-2 mx-auto"></div>
        </motion.div>
      </div>
    </motion.div>
  )
}

