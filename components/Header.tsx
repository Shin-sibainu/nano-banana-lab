"use client";

import Link from "next/link";
import Image from "next/image";
import { Search, Menu, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useEffect, useState } from "react";
import { CreditBadge } from "./CreditBadge";

export function Header() {
  const [credits, setCredits] = useState<number>(25);

  useEffect(() => {
    let mounted = true;
    fetch('/api/credits')
      .then((r) => r.ok ? r.json() : Promise.reject())
      .then((data: { balance: number }) => { if (mounted) setCredits(data.balance); })
      .catch(() => {});
    return () => { mounted = false; };
  }, []);

  return (
    <header className="border-b glass backdrop-blur-xl supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-3 font-bold text-xl group">
            <div className="relative w-10 h-10 rounded-xl overflow-hidden transition-transform group-hover:scale-110">
              <Image
                src="/apple-icon.png"
                alt="Nano Banana Lab"
                width={40}
                height={40}
                className="object-cover"
                priority
              />
            </div>
            <span className="text-2xl font-extrabold bg-gradient-to-r from-yellow-400 to-yellow-600 bg-clip-text text-transparent">
              Nano Banana Lab
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-6">
            <Link href="/" className="text-sm font-medium hover:text-primary">
              ギャラリー
            </Link>
            <Link
              href="/lab"
              className="text-sm font-medium hover:text-primary"
            >
              ラボ
            </Link>
            <Link
              href="/history"
              className="text-sm font-medium hover:text-primary"
            >
              履歴
            </Link>
            <Link
              href="/billing"
              className="text-sm font-medium hover:text-primary"
            >
              課金
            </Link>
            <Link
              href="/admin"
              className="text-sm font-medium hover:text-primary"
            >
              管理
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative hidden md:block">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="プリセットを検索..."
              className="pl-10 w-64 glass border-white/20 focus:border-primary/50"
            />
          </div>

          <CreditBadge credits={credits} />

          <Button variant="ghost" size="icon" className="md:hidden">
            <Menu className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </header>
  );
}
