'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, useScroll, useTransform, useInView } from 'framer-motion'
import { 
  Mail, 
  Github, 
  Twitter, 
  Linkedin, 
  Globe,
  Calendar,
  MapPin,
  Briefcase,
  GraduationCap,
  Code,
  Sparkles,
  ChevronRight
} from 'lucide-react'
import Button from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import Link from 'next/link'
import Image from 'next/image'

// 技能类型定义
type Skill = {
  name: string
  level: number // 1-5
  category: 'frontend' | 'backend' | 'tool' | 'other'
  icon?: React.ReactNode
}

// 经历类型定义
type Experience = {
  title: string
  company: string
  period: string
  description: string
  type: 'work' | 'education'
}

// 模拟数据
const skills: Skill[] = [
  { name: 'React', level: 5, category: 'frontend' },
  { name: 'Next.js', level: 5, category: 'frontend' },
  { name: 'TypeScript', level: 4, category: 'frontend' },
  { name: 'Tailwind CSS', level: 5, category: 'frontend' },
  { name: 'Node.js', level: 4, category: 'backend' },
  { name: 'Python', level: 3, category: 'backend' },
  { name: 'PostgreSQL', level: 4, category: 'backend' },
  { name: 'Docker', level: 3, category: 'tool' },
  { name: 'Git', level: 5, category: 'tool' },
  { name: 'Figma', level: 3, category: 'tool' },
]

const experiences: Experience[] = [
  {
    title: '全栈开发工程师',
    company: '创新科技有限公司',
    period: '2022.03 - 至今',
    description: '负责公司核心产品的前端架构设计与开发，推动技术栈升级',
    type: 'work'
  },
  {
    title: '前端开发工程师',
    company: '互联网创业公司',
    period: '2020.07 - 2022.02',
    description: '参与多个项目的前端开发，优化用户体验和页面性能',
    type: 'work'
  },
  {
    title: '计算机科学与技术',
    company: '某知名大学',
    period: '2016.09 - 2020.06',
    description: '系统学习计算机基础理论，获得学士学位',
    type: 'education'
  }
]

// 社交链接
const socialLinks = [
  { icon: Github, href: 'https://github.com', label: 'GitHub' },
  { icon: Twitter, href: 'https://twitter.com', label: 'Twitter' },
  { icon: Linkedin, href: 'https://linkedin.com', label: 'LinkedIn' },
  { icon: Mail, href: 'mailto:example@email.com', label: 'Email' },
]

