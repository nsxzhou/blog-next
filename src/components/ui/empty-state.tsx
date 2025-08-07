import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Search } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

/**
 * 空状态组件
 * 用于显示列表或内容为空时的占位界面
 * 
 * @param {string} title - 空状态标题
 * @param {string} description - 空状态描述文字
 * @param {string} actionText - 行动按钮文字
 * @param {string} actionUrl - 行动按钮链接
 * @param {React.ReactNode} icon - 自定义图标
 * @param {React.ReactNode} secondaryAction - 次要行动按钮
 */
interface EmptyStateProps {
  title: string;
  description: string;
  actionText?: string;
  actionUrl?: string;
  icon?: React.ReactNode;
  secondaryAction?: React.ReactNode;
  className?: string;
}

export function EmptyState({
  title,
  description,
  actionText,
  actionUrl,
  icon = <FileText className="h-12 w-12 text-muted-foreground" />,
  secondaryAction,
  className
}: EmptyStateProps) {
  return (
    <Card className={cn("w-full", className)}>
      <CardContent className="flex flex-col items-center justify-center p-12 text-center space-y-6">
        {/* 图标 */}
        <div className="p-4">
          {icon}
        </div>

        {/* 文字内容 */}
        <div className="space-y-2">
          <h3 className="text-xl font-semibold tracking-tight">
            {title}
          </h3>
          <p className="text-muted-foreground max-w-md">
            {description}
          </p>
        </div>

        {/* 行动按钮 */}
        {(actionText && actionUrl) && (
          <div className="flex flex-col sm:flex-row gap-3">
            <Button asChild>
              <Link href={actionUrl}>
                {actionText}
              </Link>
            </Button>
            {secondaryAction}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

/**
 * 文章空状态组件
 * 专门用于文章列表为空时的显示
 */
export function PostsEmptyState() {
  return (
    <EmptyState
      title="暂无文章"
      description="目前还没有发布的文章，请稍后再来查看或浏览其他内容。"
      icon={<FileText className="h-12 w-12 text-muted-foreground" />}
    />
  );
}

/**
 * 搜索结果空状态组件
 * 用于搜索结果为空时的显示
 */
export function SearchEmptyState() {
  return (
    <EmptyState
      title="未找到相关内容"
      description="没有找到与您的搜索词匹配的内容，请尝试其他关键词。"
      actionText="查看所有文章"
      actionUrl="/posts"
      icon={<Search className="h-12 w-12 text-muted-foreground" />}
    />
  );
}