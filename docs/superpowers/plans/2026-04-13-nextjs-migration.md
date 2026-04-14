# Next.js Migration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Migrate directbookinghealthscore.com from React 19 + Vite to Next.js 15 App Router while preserving all UI, functionality, and multi-language support. Deployment target is AWS Amplify Web Compute (connected to GitHub) — NOT GitHub Pages, NOT static export.

**Architecture:** Replace Vite's SPA entry point with Next.js App Router file-based routing. Keep all existing components as `'use client'` components (they all use hooks/localStorage). Replace `import.meta.glob` blog loading with `fs`-based server utilities. Standard Next.js 15 server — Amplify builds from `.next/` output.

## ⚠️ Critical Issues — Must Not Be Missed

### Issue 1 — `'use client'` must be EXPLICIT in every affected file
`ContentContext.tsx` uses `localStorage`. Any component using `localStorage`, `useState`, `useEffect`, `useRouter`, `usePathname`, or any browser API will throw a runtime error in Next.js unless `'use client'` is the **literal first line** of that file. This directive is NOT inherited from parent components — it must be declared in every affected file individually.

### Issue 2 — Amplify BuildSpec must be updated BEFORE merging to main
The current Amplify buildSpec is configured with `baseDirectory: dist` (Vite output). Next.js outputs to `.next`. The AWS admin must run these two commands before merging `nextjs-migration` into main:

```bash
# Update buildSpec to point to .next output
aws amplify update-app \
  --app-id d3v6f1glsnjvmy \
  --build-spec "version: 1\nfrontend:\n  phases:\n    preBuild:\n      commands:\n        - npm ci\n    build:\n      commands:\n        - npm run build\n  artifacts:\n    baseDirectory: .next\n    files:\n      - '**/*'\n  cache:\n    paths:\n      - .next/cache/**/*\n      - node_modules/**/*\n"

# Remove the broken SPA rewrite rule
aws amplify update-app \
  --app-id d3v6f1glsnjvmy \
  --custom-rules "[]"
```

These commands will be repeated at the end of MIGRATION_ERRORS.md as a mandatory pre-merge checklist.

**Tech Stack:** Next.js 15, React 19, TypeScript, Tailwind CSS 4 (`@tailwindcss/postcss`), Google Gemini API, react-markdown, Recharts, Lucide React, html2canvas + jsPDF (CDN)

---

## Current Stack Summary (for agent context)

- **Framework**: React 19 + Vite + `react-router-dom` (BrowserRouter)
- **Entry point**: `index.html` → `index.tsx` → `<App />`
- **Routing**: React Router with 6 routes: `/`, `/hotel-audit`, `/blog`, `/blog/:slug`, `/contact`, `/security`
- **Blog posts**: Loaded via Vite `import.meta.glob('/blog/*.md', { query: '?raw' })` — **must be replaced**
- **Env var**: `import.meta.env.VITE_GEMINI_API_KEY` in `services/geminiService.ts` — **must be renamed**
- **CSS**: Tailwind CSS 4 via `@tailwindcss/vite` plugin — **must switch to `@tailwindcss/postcss`**
- **CDN scripts**: html2canvas + jsPDF in `index.html` — **move to Next.js Script component**
- **Deployment**: AWS Amplify Web Compute, connected to GitHub — pushes to GitHub trigger Amplify builds automatically
- **Current Amplify buildSpec**: points to `dist/` (Vite) — must be updated to `.next/` before merging to main
- **`localStorage`**: Used in `ContentContext.tsx` for language/content persistence — fine with `'use client'`

## File Map

### Files to CREATE
| File | Purpose |
|------|---------|
| `next.config.ts` | Next.js config: standard server setup, `@` alias — NO static export |
| `postcss.config.js` | Tailwind CSS 4 PostCSS config (replaces `@tailwindcss/vite`) |
| `app/layout.tsx` | Root layout: wraps all pages, CDN scripts, ContentProvider, fonts |
| `app/globals.css` | Copy of `index.css` (Tailwind CSS 4 import) |
| `app/page.tsx` | Route `/` → renders `<Home>` |
| `app/hotel-audit/page.tsx` | Route `/hotel-audit` → renders `<AuditTool>` |
| `app/blog/page.tsx` | Route `/blog` → renders `<Blog>` (reads posts server-side) |
| `app/blog/[slug]/page.tsx` | Route `/blog/:slug` → renders `<BlogPost>`, `generateStaticParams` |
| `app/contact/page.tsx` | Route `/contact` → renders `<Contact>` |
| `app/security/page.tsx` | Route `/security` → renders `<Security>` |
| `lib/blog.ts` | Server-side blog utilities: `getAllPosts()`, `getPostBySlug()` using `fs` |
| `components/AppShell.tsx` | Client component: header + footer + nav (extracted from `App.tsx`) |

### Files to MODIFY
| File | What changes |
|------|-------------|
| `package.json` | Remove Vite deps, add Next.js; update scripts |
| `tsconfig.json` | Replace `vite/client` types with `next`, update `moduleResolution`, remove `allowImportingTsExtensions` |
| `services/geminiService.ts` | `import.meta.env.VITE_GEMINI_API_KEY` → `process.env.NEXT_PUBLIC_GEMINI_API_KEY` |
| `contexts/ContentContext.tsx` | Add `'use client'` directive at top |
| `components/AuditTool.tsx` | Add `'use client'` directive |
| `components/Blog.tsx` | Add `'use client'`; remove `import.meta.glob`; accept `posts` as prop |
| `components/BlogPost.tsx` | Add `'use client'`; remove `import.meta.glob`; accept `content` as prop |
| `components/Home.tsx` | Add `'use client'` |
| `components/Contact.tsx` | Add `'use client'` |
| `components/Security.tsx` | Add `'use client'` |
| `components/WelcomeScreen.tsx` | Add `'use client'` |
| `components/Quiz.tsx` | Add `'use client'` |
| `components/Results.tsx` | Add `'use client'` |
| `components/FullResults.tsx` | Add `'use client'` |
| `components/Editable.tsx` | Add `'use client'` |
| `components/Button.tsx` | Add `'use client'` (if it uses hooks; check first) |
| `components/LeadCapture.tsx` | Add `'use client'` |
| `.github/workflows/deploy.yml` | Replace Vite build env var with `NEXT_PUBLIC_GEMINI_API_KEY`; use `next build` |
| `.env.example` | Rename `VITE_GEMINI_API_KEY` → `NEXT_PUBLIC_GEMINI_API_KEY` |