// 技能展示组件
function SkillsSection({ skills }: { skills: Skill[] }) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true })

  const skillsByCategory = skills.reduce((acc, skill) => {
    if (!acc[skill.category]) acc[skill.category] = []
    acc[skill.category].push(skill)
    return acc
  }, {} as Record<string, Skill[]>)

  const categoryLabels = {
    frontend: '前端技术',
    backend: '后端技术',
    tool: '工具与其他',
    other: '其他技能'
  }

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, x: 50 }}
      animate={isInView ? { opacity: 1, x: 0 } : {}}
      transition={{ duration: 0.6 }}
      className="space-y-8"
    >
      <h2 className="text-2xl font-bold mb-6">技能专长</h2>
      
      {Object.entries(skillsByCategory).map(([category, categorySkills], categoryIndex) => (
        <div key={category} className="space-y-4">
          <h3 className="text-lg font-semibold text-muted-foreground">
            {categoryLabels[category as keyof typeof categoryLabels]}
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {categorySkills.map((skill, index) => (
              <motion.div
                key={skill.name}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={isInView ? { opacity: 1, scale: 1 } : {}}
                transition={{ 
                  delay: categoryIndex * 0.1 + index * 0.05,
                  duration: 0.3
                }}
                whileHover={{ scale: 1.05 }}
                className="relative group"
              >
                <div className="p-4 rounded-lg border bg-card hover:shadow-md transition-all cursor-pointer">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">{skill.name}</span>
                    <Code className="w-4 h-4 text-muted-foreground" />
                  </div>
                  {/* 技能等级条 */}
                  <div className="flex gap-1">
                    {[...Array(5)].map((_, i) => (
                      <motion.div
                        key={i}
                        initial={{ width: 0 }}
                        animate={isInView ? { width: '100%' } : {}}
                        transition={{ 
                          delay: categoryIndex * 0.1 + index * 0.05 + i * 0.1,
                          duration: 0.3
                        }}
                        className={`h-1.5 rounded-full overflow-hidden ${
                          i < skill.level ? 'bg-primary' : 'bg-muted'
                        }`}
                        style={{ flex: 1 }}
                      />
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      ))}
    </motion.div>
  )
}

// 时间线组件
function Timeline({ experiences }: { experiences: Experience[] }) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true })

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, x: -50 }}
      animate={isInView ? { opacity: 1, x: 0 } : {}}
      transition={{ duration: 0.6 }}
      className="space-y-8"
    >
      <h2 className="text-2xl font-bold mb-6">个人经历</h2>
      
      <div className="relative">
        {/* 时间线 */}
        <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-border" />
        
        {/* 经历列表 */}
        <div className="space-y-8">
          {experiences.map((exp, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={isInView ? { opacity: 1, x: 0 } : {}}
              transition={{ delay: index * 0.1 }}
              className="relative pl-8"
            >
              {/* 时间点 */}
              <motion.div
                initial={{ scale: 0 }}
                animate={isInView ? { scale: 1 } : {}}
                transition={{ delay: index * 0.1, type: "spring" }}
                className="absolute left-0 w-4 h-4 -translate-x-1/2 bg-background border-2 border-primary rounded-full"
              />
              
              {/* 内容卡片 */}
              <motion.div
                whileHover={{ x: 4 }}
                className="p-4 rounded-lg border bg-card hover:shadow-md transition-all"
              >
                <div className="flex items-start justify-between gap-4 mb-2">
                  <div>
                    <h3 className="font-semibold">{exp.title}</h3>
                    <p className="text-sm text-muted-foreground flex items-center gap-2">
                      {exp.type === 'work' ? 
                        <Briefcase className="w-3 h-3" /> : 
                        <GraduationCap className="w-3 h-3" />
                      }
                      {exp.company}
                    </p>
                  </div>
                  <Badge variant="secondary" className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {exp.period}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  {exp.description}
                </p>
              </motion.div>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  )
}

export default function AboutPage() {
  const containerRef = useRef(null)
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  })

  const backgroundY = useTransform(scrollYProgress, [0, 1], [0, -100])

  return (
    <motion.div
      ref={containerRef}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen relative"
    >
      {/* 背景装饰 */}
      <motion.div
        style={{ y: backgroundY }}
        className="absolute inset-0 -z-10 overflow-hidden"
      >
        <div className="absolute top-20 right-20 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-20 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
      </motion.div>

      <div className="px-6 py-20 md:py-24">
        {/* 分屏布局容器 */}
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 lg:gap-16">
          {/* 左侧：个人信息 */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-8"
          >
            {/* 头像和基本信息 */}
            <div className="space-y-6">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="w-32 h-32 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 p-1"
              >
                <div className="w-full h-full rounded-full bg-background flex items-center justify-center text-4xl font-bold">
                  <Sparkles className="w-16 h-16 text-primary" />
                </div>
              </motion.div>

              <div className="space-y-4">
                <h1 className="text-4xl md:text-5xl font-bold">
                  关于我
                </h1>
                <p className="text-lg text-muted-foreground">
                  全栈开发工程师 / 开源爱好者
                </p>
                <p className="text-muted-foreground flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  中国 · 北京
                </p>
              </div>
            </div>

            {/* 个人介绍 */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="prose prose-neutral dark:prose-invert max-w-none"
            >
              <p>
                热爱编程，专注于构建优雅且高效的应用程序。在前端开发领域有着丰富的经验，
                同时也涉猎后端技术和系统架构设计。
              </p>
              <p>
                相信技术的力量能够改变世界，持续学习新技术，追求代码的简洁与优雅。
                在开源社区活跃，贡献代码并与全球开发者交流学习。
              </p>
              <p>
                除了编程，还喜欢阅读、摄影和旅行。这些爱好让我保持创造力，
                也为我的技术工作带来灵感。
              </p>
            </motion.div>

            {/* 社交链接 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="space-y-4"
            >
              <h3 className="text-lg font-semibold">联系方式</h3>
              <div className="flex flex-wrap gap-3">
                {socialLinks.map((link, index) => (
                  <motion.div
                    key={link.label}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.4 + index * 0.05 }}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Link
                      href={link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-4 py-2 rounded-lg border bg-card hover:bg-accent transition-colors"
                    >
                      <link.icon className="w-4 h-4" />
                      <span className="text-sm font-medium">{link.label}</span>
                    </Link>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* CTA 按钮 */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="pt-4"
            >
              <Link href="/contact">
                <Button size="lg" className="group">
                  与我合作
                  <ChevronRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </motion.div>
          </motion.div>

          {/* 右侧：技能和经历 */}
          <div className="space-y-12">
            <SkillsSection skills={skills} />
            <Timeline experiences={experiences} />
          </div>
        </div>
      </div>
    </motion.div>
  )
}