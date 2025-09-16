import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '生成履歴',
  description: 'あなたの画像生成履歴。過去の作品を閲覧・ダウンロード・再編集できます。',
  openGraph: {
    title: 'Nano Banana Lab - 生成履歴',
    description: '過去に生成した画像の履歴を管理。お気に入りの作品をいつでも確認。',
    images: ['/og-history.jpg'],
  },
};