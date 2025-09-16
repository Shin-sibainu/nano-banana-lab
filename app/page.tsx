import type { Metadata } from "next";
import { Search } from "lucide-react";
import { PresetCard } from "@/components/PresetCard";
import { PresetFilters } from "@/components/home/PresetFilters";
import { QuickGenerateDialog } from "@/components/home/QuickGenerateDialog";
import { presets } from "@/lib/presets";

export const metadata: Metadata = {
  title: "ホーム",
  description:
    "Nano Banana Labへようこそ。AI技術を活用した革新的な画像生成・編集プラットフォーム。写真修復、スタイル変換、衣装替え、背景置換など、プロフェッショナルな画像加工を誰でも簡単に。",
  openGraph: {
    title: "Nano Banana Lab - ホーム",
    description: "AI画像生成・編集の新しい体験。豊富なプリセットから選んで、プロレベルの作品を簡単作成。",
    images: ["/og-home.jpg"],
  },
};

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; category?: string; sort?: string }>;
}) {
  const params = await searchParams;
  const searchQuery = params.search || "";
  const selectedCategory = params.category || "all";
  const sortBy = params.sort || "popular";

  // サーバーサイドでフィルタリング
  let filteredPresets = presets;

  if (searchQuery) {
    filteredPresets = filteredPresets.filter(
      (preset) =>
        preset.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        preset.description.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }

  if (selectedCategory !== "all") {
    filteredPresets = filteredPresets.filter((preset) =>
      preset.tags.includes(selectedCategory)
    );
  }

  // ソート処理もサーバーサイドで
  if (sortBy === "newest") {
    filteredPresets = [...filteredPresets].reverse();
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      <div className="text-center space-y-6 py-6">
        <h1 className="text-6xl font-extrabold mb-4">
          🍌Nano Banana🍌 AI画像変換サイト
        </h1>
        <div className="w-24 h-1 bg-primary mx-auto rounded-full mb-6"></div>
        <p className="text-muted-foreground max-w-3xl mx-auto text-lg leading-relaxed">
          GoogleのAI最新モデルを利用した画像変換・修正・複製ツールです。
        </p>
      </div>

      {/* クライアントコンポーネントは最小限に */}
      <PresetFilters
        searchQuery={searchQuery}
        selectedCategory={selectedCategory}
        sortBy={sortBy}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredPresets.map((preset) => (
          <PresetCard key={preset.id} preset={preset} />
        ))}
      </div>

      {filteredPresets.length === 0 && (
        <div className="text-center py-20">
          <div className="modern-card p-12 rounded-3xl max-w-md mx-auto">
            <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="h-8 w-8 text-white" />
            </div>
            <p className="text-muted-foreground text-lg">
              該当するプリセットが見つかりませんでした。
            </p>
          </div>
        </div>
      )}

      {/* ダイアログは別コンポーネントで管理 */}
      <QuickGenerateDialog />
    </div>
  );
}