### Files to DELETE (after build passes)
| File | Reason |
|------|--------|
| `vite.config.ts` | Replaced by `next.config.ts` |
| `index.html` | Replaced by `app/layout.tsx` |
| `index.tsx` | Replaced by `app/layout.tsx` |
| `App.tsx` | Routing replaced by file-based routing; nav extracted to `AppShell.tsx` |

---

## Phase 1 — Audit (Agent 2)

### Task 1: Code Audit → MIGRATION_ERRORS.md

**Files:**
- Create: `MIGRATION_ERRORS.md` at repo root

- [ ] **Step 1: Scan every file and produce MIGRATION_ERRORS.md**

Scan all files below and write every issue in this exact format:
```
FILE: [filepath] | LINE: [line number or N/A] | TYPE: [error type] | ISSUE: [description] | FIX: [what needs to change]
```

Issues to report (minimum — add any others found):

```
FILE: vite.config.ts | LINE: N/A | TYPE: ViteConfig | ISSUE: Vite-specific config file, incompatible with Next.js | FIX: Delete file and create next.config.ts with output: 'export', images.unoptimized: true, and @ alias
FILE: index.html | LINE: N/A | TYPE: ViteEntry | ISSUE: Vite HTML entry point not used by Next.js | FIX: Delete file; migrate CDN scripts (html2canvas, jsPDF, html2pdf, Google Fonts) to app/layout.tsx using next/script
FILE: index.tsx | LINE: N/A | TYPE: ViteEntry | ISSUE: Vite/ReactDOM entry point not used by Next.js | FIX: Delete file; create app/layout.tsx as root layout with ContentProvider and BrowserRouter removed
FILE: App.tsx | LINE: 2 | TYPE: ReactRouter | ISSUE: imports Routes, Route, Navigate, useNavigate, useLocation, useParams from react-router-dom | FIX: Delete App.tsx; extract header/footer/nav to components/AppShell.tsx using next/navigation (useRouter, usePathname) and next/link
FILE: App.tsx | LINE: 188-196 | TYPE: ReactRouter | ISSUE: React Router <Routes> and <Route> define all app routing | FIX: Replace with Next.js App Router file-based routing: create app/page.tsx, app/hotel-audit/page.tsx, app/blog/page.tsx, app/blog/[slug]/page.tsx, app/contact/page.tsx, app/security/page.tsx
FILE: components/Blog.tsx | LINE: 28 | TYPE: ViteGlob | ISSUE: import.meta.glob('/blog/*.md', { query: '?raw', import: 'default', eager: true }) is Vite-specific | FIX: Remove import.meta.glob; accept posts as a prop passed from server component in app/blog/page.tsx which uses lib/blog.ts with fs.readFileSync
FILE: components/BlogPost.tsx | LINE: 21 | TYPE: ViteGlob | ISSUE: import.meta.glob('/blog/*.md', { query: '?raw', import: 'default', eager: true }) is Vite-specific | FIX: Remove import.meta.glob; accept rawContent prop passed from app/blog/[slug]/page.tsx server component
FILE: services/geminiService.ts | LINE: 66 | TYPE: EnvVar | ISSUE: import.meta.env.VITE_GEMINI_API_KEY is Vite-specific env var syntax | FIX: Replace with process.env.NEXT_PUBLIC_GEMINI_API_KEY
FILE: package.json | LINE: N/A | TYPE: PackageScripts | ISSUE: Scripts use vite commands; gh-pages deploy no longer needed | FIX: Replace scripts: dev→"next dev", build→"next build", lint→"tsc --noEmit", preview→"next start", deploy→remove or keep for reference
FILE: package.json | LINE: N/A | TYPE: PackageDeps | ISSUE: vite, @vitejs/plugin-react, @tailwindcss/vite listed as dependencies | FIX: Remove vite, @vitejs/plugin-react, @tailwindcss/vite, gh-pages; add next@15, @tailwindcss/postcss
FILE: tsconfig.json | LINE: 14 | TYPE: TSConfig | ISSUE: types includes "vite/client" which does not exist in Next.js | FIX: Replace "vite/client" with "next" in types array; change moduleResolution to "node" or "bundler"; remove allowImportingTsExtensions
FILE: tsconfig.json | LINE: 19 | TYPE: TSConfig | ISSUE: allowImportingTsExtensions: true requires noEmit, conflicts with Next.js build | FIX: Remove allowImportingTsExtensions
FILE: contexts/ContentContext.tsx | LINE: 1 | TYPE: ClientComponent | ISSUE: Uses localStorage, useState — must be client component in Next.js | FIX: Add 'use client' at top of file
FILE: components/AuditTool.tsx | LINE: 1 | TYPE: ClientComponent | ISSUE: Uses useState — must be client component | FIX: Add 'use client' at top of file
FILE: components/Home.tsx | LINE: 1 | TYPE: ClientComponent | ISSUE: Uses useContent hook (client context) — must be client component | FIX: Add 'use client' at top of file
FILE: components/Blog.tsx | LINE: 1 | TYPE: ClientComponent | ISSUE: Uses useContent, useMemo — must be client component | FIX: Add 'use client' at top of file
FILE: components/BlogPost.tsx | LINE: 1 | TYPE: ClientComponent | ISSUE: Uses useContent, useMemo — must be client component | FIX: Add 'use client' at top of file
FILE: components/Contact.tsx | LINE: 1 | TYPE: ClientComponent | ISSUE: Likely uses hooks or context — must be client component | FIX: Add 'use client' at top of file
FILE: components/Security.tsx | LINE: 1 | TYPE: ClientComponent | ISSUE: Likely uses hooks or context — must be client component | FIX: Add 'use client' at top of file
FILE: components/WelcomeScreen.tsx | LINE: 1 | TYPE: ClientComponent | ISSUE: Uses hooks/context | FIX: Add 'use client' at top of file
FILE: components/Quiz.tsx | LINE: 1 | TYPE: ClientComponent | ISSUE: Uses hooks | FIX: Add 'use client' at top of file
FILE: components/Results.tsx | LINE: 1 | TYPE: ClientComponent | ISSUE: Uses hooks | FIX: Add 'use client' at top of file
FILE: components/FullResults.tsx | LINE: 1 | TYPE: ClientComponent | ISSUE: Uses hooks | FIX: Add 'use client' at top of file
FILE: components/Editable.tsx | LINE: 1 | TYPE: ClientComponent | ISSUE: Uses context/hooks | FIX: Add 'use client' at top of file
FILE: components/LeadCapture.tsx | LINE: 1 | TYPE: ClientComponent | ISSUE: Likely uses hooks | FIX: Add 'use client' at top of file
FILE: .github/workflows/deploy.yml | LINE: 24 | TYPE: EnvVar | ISSUE: Workflow passes VITE_GEMINI_API_KEY to build — env var name will be wrong | FIX: Rename to NEXT_PUBLIC_GEMINI_API_KEY in env block; update run step to use next build
FILE: .env.example | LINE: N/A | TYPE: EnvVar | ISSUE: Documents VITE_ prefixed variable | FIX: Rename to NEXT_PUBLIC_GEMINI_API_KEY
FILE: public/404.html | LINE: N/A | TYPE: StaticAsset | ISSUE: GitHub Pages 404 redirect hack in index.html is no longer needed with Next.js static export | FIX: Keep file but remove the redirect script from layout.tsx (it was in index.html head)
FILE: index.css | LINE: N/A | TYPE: CSSEntry | ISSUE: CSS entry file needs to be at app/globals.css for Next.js | FIX: Copy contents to app/globals.css and import from app/layout.tsx
```

