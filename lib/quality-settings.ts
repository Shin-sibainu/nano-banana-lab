// 画質設定プリセット
export interface QualityPreset {
  name: string;
  maxSize: number;
  jpegQuality: number;
  maxFileSizeKB: number;
  credits: number;
  description: string;
}

export const QUALITY_PRESETS: Record<string, QualityPreset> = {
  draft: {
    name: "ドラフト",
    maxSize: 512,
    jpegQuality: 0.5,
    maxFileSizeKB: 200,
    credits: 5,
    description: "高速生成・低コスト"
  },
  standard: {
    name: "スタンダード",
    maxSize: 768,
    jpegQuality: 0.65,
    maxFileSizeKB: 300,
    credits: 10,
    description: "バランス重視"
  },
  high: {
    name: "高画質",
    maxSize: 1024,
    jpegQuality: 0.75,
    maxFileSizeKB: 400,
    credits: 20,
    description: "最高品質（制限あり）"
  },
  ultra: {
    name: "ウルトラ",
    maxSize: 1280,
    jpegQuality: 0.8,
    maxFileSizeKB: 500,
    credits: 30,
    description: "プレミアム品質（要注意）"
  }
};

// トークン数の推定
export function estimateTokens(sizeInKB: number): number {
  // 経験則: 1KB ≈ 30-40トークン
  return Math.round(sizeInKB * 35);
}

// 安全性チェック
export function isSafeForAPI(totalSizeKB: number): boolean {
  const estimatedTokens = estimateTokens(totalSizeKB);
  const MAX_TOKENS = 32768;
  const SAFETY_MARGIN = 0.8; // 80%まで

  return estimatedTokens < (MAX_TOKENS * SAFETY_MARGIN);
}

// 推奨品質の取得
export function getRecommendedQuality(imageCount: number = 2): string {
  // 画像数に応じて推奨品質を決定
  if (imageCount >= 3) return "draft";
  if (imageCount === 2) return "standard"; // 現在のデフォルト
  return "high"; // 単一画像なら高画質可能
}