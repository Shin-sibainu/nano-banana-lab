"use client";

import Link from "next/link";
import { Menu, User as UserIcon, LogOut, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { CreditBadge } from "./CreditBadge";
import { useAuth } from "@/components/providers/AuthProvider";
import { createClient } from "@/lib/supabase/client";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { User } from "@supabase/supabase-js";

interface HeaderClientProps {
  user: User | null;
  initialCredits: number;
  initialDisplayName?: string;
  initialAvatarUrl?: string;
}

export function HeaderClient({ user, initialCredits, initialDisplayName, initialAvatarUrl }: HeaderClientProps) {
  const { signOut } = useAuth();
  const [credits, setCredits] = useState<number>(initialCredits);
  const [displayName, setDisplayName] = useState<string | undefined>(initialDisplayName);
  const [avatarUrl, setAvatarUrl] = useState<string | undefined>(initialAvatarUrl);
  const supabase = createClient();

  useEffect(() => {
    if (!user) return;

    // Update state with initial values
    setCredits(initialCredits);
    setDisplayName(initialDisplayName);
    setAvatarUrl(initialAvatarUrl);

    // Subscribe to realtime changes
    const subscription = supabase
      .channel('user_credits')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'users',
          filter: `id=eq.${user.id}`,
        },
        (payload) => {
          if (payload.new) {
            setCredits(payload.new.credits || 0);
            setDisplayName(payload.new.display_name);
            setAvatarUrl(payload.new.avatar_url);
          }
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [user, supabase, initialCredits, initialDisplayName, initialAvatarUrl]);

  return (
    <div className="flex items-center gap-4">
      {user ? (
        <>
          <CreditBadge credits={credits} />

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarImage
                    src={avatarUrl || user.user_metadata?.avatar_url}
                    alt={displayName || user.email || 'User'}
                  />
                  <AvatarFallback className="bg-primary/10">
                    {displayName?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">
                    {displayName || 'ユーザー'}
                  </p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {user.email}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/billing" className="flex items-center cursor-pointer">
                  <CreditCard className="mr-2 h-4 w-4" />
                  <span>クレジット購入</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/history" className="flex items-center cursor-pointer">
                  <UserIcon className="mr-2 h-4 w-4" />
                  <span>生成履歴</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => signOut()}
                className="text-red-600 cursor-pointer"
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span>ログアウト</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </>
      ) : (
        <Link href="/preset/virtual-try-on">
          <Button variant="default" size="sm">
            ログイン
          </Button>
        </Link>
      )}

      <Button variant="ghost" size="icon" className="md:hidden">
        <Menu className="h-4 w-4" />
      </Button>
    </div>
  );
}