---

## Phase 2 — Fixes (Agent 3)

Work through MIGRATION_ERRORS.md line by line. Mark each line `FIXED: ✅` after completing it.

### Task 2: Update package.json

**Files:**
- Modify: `package.json`

- [ ] **Step 1: Update package.json scripts and dependencies**

Replace the entire `scripts` and relevant `dependencies`/`devDependencies` blocks:

```json
{
  "name": "direct-booking-health-score",
  "private": true,
  "version": "1.0.0",
  "homepage": "https://directbookinghealthscore.com",
  "description": "Professional hotel technology and marketing audit tool with AI-powered strategic assessments.",
  "author": "Bookassist",
  "license": "MIT",
  "type": "module",
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "tsc --noEmit"
  },
  "dependencies": {
    "@google/genai": "^1.30.0",
    "@tailwindcss/postcss": "^4.2.1",
    "lucide-react": "^0.554.0",
    "next": "^15.3.0",
    "react": "^19.2.0",
    "react-dom": "^19.2.0",
    "react-markdown": "^10.1.0",
    "react-router-dom": "^7.13.2",
    "recharts": "^3.4.1",
    "tailwindcss": "^4.2.1"
  },
  "devDependencies": {
    "@types/node": "^22.14.0",
    "@types/react": "^19.0.0",
    "@types/react-dom": "^19.0.0",
    "typescript": "~5.8.2"
  }
}
```

Note: `react-router-dom` is removed — Next.js App Router replaces it entirely.

- [ ] **Step 2: Mark package.json lines in MIGRATION_ERRORS.md as FIXED: ✅**

### Task 3: Create next.config.ts

**Files:**
- Create: `next.config.ts`

- [ ] **Step 1: Create next.config.ts**

```typescript
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
  webpack(config) {
    config.module.rules.push({
      test: /\.md$/,
      type: 'asset/source',
    });
    return config;
  },
};

export default nextConfig;
```

- [ ] **Step 2: Mark vite.config.ts lines in MIGRATION_ERRORS.md as FIXED: ✅**

### Task 4: Create postcss.config.js

**Files:**
- Create: `postcss.config.js`

- [ ] **Step 1: Create postcss.config.js**

```javascript
export default {
  plugins: {
    '@tailwindcss/postcss': {},
  },
};
```

### Task 5: Update tsconfig.json

**Files:**
- Modify: `tsconfig.json`

