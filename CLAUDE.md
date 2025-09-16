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
- **Primary Model**: Gemini 2.5 Flash (Preview) - Supports image generation
- **Alternative Models**: Imagen 4, Imagen 4 Ultra for advanced use cases

#### Supported Features
1. **Text-to-Image**: Generate images from text descriptions
2. **Image Editing**: Modify existing images with text instructions
3. **Multi-Image Composition**: Combine elements from multiple images (max 3 recommended)
4. **Iterative Refinement**: Adjust results through conversation

#### API Implementation Notes
```typescript
// Example generation endpoint structure
const generateWithGemini = async (prompt: string, images?: string[]) => {
  // API endpoint: https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent
  // Headers: { "Content-Type": "application/json", "x-goog-api-key": API_KEY }
  // Input images should be base64 encoded
  // Response includes generated image in base64 format
};
```

#### Key Considerations
- **Language Support**: Best performance in EN, es-MX, ja-JP, zh-CN, hi-IN
- **Watermarking**: All generated images include SynthID watermark automatically
- **Pricing**: ~1,290 tokens per image generation (¥30 per 1M tokens)
- **Rate Limits**: Consider implementing queue system for production
- **Image Format**: Base64 encoding for input/output images

#### Prompt Best Practices
- Provide specific, detailed descriptions
- Include background context and intent
- Use step-by-step instructions for complex edits
- Iterate with refinement prompts for better results