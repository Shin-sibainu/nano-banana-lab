"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Coins, CreditCard, TrendingUp, Sparkles, Check } from "lucide-react";
import { toast } from "sonner";

interface BillingClientProps {
  initialCredits: number;
}

const creditPlans = [
  {
    id: "basic",
    name: "ベーシック",
    credits: 100,
    price: 1000,
    originalPrice: 1000,
    discount: 0,
    popular: false,
    features: ["100クレジット", "1クレジット = ¥10", "有効期限なし"],
  },
  {
    id: "standard",
    name: "スタンダード",
    credits: 500,
    price: 4500,
    originalPrice: 5000,
    discount: 10,
    popular: true,
    features: ["500クレジット", "1クレジット = ¥9", "10%お得", "有効期限なし"],
  },
  {
    id: "premium",
    name: "プレミアム",
    credits: 1000,
    price: 8000,
    originalPrice: 10000,
    discount: 20,
    popular: false,
    features: ["1000クレジット", "1クレジット = ¥8", "20%お得", "有効期限なし", "優先サポート"],
  },
];

export default function BillingClient({ initialCredits }: BillingClientProps) {
  const [isLoading, setIsLoading] = useState<string | null>(null);
  const router = useRouter();

  const handlePurchase = async (planId: string) => {
    setIsLoading(planId);

    try {
      // TODO: Stripe決済の実装
      toast.info("決済機能は準備中です");

      // 仮の実装: APIを呼び出して決済処理を開始
      // const response = await apiClient.post('/purchase', { planId });
      // if (response.checkoutUrl) {
      //   window.location.href = response.checkoutUrl;
      // }
    } catch (error) {
      toast.error("購入処理でエラーが発生しました");
    } finally {
      setIsLoading(null);
    }
  };

  return (
    <div className="container max-w-6xl mx-auto py-8 px-4">
      {/* Current Balance */}
      <div className="mb-8 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-2xl p-6 border border-purple-500/20">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-2">現在のクレジット残高</h2>
            <div className="flex items-center gap-2">
              <Coins className="h-8 w-8 text-yellow-500" />
              <span className="text-4xl font-bold">{initialCredits}</span>
              <span className="text-xl text-muted-foreground">クレジット</span>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-muted-foreground mb-1">推定生成可能枚数</p>
            <p className="text-2xl font-semibold">{initialCredits}枚</p>
          </div>
        </div>
      </div>

      {/* Pricing Cards */}
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        {creditPlans.map((plan) => (
          <Card
            key={plan.id}
            className={`relative overflow-hidden transition-all duration-300 hover:scale-105 ${
              plan.popular
                ? "border-gradient-to-r from-purple-500 to-pink-500 shadow-glow"
                : ""
            }`}
          >
            {plan.popular && (
              <div className="absolute top-0 right-0">
                <Badge className="rounded-none rounded-bl-lg bg-gradient-to-r from-purple-500 to-pink-500 text-white px-3 py-1">
                  <Sparkles className="h-3 w-3 mr-1" />
                  人気
                </Badge>
              </div>
            )}

            <CardHeader>
              <CardTitle className="text-2xl">{plan.name}</CardTitle>
              <CardDescription>
                {plan.discount > 0 && (
                  <Badge variant="secondary" className="mb-2">
                    {plan.discount}% OFF
                  </Badge>
                )}
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              <div>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-bold">¥{plan.price.toLocaleString()}</span>
                  {plan.discount > 0 && (
                    <span className="text-lg text-muted-foreground line-through">
                      ¥{plan.originalPrice.toLocaleString()}
                    </span>
                  )}
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  {plan.credits}クレジット
                </p>
              </div>

              <ul className="space-y-2">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-500" />
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>

              <Button
                className={`w-full ${
                  plan.popular
                    ? "bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
                    : ""
                }`}
                variant={plan.popular ? "default" : "outline"}
                onClick={() => handlePurchase(plan.id)}
                disabled={isLoading !== null}
              >
                {isLoading === plan.id ? (
                  "処理中..."
                ) : (
                  <>
                    <CreditCard className="h-4 w-4 mr-2" />
                    購入する
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Info Section */}
      <Card className="bg-muted/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            クレジットについて
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>• 1クレジットで1枚の画像を生成できます</p>
          <p>• クレジットに有効期限はありません</p>
          <p>• まとめて購入するとお得になります</p>
          <p>• 決済は安全なStripeを使用しています</p>
        </CardContent>
      </Card>
    </div>
  );
}