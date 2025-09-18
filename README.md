# Nano Banana Lab 🍌

AI Creative Studio - プロフェッショナルなAI画像生成・編集プラットフォーム

## 🚀 機能

- **画像生成**: テキストから高品質な画像を生成
- **画像編集**: 既存画像の編集・変換
- **複数画像合成**: 複数の画像を組み合わせた高度な編集
- **プリセット**: 用途別に最適化された20以上のプリセット
  - 衣装替え
  - 背景置換
  - 写真修復
  - スタイル変換
  - など多数

## 📋 必要条件

- Node.js 18.0以上
- npm または yarn
- Gemini API Key（[Google AI Studio](https://aistudio.google.com/app/apikey)から取得）

## 🛠️ セットアップ

1. **リポジトリのクローン**
```bash
git clone https://github.com/Shin-sibainu/nano-banana-lab.git
cd nano-banana-lab
```

2. **依存関係のインストール**
```bash
npm install
```

3. **環境変数の設定**

`.env.local`ファイルを作成し、Gemini APIキーを設定：

```bash
cp .env.local.example .env.local
```

`.env.local`を編集：
```env
NEXT_PUBLIC_GEMINI_API_KEY=your-actual-gemini-api-key-here
```

4. **開発サーバーの起動**
```bash
npm run dev
```

ブラウザで http://localhost:3000 を開く

## 🔑 Gemini API Keyの取得方法

1. [Google AI Studio](https://aistudio.google.com/app/apikey)にアクセス
2. Googleアカウントでログイン
3. 「Create API Key」をクリック
4. 生成されたAPIキーをコピー
5. `.env.local`ファイルに貼り付け

## 📁 プロジェクト構造

```
banana-lab/
├── app/                    # Next.js App Router
│   ├── api/               # APIエンドポイント
│   ├── lab/               # ラボページ（カスタム生成）
│   ├── preset/[id]/       # プリセット詳細ページ
│   └── ...
├── components/            # Reactコンポーネント
├── lib/                   # ユーティリティ・設定
│   ├── gemini.ts         # Gemini API統合
│   ├── presets.ts        # プリセット定義
│   └── types.ts          # TypeScript型定義
└── public/               # 静的ファイル
```

## 🎨 技術スタック

- **Framework**: Next.js 15 (App Router)
- **UI**: Shadcn/ui + Radix UI
- **Styling**: Tailwind CSS
- **State**: Zustand
- **AI**: Google Gemini API
- **Language**: TypeScript

## 📝 開発コマンド

```bash
npm run dev      # 開発サーバー起動
npm run build    # プロダクションビルド
npm run start    # プロダクションサーバー起動
npm run lint     # ESLint実行
```

## 🚀 デプロイ

### Vercel（推奨）

1. [Vercel](https://vercel.com)にログイン
2. GitHubリポジトリをインポート
3. 環境変数を設定：
   - `NEXT_PUBLIC_GEMINI_API_KEY`
4. デプロイ

## 🤝 コントリビューション

プルリクエストは歓迎します！

## 📄 ライセンス

MIT

## 🙋‍♂️ サポート

Issues: https://github.com/Shin-sibainu/nano-banana-lab/issues