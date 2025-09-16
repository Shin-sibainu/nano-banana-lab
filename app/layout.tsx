import "./globals.css";
import type { Metadata } from "next";
import { Noto_Sans_JP } from "next/font/google";
import { Header } from "@/components/Header";
import { ConsentDialog } from "@/components/ConsentDialog";
import { Toaster } from "@/components/ui/sonner";

const notoSansJP = Noto_Sans_JP({
  subsets: ["latin"],
  weight: ["300", "400", "500", "700", "900"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Nano Banana Lab - AIクリエイティブスタジオ",
    template: "%s | Nano Banana Lab",
  },
  description:
    "プロフェッショナルなAI画像生成・編集スタジオ。写真修復、スタイル変換、衣装替え、背景置換など、AIの力で画像を自在に加工。誰でも簡単にクリエイティブな作品を制作。",
  keywords: [
    "AI画像生成",
    "AI画像編集",
    "写真修復",
    "スタイル変換",
    "衣装替え",
    "背景置換",
    "AIアート",
    "クリエイティブツール",
    "Gemini API",
    "AI写真加工",
  ],
  authors: [{ name: "Nano Banana Lab Team" }],
  creator: "Nano Banana Lab",
  publisher: "Nano Banana Lab",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL("https://nanobana.lab"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Nano Banana Lab - AIクリエイティブスタジオ",
    description:
      "プロフェッショナルなAI画像生成・編集スタジオ。写真修復、スタイル変換、クリエイティブな画像加工を簡単に実現。",
    url: "https://nanobana.lab",
    siteName: "Nano Banana Lab",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Nano Banana Lab - AIクリエイティブスタジオ",
      },
    ],
    locale: "ja_JP",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Nano Banana Lab - AIクリエイティブスタジオ",
    description: "AI画像生成・編集の新しい体験。写真修復からアート作品まで。",
    images: ["/og-image.jpg"],
    creator: "@nanobanalab",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: [
      { url: "/apple-icon.png" },
      { url: "/apple-icon-180x180.png", sizes: "180x180", type: "image/png" },
    ],
    other: [
      {
        rel: "mask-icon",
        url: "/safari-pinned-tab.svg",
      },
    ],
  },
  manifest: "/site.webmanifest",
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
  },
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#000000" },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body className={notoSansJP.className}>
        <Header />
        <main className="min-h-screen bg-background">{children}</main>
        <ConsentDialog />
        <Toaster />
      </body>
    </html>
  );
}
