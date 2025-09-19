'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Sparkles,
  Zap,
  Crown,
  Star,
  Check,
  TrendingUp,
  Gift,
  Shield,
  Rocket,
  Heart
} from 'lucide-react';
import { apiClient } from '@/lib/client';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const PACKS = [
  {
    id: 'starter',
    name: 'スターター',
    credits: 50,
    price: 500,
    priceDisplay: '¥500',
    perCredit: 10,
    icon: Sparkles,
    color: 'from-blue-500 to-cyan-500',
    popular: false,
    features: [
      '基本的な画像生成',
      '標準解像度',
      'メールサポート'
    ]
  },
  {
    id: 'pro',
    name: 'プロ',
    credits: 200,
    price: 1800,
    priceDisplay: '¥1,800',
    perCredit: 9,
    originalPrice: 2000,
    discount: 10,
    icon: Zap,
    color: 'from-purple-500 to-pink-500',
    popular: true,
    features: [
      '全てのプリセット利用可',
      '高解像度生成',
      '優先処理',
      'チャットサポート'
    ]
  },
  {
    id: 'studio',
    name: 'スタジオ',
    credits: 600,
    price: 4800,
    priceDisplay: '¥4,800',
    perCredit: 8,
    originalPrice: 6000,
    discount: 20,
    icon: Crown,
    color: 'from-amber-500 to-orange-500',
    popular: false,
    features: [
      '全機能アンロック',
      '最高画質生成',
      '最優先処理',
      '商用利用可',
      '専用サポート'
    ]
  },
];

