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

    const raw = fs.readFileSync(path.join(BLOG_DIR, filename), 'utf-8');
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
    .filter((p): p is BlogPostMeta => p !== null)
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
  return Object.keys(postMap).map(slug => ({ slug }));
}
