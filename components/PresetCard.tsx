import Image from 'next/image';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Zap } from 'lucide-react';
import type { Preset } from '@/lib/types';
import { QuickGenerateButton } from './QuickGenerateButton';

interface PresetCardProps {
  preset: Preset;
}

export function PresetCard({ preset }: PresetCardProps) {
  return (
    <Card className="modern-card overflow-hidden transition-all duration-500 hover:shadow-glow-hover group border-0 hover:transform-none">
      <div className="aspect-square relative overflow-hidden rounded-t-2xl">
        <Image
          src={preset.coverUrl}
          alt={preset.title}
          fill
          className="object-cover group-hover:scale-110 transition-transform duration-700"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="glass p-2 rounded-full">
            <Zap className="h-4 w-4 text-white" />
          </div>
        </div>
      </div>

      <CardContent className="p-6">
        <h3 className="font-bold text-xl mb-3 group-hover:gradient-text transition-all duration-300">{preset.title}</h3>
        <p className="text-sm text-muted-foreground mb-4 line-clamp-2 leading-relaxed">
          {preset.description}
        </p>

        <div className="flex flex-wrap gap-2">
          {preset.tags.map((tag) => (
            <Badge key={tag} variant="secondary" className="text-xs px-3 py-1 rounded-full bg-gradient-to-r from-primary/10 to-accent/10 border-primary/20">
              {tag}
            </Badge>
          ))}
        </div>
      </CardContent>

      <CardFooter className="p-6 pt-0 flex gap-3">
        <Link href={`/preset/${preset.id}`} className="flex-1">
          <Button variant="outline" className="w-full glass border-primary/20 hover:border-primary/40 hover:bg-primary/5 transition-all duration-300">
            詳細
          </Button>
        </Link>

        <QuickGenerateButton preset={preset} />
      </CardFooter>
    </Card>
  );
}