- [ ] **Step 1: Replace tsconfig.json content**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": false,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "ESNext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "paths": {
      "@/*": ["./*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

- [ ] **Step 2: Mark tsconfig.json lines in MIGRATION_ERRORS.md as FIXED: ✅**

### Task 6: Create lib/blog.ts (server-side blog utilities)

**Files:**
- Create: `lib/blog.ts`

This replaces all `import.meta.glob` usage in `Blog.tsx` and `BlogPost.tsx`.

- [ ] **Step 1: Create lib/blog.ts**

```typescript
import fs from 'fs';
import path from 'path';

export interface BlogPost {
  slug: string;
  title: string;
  date: string;
  excerpt: string;
  image: string;
  lang: string;
  baseSlug: string;
}

export interface BlogPostContent {
  data: Record<string, string>;
  body: string;
}

const BLOG_DIR = path.join(process.cwd(), 'blog');

function parseFrontmatter(content: string): { data: Record<string, string>; body: string } {
  const match = content.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
  if (!match) return { data: {}, body: content };
  const data: Record<string, string> = {};
  match[1].split('\n').forEach(line => {
    const colonIdx = line.indexOf(':');
    if (colonIdx === -1) return;
    const key = line.slice(0, colonIdx).trim();
    const value = line.slice(colonIdx + 1).trim().replace(/^"|"$/g, '');
    data[key] = value;
  });
  return { data, body: match[2] };
}

// Returns all unique base slugs (one entry per post, not per language variant)
export function getAllBaseSlugs(): string[] {
  const files = fs.readdirSync(BLOG_DIR);
  const slugs = new Set<string>();
  files.forEach(filename => {
    if (!filename.endsWith('.md')) return;
    const withoutExt = filename.replace('.md', '');
    const langMatch = withoutExt.match(/^(.+)\.(it|es)$/);
    const baseSlug = langMatch ? langMatch[1] : withoutExt;
    const raw = fs.readFileSync(path.join(BLOG_DIR, filename), 'utf-8');
    const { data } = parseFrontmatter(raw);
    slugs.add(data.slug || baseSlug);
  });
  return Array.from(slugs);
}

// Returns all language versions of all posts, keyed by baseSlug
function loadAllVersions(): Record<string, Record<string, { data: Record<string, string>; body: string }>> {
  const files = fs.readdirSync(BLOG_DIR);
  const postMap: Record<string, Record<string, { data: Record<string, string>; body: string }>> = {};

  files.forEach(filename => {
    if (!filename.endsWith('.md')) return;
    const withoutExt = filename.replace('.md', '');
    const langMatch = withoutExt.match(/^(.+)\.(it|es)$/);
    const baseSlug = langMatch ? langMatch[1] : withoutExt;
    const fileLang = langMatch ? langMatch[2] : 'en';

    const raw = fs.readFileSync(path.join(BLOG_DIR, filename), 'utf-8');
    const parsed = parseFrontmatter(raw);
    const resolvedSlug = parsed.data.slug || baseSlug;

    if (!postMap[resolvedSlug]) postMap[resolvedSlug] = {};
    postMap[resolvedSlug][fileLang] = parsed;
  });

  return postMap;
}

// Returns blog listing for a given language
export function getAllPosts(language: string): BlogPost[] {
  const postMap = loadAllVersions();

  return Object.entries(postMap)
    .map(([resolvedSlug, versions]) => {
      const selected = versions[language] || versions['en'];
      if (!selected) return null;
      const { data } = selected;
      return {
        slug: resolvedSlug,
        title: data.title || 'Untitled',
        date: data.date || '',
        excerpt: data.excerpt || '',
        image: data.image || '',
        lang: language,
        baseSlug: resolvedSlug,
      };
    })
    .filter((p): p is BlogPost => p !== null)
    .sort((a, b) => (a.date < b.date ? 1 : -1));
}

// Returns post content for a specific slug and language
export function getPostContent(slug: string, language: string): BlogPostContent | null {
  const postMap = loadAllVersions();
  const versions = postMap[slug];
  if (!versions) return null;
  return versions[language] || versions['en'] || null;
}

// Returns all language variants of a post (for generateStaticParams)
export function getAllPostSlugs(): { slug: string }[] {
  return getAllBaseSlugs().map(slug => ({ slug }));
}
```

### Task 7: Create app/globals.css

**Files:**
- Create: `app/globals.css`

- [ ] **Step 1: Copy index.css to app/globals.css**

Read the full contents of `index.css` and write them verbatim to `app/globals.css`. Do not modify the Tailwind directives — Tailwind CSS 4 uses `@import "tailwindcss"` syntax which works with PostCSS.

### Task 8: Create app/layout.tsx (root layout)

**Files:**
- Create: `app/layout.tsx`

This replaces `index.html` + `index.tsx`. It mounts the `ContentProvider` and `AppShell` (header/nav/footer), and loads CDN scripts.

- [ ] **Step 1: Create app/layout.tsx**

```tsx
import type { Metadata } from 'next';
import Script from 'next/script';
import { ContentProvider } from '../contexts/ContentContext';
import { AppShell } from '../components/AppShell';
import './globals.css';

export const metadata: Metadata = {
  title: 'Direct Booking Health Score | Digital Audit',
  description: 'Professional hotel technology and marketing audit tool with AI-powered strategic assessments.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" type="image/svg+xml" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Crect width='24' height='24' rx='4' fill='%23003366'/%3E%3Cpath d='M22 12h-4l-3 9L9 3l-3 9H2' fill='none' stroke='white' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body>
        <Script src="https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js" strategy="beforeInteractive" />
        <Script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js" strategy="beforeInteractive" />
        <Script src="https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js" strategy="beforeInteractive" />
        <ContentProvider>
          <AppShell>
            {children}
          </AppShell>
        </ContentProvider>
      </body>
    </html>
  );
}
```

- [ ] **Step 2: Mark index.html lines in MIGRATION_ERRORS.md as FIXED: ✅**
- [ ] **Step 3: Mark index.tsx lines in MIGRATION_ERRORS.md as FIXED: ✅**

### Task 9: Create components/AppShell.tsx

**Files:**
- Create: `components/AppShell.tsx`

This extracts the header, nav, and footer from `App.tsx`. It replaces React Router hooks with Next.js navigation hooks.

- [ ] **Step 1: Create components/AppShell.tsx**

```tsx
'use client';

import React, { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Activity, Menu, X, Globe } from 'lucide-react';
import { EditableText } from './Editable';
import { useContent } from '../contexts/ContentContext';
import { Language } from '../types';

export const AppShell: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { language, setLanguage } = useContent();
  const router = useRouter();
  const pathname = usePathname();

  const navigateTo = (path: string) => {
    router.push(path);
    setIsMenuOpen(false);
    window.scrollTo(0, 0);
  };

  const isActive = (path: string) => {
    if (path === '/blog') return pathname.startsWith('/blog');
    return pathname === path;
  };

  const languages: { code: Language; label: string }[] = [
    { code: 'en', label: 'English' },
    { code: 'it', label: 'Italiano' },
    { code: 'es', label: 'Español' },
  ];

  const headerLabels: Record<Language, { contact: string; start: string }> = {
    en: { contact: 'Contact Us', start: 'Start Audit' },
    it: { contact: 'Contattaci', start: "Inizia l'Audit" },
    es: { contact: 'Contáctanos', start: 'Empieza el Audit' },
  };

  const labels = headerLabels[language];

  return (
    <div className="min-h-screen supports-[height:100dvh]:min-h-[100dvh] bg-[#F4F6F8] font-sans text-gray-900 flex flex-col print:bg-white print:h-auto print:min-h-0">
      <header className="bg-white shadow-sm sticky top-0 z-50 border-b border-gray-200 print:static print:shadow-none print:border-b-2 print:border-brand-blue">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between">
          <div
            className="flex items-center gap-3 cursor-pointer active:opacity-80 transition-opacity flex-shrink-0"
            onClick={() => navigateTo('/')}
          >
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-brand-blue rounded-lg flex items-center justify-center shadow-md flex-shrink-0 print:shadow-none">
              <Activity className="text-white w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div className="flex flex-col justify-center">
              <h1 className="text-lg sm:text-xl font-bold text-brand-blue tracking-tight leading-none">
                <EditableText id="app.header.title" defaultText="Direct Booking Health Score" as="span" />
              </h1>
              <p className="hidden sm:block text-xs text-gray-500 uppercase tracking-widest font-semibold mt-1 print:block">
                <EditableText id="app.header.subtitle" defaultText="Hotel Tech & Marketing Audit Tool" as="span" />
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 sm:gap-8">
            <div className="flex items-center gap-1 sm:gap-2 bg-gray-50 p-1 rounded-lg border border-gray-200 print:hidden">
              <Globe size={16} className="text-gray-400 ml-1" />
              {languages.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => setLanguage(lang.code)}
                  className={`px-2 py-1 text-[10px] sm:text-xs font-bold rounded uppercase transition-colors ${
                    language === lang.code
                      ? 'bg-brand-blue text-white shadow-sm'
                      : 'text-gray-400 hover:text-brand-blue hover:bg-white'
                  }`}
                >
                  {lang.code}
                </button>
              ))}
            </div>

            <div className="hidden md:flex items-center gap-6 lg:gap-8 print:hidden">
              <button onClick={() => navigateTo('/')} className={`text-sm font-medium transition-colors ${isActive('/') ? 'text-brand-blue font-bold' : 'text-gray-500 hover:text-brand-blue'}`}>Home</button>
              <button onClick={() => navigateTo('/hotel-audit')} className={`text-sm font-medium transition-colors ${isActive('/hotel-audit') ? 'text-brand-blue font-bold' : 'text-gray-500 hover:text-brand-blue'}`}>Hotel Audit</button>
              <button onClick={() => navigateTo('/blog')} className={`text-sm font-medium transition-colors ${isActive('/blog') ? 'text-brand-blue font-bold' : 'text-gray-500 hover:text-brand-blue'}`}>Blog</button>
              <button onClick={() => navigateTo('/contact')} className={`text-sm font-medium transition-colors ${isActive('/contact') ? 'text-brand-blue font-bold' : 'text-gray-500 hover:text-brand-blue'}`}>{labels.contact}</button>
              <button onClick={() => navigateTo('/hotel-audit')} className="bg-brand-blue text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-900 transition-colors shadow-sm">{labels.start}</button>
            </div>

            <div className="md:hidden flex items-center print:hidden">
              <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="p-2 -mr-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors active:bg-gray-200" aria-label="Toggle menu">
                {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {isMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-100 shadow-xl absolute w-full left-0 top-16 sm:top-20 z-40 h-[calc(100vh-4rem)] overflow-y-auto print:hidden">
            <div className="px-4 py-6 space-y-3 flex flex-col pb-20">
              <button onClick={() => navigateTo('/')} className={`text-left px-4 py-4 rounded-lg text-lg ${isActive('/') ? 'bg-blue-50 text-brand-blue font-semibold' : 'text-gray-700 hover:bg-gray-50'}`}>Home</button>
              <button onClick={() => navigateTo('/hotel-audit')} className={`text-left px-4 py-4 rounded-lg text-lg ${isActive('/hotel-audit') ? 'bg-blue-50 text-brand-blue font-semibold' : 'text-gray-700 hover:bg-gray-50'}`}>Hotel Audit Tool</button>
              <button onClick={() => navigateTo('/blog')} className={`text-left px-4 py-4 rounded-lg text-lg ${isActive('/blog') ? 'bg-blue-50 text-brand-blue font-semibold' : 'text-gray-700 hover:bg-gray-50'}`}>Blog</button>
              <button onClick={() => navigateTo('/contact')} className={`text-left px-4 py-4 rounded-lg text-lg ${isActive('/contact') ? 'bg-blue-50 text-brand-blue font-semibold' : 'text-gray-700 hover:bg-gray-50'}`}>{labels.contact}</button>
              <button onClick={() => navigateTo('/security')} className={`text-left px-4 py-4 rounded-lg text-lg ${isActive('/security') ? 'bg-blue-50 text-brand-blue font-semibold' : 'text-gray-700 hover:bg-gray-50'}`}>Security & Privacy</button>
              <div className="pt-4 border-t border-gray-100 mt-2">
                <button onClick={() => navigateTo('/hotel-audit')} className="w-full bg-brand-blue text-white px-4 py-4 rounded-xl text-lg font-medium shadow-md active:scale-[0.98] transition-transform">{labels.start}</button>
              </div>
            </div>
          </div>
        )}
      </header>

      <main className="flex-grow flex flex-col items-center justify-start w-full pt-4 sm:pt-6 pb-12 print:pt-4 print:pb-0">
        {children}
      </main>

      <footer className="bg-white border-t border-gray-200 py-8 sm:py-12 mt-auto print:border-t-0 print:py-4 print:mt-4 break-inside-avoid">
        <div className="max-w-7xl mx-auto px-4 text-center text-gray-400 text-sm">
          <p>&copy; {new Date().getFullYear()} Direct Booking Health Score. All rights reserved.</p>
          <p className="mt-2 text-xs uppercase tracking-widest text-gray-300 print:text-gray-500">Technology Provided by Bookassist</p>
          <div className="mt-4 flex justify-center gap-6 text-xs">
            <button onClick={() => navigateTo('/security')} className="text-gray-400 hover:text-brand-blue transition-colors">Security & Privacy</button>
            <button onClick={() => navigateTo('/contact')} className="text-gray-400 hover:text-brand-blue transition-colors">Contact Us</button>
          </div>
        </div>
      </footer>
    </div>
  );
};
```

- [ ] **Step 2: Mark App.tsx lines in MIGRATION_ERRORS.md as FIXED: ✅**

### Task 10: Create app route pages

**Files:**
- Create: `app/page.tsx`
- Create: `app/hotel-audit/page.tsx`
- Create: `app/blog/page.tsx`
- Create: `app/blog/[slug]/page.tsx`
- Create: `app/contact/page.tsx`
- Create: `app/security/page.tsx`

- [ ] **Step 1: Create app/page.tsx**

```tsx
'use client';

import { useRouter } from 'next/navigation';
import { Home } from '../components/Home';

export default function HomePage() {
  const router = useRouter();
  return <Home onStart={() => router.push('/hotel-audit')} />;
}
```

- [ ] **Step 2: Create app/hotel-audit/page.tsx**

```tsx
import { AuditTool } from '../../components/AuditTool';

export default function HotelAuditPage() {
  return <AuditTool />;
}
```

- [ ] **Step 3: Create app/blog/page.tsx**

```tsx
import { getAllPosts } from '../../lib/blog';
import { BlogClientPage } from '../../components/BlogClientPage';

export default function BlogPage() {
  // Server component: read posts at build time for all 3 languages
  const postsEn = getAllPosts('en');
  const postsIt = getAllPosts('it');
  const postsEs = getAllPosts('es');

  return <BlogClientPage postsEn={postsEn} postsIt={postsIt} postsEs={postsEs} />;
}
```

- [ ] **Step 4: Create components/BlogClientPage.tsx**

Because `Blog.tsx` uses `useContent()` (client hook) but the page needs server-side data, create a thin client wrapper:

```tsx
'use client';

import { useRouter } from 'next/navigation';
import { Blog } from './Blog';
import { useContent } from '../contexts/ContentContext';
import type { BlogPost } from '../lib/blog';

interface Props {
  postsEn: BlogPost[];
  postsIt: BlogPost[];
  postsEs: BlogPost[];
}

export const BlogClientPage: React.FC<Props> = ({ postsEn, postsIt, postsEs }) => {
  const { language } = useContent();
  const router = useRouter();

  const postsByLang: Record<string, BlogPost[]> = { en: postsEn, it: postsIt, es: postsEs };
  const posts = postsByLang[language] || postsEn;

  return (
    <Blog
      posts={posts}
      onSelectPost={(slug) => router.push(`/blog/${slug}`)}
      onStartAudit={() => router.push('/hotel-audit')}
    />
  );
};
```

- [ ] **Step 5: Create app/blog/[slug]/page.tsx**

```tsx
import { getAllPostSlugs, getPostContent } from '../../../lib/blog';
import { BlogPostClientPage } from '../../../components/BlogPostClientPage';

export async function generateStaticParams() {
  return getAllPostSlugs();
}

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;

  // Pre-fetch all language versions at build time
  const contentEn = getPostContent(slug, 'en');
  const contentIt = getPostContent(slug, 'it');
  const contentEs = getPostContent(slug, 'es');

  return (
    <BlogPostClientPage
      slug={slug}
      contentEn={contentEn}
      contentIt={contentIt}
      contentEs={contentEs}
    />
  );
}
```

- [ ] **Step 6: Create components/BlogPostClientPage.tsx**

```tsx
'use client';

import { useRouter } from 'next/navigation';
import { BlogPost } from './BlogPost';
import { useContent } from '../contexts/ContentContext';
import type { BlogPostContent } from '../lib/blog';

interface Props {
  slug: string;
  contentEn: BlogPostContent | null;
  contentIt: BlogPostContent | null;
  contentEs: BlogPostContent | null;
}

export const BlogPostClientPage: React.FC<Props> = ({ slug, contentEn, contentIt, contentEs }) => {
  const { language } = useContent();
  const router = useRouter();

  const contentByLang: Record<string, BlogPostContent | null> = {
    en: contentEn,
    it: contentIt,
    es: contentEs,
  };
  const content = contentByLang[language] || contentEn;

  return (
    <BlogPost
      slug={slug}
      content={content}
      onBack={() => router.push('/blog')}
      onStartAudit={() => router.push('/hotel-audit')}
    />
  );
};
```

- [ ] **Step 7: Create app/contact/page.tsx**

```tsx
import { Contact } from '../../components/Contact';

export default function ContactPage() {
  return <Contact />;
}
```

- [ ] **Step 8: Create app/security/page.tsx**

```tsx
import { Security } from '../../components/Security';

export default function SecurityPage() {
  return <Security />;
}
```

### Task 11: Update Blog.tsx to accept posts as props

**Files:**
- Modify: `components/Blog.tsx`

Remove the `import.meta.glob` call and `loadPosts` function. Accept `posts` as a prop.

- [ ] **Step 1: Update Blog.tsx**

Replace the entire file content with:

```tsx
'use client';

import React from 'react';
import { ArrowRight, Calendar, BookOpen } from 'lucide-react';
import { useContent } from '../contexts/ContentContext';
import { Language } from '../types';
import type { BlogPost as BlogPostType } from '../lib/blog';

interface BlogProps {
  posts: BlogPostType[];
  onSelectPost: (slug: string) => void;
  onStartAudit: () => void;
}

export const Blog: React.FC<BlogProps> = ({ posts, onSelectPost, onStartAudit }) => {
  const { language } = useContent();

  const labels: Record<Language, any> = {
    en: { heading: 'Direct Booking Insights', sub: 'Weekly strategy and technology advice for hotels reducing OTA dependency.', readMore: 'Read Article', cta: 'Book a Demo to Improve Your Hotel Score', ctaSub: 'Speak with an expert and find out how to grow your direct bookings.' },
    it: { heading: 'Approfondimenti sul Direct Booking', sub: 'Consigli settimanali su strategia e tecnologia per hotel che riducono la dipendenza dalle OTA.', readMore: 'Leggi Articolo', cta: 'Prenota una Demo per Migliorare il Punteggio del Tuo Hotel', ctaSub: 'Parla con un esperto e scopri come aumentare le prenotazioni dirette.' },
    es: { heading: 'Perspectivas de Reserva Directa', sub: 'Consejos semanales de estrategia y tecnología para hoteles que reducen su dependencia de las OTA.', readMore: 'Leer Artículo', cta: 'Reserva una Demo para Mejorar la Puntuación de tu Hotel', ctaSub: 'Habla con un experto y descubre cómo aumentar tus reservas directas.' },
  };
  const l = labels[language];

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    const localeMap: Record<Language, string> = { en: 'en-GB', it: 'it-IT', es: 'es-ES' };
    return new Date(dateStr).toLocaleDateString(localeMap[language], { day: 'numeric', month: 'long', year: 'numeric' });
  };

  return (
    <div className="w-full max-w-5xl px-4 sm:px-6 py-12 mx-auto">
      <div className="text-center mb-14">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-blue/10 text-brand-blue text-[10px] font-black tracking-widest uppercase mb-5">
          <BookOpen size={12} /> Weekly Insights
        </div>
        <h1 className="text-4xl sm:text-5xl font-black text-gray-900 mb-4">{l.heading}</h1>
        <p className="text-lg text-gray-500 max-w-xl mx-auto">{l.sub}</p>
      </div>

      {posts.length === 0 ? (
        <p className="text-center text-gray-400 py-20">No posts yet — check back next week.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          {posts.map((post, i) => (
            <button
              key={post.slug}
              onClick={() => onSelectPost(post.slug)}
              className={`text-left bg-white rounded-[24px] shadow-md border border-gray-100 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-200 flex flex-col ${i === 0 ? 'md:col-span-2' : ''}`}
            >
              {post.image && (
                <div className={`w-full overflow-hidden ${i === 0 ? 'h-64 sm:h-80' : 'h-48'}`}>
                  <img src={post.image} alt={post.title} className="w-full h-full object-cover" />
                </div>
              )}
              <div className="p-7 flex flex-col flex-1">
                <div className="flex items-center gap-2 text-gray-400 text-xs font-bold uppercase tracking-widest mb-3">
                  <Calendar size={12} />
                  {formatDate(post.date)}
                </div>
                <h2 className={`font-black text-gray-900 mb-3 leading-tight ${i === 0 ? 'text-2xl sm:text-3xl' : 'text-xl'}`}>{post.title}</h2>
                <p className="text-gray-500 text-sm leading-relaxed flex-1 mb-5">{post.excerpt}</p>
                <span className="inline-flex items-center gap-2 text-brand-blue font-black text-xs uppercase tracking-widest">
                  {l.readMore} <ArrowRight size={14} />
                </span>
              </div>
            </button>
          ))}
        </div>
      )}

      <div className="bg-brand-blue rounded-[28px] p-10 text-center text-white">
        <h3 className="text-2xl sm:text-3xl font-black mb-3">{l.cta}</h3>
        <p className="text-blue-200 mb-7">{l.ctaSub}</p>
        <a
          href="https://bookassist.org/book-a-demo"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center bg-white text-brand-blue px-10 py-4 rounded-xl font-black text-sm uppercase tracking-widest hover:scale-105 transition-transform shadow-xl"
        >
          Book a Demo <ArrowRight size={16} className="inline ml-2" />
        </a>
      </div>
    </div>
  );
};
```

- [ ] **Step 2: Mark Blog.tsx lines in MIGRATION_ERRORS.md as FIXED: ✅**

### Task 12: Update BlogPost.tsx to accept content as props

**Files:**
- Modify: `components/BlogPost.tsx`

Remove `import.meta.glob`. Accept `content` as a prop (pre-loaded by the server component).

- [ ] **Step 1: Read components/BlogPost.tsx in full to see what needs changing beyond import.meta.glob**
- [ ] **Step 2: Replace the import.meta.glob call and the slug-matching logic. Add 'use client'. Accept content prop.**

The new interface:
```tsx
'use client';

import React from 'react';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { useContent } from '../contexts/ContentContext';
import { Language } from '../types';
import type { BlogPostContent } from '../lib/blog';

interface BlogPostProps {
  slug: string;
  content: BlogPostContent | null;
  onBack: () => void;
  onStartAudit: () => void;
}

export const BlogPost: React.FC<BlogPostProps> = ({ slug, content, onBack, onStartAudit }) => {
  const { language } = useContent();

  const labels: Record<Language, any> = {
    en: { back: 'Back to Blog', cta: 'Book a Demo to Improve Your Hotel Score', ctaBtn: 'Book a Demo' },
    it: { back: 'Torna al Blog', cta: 'Prenota una Demo per Migliorare il Punteggio del Tuo Hotel', ctaBtn: 'Prenota una Demo' },
    es: { back: 'Volver al Blog', cta: 'Reserva una Demo para Mejorar la Puntuación de tu Hotel', ctaBtn: 'Reservar una Demo' },
  };
  const l = labels[language];

  if (!content) {
    return (
      <div className="w-full max-w-3xl px-4 py-12 mx-auto text-center">
        <p className="text-gray-400">Post not found.</p>
        <button onClick={onBack} className="mt-4 text-brand-blue font-bold">{l.back}</button>
      </div>
    );
  }

  const { data, body } = content;

  // Preserve remainder of existing BlogPost render JSX below this point — only the data source changes.
  // Read the existing file and keep all formatting/display logic, replacing only the data loading section.
```

The agent must read the existing `BlogPost.tsx` render JSX fully and preserve it, only replacing lines 1–60 (the import.meta.glob and useMemo data loading) with the above.

- [ ] **Step 3: Mark BlogPost.tsx lines in MIGRATION_ERRORS.md as FIXED: ✅**

### Task 13: Update geminiService.ts env var

**Files:**
- Modify: `services/geminiService.ts`

- [ ] **Step 1: Replace import.meta.env reference**

In `services/geminiService.ts` line 66, change:
```typescript
const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
```
to:
```typescript
const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
```

- [ ] **Step 2: Mark geminiService.ts lines in MIGRATION_ERRORS.md as FIXED: ✅**

### Task 14: Add 'use client' to all remaining components

**Files:**
- Modify: `contexts/ContentContext.tsx`
- Modify: `components/AuditTool.tsx`
- Modify: `components/Home.tsx`
- Modify: `components/Contact.tsx`
- Modify: `components/Security.tsx`
- Modify: `components/WelcomeScreen.tsx`
- Modify: `components/Quiz.tsx`
- Modify: `components/Results.tsx`
- Modify: `components/FullResults.tsx`
- Modify: `components/Editable.tsx`
- Modify: `components/LeadCapture.tsx`
- Modify: `components/Button.tsx` (check if it uses hooks first)

- [ ] **Step 1: Add `'use client';` as the very first line of each file above**

For each file, use Edit to prepend `'use client';\n` before the first import.

- [ ] **Step 2: Mark all ClientComponent lines in MIGRATION_ERRORS.md as FIXED: ✅**

### Task 15: Update GitHub Actions workflow

**Files:**
- Modify: `.github/workflows/deploy.yml`

- [ ] **Step 1: Update deploy.yml**

Replace the Build step env block:
```yaml
      - name: Build
        run: npm run build
        env:
          NEXT_PUBLIC_GEMINI_API_KEY: ${{ secrets.VITE_GEMINI_API_KEY }}
```

Note: The GitHub secret is still named `VITE_GEMINI_API_KEY` in the repo — map it to the new env var name here. If the user renames the secret later, update accordingly.

- [ ] **Step 2: Mark deploy.yml lines in MIGRATION_ERRORS.md as FIXED: ✅**

### Task 16: Update .env.example

**Files:**
- Modify: `.env.example`

- [ ] **Step 1: Read .env.example and rename VITE_GEMINI_API_KEY to NEXT_PUBLIC_GEMINI_API_KEY**
- [ ] **Step 2: Mark .env.example lines in MIGRATION_ERRORS.md as FIXED: ✅**

### Task 17: Rename local .env file

**Files:**
- N/A (shell command)

- [ ] **Step 1: Rename the .env variable in the local .env file**

Run:
```bash
cd ~/Documents/GitHub/Directbookinghealthscore
grep -r "VITE_GEMINI_API_KEY" .env 2>/dev/null && sed -i '' 's/VITE_GEMINI_API_KEY/NEXT_PUBLIC_GEMINI_API_KEY/g' .env || echo "No .env file found or variable not present"
```

---

## Phase 3 — Build & Verify

### Task 18: Install dependencies and run build

**Files:**
- N/A (shell commands)

- [ ] **Step 1: Install dependencies**

```bash
cd ~/Documents/GitHub/Directbookinghealthscore
npm install
```

Expected: Clean install, no peer dependency errors.

- [ ] **Step 2: Run TypeScript check**

```bash
npm run lint
```

Expected: No errors. If errors appear, fix them before proceeding.

- [ ] **Step 3: Run Next.js build**

```bash
npm run build
```

Expected: 
```
✓ Compiled successfully
✓ Generating static pages (8/8)
```

If build errors occur: read each error carefully, fix the root cause, and re-run. Do NOT proceed to Phase 4 until the build passes cleanly.

Common errors to anticipate:
- `'react-router-dom' not found` — check that App.tsx has been deleted/retired and no remaining imports exist
- TypeScript errors from `allowImportingTsExtensions` removal — rename any `.ts`/`.tsx` imports that include the extension
- `import.meta` references remaining — grep for `import.meta` and fix each one
- Tailwind not applying — ensure `app/globals.css` is imported in `app/layout.tsx`

- [ ] **Step 4: Verify output directory**

```bash
ls ~/Documents/GitHub/Directbookinghealthscore/out/
```

Expected: `index.html`, `hotel-audit/`, `blog/`, `contact/`, `security/` directories. Next.js static export outputs to `out/` by default.

- [ ] **Step 5: Update GitHub Actions workflow to deploy from `out/` instead of `dist/`**

In `.github/workflows/deploy.yml`, change:
```yaml
        with:
          folder: out
          branch: gh-pages
          cname: directbookinghealthscore.com
```

---

## Phase 4 — Local Preview

### Task 19: Run local dev server

- [ ] **Step 1: Start dev server**

```bash
cd ~/Documents/GitHub/Directbookinghealthscore && npm run dev
```

Expected: Server starts on `http://localhost:3000`

- [ ] **Step 2: Confirm server is running and display URL**

Tell the user:
> **Local preview is running at http://localhost:3000 — please review the site and type GO AHEAD when you are ready to push to GitHub.**

**STOP HERE. Wait for explicit user confirmation before proceeding to Phase 5.**

---

## Phase 5 — GitHub Push (only after user says GO AHEAD)

### Task 20: Create branch and push to GitHub

- [ ] **Step 1: Stop the dev server (Ctrl+C)**

- [ ] **Step 2: Create migration branch**

```bash
cd ~/Documents/GitHub/Directbookinghealthscore
git checkout -b nextjs-migration
```

- [ ] **Step 3: Stage all changed files**

```bash
git add next.config.ts postcss.config.js app/ lib/ components/AppShell.tsx components/BlogClientPage.tsx components/BlogPostClientPage.tsx components/AuditTool.tsx components/Blog.tsx components/BlogPost.tsx components/Home.tsx components/Contact.tsx components/Security.tsx components/WelcomeScreen.tsx components/Quiz.tsx components/Results.tsx components/FullResults.tsx components/Editable.tsx components/LeadCapture.tsx components/Button.tsx contexts/ContentContext.tsx services/geminiService.ts package.json tsconfig.json .github/workflows/deploy.yml .env.example MIGRATION_ERRORS.md
```

- [ ] **Step 4: Commit**

```bash
git commit -m "feat: migrate from React/Vite to Next.js with App Router"
```

- [ ] **Step 5: Push branch**

```bash
git push origin nextjs-migration
```

- [ ] **Step 6: Confirm and tell user**

> **Branch `nextjs-migration` has been pushed to GitHub. You can now open a Pull Request to review before merging to main. Do NOT merge to main without reviewing the PR.**

---

## Self-Review Checklist

- [x] All 6 routes covered: `/`, `/hotel-audit`, `/blog`, `/blog/:slug`, `/contact`, `/security`
- [x] `import.meta.glob` removed from Blog.tsx and BlogPost.tsx
- [x] `import.meta.env` removed from geminiService.ts
- [x] `react-router-dom` removed from all files
- [x] Tailwind CSS 4 PostCSS config created
- [x] CDN scripts (html2canvas, jsPDF) moved to layout.tsx
- [x] `'use client'` added to all components using hooks/localStorage/context
- [x] `generateStaticParams` added to blog/[slug]/page.tsx
- [x] GitHub Actions updated: env var renamed, deploy folder updated to `out/`
- [x] `.env.example` updated
- [x] GitHub Pages static export configured (`output: 'export'`)
- [x] All existing UI preserved — no redesign
- [x] No Amplify config present — confirmed not needed
