// Badge 组件使用示例

import { Badge } from "@/components/ui/Badge";

export default function BadgeExample() {
  return (
    <div className="p-8 space-y-8">
      {/* 基础用法 */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">基础用法</h3>
        <div className="flex gap-2">
          <Badge>Default</Badge>
          <Badge variant="secondary">Secondary</Badge>
          <Badge variant="success">Success</Badge>
          <Badge variant="warning">Warning</Badge>
          <Badge variant="destructive">Danger</Badge>
          <Badge variant="info">Info</Badge>
        </div>
      </div>

      {/* 不同尺寸 */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">不同尺寸</h3>
        <div className="flex items-center gap-2">
          <Badge size="sm">Small</Badge>
          <Badge size="md">Medium</Badge>
          <Badge size="lg">Large</Badge>
        </div>
      </div>

      {/* 在文章标签中使用 */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">文章标签示例</h3>
        <div className="flex flex-wrap gap-2">
          <Badge variant="info" size="sm">React</Badge>
          <Badge variant="info" size="sm">TypeScript</Badge>
          <Badge variant="info" size="sm">Next.js</Badge>
          <Badge variant="info" size="sm">Tailwind CSS</Badge>
        </div>
      </div>

      {/* 状态标签 */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">状态标签</h3>
        <div className="flex gap-2">
          <Badge variant="success" size="sm">已发布</Badge>
          <Badge variant="warning" size="sm">草稿</Badge>
          <Badge variant="destructive" size="sm">已归档</Badge>
        </div>
      </div>

      {/* 带图标的徽章 */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">带图标的徽章</h3>
        <div className="flex gap-2">
          <Badge variant="success" className="gap-1">
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            完成
          </Badge>
          <Badge variant="info" className="gap-1">
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            提示
          </Badge>
        </div>
      </div>

      {/* 自定义样式 */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">自定义样式</h3>
        <div className="flex gap-2">
          <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0">
            渐变徽章
          </Badge>
          <Badge className="border border-gray-300 dark:border-gray-600 bg-transparent">
            边框徽章
          </Badge>
        </div>
      </div>
    </div>
  );
}