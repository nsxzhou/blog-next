'use client'

import React, { useEffect, useState } from 'react'
import { motion, useScroll, useSpring } from 'framer-motion'

export default function ReadingProgress() {
  const [isVisible, setIsVisible] = useState(false)
  const { scrollYProgress } = useScroll()
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  })
  
  // 只在滚动后显示进度条
  useEffect(() => {
    const handleScroll = () => {
      setIsVisible(window.scrollY > 100)
    }
    
    handleScroll()
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])
  
  return (
    <motion.div
      className="fixed top-0 left-0 right-0 z-50 h-[2px] bg-primary/20 origin-left"
      initial={{ opacity: 0 }}
      animate={{ opacity: isVisible ? 1 : 0 }}
      transition={{ duration: 0.3 }}
    >
      <motion.div
        className="h-full bg-primary origin-left"
        style={{ scaleX }}
      />
    </motion.div>
  )
}