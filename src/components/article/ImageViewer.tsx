'use client'

import React, { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import { X, ZoomIn, ZoomOut, RotateCw } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ImageViewerProps {
  isOpen: boolean
  imageSrc: string
  imageAlt?: string
  onClose: () => void
}

export default function ImageViewer({ isOpen, imageSrc, imageAlt, onClose }: ImageViewerProps) {
  const [scale, setScale] = React.useState(1)
  const [rotation, setRotation] = React.useState(0)
  
  // 重置状态
  useEffect(() => {
    if (!isOpen) {
      setScale(1)
      setRotation(0)
    }
  }, [isOpen])
  
  // 键盘操作
  useEffect(() => {
    if (!isOpen) return
    
    const handleKeyDown = (e: KeyboardEvent) => {
      switch(e.key) {
        case 'Escape':
          onClose()
          break
        case '+':
        case '=':
          handleZoomIn()
          break
        case '-':
        case '_':
          handleZoomOut()
          break
        case 'r':
          handleRotate()
          break
      }
    }
    
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])
  
  const handleZoomIn = () => {
    setScale(prev => Math.min(prev + 0.25, 3))
  }
  
  const handleZoomOut = () => {
    setScale(prev => Math.max(prev - 0.25, 0.5))
  }
  
  const handleRotate = () => {
    setRotation(prev => (prev + 90) % 360)
  }
  
  const handleReset = () => {
    setScale(1)
    setRotation(0)
  }
  
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-50 flex items-center justify-center"
          onClick={onClose}
        >
          {/* 背景遮罩 */}
          <div className="absolute inset-0 bg-background/95 backdrop-blur-sm" />
          
          {/* 工具栏 */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="absolute top-6 left-1/2 -translate-x-1/2 flex items-center gap-2 p-2 bg-background/80 backdrop-blur-sm border border-border rounded-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={handleZoomOut}
              disabled={scale <= 0.5}
              className={cn(
                "p-2 rounded-md transition-all duration-200",
                "hover:bg-muted hover:text-foreground",
                scale <= 0.5 && "opacity-50 cursor-not-allowed"
              )}
              title="缩小 (快捷键: -)"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            
            <span className="px-3 text-sm font-mono">
              {Math.round(scale * 100)}%
            </span>
            
            <button
              onClick={handleZoomIn}
              disabled={scale >= 3}
              className={cn(
                "p-2 rounded-md transition-all duration-200",
                "hover:bg-muted hover:text-foreground",
                scale >= 3 && "opacity-50 cursor-not-allowed"
              )}
              title="放大 (快捷键: +)"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            
            <div className="w-px h-6 bg-border mx-1" />
            
            <button
              onClick={handleRotate}
              className="p-2 rounded-md hover:bg-muted hover:text-foreground transition-all duration-200"
              title="旋转 (快捷键: R)"
            >
              <RotateCw className="w-4 h-4" />
            </button>
            
            <button
              onClick={handleReset}
              disabled={scale === 1 && rotation === 0}
              className={cn(
                "px-3 py-1.5 text-sm rounded-md transition-all duration-200",
                "hover:bg-muted hover:text-foreground",
                scale === 1 && rotation === 0 && "opacity-50 cursor-not-allowed"
              )}
            >
              重置
            </button>
          </motion.div>
          
          {/* 关闭按钮 */}
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.3 }}
            onClick={onClose}
            className="absolute top-6 right-6 p-2 rounded-lg bg-background/80 backdrop-blur-sm border border-border hover:bg-muted transition-all duration-200"
            title="关闭 (快捷键: ESC)"
          >
            <X className="w-5 h-5" />
          </motion.button>
          
          {/* 图片容器 */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.3 }}
            className="relative max-w-[90vw] max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <motion.div
              animate={{
                scale,
                rotate: rotation,
              }}
              transition={{
                type: "spring",
                stiffness: 300,
                damping: 30
              }}
              className="relative"
            >
              <img
                src={imageSrc}
                alt={imageAlt || '图片'}
                className="max-w-full max-h-[80vh] object-contain rounded-lg shadow-2xl"
                draggable={false}
              />
            </motion.div>
            
            {/* 图片说明 */}
            {imageAlt && (
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.2 }}
                className="absolute -bottom-10 left-1/2 -translate-x-1/2 text-sm text-muted-foreground bg-background/80 backdrop-blur-sm px-3 py-1 rounded-md"
              >
                {imageAlt}
              </motion.p>
            )}
          </motion.div>
          
          {/* 操作提示 */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-4 text-xs text-muted-foreground"
          >
            <span>ESC 关闭</span>
            <span>+/- 缩放</span>
            <span>R 旋转</span>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}