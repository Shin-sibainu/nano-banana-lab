'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Edit, Trash2, Save } from 'lucide-react';
import type { Preset, PresetParam } from '@/lib/types';
import { apiClient } from '@/lib/client';
import { toast } from 'sonner';

export default function AdminPage() {
  const [presets, setPresets] = useState<Preset[]>([]);
  const [editingPreset, setEditingPreset] = useState<Preset | null>(null);
  const [isNewPreset, setIsNewPreset] = useState(false);
  const [yamlMode, setYamlMode] = useState(false);
  const [yamlContent, setYamlContent] = useState('');

  useEffect(() => {
    loadPresets();
  }, []);

  const loadPresets = async () => {
    try {
      const data = await apiClient.get<Preset[]>('/presets');
      setPresets(data);
    } catch (error) {
      console.error('Failed to load presets:', error);
      toast.error('プリセットの読み込みに失敗しました');
    }
  };

  const handleNewPreset = () => {
    const newPreset: Preset = {
      id: '',
      title: '',
      tags: [],
      description: '',
      coverUrl: 'https://placehold.co/400x400?text=New+Preset',
      promptTemplate: '',
      params: [],
    };
    setEditingPreset(newPreset);
    setIsNewPreset(true);
  };

  const handleEditPreset = (preset: Preset) => {
    setEditingPreset({ ...preset });
    setIsNewPreset(false);
    setYamlContent(JSON.stringify(preset, null, 2));
  };

  const handleSavePreset = async () => {
    if (!editingPreset) return;

    try {
      if (yamlMode) {
        const parsedPreset = JSON.parse(yamlContent);
        setEditingPreset(parsedPreset);
      }

      const method = isNewPreset ? 'post' : 'put';
      const endpoint = isNewPreset ? '/presets' : `/presets/${editingPreset.id}`;
      
      await apiClient[method](endpoint, editingPreset);
      
      if (isNewPreset) {
        setPresets(prev => [...prev, editingPreset]);
      } else {
        setPresets(prev => prev.map(p => p.id === editingPreset.id ? editingPreset : p));
      }
      
      setEditingPreset(null);
      toast.success(isNewPreset ? 'プリセットを作成しました' : 'プリセットを更新しました');
    } catch (error) {
      console.error('Save failed:', error);
      toast.error('保存に失敗しました');
    }
  };

  const handleDeletePreset = async (id: string) => {
    if (!confirm('本当に削除しますか？')) return;

    try {
      await apiClient.delete(`/presets/${id}`);
      setPresets(prev => prev.filter(p => p.id !== id));
      toast.success('プリセットを削除しました');
    } catch (error) {
      console.error('Delete failed:', error);
      toast.error('削除に失敗しました');
    }
  };

  const handleParameterChange = (index: number, field: string, value: any) => {
    if (!editingPreset) return;
    
    const newParams = [...editingPreset.params];
    newParams[index] = { ...newParams[index], [field]: value };
    setEditingPreset({ ...editingPreset, params: newParams });
  };

  const addParameter = () => {
    if (!editingPreset) return;
    
    const newParam: PresetParam = {
      id: '',
      label: '',
      type: 'text',
    };
    setEditingPreset({ 
      ...editingPreset, 
      params: [...editingPreset.params, newParam] 
    });
  };

  const removeParameter = (index: number) => {
    if (!editingPreset) return;
    
    const newParams = editingPreset.params.filter((_, i) => i !== index);
    setEditingPreset({ ...editingPreset, params: newParams });
  };

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-6xl font-extrabold gradient-text mb-4">プリセット管理</h1>
          <div className="w-24 h-1 gradient-bg mx-auto rounded-full mb-6"></div>
          <p className="text-muted-foreground text-lg leading-relaxed">
            画像生成プリセットの作成・編集・削除ができます
          </p>
        </div>
        <Button 
          onClick={handleNewPreset}
          className="gradient-animated text-white border-0 shadow-glow hover:shadow-glow-hover hover:scale-105 transition-all duration-300"
        >
          <Plus className="h-4 w-4 mr-2" />
          新規プリセット
        </Button>
      </div>

      <div className="grid gap-6">
        {presets.map(preset => (
          <Card key={preset.id} className="modern-card border-0">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <CardTitle className="text-2xl gradient-text">{preset.title}</CardTitle>
                  <CardDescription className="text-base">{preset.description}</CardDescription>
                  <div className="flex gap-1">
                    {preset.tags.map(tag => (
                      <Badge key={tag} variant="secondary" className="text-xs bg-gradient-to-r from-primary/20 to-accent/20 border-primary/30">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    className="glass border-primary/20 hover:border-primary/40 hover:bg-primary/5 transition-all duration-300"
                    size="sm"
                    onClick={() => handleEditPreset(preset)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    className="glass border-destructive/20 hover:border-destructive/40 hover:bg-destructive/5 transition-all duration-300"
                    size="sm"
                    onClick={() => handleDeletePreset(preset.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="p-3 glass rounded-lg">
                    <strong className="gradient-text">ID:</strong> {preset.id}
                  </div>
                </div>
                <div>
                  <div className="p-3 glass rounded-lg">
                    <strong className="gradient-text">パラメータ数:</strong> {preset.params.length}
                  </div>
                </div>
                <div className="md:col-span-2">
                  <strong className="gradient-text">プロンプトテンプレート:</strong>
                  <div className="mt-2 p-4 glass rounded-xl text-xs font-mono">
                    {preset.promptTemplate.length > 100 
                      ? `${preset.promptTemplate.substring(0, 100)}...` 
                      : preset.promptTemplate
                    }
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Edit Dialog */}
      <Dialog open={!!editingPreset} onOpenChange={() => setEditingPreset(null)}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto modern-card border-0">
          <DialogHeader>
            <DialogTitle className="text-2xl gradient-text">
              {isNewPreset ? '新規プリセット作成' : 'プリセット編集'}
            </DialogTitle>
          </DialogHeader>

          {editingPreset && (
            <Tabs value={yamlMode ? 'yaml' : 'form'} onValueChange={(v) => setYamlMode(v === 'yaml')}>
              <TabsList>
                <TabsTrigger value="form">フォーム</TabsTrigger>
                <TabsTrigger value="yaml">YAML/JSON</TabsTrigger>
              </TabsList>

              <TabsContent value="form" className="space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>ID</Label>
                    <Input
                      value={editingPreset.id}
                      onChange={(e) => setEditingPreset({ ...editingPreset, id: e.target.value })}
                      placeholder="preset-id"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>タイトル</Label>
                    <Input
                      value={editingPreset.title}
                      onChange={(e) => setEditingPreset({ ...editingPreset, title: e.target.value })}
                      placeholder="プリセット名"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>タグ（カンマ区切り）</Label>
                    <Input
                      value={editingPreset.tags.join(', ')}
                      onChange={(e) => setEditingPreset({ 
                        ...editingPreset, 
                        tags: e.target.value.split(',').map(t => t.trim()).filter(Boolean)
                      })}
                      placeholder="人物, 修復"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>カバー画像URL</Label>
                    <Input
                      value={editingPreset.coverUrl}
                      onChange={(e) => setEditingPreset({ ...editingPreset, coverUrl: e.target.value })}
                      placeholder="https://..."
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>説明</Label>
                  <Textarea
                    value={editingPreset.description}
                    onChange={(e) => setEditingPreset({ ...editingPreset, description: e.target.value })}
                    placeholder="プリセットの説明"
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label>プロンプトテンプレート</Label>
                  <Textarea
                    value={editingPreset.promptTemplate}
                    onChange={(e) => setEditingPreset({ ...editingPreset, promptTemplate: e.target.value })}
                    placeholder="${paramId} を使って動的な部分を指定"
                    rows={4}
                  />
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label>パラメータ</Label>
                    <Button type="button" variant="outline" size="sm" onClick={addParameter}>
                      <Plus className="h-4 w-4 mr-2" />
                      追加
                    </Button>
                  </div>

                  {editingPreset.params.map((param, index) => (
                    <Card key={index} className="glass border-primary/20">
                      <CardContent className="p-4">
                        <div className="grid md:grid-cols-4 gap-4 items-start">
                          <Input
                            placeholder="id"
                            value={param.id}
                            onChange={(e) => handleParameterChange(index, 'id', e.target.value)}
                          />
                          <Input
                            placeholder="ラベル"
                            value={param.label}
                            onChange={(e) => handleParameterChange(index, 'label', e.target.value)}
                          />
                          <select
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                            value={param.type}
                            onChange={(e) => handleParameterChange(index, 'type', e.target.value)}
                          >
                            <option value="text">text</option>
                            <option value="select">select</option>
                            <option value="number">number</option>
                            <option value="switch">switch</option>
                            <option value="image">image</option>
                          </select>
                          <Button
                            type="button"
                            variant="outline"
                            className="glass border-destructive/20 hover:border-destructive/40 hover:bg-destructive/5 transition-all duration-300"
                            size="sm"
                            onClick={() => removeParameter(index)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>

                        {param.type === 'select' && (
                          <div className="mt-4">
                            <Input
                              placeholder="選択肢（カンマ区切り）"
                              value={'options' in param ? param.options.join(', ') : ''}
                              onChange={(e) => handleParameterChange(index, 'options', 
                                e.target.value.split(',').map(o => o.trim()).filter(Boolean)
                              )}
                            />
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="yaml" className="space-y-4">
                <Textarea
                  value={yamlContent}
                  onChange={(e) => setYamlContent(e.target.value)}
                  rows={20}
                  className="font-mono text-sm"
                  placeholder="JSON形式でプリセットを編集..."
                />
              </TabsContent>

              <div className="flex gap-2 pt-4">
                <Button 
                  onClick={handleSavePreset}
                  className="gradient-animated text-white border-0 shadow-glow hover:shadow-glow-hover hover:scale-105 transition-all duration-300"
                >
                  <Save className="h-4 w-4 mr-2" />
                  保存
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setEditingPreset(null)}
                  className="glass border-primary/20 hover:border-primary/40 hover:bg-primary/5 transition-all duration-300"
                >
                  キャンセル
                </Button>
              </div>
            </Tabs>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}