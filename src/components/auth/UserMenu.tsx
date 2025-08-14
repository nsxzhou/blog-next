"use client";

import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { Button } from "@/components/ui/forms/Button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { User, Settings, LogOut } from "lucide-react";
import { ToastHelper } from "@/lib/utils/toast";

export function UserMenu() {
  const { data: session } = useSession();

  if (!session?.user) {
    return null;
  }

  const userInitials = session.user.name
    ? session.user.name.split(' ').map(n => n[0]).join('').toUpperCase()
    : session.user.username?.substring(0, 2).toUpperCase() || 'U';

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <Avatar className="h-8 w-8">
            <AvatarFallback className="text-xs">
              {userInitials}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <div className="flex items-center justify-start gap-2 p-2">
          <div className="flex flex-col space-y-1 leading-none">
            {session.user.name && (
              <p className="font-medium">{session.user.name}</p>
            )}
            <p className="w-[200px] truncate text-sm text-muted-foreground">
              {session.user.username}
            </p>
          </div>
        </div>
        <DropdownMenuSeparator />
        {session.user.role === 'ADMIN' && (
          <>
            <DropdownMenuItem asChild>
              <Link href="/admin" className="flex items-center w-full">
                <Settings className="mr-2 h-4 w-4" />
                <span>管理后台</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
          </>
        )}
        {session.user.role === 'AUTHOR' && (
          <>
            <DropdownMenuItem 
              onClick={() => {
                ToastHelper.info("作者后台功能暂未开放");
              }}
              className="flex items-center"
            >
              <Settings className="mr-2 h-4 w-4" />
              <span>管理后台</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
          </>
        )}
        {/* <DropdownMenuItem asChild>
          <Link href="/profile" className="flex items-center w-full">
            <User className="mr-2 h-4 w-4" />
            <span>个人资料</span>
          </Link>
        </DropdownMenuItem> */}
        <DropdownMenuItem
          onClick={() => {
            ToastHelper.success("已退出登录");
            signOut({ callbackUrl: '/' });
          }}
          className="flex items-center"
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span>退出登录</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}