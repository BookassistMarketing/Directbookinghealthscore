import 'server-only';
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkGfm from 'remark-gfm';
import remarkRehype from 'remark-rehype';
import rehypeStringify from 'rehype-stringify';
import { visit, SKIP } from 'unist-util-visit';
import type { Root, Element } from 'hast';

// Turns the Gemini markdown report into email-safe HTML (inline styles only,
// Arial, Bookassist palette) for the HubSpot rich text property
// `ttg_audit_report`, which the TTG workflow email prints with its token.
// Raw HTML in the model output is dropped (remark-rehype default).

// HubSpot caps a text property at 65,536 characters; keep a margin.
const MAX_HTML_CHARS = 60000;

const TEAL = '#45AEB1';
const NAVY = '#3B5772';
const TEXT = '#3e3e3f';
const LIGHT = '#E5F2F2';
const BORDER = '#d6e6e6';
const FONT = 'Arial, Helvetica, sans-serif';
const BODY = `font-family:${FONT};font-size:15px;line-height:23px;color:${TEXT}`;

// Report h1/h2/h3 sit under the email's own headline, so shift them down a level.
const RENAME: Record<string, string> = { h1: 'h2', h2: 'h3', h3: 'h4' };

const STYLES: Record<string, string> = {
  h1: `font-family:${FONT};font-size:22px;line-height:28px;color:${NAVY};margin:24px 0 12px`,
  h2: `font-family:${FONT};font-size:19px;line-height:25px;color:${TEAL};margin:24px 0 10px`,
  h3: `font-family:${FONT};font-size:16px;line-height:22px;color:${NAVY};margin:18px 0 8px`,
  h4: `font-family:${FONT};font-size:15px;line-height:21px;color:${NAVY};margin:16px 0 6px`,
  p: `${BODY};margin:0 0 12px`,
  ul: `${BODY};margin:0 0 12px;padding-left:22px`,
  ol: `${BODY};margin:0 0 12px;padding-left:22px`,
  li: 'margin:0 0 6px',
  strong: `color:${NAVY}`,
  a: `color:${TEAL}`,
  hr: `border:0;border-top:1px solid ${LIGHT};margin:20px 0`,
  table: `border-collapse:collapse;width:100%;margin:8px 0 18px;font-family:${FONT};font-size:13px;line-height:19px;color:${TEXT}`,
  th: `background:${LIGHT};color:${NAVY};padding:8px;border:1px solid ${BORDER};text-align:left;vertical-align:top`,
  td: `padding:8px;border:1px solid ${BORDER};vertical-align:top`,
};

function emailStyles({ withStyles }: { withStyles: boolean }) {
  return (tree: Root) => {
    visit(tree, 'element', (node: Element, index, parent) => {
      // Never pull remote images from model output into an email.
      if (node.tagName === 'img' && parent && typeof index === 'number') {
        parent.children.splice(index, 1);
        return [SKIP, index];
      }
      const original = node.tagName;
      if (RENAME[original]) node.tagName = RENAME[original];
      if (withStyles && STYLES[original]) node.properties = { ...node.properties, style: STYLES[original] };
      if (original === 'table') node.properties = { ...node.properties, width: '100%', cellPadding: 0, cellSpacing: 0 };
      return undefined;
    });
  };
}

function render(report: string, withStyles: boolean): string {
  return String(
    unified()
      .use(remarkParse)
      .use(remarkGfm)
      .use(remarkRehype)
      .use(emailStyles, { withStyles })
      .use(rehypeStringify)
      .processSync(report)
  );
}

// Same pattern the report page uses for its score card.
export function extractScore(report: string): number | null {
  const m = report.match(/\b(\d{1,3})\s*\/\s*100\b/);
  if (!m) return null;
  const n = parseInt(m[1], 10);
  return Number.isFinite(n) && n >= 0 && n <= 100 ? n : null;
}

export function reportToEmailHtml(report: string): string {
  const html = render(report, true);
  if (html.length <= MAX_HTML_CHARS) return html;

  // Too long with inline styles: fall back to plain markup.
  const plain = render(report, false);
  if (plain.length <= MAX_HTML_CHARS) return plain;

  // Still too long: cut after the last closed block and point to the PDF.
  const cut = plain.slice(0, MAX_HTML_CHARS - 300);
  const ends = ['</p>', '</table>', '</ul>', '</ol>']
    .map(tag => { const i = cut.lastIndexOf(tag); return i < 0 ? -1 : i + tag.length; });
  const end = Math.max(0, ...ends);
  return `${cut.slice(0, end)}<p><em>Il report completo è disponibile in PDF: rispondi a questa email e te lo inviamo.</em></p>`;
}
