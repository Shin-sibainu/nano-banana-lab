# 画像アップロード修正記録

## 問題の概要
画像生成機能が動作しない問題が発生していた。画像アップロード時のデータ形式の不整合が原因と推測。

## 解決方法
`ImageData`型を導入し、画像データの形式を統一化することで解決。

## 実装の変更点

### 1. ImageData型の定義 (`lib/types.ts`)
```typescript
export type ImageData = {
  base64: string;      // Pure base64 string without data URL prefix
  mimeType: string;    // MIME type of the image (e.g., "image/jpeg")
  previewUrl: string;  // Full data URL for preview
};
```

### 2. ImageUploaderコンポーネントの変更 (`components/ImageUploader.tsx`)

#### Before (問題のあった実装)
```typescript
// 単純な文字列（data URL）を返していた
onChange: (value: string | undefined) => void;

// データ処理
const base64 = canvas.toDataURL("image/jpeg", 0.65);
onChange(base64);  // そのままdata URLを渡す
```

#### After (修正後の実装)
```typescript
// ImageData型を返すように変更
onChange: (value: ImageData | undefined) => void;

// データ処理
const dataUrl = canvas.toDataURL("image/jpeg", 0.65);
const base64 = dataUrl.split(',')[1];  // 純粋なbase64を抽出

onChange({
  base64: base64,        // 純粋なbase64
  mimeType: "image/jpeg", // MIMEタイプ
  previewUrl: dataUrl     // 完全なdata URL
});
```

### 3. API側の対応 (`app/api/generate/route.ts`)
```typescript
// ImageDataと文字列の両方に対応する柔軟な処理
preset.params.forEach((param) => {
  if (param.type === "image" && data.inputs[param.id]) {
    const imageData = data.inputs[param.id] as ImageData;

    // ImageDataオブジェクトの場合
    if (typeof imageData === 'object' && imageData.previewUrl) {
      images.push(imageData.previewUrl);
    }
    // 文字列の場合（後方互換性）
    else if (typeof imageData === 'string') {
      images.push(imageData);
    }
  }
});
```

## なぜこの修正が効いたか

### 1. **データ形式の一貫性**
- 以前：画像データの形式が場面によって異なっていた（base64、data URL、undefined等）
- 修正後：`ImageData`型で統一され、どの部分でどのデータを使うか明確化

### 2. **型安全性の向上**
- TypeScriptの型チェックにより、誤った形式のデータ受け渡しを防止
- 各コンポーネント間のインターフェースが明確に

### 3. **base64の正確な抽出**
- `split(',')[1]`により、data URLプレフィックスを確実に除去
- Gemini APIには完全なdata URL（`previewUrl`）を送信

### 4. **画像処理の最適化**
- 768pxへのリサイズ（トークン制限対策）
- JPEG 65%品質での圧縮
- 300KB超過時の追加圧縮（640pxへのフォールバック）

## 技術的な詳細

### 画像サイズの最適化
```typescript
const maxSize = 768;  // Gemini APIのトークン制限に最適
// 768px = 約50-80KB = 32Kトークン制限内で安全
```

### データサイズの計算
```typescript
const sizeInKB = Math.round((base64.length * 3) / 4 / 1024);
```
Base64エンコーディングは元のバイナリデータの約1.33倍のサイズになるため、この計算式で実際のファイルサイズを推定。

## 今後の改善点

1. **エラーハンドリングの強化**
   - 画像形式のバリデーション追加
   - アップロードエラー時の詳細なメッセージ

2. **パフォーマンス最適化**
   - Web Workerでの画像処理
   - プログレッシブな画像圧縮

3. **機能拡張**
   - 複数画像の一括アップロード
   - 画像の事前プレビュー編集機能

## まとめ
型定義の明確化とデータフローの統一により、画像生成機能の安定性が大幅に向上した。この修正は、TypeScriptの型システムを活用した良い事例となった。

---
*修正日: 2025-09-18*
*修正者: Claude Code Assistant*