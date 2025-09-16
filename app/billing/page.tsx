'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Coins, Zap, Crown, Star } from 'lucide-react';
import { apiClient } from '@/lib/client';
import { toast } from 'sonner';

const PACKS = [
  {
    id: 'small',
    name: 'Small Pack',
    credits: 50,
    price: '¥500',
    icon: Coins,
    popular: false as const,
    bonus: undefined,
  },
  {
    id: 'pro',
    name: 'Pro Pack',
    credits: 200,
    price: '¥1,800',
    icon: Zap,
    popular: true as const,
    bonus: '10% bonus',
  },
  {
    id: 'studio',
    name: 'Studio Pack',
    credits: 600,
    price: '¥4,800',
    icon: Crown,
    popular: false as const,
    bonus: '20% bonus',
  },
];

export default function BillingPage() {
  const [credits, setCredits] = useState<number>(25);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadCredits();
  }, []);

  const loadCredits = async () => {
    try {
      const data = await apiClient.get<{ balance: number }>('/credits');
      setCredits(data.balance);
    } catch (error) {
      console.error('Failed to load credits:', error);
    }
  };

  const handlePurchase = async (packId: string) => {
    setIsLoading(true);
    try {
      const result = await apiClient.post<{ balance: number }>('/purchase', {
        pack: packId,
      });
      
      setCredits(result.balance);
      toast.success('クレジットパックを購入しました！');
    } catch (error) {
      console.error('Purchase failed:', error);
      toast.error('購入に失敗しました');
    } finally {
      setIsLoading(false);
    }
  };

  const getCreditCost = (action: string) => {
    const costs: Record<string, number> = {
      '基本生成': 1,
      '高解像度生成': 2,
      '人物生成': 3,
      '商業利用': 5,
    };
    return costs[action] || 1;
  };

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      <div className="text-center space-y-6 py-12">
        <h1 className="text-6xl font-extrabold gradient-text mb-4">クレジット & 料金</h1>
        <div className="w-24 h-1 gradient-bg mx-auto rounded-full mb-6"></div>
        <p className="text-muted-foreground max-w-3xl mx-auto text-lg leading-relaxed">
          クレジットを購入して、より多くの画像生成をお楽しみください。用途に応じた最適なパックをお選びいただけます。
        </p>
      </div>

      {/* Current Balance */}
      <Card className="max-w-md mx-auto modern-card border-0">
        <CardHeader className="text-center pb-4">
          <CardTitle className="flex items-center justify-center gap-3 text-2xl">
            <div className="gradient-animated p-3 rounded-full shadow-glow pulse-glow">
              <Coins className="h-6 w-6 text-white" />
            </div>
            現在の残高
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center pb-8">
          <div className="text-6xl font-extrabold gradient-text mb-3">{credits}</div>
          <p className="text-muted-foreground text-lg">クレジット</p>
        </CardContent>
      </Card>

      {/* Credit Packs */}
      <div className="space-y-6">
        <h2 className="text-4xl font-bold text-center gradient-text">クレジットパック</h2>
        
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {PACKS.map((pack) => {
            const Icon = pack.icon;
            return (
              <Card 
                key={pack.id}
                className={`modern-card relative border-0 transition-all duration-500 hover:scale-105 ${
                  pack.popular ? 'shadow-glow-hover ring-2 ring-primary/50' : 'hover:shadow-glow'
                }`}
              >
                {pack.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10">
                    <Badge className="gradient-animated text-white border-0 px-4 py-2 shadow-glow">
                      <Star className="h-3 w-3 mr-1" />
                      人気
                    </Badge>
                  </div>
                )}
                
                <CardHeader className="text-center pb-4">
                  <div className="flex justify-center mb-6">
                    <div className={`p-4 rounded-2xl transition-all duration-300 ${
                      pack.popular ? 'gradient-animated text-white shadow-glow pulse-glow' : 'bg-gradient-to-br from-muted to-muted/50'
                    }`}>
                      <Icon className="h-10 w-10" />
                    </div>
                  </div>
                  <CardTitle className="text-2xl mb-2">{pack.name}</CardTitle>
                  <CardDescription className="text-lg">{pack.credits} クレジット</CardDescription>
                  {pack.bonus && (
                    <Badge variant="secondary" className="w-fit mx-auto mt-2 bg-gradient-to-r from-accent/20 to-primary/20 border-accent/30">
                      {pack.bonus}
                    </Badge>
                  )}
                </CardHeader>
                
                <CardContent className="text-center space-y-6 pb-6">
                  <div className="text-4xl font-extrabold gradient-text">{pack.price}</div>
                  
                  <Button
                    onClick={() => handlePurchase(pack.id)}
                    disabled={isLoading}
                    className={`w-full py-3 text-lg font-semibold transition-all duration-300 ${
                      pack.popular 
                        ? 'gradient-animated text-white border-0 shadow-glow hover:shadow-glow-hover hover:scale-105' 
                        : 'glass border-primary/20 hover:border-primary/40 hover:bg-primary/5'
                    }`}
                  >
                    {isLoading ? '処理中...' : '購入する'}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Usage Guide */}
      <Card className="max-w-3xl mx-auto modern-card border-0">
        <CardHeader>
          <CardTitle className="text-2xl gradient-text">クレジット使用量の目安</CardTitle>
          <CardDescription className="text-lg">
            各機能で消費されるクレジット数
          </CardDescription>
        </CardHeader>
        <CardContent className="p-8">
          <div className="space-y-4">
            {[
              { action: '基本生成', cost: 1, desc: '標準的な画像生成' },
              { action: '高解像度生成', cost: 2, desc: '1024px以上の高品質生成' },
              { action: '人物生成', cost: 3, desc: '人物画像の生成・編集' },
              { action: '商業利用', cost: 5, desc: '商用ライセンス付き生成' },
            ].map(({ action, cost, desc }) => (
              <div key={action} className="flex items-center justify-between py-4 px-4 rounded-xl glass">
                <div>
                  <div className="font-semibold text-lg">{action}</div>
                  <div className="text-muted-foreground">{desc}</div>
                </div>
                <Badge variant="outline" className="gradient-bg text-white border-0 px-4 py-2 text-lg font-bold">
                  {cost} クレジット
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Terms */}
      <div className="text-center text-muted-foreground max-w-3xl mx-auto modern-card p-8 rounded-2xl border-0">
        <p>
          ※ クレジットの有効期限はありません。<br />
          ※ 生成に失敗した場合、クレジットは消費されません。<br />
          ※ 返金・譲渡はできません。利用規約をご確認ください。
        </p>
      </div>
    </div>
  );
}