export default function BillingPage() {
  const [credits, setCredits] = useState<number>(25);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedPack, setSelectedPack] = useState<string | null>(null);

  useEffect(() => {
    loadCredits();
  }, []);

  const loadCredits = async () => {
    try {
      const data = await apiClient.get<{ balance: number }>('/credits');
      setCredits(data.balance);
    } catch (error) {
      // Mock data for demo
      setCredits(25);
    }
  };

  const handlePurchase = async (packId: string) => {
    setIsLoading(true);
    setSelectedPack(packId);

    // Simulate purchase delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    try {
      // Mock success
      const pack = PACKS.find(p => p.id === packId);
      if (pack) {
        setCredits(prev => prev + pack.credits);
        toast.success(
          <div className="flex items-center gap-2">
            <Gift className="h-5 w-5" />
            <span>{pack.credits}クレジットを追加しました！</span>
          </div>
        );
      }
    } catch (error) {
      toast.error('購入に失敗しました');
    } finally {
      setIsLoading(false);
      setSelectedPack(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background/95 to-background">
      <div className="container mx-auto px-4 py-8 space-y-12">
        {/* Hero Section */}
        <div className="text-center space-y-6 py-12 relative">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-accent/5 to-primary/5 blur-3xl -z-10" />

          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20 mb-6">
            <TrendingUp className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium">期間限定！最大20%OFF</span>
          </div>

          <h1 className="text-6xl md:text-7xl font-black gradient-text mb-4">
            クレジットストア
          </h1>

          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            もっと創造的に、もっと自由に。<br />
            あなたのアイデアを無限に広げるクレジットパック
          </p>

          {/* Current Balance Card */}
          <div className="inline-flex items-center gap-6 p-6 rounded-3xl bg-gradient-to-r from-primary/5 to-accent/5 backdrop-blur-xl border border-primary/20 shadow-2xl mt-8">
            <div className="p-4 rounded-2xl bg-gradient-to-br from-primary to-accent shadow-glow">
              <Sparkles className="h-8 w-8 text-white" />
            </div>
            <div className="text-left">
              <p className="text-sm text-muted-foreground mb-1">現在の残高</p>
              <div className="flex items-baseline gap-2">
                <span className="text-5xl font-black gradient-text">{credits}</span>
                <span className="text-xl text-muted-foreground">クレジット</span>
              </div>
            </div>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {PACKS.map((pack) => {
            const Icon = pack.icon;
            const isSelected = selectedPack === pack.id;

            return (
              <div
                key={pack.id}
                className={cn(
                  "relative group",
                  pack.popular && "md:scale-105 z-10"
                )}
              >
                {/* Popular Badge */}
                {pack.popular && (
                  <div className="absolute -top-5 left-0 right-0 flex justify-center z-20">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-primary to-accent text-white text-sm font-bold shadow-glow">
                      <Star className="h-4 w-4 fill-current" />
                      MOST POPULAR
                    </div>
                  </div>
                )}

                <Card
                  className={cn(
                    "h-full transition-all duration-500 overflow-hidden",
                    "hover:shadow-2xl hover:-translate-y-2",
                    pack.popular
                      ? "border-primary/50 shadow-glow bg-gradient-to-b from-primary/5 to-transparent"
                      : "border-border/50 hover:border-primary/30",
                    isSelected && "ring-2 ring-primary animate-pulse"
                  )}
                >
                  <CardHeader className="pb-8 pt-8">
                    {/* Icon */}
                    <div className="flex justify-center mb-6">
                      <div className={cn(
                        "p-5 rounded-3xl bg-gradient-to-br shadow-xl",
                        `${pack.color}`,
                        "group-hover:scale-110 transition-transform duration-300"
                      )}>
                        <Icon className="h-10 w-10 text-white" />
                      </div>
                    </div>

                    {/* Plan Name */}
                    <CardTitle className="text-2xl text-center mb-2">
                      {pack.name}
                    </CardTitle>

                    {/* Credits */}
                    <div className="text-center">
                      <span className={cn(
                        "text-5xl font-black bg-gradient-to-r bg-clip-text text-transparent",
                        pack.color
                      )}>
                        {pack.credits}
                      </span>
                      <span className="text-muted-foreground ml-2">クレジット</span>
                    </div>

                    {/* Price */}
                    <div className="text-center mt-4 space-y-1">
                      {pack.originalPrice && (
                        <div className="text-sm text-muted-foreground line-through">
                          ¥{pack.originalPrice.toLocaleString()}
                        </div>
                      )}
                      <div className="flex items-center justify-center gap-2">
                        <span className="text-3xl font-bold">
                          {pack.priceDisplay}
                        </span>
                        {pack.discount && (
                          <Badge className="bg-red-500/10 text-red-500 border-red-500/20">
                            {pack.discount}%OFF
                          </Badge>
                        )}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        ¥{pack.perCredit}/クレジット
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-6">
                    {/* Features */}
                    <div className="space-y-3">
                      {pack.features.map((feature, i) => (
                        <div key={i} className="flex items-start gap-3">
                          <div className={cn(
                            "mt-1 rounded-full p-1 bg-gradient-to-r",
                            pack.color
                          )}>
                            <Check className="h-3 w-3 text-white" />
                          </div>
                          <span className="text-sm text-muted-foreground">
                            {feature}
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* Purchase Button */}
                    <Button
                      onClick={() => handlePurchase(pack.id)}
                      disabled={isLoading}
                      className={cn(
                        "w-full py-6 text-lg font-bold transition-all duration-300",
                        pack.popular
                          ? "bg-gradient-to-r from-primary to-accent hover:opacity-90 text-white shadow-glow"
                          : "hover:shadow-lg"
                      )}
                      size="lg"
                    >
                      {isLoading && isSelected ? (
                        <div className="flex items-center gap-2">
                          <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                          処理中...
                        </div>
                      ) : (
                        <>
                          <Rocket className="mr-2 h-5 w-5" />
                          今すぐ購入
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              </div>
            );
          })}
        </div>

        {/* Trust Badges */}
        <div className="flex flex-wrap justify-center gap-8 py-12">
          {[
            { icon: Shield, label: '安全な決済', desc: 'SSL暗号化' },
            { icon: Zap, label: '即時反映', desc: 'すぐに使える' },
            { icon: Heart, label: '満足保証', desc: '24時間サポート' },
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-3 px-6 py-3 rounded-2xl bg-muted/50 backdrop-blur">
              <item.icon className="h-5 w-5 text-primary" />
              <div>
                <div className="font-semibold">{item.label}</div>
                <div className="text-xs text-muted-foreground">{item.desc}</div>
              </div>
            </div>
          ))}
        </div>

        {/* FAQ Section */}
        <div className="max-w-4xl mx-auto space-y-6">
          <h2 className="text-3xl font-bold text-center gradient-text mb-8">
            よくある質問
          </h2>

          <div className="grid gap-4">
            {[
              {
                q: 'クレジットの有効期限はありますか？',
                a: 'いいえ、購入したクレジットに有効期限はありません。いつでもご利用いただけます。'
              },
              {
                q: '生成に失敗した場合はどうなりますか？',
                a: 'システムエラーによる生成失敗の場合、クレジットは消費されません。自動的に返還されます。'
              },
              {
                q: '商用利用は可能ですか？',
                a: 'スタジオプランをご利用の場合、生成した画像の商用利用が可能です。'
              }
            ].map((item, i) => (
              <Card key={i} className="border-border/50 hover:border-primary/30 transition-colors">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold">{item.q}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{item.a}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center py-12">
          <Card className="inline-block p-8 bg-gradient-to-r from-primary/10 to-accent/10 border-primary/20">
            <div className="space-y-4">
              <h3 className="text-2xl font-bold">
                初回購入特典で
                <span className="gradient-text"> +10クレジット </span>
                プレゼント！
              </h3>
              <p className="text-muted-foreground">
                今すぐ始めて、AIクリエイティブの可能性を広げましょう
              </p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}