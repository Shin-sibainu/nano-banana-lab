import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'ラボ',
  description: 'AI画像生成ラボ。カスタムプロンプトで自由に画像を生成・編集。複数の画像を組み合わせた高度な編集も可能。',
  openGraph: {
    title: 'Nano Banana Lab - ラボ',
    description: 'プロンプトを自由に入力して、オリジナルのAI画像を生成。上級者向けの高度な編集機能。',
    images: ['/og-lab.jpg'],
  },
};