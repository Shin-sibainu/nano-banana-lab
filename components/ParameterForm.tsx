'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ImageUploader } from './ImageUploader';
import type { PresetParam } from '@/lib/types';

interface ParameterFormProps {
  params: PresetParam[];
  values: Record<string, any>;
  onChange: (values: Record<string, any>) => void;
  onSubmit?: () => void;
  isGenerating?: boolean;
  canGenerate?: boolean;
}

export function ParameterForm({ 
  params, 
  values, 
  onChange, 
  onSubmit,
  isGenerating = false,
  canGenerate = true
}: ParameterFormProps) {
  const handleValueChange = (paramId: string, value: any) => {
    onChange({ ...values, [paramId]: value });
  };

  const renderParam = (param: PresetParam) => {
    switch (param.type) {
      case 'text':
        return (
          <div key={param.id} className="space-y-2">
            <Label htmlFor={param.id} className="flex items-center gap-1">
              {param.label}
              {param.required && <span className="text-destructive">*</span>}
            </Label>
            <Input
              id={param.id}
              placeholder={param.placeholder}
              value={values[param.id] || ''}
              onChange={(e) => handleValueChange(param.id, e.target.value)}
              required={param.required}
            />
          </div>
        );

      case 'select':
        return (
          <div key={param.id} className="space-y-2">
            <Label htmlFor={param.id} className="flex items-center gap-1">
              {param.label}
              {param.required && <span className="text-destructive">*</span>}
            </Label>
            <Select
              value={values[param.id] || ''}
              onValueChange={(value) => handleValueChange(param.id, value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="選択してください" />
              </SelectTrigger>
              <SelectContent>
                {param.options.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        );

      case 'number':
        return (
          <div key={param.id} className="space-y-2">
            <Label htmlFor={param.id}>{param.label}</Label>
            <Input
              id={param.id}
              type="number"
              min={param.min}
              max={param.max}
              step={param.step}
              value={values[param.id] || param.min || 0}
              onChange={(e) => handleValueChange(param.id, parseInt(e.target.value))}
            />
          </div>
        );

      case 'switch':
        return (
          <div key={param.id} className="flex items-center justify-between">
            <Label htmlFor={param.id}>{param.label}</Label>
            <Switch
              id={param.id}
              checked={values[param.id] ?? param.default ?? false}
              onCheckedChange={(checked) => handleValueChange(param.id, checked)}
            />
          </div>
        );

      case 'image':
        return (
          <div key={param.id} className="space-y-2">
            <Label className="flex items-center gap-1">
              {param.label}
              {param.required && <span className="text-destructive">*</span>}
            </Label>
            <ImageUploader
              value={values[param.id]}
              onChange={(value) => handleValueChange(param.id, value)}
              required={param.required}
            />
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2">
        {params.map(renderParam)}
      </div>
      
      {onSubmit && (
        <Button 
          onClick={onSubmit}
          disabled={isGenerating || !canGenerate}
          className="w-full py-3 text-lg font-semibold gradient-animated text-white border-0 shadow-glow hover:shadow-glow-hover hover:scale-105 transition-all duration-300"
          size="lg"
        >
          {isGenerating ? '生成中...' : '生成する'}
        </Button>
      )}
    </div>
  );
}