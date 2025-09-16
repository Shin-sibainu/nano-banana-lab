"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useTransition } from "react";

const CATEGORY_TAGS = [
  { id: "all", label: "全て" },
  { id: "人物", label: "👤 人物" },
  { id: "修復", label: "📷 写真修復" },
  { id: "デザイン", label: "✏️ デザイン" },
  { id: "商品", label: "🛍️ プロダクト" },
  { id: "シーン", label: "🌍 シーン" },
  { id: "アート", label: "🎨 アート" },
];

const SORT_OPTIONS = [
  { id: "popular", label: "人気順" },
  { id: "newest", label: "新着順" },
];

interface PresetFiltersProps {
  searchQuery: string;
  selectedCategory: string;
  sortBy: string;
}

export function PresetFilters({
  searchQuery,
  selectedCategory,
  sortBy,
}: PresetFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const updateSearchParams = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams);
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    startTransition(() => {
      router.push(`/?${params.toString()}`);
    });
  };

  return (
    <div className="modern-card p-6 rounded-2xl flex flex-col lg:flex-row gap-4 items-center">
      <div className="relative flex-1 max-w-md">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="プリセットを検索..."
          defaultValue={searchQuery}
          onChange={(e) => updateSearchParams("search", e.target.value)}
          className={`pl-10 glass border-white/20 focus:border-primary/50 ${
            isPending ? "opacity-60" : ""
          }`}
        />
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        {CATEGORY_TAGS.map((tag) => (
          <Badge
            key={tag.id}
            variant={selectedCategory === tag.id ? "default" : "secondary"}
            className={`cursor-pointer transition-all duration-300 ${
              selectedCategory === tag.id
                ? "bg-primary text-primary-foreground"
                : "hover:bg-muted"
            } ${isPending ? "opacity-60" : ""}`}
            onClick={() => updateSearchParams("category", tag.id === "all" ? "" : tag.id)}
          >
            {tag.label}
          </Badge>
        ))}
      </div>

      <Select
        value={sortBy}
        onValueChange={(value) => updateSearchParams("sort", value)}
      >
        <SelectTrigger className={`w-32 glass border-white/20 ${
          isPending ? "opacity-60" : ""
        }`}>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {SORT_OPTIONS.map((option) => (
            <SelectItem key={option.id} value={option.id}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}