# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

### Development
```bash
npm run dev      # Start development server on http://localhost:3000
npm run build    # Build production bundle
npm run start    # Start production server
npm run lint     # Run ESLint
```

## Architecture Overview

### Tech Stack
- **Framework**: Next.js 15 with App Router
- **UI Components**: Shadcn UI with Radix UI primitives
- **Styling**: Tailwind CSS with custom theming
- **State Management**: Zustand with persistence
- **Form Handling**: React Hook Form with Zod validation
- **TypeScript**: Strict mode enabled

### Project Structure

#### Core Application Routes (`/app`)
- **Home** (`page.tsx`): Gallery view with preset cards, filtering, and search
- **Lab** (`/lab`): Main generation interface with parameter controls
- **Preset** (`/preset/[id]`): Dynamic preset detail pages
- **History** (`/history`): User generation history
- **Billing** (`/billing`): Credit management and purchases
- **Admin** (`/admin`): Administrative controls

#### API Routes (`/app/api`)
- `/generate`: Image generation endpoint
- `/presets`: Preset management
- `/jobs/[id]`: Job status tracking
- `/credits`: Credit balance management
- `/purchase`: Payment processing
- `/history`: Generation history

#### Key Components
- **ImageUploader**: Drag-and-drop image upload with preview
- **ParameterForm**: Dynamic form generation based on preset parameters
- **BeforeAfterSlider**: Interactive comparison slider
- **JobStatusBar**: Real-time job progress tracking
- **ConsentDialog**: Privacy and consent management
- **CreditBadge**: Credit balance display

#### Type System (`/lib/types.ts`)
- `Preset`: Template configuration with dynamic parameters
- `PresetParam`: Flexible parameter types (text, select, number, switch, image)
- `Job`: Generation job tracking
- `ConsentState`: User consent preferences

#### State Management (`/lib/store.ts`)
- Persistent store using Zustand
- Manages credits, consent states, and UI preferences
- Automatic persistence to localStorage

### Key Features

1. **Dynamic Parameter System**: Presets define flexible parameter types that generate custom UI forms
2. **Consent Management**: Privacy-aware handling of personal images with consent tracking
3. **Credit System**: Token-based generation with balance tracking
4. **Job Queue**: Asynchronous job processing with progress updates
5. **Responsive Design**: Mobile-first with glassmorphism effects

### Development Patterns

- Component files use single default exports
- API routes follow Next.js App Router conventions (route.ts)
- UI components from Shadcn are in `/components/ui`
- Custom business components in `/components`
- Shared utilities in `/lib`
- Path aliases configured: `@/*` maps to root directory

### Next.js App Router Best Practices

1. **Server Components by Default**: Use Server Components wherever possible. Only add `"use client"` when necessary for interactivity, browser APIs, or event handlers
2. **Server Actions**: Prefer Server Actions over API routes for mutations and form submissions
3. **Data Fetching**: Fetch data directly in Server Components without useEffect
4. **URL State Management**: Use searchParams for filters and pagination instead of client state
5. **Component Splitting**: Keep Server Components at the top level, extract client interactivity to small focused components
6. **Streaming & Suspense**: Use loading.tsx and Suspense boundaries for better perceived performance
7. **Parallel Routes**: Leverage parallel data fetching in Server Components
8. **Revalidation**: Use revalidatePath/revalidateTag for on-demand cache updates

### Gemini API Integration (Image Generation Backend)

#### Model Information
- **Primary Model**: `gemini-2.5-flash-image-preview` - Supports native image generation
- **Text Generation Models**: `gemini-2.0-flash-exp`, `gemini-1.5-flash` (text only, no image generation)

#### Correct Implementation (IMPORTANT!)

