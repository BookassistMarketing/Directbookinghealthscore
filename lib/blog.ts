import fs from 'fs';
import path from 'path';

export interface BlogPostMeta {
  slug: string;
  title: string;
  date: string;
  excerpt: string;
  image: string;
}

export interface BlogPostContent {
  data: Record<string, string>;
  body: string;
}

const BLOG_DIR = path.join(process.cwd(), 'blog');

/**
 * Returns true if a post with this front-matter `date` should be visible.
 * Used to schedule future posts: drop the file in `blog/` with a future date,
 * push to main, and the post stays hidden from listings/sitemap/static
 * params until UTC midnight of its date passes. ISR revalidation on the
 * list pages then makes it appear within ~1 hour.
 *
 * Development always returns true so future posts are previewable with
 * `npm run dev` without having to fake the clock.
 */
function isPublished(dateStr: string): boolean {
  if (process.env.NODE_ENV !== 'production') return true;
  if (!dateStr) return false;
  // ISO date strings (YYYY-MM-DD) sort lexicographically — same order as
  // chronological — so a direct string compare works here.
  const todayUtc = new Date().toISOString().slice(0, 10);
  return dateStr <= todayUtc;
}

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

function loadAllVersions(): Record<string, Record<string, { data: Record<string, string>; body: string }>> {
  const files = fs.readdirSync(BLOG_DIR);
  const postMap: Record<string, Record<string, { data: Record<string, string>; body: string }>> = {};

  files.forEach(filename => {
    if (!filename.endsWith('.md')) return;
    const withoutExt = filename.replace('.md', '');
    const langMatch = withoutExt.match(/^(.+)\.(it|es|pl|fr|de|cs)$/);
    const baseSlug = langMatch ? langMatch[1] : withoutExt;
    const fileLang = langMatch ? langMatch[2] : 'en';

    // Normalise CRLF to LF so frontmatter parsing works regardless of the
    // checkout's line endings (Windows dev with core.autocrlf=true yields CRLF).
    const raw = fs.readFileSync(path.join(BLOG_DIR, filename), 'utf-8').replace(/\r\n/g, '\n');
    const parsed = parseFrontmatter(raw);
    const resolvedSlug = parsed.data.slug || baseSlug;

    if (!postMap[resolvedSlug]) postMap[resolvedSlug] = {};
    postMap[resolvedSlug][fileLang] = parsed;
  });

  return postMap;
}

export function getAllPosts(language: string): BlogPostMeta[] {
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
      };
    })
    .filter((p): p is BlogPostMeta => p !== null && isPublished(p.date))
    .sort((a, b) => (a.date < b.date ? 1 : -1));
}

export function getPostContent(slug: string, language: string): BlogPostContent | null {
  const postMap = loadAllVersions();
  const versions = postMap[slug];
  if (!versions) return null;
  return versions[language] || versions['en'] || null;
}

export function getAllPostSlugs(): { slug: string }[] {
  const postMap = loadAllVersions();
  // Only published posts get pre-rendered static params and sitemap entries.
  // Future-dated posts still render on-demand if someone hits their direct
  // URL (Next.js falls back to dynamic rendering for unknown slugs because
  // dynamicParams defaults to true) — that's intentional so you can preview
  // a future post before it's live by sharing the URL.
  return Object.entries(postMap)
    .filter(([, versions]) => isPublished(versions['en']?.data.date || ''))
    .map(([slug]) => ({ slug }));
}
