"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface DialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
}

const Dialog = ({ open, onOpenChange, children }: DialogProps) => {
  const dialogRef = React.useRef<HTMLDivElement>(null);

  // 处理ESC键关闭
  React.useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onOpenChange(false);
      }
    };

    if (open) {
      document.addEventListener('keydown', handleEscape);
      // 防止背景滚动
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [open, onOpenChange]);

  // 处理点击遮罩层关闭
  const handleBackdropClick = (event: React.MouseEvent) => {
    if (event.target === event.currentTarget) {
      onOpenChange(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* 遮罩层 */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
        onClick={handleBackdropClick}
      />
      
      {/* 对话框内容 */}
      <div
        ref={dialogRef}
        className="relative z-50 w-full max-w-lg mx-4"
        role="dialog"
        aria-modal="true"
        aria-labelledby="dialog-title"
      >
        {children}
      </div>
    </div>
  );
};

/**
 * 对话框内容组件
 */
interface DialogContentProps {
  children: React.ReactNode;
  className?: string;
}

const DialogContent = ({ children, className }: DialogContentProps) => {
  return (
    <div
      className={cn(
        "relative bg-background border border-border rounded-lg shadow-lg p-6",
        "animate-in fade-in-90 zoom-in-90",
        "max-h-[90vh] overflow-y-auto",
        className
      )}
    >
      {children}
    </div>
  );
};

/**
 * 对话框头部组件
 */
interface DialogHeaderProps {
  children: React.ReactNode;
  className?: string;
}

const DialogHeader = ({ children, className }: DialogHeaderProps) => {
  return (
    <div className={cn("flex flex-col space-y-1.5 text-center sm:text-left", className)}>
      {children}
    </div>
  );
};

/**
 * 对话框标题组件
 */
interface DialogTitleProps {
  children: React.ReactNode;
  className?: string;
}

const DialogTitle = ({ children, className }: DialogTitleProps) => {
  return (
    <h2
      id="dialog-title"
      className={cn(
        "text-lg font-semibold leading-none tracking-tight",
        className
      )}
    >
      {children}
    </h2>
  );
};

/**
 * 对话框描述组件
 */
interface DialogDescriptionProps {
  children: React.ReactNode;
  className?: string;
}

const DialogDescription = ({ children, className }: DialogDescriptionProps) => {
  return (
    <p className={cn("text-sm text-muted-foreground", className)}>
      {children}
    </p>
  );
};

/**
 * 对话框底部组件
 */
interface DialogFooterProps {
  children: React.ReactNode;
  className?: string;
}

const DialogFooter = ({ children, className }: DialogFooterProps) => {
  return (
    <div className={cn(
      "flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2",
      "space-y-2 space-y-reverse sm:space-y-0",
      className
    )}>
      {children}
    </div>
  );
};

export {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
};