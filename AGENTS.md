# Repository Guidelines

## Project Structure & Module Organization
This project uses the Next.js App Router. Keep feature code within route folders and share cross-cutting primitives through the component and util directories.
- `app/`: route segments with `page.tsx`/`layout.tsx`; nest folders like `app/lab/`.
- `components/ui/`: shadcn-style primitives; follow export patterns already in place.
- `components/`: composite widgets that assemble primitives.
- `lib/`: shared helpers and types (`lib/utils.ts`).
- `hooks/`: reusable React hooks (e.g. `use-toast.ts`).
- Path alias `@/*` targets the repo root; prefer `import { cn } from '@/lib/utils'` over relative paths.

## Build, Test, and Development Commands
- `npm run dev` launches the dev server on `http://localhost:3000` with HMR.
- `npm run build` creates the production bundle; run before deploying.
- `npm run start` serves the built app for smoke tests.
- `npm run lint` runs ESLint using `next/core-web-vitals`; resolve warnings or justify exceptions.

## Coding Style & Naming Conventions
Author strict TypeScript with 2-space indent, single quotes, semicolons, and trailing commas (see `components/ui/button.tsx`). Use kebab-case filenames (`before-after-slider.tsx`), PascalCase components, and `use`-prefixed hooks. Rely on Tailwind utility classes; merge conditionals with `cn()`. Keep JSX declarative and avoid manual DOM manipulation.

## Testing Guidelines
No default runner is configured. Add Vitest/Jest + React Testing Library for unit coverage and Playwright for E2E. Co-locate tests beside sources using `.test.ts(x)` suffixes (`button.test.tsx`). Prioritize coverage for routing, form state, and key async flows. Document custom fixtures or setup code in the same folder.

## Commit & Pull Request Guidelines
Write imperative commit subjects under ~72 chars (e.g. `fix(ui/button): preserve aria attributes`). PRs should include a concise summary, linked issues, screenshots for UI changes, migration notes for breaking changes, and manual QA steps when applicable. Keep diffs focused and update docs or types alongside related code.

## Security & Configuration Tips
Store secrets in `.env.local` and keep `.env*` out of git. Client-visible values must be prefixed `NEXT_PUBLIC_`. Audit new dependencies for license and bundle impact, and exclude user data from logs or fixtures.

## Agent-Specific Notes
Do not edit `.next/` or generated artifacts. Follow existing shadcn patterns when extending primitives, reuse variant helpers, and stick with `@/*` imports to avoid brittle relative paths.
