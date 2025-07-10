import { FileX, Search, MessageSquare, Inbox, Image as ImageIcon } from "lucide-react";
import Button from "@/components/ui/Button";

interface EmptyStateProps {
  type: "posts" | "search" | "comments" | "general" | "images";
  message?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export default function EmptyState({ type, message, action }: EmptyStateProps) {
  const config = {
    posts: {
      icon: FileX,
      title: "暂无文章",
      description: message || "这里还没有任何文章，请稍后再来查看。",
    },
    search: {
      icon: Search,
      title: "未找到结果",
      description: message || "尝试使用其他关键词进行搜索。",
    },
    comments: {
      icon: MessageSquare,
      title: "暂无评论",
      description: message || "成为第一个发表评论的人吧！",
    },
    general: {
      icon: Inbox,
      title: "暂无内容",
      description: message || "这里还没有任何内容。",
    },
    images: {
      icon: ImageIcon,
      title: "暂无图片",
      description: message || "还没有上传任何图片。",
    },
  };

  const { icon: Icon, title, description } = config[type];

  return (
    <div className="text-center py-12">
      <Icon className="mx-auto h-12 w-12 text-gray-400" />
      <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">
        {title}
      </h3>
      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
        {description}
      </p>
      {action && (
        <div className="mt-6">
          <Button onClick={action.onClick}>
            {action.label}
          </Button>
        </div>
      )}
    </div>
  );
}