import { Metadata } from 'next';
import { getPresetById } from '@/lib/presets';
import PresetDetailClient from './page-client';

type Props = {
  params: { id: string }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const preset = getPresetById(params.id);

  if (!preset) {
    return {
      title: 'プリセットが見つかりません - Nano Banana Lab',
      description: '指定されたプリセットは存在しません。',
    };
  }

  const title = `${preset.title} - AI画像生成 | Nano Banana Lab`;
  const description = preset.description ||
    `${preset.title}を使ってAI画像を生成。${preset.tags.join('、')}に最適なプリセットです。`;

  return {
    title,
    description,
    keywords: [
      ...preset.tags,
      'AI画像生成',
      '画像編集',
      preset.title,
      'Gemini',
      'Nano Banana Lab'
    ],
    openGraph: {
      title,
      description,
      images: preset.coverUrl ? [{
        url: preset.coverUrl,
        width: 1200,
        height: 630,
        alt: preset.title
      }] : [{
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Nano Banana Lab'
      }],
      type: 'website',
      siteName: 'Nano Banana Lab',
      locale: 'ja_JP',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: preset.coverUrl ? [preset.coverUrl] : ['/og-image.png'],
      site: '@nanobanalab',
    },
    alternates: {
      canonical: `/preset/${params.id}`,
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
  };
}

export default function PresetDetailPage({ params }: Props) {
  return <PresetDetailClient presetId={params.id} />;
}