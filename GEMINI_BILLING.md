# Gemini API 有料プラン設定ガイド 💎

## 📊 現在の状況

無料プランのクォータ制限に達しています：

- **1 分あたりのリクエスト数**: 制限到達
- **1 日あたりのリクエスト数**: 制限到達
- **入力トークン数**: 制限到達

## 🚀 有料プランへのアップグレード手順

### 方法 1: Google AI Studio（推奨・簡単）

1. **Google AI Studio にアクセス**

   - https://aistudio.google.com/app/billing にアクセス
   - Google アカウントでログイン

2. **料金プランを選択**

   - 「Get started」または「Upgrade」をクリック
   - 支払い方法を設定（クレジットカード）

3. **Pay-as-you-go プラン料金**（2024 年現在）

   - **Gemini 2.5 Flash**:
     - 入力: $0.075 / 100 万トークン
     - 出力: $0.30 / 100 万トークン
     - 画像入力: $0.04 / 画像
   - **画像生成**: 約 $0.002 / 画像

4. **新しい API キーを生成**
   - 有料プラン設定後、新しい API キーを生成
   - `.env.local`の GEMINI_API_KEY を更新

### 方法 2: Google Cloud Platform（高度な管理）

1. **Google Cloud Console にアクセス**

   - https://console.cloud.google.com
   - 新規プロジェクトを作成

2. **Vertex AI API を有効化**

   ```bash
   gcloud services enable aiplatform.googleapis.com
   ```

3. **課金アカウントを設定**

   - 「請求先アカウント」から新規作成
   - クレジットカード情報を入力

4. **サービスアカウントと API キーを作成**

   - IAM でサービスアカウントを作成
   - Vertex AI ユーザーロールを付与
   - JSON キーをダウンロード

5. **環境変数を更新**
   ```env
   GOOGLE_APPLICATION_CREDENTIALS=path/to/service-account-key.json
   GOOGLE_CLOUD_PROJECT_ID=your-project-id
   ```

## 💰 料金の目安

### 画像生成のコスト計算

- **1 画像あたり**: 約 1,290 トークン
- **コスト**: 約 $0.0001（約 0.015 円）
- **月 1000 枚生成**: 約 $0.10（約 15 円）
- **月 10000 枚生成**: 約 $1.00（約 150 円）

### 予算アラート設定（推奨）

1. Google Cloud Console で予算アラートを設定
2. 月額上限を設定（例：$10）
3. 50%, 90%, 100%でメール通知

## 🔧 実装の更新

### 1. モデル名の確認

```typescript
// lib/gemini-new.ts
const MODEL_NAME = "gemini-2.5-flash-image"; // 有料版のモデル名
```

### 2. レート制限の対応

```typescript
// リトライロジックの実装
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1秒

async function generateWithRetry(apiKey, prompt, images, retries = 0) {
  try {
    return await generateWithGemini(apiKey, prompt, images);
  } catch (error) {
    if (error.status === 429 && retries < MAX_RETRIES) {
      await new Promise((resolve) =>
        setTimeout(resolve, RETRY_DELAY * Math.pow(2, retries))
      );
      return generateWithRetry(apiKey, prompt, images, retries + 1);
    }
    throw error;
  }
}
```

## 📈 使用量のモニタリング

### Google AI Studio

- https://aistudio.google.com/app/usage
- リアルタイムの使用量確認
- 日別・月別の統計

### Google Cloud Console

- https://console.cloud.google.com/billing
- 詳細な課金レポート
- API ごとの使用量分析

## ⚠️ 注意事項

1. **初回クレジット**: Google Cloud の新規ユーザーは$300 の無料クレジットあり
2. **地域制限**: 一部の国では利用不可
3. **請求サイクル**: 月末締め、翌月請求
4. **自動スケーリング**: 使用量に応じて自動的にスケール

## 🆘 トラブルシューティング

### エラー: "Billing account not configured"

→ 課金アカウントをプロジェクトにリンク

### エラー: "API not enabled"

→ Vertex AI API を有効化

### エラー: "Insufficient permissions"

→ サービスアカウントに適切なロールを付与

## 📞 サポート

- **Google AI Studio サポート**: https://ai.google.dev/support
- **Google Cloud サポート**: https://cloud.google.com/support
- **コミュニティフォーラム**: https://discuss.ai.google.dev/

---

## 次のステップ

1. 上記の方法で有料プランを設定
2. 新しい API キーを`.env.local`に設定
3. 開発サーバーを再起動
4. 画像生成を楽しむ！🎨
