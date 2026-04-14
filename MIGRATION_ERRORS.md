# Migration Errors — React/Vite → Next.js 15

All issues below were identified and fixed during migration to Next.js App Router.

FILE: vite.config.ts | LINE: N/A | TYPE: ViteConfig | ISSUE: Vite-specific config, incompatible with Next.js | FIX: Deleted; created next.config.ts with standard Next.js server setup | FIXED: ✅
FILE: index.html | LINE: N/A | TYPE: ViteEntry | ISSUE: Vite HTML entry point not used by Next.js | FIX: Deleted; CDN scripts moved to app/layout.tsx via next/script | FIXED: ✅
FILE: index.tsx | LINE: N/A | TYPE: ViteEntry | ISSUE: Vite/ReactDOM entry point not used by Next.js | FIX: Deleted; replaced by app/layout.tsx with ContentProvider | FIXED: ✅
FILE: App.tsx | LINE: 2 | TYPE: ReactRouter | ISSUE: Uses react-router-dom (Routes, Route, useNavigate, useLocation, useParams) | FIX: Retired; routing replaced by app/ file-based routing; nav extracted to components/AppShell.tsx using next/navigation | FIXED: ✅
FILE: components/Blog.tsx | LINE: 28 | TYPE: ViteGlob | ISSUE: import.meta.glob is Vite-specific | FIX: Removed; Blog now accepts posts as props from server component app/blog/page.tsx via lib/blog.ts | FIXED: ✅
FILE: components/BlogPost.tsx | LINE: 21 | TYPE: ViteGlob | ISSUE: import.meta.glob is Vite-specific | FIX: Removed; BlogPost now accepts content as prop from server component app/blog/[slug]/page.tsx | FIXED: ✅
FILE: services/geminiService.ts | LINE: 66 | TYPE: EnvVar | ISSUE: import.meta.env.VITE_GEMINI_API_KEY is Vite-specific | FIX: Replaced with process.env.NEXT_PUBLIC_GEMINI_API_KEY | FIXED: ✅
FILE: package.json | LINE: N/A | TYPE: PackageScripts | ISSUE: Scripts used vite commands; gh-pages deploy not needed for Amplify | FIX: Updated scripts to next dev/build/start; removed vite, @vitejs/plugin-react, @tailwindcss/vite, gh-pages | FIXED: ✅
FILE: tsconfig.json | LINE: 14 | TYPE: TSConfig | ISSUE: types included "vite/client"; allowImportingTsExtensions conflicts with Next.js | FIX: Replaced with Next.js-compatible tsconfig | FIXED: ✅
FILE: contexts/ContentContext.tsx | LINE: 1 | TYPE: ClientComponent | ISSUE: Uses localStorage and useState — must be 'use client' | FIX: Added 'use client' as first line | FIXED: ✅
FILE: components/AuditTool.tsx | LINE: 1 | TYPE: ClientComponent | ISSUE: Uses useState | FIX: Added 'use client' | FIXED: ✅
FILE: components/Home.tsx | LINE: 1 | TYPE: ClientComponent | ISSUE: Uses useContent hook | FIX: Added 'use client' | FIXED: ✅
FILE: components/Blog.tsx | LINE: 1 | TYPE: ClientComponent | ISSUE: Uses useContent, useMemo | FIX: Added 'use client' | FIXED: ✅
FILE: components/BlogPost.tsx | LINE: 1 | TYPE: ClientComponent | ISSUE: Uses useContent, useMemo | FIX: Added 'use client' | FIXED: ✅
FILE: components/Contact.tsx | LINE: 1 | TYPE: ClientComponent | ISSUE: Uses hooks/context | FIX: Added 'use client' | FIXED: ✅
FILE: components/Security.tsx | LINE: 1 | TYPE: ClientComponent | ISSUE: Uses hooks/context | FIX: Added 'use client' | FIXED: ✅
FILE: components/WelcomeScreen.tsx | LINE: 1 | TYPE: ClientComponent | ISSUE: Uses hooks | FIX: Added 'use client' | FIXED: ✅
FILE: components/Quiz.tsx | LINE: 1 | TYPE: ClientComponent | ISSUE: Uses hooks | FIX: Added 'use client' | FIXED: ✅
FILE: components/Results.tsx | LINE: 1 | TYPE: ClientComponent | ISSUE: Uses hooks | FIX: Added 'use client' | FIXED: ✅
FILE: components/FullResults.tsx | LINE: 1 | TYPE: ClientComponent | ISSUE: Uses hooks | FIX: Added 'use client' | FIXED: ✅
FILE: components/Editable.tsx | LINE: 1 | TYPE: ClientComponent | ISSUE: Uses context/hooks | FIX: Added 'use client' | FIXED: ✅
FILE: components/LeadCapture.tsx | LINE: 1 | TYPE: ClientComponent | ISSUE: Uses hooks | FIX: Added 'use client' | FIXED: ✅
FILE: .github/workflows/deploy.yml | LINE: 24 | TYPE: EnvVar | ISSUE: Passed VITE_GEMINI_API_KEY to build | FIX: Updated to pass NEXT_PUBLIC_GEMINI_API_KEY mapped from existing GitHub secret | FIXED: ✅
FILE: .env.example | LINE: N/A | TYPE: EnvVar | ISSUE: Documented VITE_ prefixed variable | FIX: Renamed to NEXT_PUBLIC_GEMINI_API_KEY | FIXED: ✅

---

## ⚠️ MANDATORY PRE-MERGE CHECKLIST — AWS ADMIN MUST RUN BEFORE MERGING TO MAIN

The Amplify buildSpec currently points to `baseDirectory: dist` (Vite output). Next.js outputs to `.next`.
The AWS admin must run both commands below before merging `nextjs-migration` into `main`, or the live deployment will fail.

### Step 1 — Update Amplify buildSpec to use .next output

```bash
aws amplify update-app \
  --app-id d3v6f1glsnjvmy \
  --build-spec "version: 1\nfrontend:\n  phases:\n    preBuild:\n      commands:\n        - npm ci\n    build:\n      commands:\n        - npm run build\n  artifacts:\n    baseDirectory: .next\n    files:\n      - '**/*'\n  cache:\n    paths:\n      - .next/cache/**/*\n      - node_modules/**/*\n"
```

### Step 2 — Remove broken SPA rewrite rule

```bash
aws amplify update-app \
  --app-id d3v6f1glsnjvmy \
  --custom-rules "[]"
```

### Step 3 — Set environment variable in Amplify console

In the Amplify console for app `d3v6f1glsnjvmy`, set:
- Key: `NEXT_PUBLIC_GEMINI_API_KEY`
- Value: (same value as the existing `VITE_GEMINI_API_KEY`)

These steps must be completed by the AWS admin before merging. Once done, merging `nextjs-migration` to `main` will trigger Amplify to build and deploy the Next.js app automatically.
