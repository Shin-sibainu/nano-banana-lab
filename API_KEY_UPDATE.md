# 🔑 Gemini APIキー更新ガイド

## ⚠️ 現在のエラー
```
API key expired. Please renew the API key.
```

現在設定されているAPIキー（AIzaSyC7f3u1Sgf5w6mAM0NrKDVYMFgKWJObzKw）が期限切れまたは無効になっています。

## 🚀 新しいAPIキーの取得方法

### ステップ1: Google AI Studioにアクセス
1. https://aistudio.google.com/app/apikey にアクセス
2. Googleアカウントでログイン

### ステップ2: 新しいAPIキーを生成
1. 「Create API Key」ボタンをクリック
2. プロジェクトを選択：
   - 既存のプロジェクトを選択
   - または「Create API key in new project」を選択

### ステップ3: APIキーをコピー
1. 生成されたAPIキーをコピー
2. 安全な場所に保管（後で必要になります）

### ステップ4: .env.localを更新
```bash
# .env.local
GEMINI_API_KEY=YOUR_NEW_API_KEY_HERE
```

### ステップ5: 開発サーバーを再起動
```bash
# Ctrl+Cで現在のサーバーを停止してから
npm run dev
```

## 📝 重要な注意事項

### 無料プランの制限
- **1分あたり**: 15リクエスト
- **1日あたり**: 1,500リクエスト
- **1分あたりのトークン**: 100万トークン

### 有料プランへのアップグレード
制限に頻繁に達する場合は、有料プラン（Pay-as-you-go）へのアップグレードを検討してください：
- 詳細は `GEMINI_BILLING.md` を参照

## 🔍 APIキーの確認方法

### APIキーが正しく設定されているか確認
1. Google AI Studioの[APIキー管理ページ](https://aistudio.google.com/app/apikey)でステータスを確認
2. 「Active」と表示されていることを確認
3. プロジェクトが正しく関連付けられていることを確認

### トラブルシューティング
- **エラー: API_KEY_INVALID**
  - APIキーが正しくコピーされているか確認
  - 前後に余分なスペースがないか確認
  - APIキーが有効化されているか確認

- **エラー: QUOTA_EXCEEDED**
  - 無料プランの制限に達しています
  - しばらく待つか、有料プランにアップグレード

## 🆘 サポート
- [Google AI Studio サポート](https://ai.google.dev/support)
- [コミュニティフォーラム](https://discuss.ai.google.dev/)