**正しいパッケージと呼び出し方：**
```typescript
// ✅ CORRECT - Use @google/genai package
import { GoogleGenAI, Modality } from "@google/genai";

// Initialize with API key
const ai = new GoogleGenAI({ apiKey });

// Generate image - MUST use ai.models.generateContent
const response = await ai.models.generateContent({
  model: "gemini-2.5-flash-image-preview",
  contents: promptParts,
});

// Extract generated image
for (const part of response.candidates[0].content.parts) {
  if (part.inlineData && part.inlineData.data) {
    const imageData = part.inlineData.data;
    const mimeType = part.inlineData.mimeType || "image/png";
    return `data:${mimeType};base64,${imageData}`;
  }
}
```

**間違った実装（避けるべき）：**
```typescript
// ❌ WRONG - Don't use @google/generative-ai
import { GoogleGenerativeAI } from "@google/generative-ai";

// ❌ WRONG - Don't use getGenerativeModel
const model = genAI.getGenerativeModel({ model: "..." });
const result = await model.generateContent(parts);
```

#### Package Requirements
```json
{
  "@google/genai": "^1.20.0"  // 正しいパッケージ
  // NOT @google/generative-ai
}
```

#### Supported Features
1. **Text-to-Image**: Generate images from text descriptions
2. **Image Editing**: Modify existing images with text instructions
3. **Multi-Image Composition**: Combine elements from multiple images (max 3 recommended)
4. **Outfit Transfer**: Change clothing while keeping face/pose

#### Key Considerations
- **Language Support**: Best performance in EN, es-MX, ja-JP, zh-CN, hi-IN
- **Watermarking**: All generated images include SynthID watermark automatically
- **Rate Limits**: Free tier has strict limits, consider paid plan
- **Image Format**: Base64 encoding for input/output images
- **API Key**: Get from https://aistudio.google.com/app/apikey

#### Common Errors and Solutions
- **"Cannot read properties of undefined (reading 'generateContent')"**: Wrong package or calling method
- **"API key expired"**: Generate new key at Google AI Studio
- **"Quota exceeded"**: Upgrade to paid plan or wait for reset

#### Prompt Best Practices
- Provide specific, detailed descriptions
- For outfit changes: Specify both source and target clearly
- Use step-by-step instructions for complex edits
- Include style, lighting, and atmosphere details

### Advanced Image Composition (Multi-Image Synthesis)

#### Overview
Gemini 2.5 Flash supports combining elements from multiple images to create complex compositions. This is Nano Banana Lab's core feature for advanced image editing.

#### Capabilities
1. **Element Extraction**: Pull specific objects/people from different images
2. **Style Transfer**: Apply artistic styles from one image to another
3. **Scene Composition**: Combine backgrounds, foregrounds, and subjects
4. **Product Visualization**: Place products in different contexts
5. **Fashion Transfer**: Transfer clothing between models

#### Implementation Guidelines
```typescript
// Multi-image composition example
const composeImages = async (images: string[], instruction: string) => {
  const payload = {
    contents: [{
      parts: [
        ...images.map(img => ({ inline_data: { mime_type: "image/jpeg", data: img }})),
        { text: instruction }
      ]
    }]
  };
  // POST to Gemini API
};
```

#### Composition Strategies
1. **Be Extremely Specific**: Describe exactly which elements from which image
2. **Explain Intent**: Provide context for why you're combining these elements
3. **Use Step-by-Step**: Break complex compositions into sequential instructions
4. **Semantic Negative Prompting**: Specify what NOT to change
5. **Photographic Terminology**: Use camera angles, lighting terms, composition rules

#### Example Prompts
- **Fashion**: "Take the blue dress from image 1 and put it on the model from image 2"
- **Product**: "Place the watch from image 1 on the wrist of the person in image 2"
- **Background**: "Keep the person from image 1 but replace background with scene from image 2"
- **Style**: "Apply the artistic style of image 2 to the photo in image 1"

#### Limitations & Best Practices
- **Max 3 images recommended** for optimal performance
- **Order matters**: Reference images by position (first image, second image)
- **Preserve faces**: Explicitly state when facial features should remain unchanged
- **Lighting consistency**: Request natural lighting adjustments when combining
- **Resolution**: Output maintains quality of input images