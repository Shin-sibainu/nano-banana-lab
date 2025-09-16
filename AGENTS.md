# Repository Guidelines

## Project Structure & Module Organization

- `app/`: Next.js App Router pages (`page.tsx`, route folders like `lab/`, `history/`).
- `components/ui/`: Shadcn-style reusable UI primitives (export named + default where applicable).
- `components/`: Higher-level app components (compose from `components/ui`).
- `lib/`: Utilities, types, and client helpers (`utils.ts`, `types.ts`).
- `hooks/`: Reusable React hooks (e.g., `use-toast.ts`).
- `.bolt/`, `.next/`: Tooling and build outputs (do not edit/commit build output).
- Path alias: `@/*` maps to repo root (see `tsconfig.json`). Use `import { cn } from '@/lib/utils'` style imports.

## Build, Test, and Development Commands

- `npm run dev`: Start local dev server at `http://localhost:3000` with HMR.
- `npm run build`: Production build.
- `npm run start`: Run the production server (after `build`).
- `npm run lint`: ESLint checks using `next/core-web-vitals` config.

## Coding Style & Naming Conventions

- Language: TypeScript (strict mode). React + Next.js App Router.
- Linting: ESLint (`.eslintrc.json` extends `next/core-web-vitals`). Fix issues or add minimal, targeted `eslint-disable` comments.
- Formatting: Follow existing style (2-space indent, single quotes, semicolons, trailing commas). Example: `components/ui/button.tsx`.
- Naming: Components use PascalCase exports; files typically kebab-case (`before-after-slider.tsx`). Hooks start with `use-` and export `useFoo`.
- Styling: Tailwind CSS; prefer utility classes over ad-hoc CSS. Use `cn()` from `lib/utils` to merge classes.

## Testing Guidelines

- No test runner is configured yet. For new tests, prefer:
  - Unit: Vitest/Jest + React Testing Library.
  - E2E: Playwright.
- Co-locate tests next to sources with `.test.ts(x)` suffix. Aim for critical-path coverage (routing, forms, complex UI logic).

## Commit & Pull Request Guidelines

- Commits: Clear, imperative subject lines (max ~72 chars). Example: `fix(ui/button): preserve aria attributes`.
- PRs: Include a concise description, linked issues, and screenshots for UI changes. Note any breaking changes and migration steps.
- Keep diffs focused; update docs and types alongside code.

## Security & Configuration Tips

- Use `.env.local` for secrets; never commit `.env*`. Client-exposed vars must be prefixed `NEXT_PUBLIC_`.
- Avoid storing user data in the repo or logs. Review third-party additions for license and bundle impact.

## Agent-Specific Notes

- When adding UI primitives, follow existing Shadcn patterns in `components/ui` and reuse `cn` and variant helpers.
- Do not modify files under `.next/`. Keep imports using the `@/*` alias for consistency.
