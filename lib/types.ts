export type PresetParam =
  | { id: string; label: string; type: "text"; placeholder?: string; required?: boolean }
  | { id: string; label: string; type: "select"; options: string[]; required?: boolean }
  | { id: string; label: string; type: "number"; min?: number; max?: number; step?: number; required?: boolean }
  | { id: string; label: string; type: "switch"; default?: boolean; required?: boolean }
  | { id: string; label: string; type: "image"; required?: boolean };

export type Preset = {
  id: string;
  title: string;
  tags: string[];
  description: string;
  coverUrl: string;
  promptTemplate: string;
  params: PresetParam[];
  sampleInputs?: Record<string, any>;
};

export type Job = {
  id: string;
  presetId?: string;
  inputs: Record<string, any>;
  status: "queued" | "running" | "succeeded" | "failed";
  progress: number;
  resultUrls?: string[];
  createdAt: string;
};

export type Credit = { balance: number };

export type GenerateRequest = {
  presetId?: string;
  prompt?: string;
  inputs: Record<string, any>;
  images?: string[];
  variants?: number;
};

export type ConsentState = {
  personalImages: boolean;
  exifRemoval: boolean;
  generationLabel: boolean;
};

export type ImageData = {
  base64: string;      // Pure base64 string without data URL prefix
  mimeType: string;    // MIME type of the image (e.g., "image/jpeg")
  previewUrl: string;  // Full data URL for preview
};