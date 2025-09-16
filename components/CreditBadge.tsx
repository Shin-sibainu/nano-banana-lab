'use client';

import { Coins } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface CreditBadgeProps {
  credits: number;
}

export function CreditBadge({ credits }: CreditBadgeProps) {
  return (
    <Badge variant="secondary" className="flex items-center gap-2 px-4 py-2">
      <Coins className="h-4 w-4" />
      <span className="font-bold text-lg">{credits}</span>
    </Badge>
  );
}