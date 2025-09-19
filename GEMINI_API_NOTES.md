# Gemini API 画像生成 - 実装メモ

## 重要な注意事項

### 1. トークン制限（32,768 トークン）

- **これは無料・有料問わず共通の技術的制限**
- 1 枚の高解像度画像は簡単にこの制限を超える
- 複数画像を扱う場合は特に注意

### 2. 画像圧縮の必要性

アップロード前に必ず画像を圧縮する必要があります：

#### 現在の実装設定

- **最大サイズ**: 768px × 768px (改善済み)
- **画像形式**: JPEG
- **品質**: 65%（300KB 超えた場合は640pxに縮小）
- **実装場所**: `components/ImageUploader.tsx`

#### 圧縮後のサイズ例

- 元画像: 数 MB
- 圧縮後: 10-20KB 程度
- 2 枚合計でも 50KB 以下に収まる

### 3. API モデル情報

- **モデル名**: `gemini-2.5-flash-image-preview`
- **パッケージ**: `@google/genai` （NOT @google/generative-ai）
- **呼び出し方法**: `ai.models.generateContent()`

### 4. クォータ制限

#### 無料枠

- ほぼ使用不可（1 リクエストで即制限の報告多数）
- 本番利用は現実的ではない

#### 有料枠

- **500,000 トークン/分**の制限
- **料金**: $30/100 万出力トークン
- **1 画像**: 約 1,290 トークン（約$0.039）

### 5. エラーハンドリング

#### よくあるエラー

1. **Token limit exceeded (32768)**

   - 原因: 画像が大きすぎる
   - 対策: 画像をさらに圧縮

2. **Quota exceeded (429 エラー)**

   - 原因: 1 分間のトークン制限超過
   - 対策: 1 分待つかモック画像を使用

3. **IMAGE_SAFETY**
   - 原因: セーフティフィルターに引っかかった
   - 対策: プロンプトを変更

### 6. 開発時の推奨事項

1. **画像サイズのログ出力**

   ```javascript
   console.log(`Resized image size: ${sizeInKB}KB (${width}x${height})`);
   ```

2. **モック画像フォールバック**

   - API エラー時は `picsum.photos` を使用
   - 開発中のコスト削減にも有効

3. **プロンプトテンプレート**
   ```javascript
   "Change the outfit of the person in ${person} to match the exact outfit shown in ${reference_outfit} while keeping the same face and pose.";
   ```

## トラブルシューティング

### Q: 初回実行でもクォータエラーが出る

A: 以下を確認：

- 同じ API キーが他で使われていないか
- Google AI Studio で使用状況を確認
- プレビューモデルの無料枠制限の可能性

### Q: 画像が生成されない

A: 以下を確認：

- 画像サイズが適切に圧縮されているか（コンソールログ確認）
- API キーが有効か
- ネットワーク接続

### Q: 生成速度が遅い

A: 正常な動作：

- 通常 15-20 秒程度かかる
- 画像 2 枚の処理が含まれるため

## 関連ファイル

- `/lib/gemini-image-gen.ts` - メインの画像生成実装
- `/components/ImageUploader.tsx` - 画像圧縮処理
- `/app/api/generate/route.ts` - API エンドポイント
- `/CLAUDE.md` - 正しい実装方法の詳細

## 更新履歴

- 2025-09-18: 初版作成
- 画像圧縮を 512px、JPEG 50%品質に設定
- トークン制限対策を実装
- 2025-09-18: 画質改善
- 768px、JPEG 65%品質に変更
- APIキー初期化方法を修正
