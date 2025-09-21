import Link from "next/link";
import Image from "next/image";
import { Github, Twitter } from "lucide-react";

export function Footer() {
  return (
    <footer className="mt-auto border-t glass backdrop-blur-xl supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-2">
              <Image
                src="/apple-icon.png"
                alt="Nano Banana Lab"
                width={32}
                height={32}
                className="rounded-lg"
              />
              <span className="font-bold text-lg bg-gradient-to-r from-yellow-400 to-yellow-600 bg-clip-text text-transparent">
                Nano Banana Lab
              </span>
            </Link>
            <p className="text-sm text-muted-foreground">
              AI画像生成の新しい体験。
              Gemini 2.5を活用した最先端の画像生成スタジオ。
            </p>
          </div>

          {/* Product */}
          <div>
            <h3 className="font-semibold mb-4">プロダクト</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/" className="text-muted-foreground hover:text-foreground transition-colors">
                  ギャラリー
                </Link>
              </li>
              <li>
                <Link href="/preset/virtual-try-on" className="text-muted-foreground hover:text-foreground transition-colors">
                  バーチャル試着
                </Link>
              </li>
              <li>
                <Link href="/preset/product-composite" className="text-muted-foreground hover:text-foreground transition-colors">
                  商品合成
                </Link>
              </li>
              <li>
                <Link href="/preset/photo-restoration" className="text-muted-foreground hover:text-foreground transition-colors">
                  写真修復
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="font-semibold mb-4">リソース</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/billing" className="text-muted-foreground hover:text-foreground transition-colors">
                  料金プラン
                </Link>
              </li>
              <li>
                <Link href="/history" className="text-muted-foreground hover:text-foreground transition-colors">
                  生成履歴
                </Link>
              </li>
              <li>
                <a
                  href="https://ai.google.dev/gemini-api/docs"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Gemini API ドキュメント
                </a>
              </li>
            </ul>
          </div>

          {/* Legal & Social */}
          <div>
            <h3 className="font-semibold mb-4">会社情報</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/terms" className="text-muted-foreground hover:text-foreground transition-colors">
                  利用規約
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-muted-foreground hover:text-foreground transition-colors">
                  プライバシーポリシー
                </Link>
              </li>
              <li>
                <Link href="/support" className="text-muted-foreground hover:text-foreground transition-colors">
                  サポート
                </Link>
              </li>
            </ul>

            {/* Social Links */}
            <div className="flex gap-4 mt-6">
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <Github className="h-5 w-5" />
                <span className="sr-only">GitHub</span>
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <Twitter className="h-5 w-5" />
                <span className="sr-only">Twitter</span>
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-8 pt-8 border-t flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-muted-foreground">
            © 2024 Nano Banana Lab. All rights reserved.
          </p>
          <div className="flex gap-4 text-sm">
            <span className="text-muted-foreground">
              Powered by{" "}
              <a
                href="https://ai.google.dev"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                Google Gemini
              </a>
            </span>
            <span className="text-muted-foreground">•</span>
            <span className="text-muted-foreground">
              Built with{" "}
              <a
                href="https://nextjs.org"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                Next.js
              </a>
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}