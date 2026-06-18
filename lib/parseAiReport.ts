// Parse the Bookassist AI Readiness Report markdown returned by Gemini into
// structured pieces the dashboard can render distinctly. The Gemini prompt
// translates section headings into the user's language, so this parser
// deliberately matches by structural cues (tables, score regex, section
// order) rather than by heading text — which means the same parser works
// for all 7 supported languages.
//
// Falls back gracefully: if any piece can't be parsed, returns `null` for
// that piece and the renderer shows the raw markdown for that section
// instead of crashing.

export interface ParsedReport {
  overallScore: number | null;
  projectedScore: number | null;
  hotelName: string | null;
  url: string | null;
  tierLabel: string | null;
  observedParagraph: string | null;
  scoringRows: ScoringRow[] | null;
  issuesRows: IssueRow[] | null;
  fixesRows: FixRow[] | null;
  strategicAdvantage: string | null;
  /** Map of "category-key/criterion-key" → status. Emitted by Gemini in a
   *  machine-readable block; null if the block wasn't found. */
  criterionStatuses: Record<string, 'met' | 'partial' | 'not-met'> | null;
  unrecognisedSections: { heading: string; body: string }[];
}

export interface ScoringRow {
  category: string;
  weight: number;
  score: number;
}

export interface IssueRow {
  issue: string;
  impact: string;
  pagesAffected: string;
}

export interface FixRow {
  fix: string;
  pointsIncrease: number;
}

// ----- Regex utilities -----

// "Overall score: 42 / 100 — Below AI-optimized threshold"
const OVERALL_SCORE_RE = /\b(\d{1,3})\s*\/\s*100\b(?:\s*[—–-]\s*([^\n]+))?/;

// "Projected Score After Fixes: 85 / 100"
const PROJECTED_PATTERNS = [
  /projected[^\n]*?(\d{1,3})\s*\/\s*100/i,
  /proiett[^\n]*?(\d{1,3})\s*\/\s*100/i,
  /proyect[^\n]*?(\d{1,3})\s*\/\s*100/i,
  /prognoz[^\n]*?(\d{1,3})\s*\/\s*100/i,
  /projet[^\n]*?(\d{1,3})\s*\/\s*100/i,
  /prognost[^\n]*?(\d{1,3})\s*\/\s*100/i,
];

// "+3 points", "+12 pts", "+ 5 pkt", etc.
const POINTS_RE = /([+-]?\s*\d{1,3})/;

const URL_RE = /https?:\/\/[^\s)]+/;

// ----- Markdown helpers -----

function stripMarkdown(text: string): string {
  return text
    .replace(/^\s*#+\s*/, '')
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/\*([^*]+)\*/g, '$1')
    .replace(/`([^`]+)`/g, '$1')
    .trim();
}

interface TableData {
  headers: string[];
  rows: string[][];
  start: number;
  end: number;
}

function parseTablesAt(lines: string[]): TableData[] {
  const tables: TableData[] = [];
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    if (line.trim().startsWith('|') && lines[i + 1] && /^\s*\|?\s*:?-{2,}/.test(lines[i + 1])) {
      const headers = splitTableRow(line);
      const start = i;
      i += 2; // skip header + separator
      const rows: string[][] = [];
      while (i < lines.length && lines[i].trim().startsWith('|')) {
        const row = splitTableRow(lines[i]);
        if (row.length > 0) rows.push(row);
        i += 1;
      }
      tables.push({ headers, rows, start, end: i - 1 });
    } else {
      i += 1;
    }
  }
  return tables;
}

function splitTableRow(line: string): string[] {
  const trimmed = line.trim().replace(/^\|/, '').replace(/\|$/, '');
  return trimmed.split('|').map(c => stripMarkdown(c));
}

function parseIntSafe(raw: string): number {
  const m = raw.match(/-?\d+/);
  return m ? parseInt(m[0], 10) : 0;
}

// ----- Section parser -----

// Find the markdown headers that look like H1/H2/H3 lines. We split the
// report body into "sections" separated by these headers. We deliberately
// ignore heading text and identify sections by their position in the
// document, so translations don't break parsing.
interface RawSection {
  heading: string;
  bodyLines: string[];
}

function splitIntoSections(lines: string[], startFrom: number): RawSection[] {
  const sections: RawSection[] = [];
  let current: RawSection | null = null;
  for (let i = startFrom; i < lines.length; i += 1) {
    const line = lines[i];
    const headerMatch = line.match(/^(#{1,4})\s+(.+)$/);
    if (headerMatch) {
      if (current) sections.push(current);
      current = { heading: stripMarkdown(headerMatch[2]), bodyLines: [] };
    } else if (current) {
      current.bodyLines.push(line);
    }
  }
  if (current) sections.push(current);
  return sections;
}

function sectionMarkdown(section: RawSection): string {
  return section.bodyLines.join('\n').trim();
}

function sectionTables(section: RawSection): TableData[] {
  return parseTablesAt(section.bodyLines);
}

function sectionFirstParagraph(section: RawSection): string | null {
  const text = sectionMarkdown(section);
  if (!text) return null;
  // Take everything up to the first blank line OR up to a table boundary.
  const blockEnd = text.search(/\n\s*\n/);
  const paragraph = blockEnd >= 0 ? text.slice(0, blockEnd) : text;
  // If the paragraph starts with a pipe (table), no usable prose.
  if (/^\s*\|/.test(paragraph)) return null;
  return paragraph.trim() || null;
}

// ----- Main parser -----

export function parseAiReadinessReport(markdown: string): ParsedReport {
  const empty: ParsedReport = {
    overallScore: null,
    projectedScore: null,
    hotelName: null,
    url: null,
    tierLabel: null,
    observedParagraph: null,
    scoringRows: null,
    issuesRows: null,
    fixesRows: null,
    strategicAdvantage: null,
    criterionStatuses: null,
    unrecognisedSections: [],
  };

  if (!markdown || typeof markdown !== 'string') return empty;

  // Per-criterion status block: collect all "category-key/criterion-key: status"
  // lines from anywhere in the document. The keys are stable English
  // identifiers (intentionally untranslated by Gemini per the prompt).
  // Then strip those lines from the markdown so they don't bleed into any
  // rendered section (notably the trailing Strategic Advantage paragraph).
  const STATUS_LINE = /^[ \t]*([a-z][a-z0-9-]*)\/([a-z][a-z0-9-]*)[ \t]*:[ \t]*(met|partial|not[- ]?met)[ \t]*$/i;
  const statuses: Record<string, 'met' | 'partial' | 'not-met'> = {};
  const rawLines = markdown.split('\n');
  const filteredLines: string[] = [];
  for (const line of rawLines) {
    const m = line.match(STATUS_LINE);
    if (m) {
      const raw = m[3].toLowerCase().replace(/\s+/g, '-');
      const status: 'met' | 'partial' | 'not-met' =
        raw === 'met' ? 'met' : raw === 'partial' ? 'partial' : 'not-met';
      statuses[`${m[1]}/${m[2]}`] = status;
    } else {
      filteredLines.push(line);
    }
  }
  if (Object.keys(statuses).length > 0) {
    empty.criterionStatuses = statuses;
  }
  const lines = filteredLines;

  // 1. Overall score + tier label (first "X/100" in the document)
  const scoreMatch = markdown.match(OVERALL_SCORE_RE);
  if (scoreMatch) {
    const n = parseInt(scoreMatch[1], 10);
    if (n >= 0 && n <= 100) empty.overallScore = n;
    if (scoreMatch[2]) empty.tierLabel = stripMarkdown(scoreMatch[2]).trim();
  }

  // 2. URL (first http(s) URL in the doc — usually the "url analyzed:" line)
  const urlMatch = markdown.match(URL_RE);
  if (urlMatch) empty.url = urlMatch[0];

  // 3. Hotel name — the line immediately before the score line in the title
  //    block. The line BEFORE the score is the hotel name; the line two
  //    before it (if any) is the report title. We grab "before score - 1".
  const scoreLineIdx = lines.findIndex(l => OVERALL_SCORE_RE.test(l));
  if (scoreLineIdx > 0) {
    // Walk backwards from the score line, skipping blanks, until a usable
    // line. Skip the report title (any line matching the prompt's
    // "ai visibility" wording in any language) by also skipping lines that
    // look like section labels.
    for (let i = scoreLineIdx - 1; i >= 0; i -= 1) {
      const t = lines[i].trim();
      if (!t) continue;
      if (/^#+\s/.test(t)) continue;
      if (URL_RE.test(t)) continue;
      if (/\/\s*100/.test(t)) continue;
      // The hotel name typically contains a comma (e.g. "Academy Plaza, Dublin")
      // or a place name. The report title rarely has a comma. If this candidate
      // looks like a title (no comma, short, and prior line is empty), prefer
      // the next line down. Conservative: take this line; the title-as-name
      // edge case is rare.
      empty.hotelName = stripMarkdown(t);
      break;
    }
  }

  // 4. Projected score (search the whole doc for "projected ... X/100")
  for (const re of PROJECTED_PATTERNS) {
    const m = markdown.match(re);
    if (m) {
      const n = parseInt(m[1], 10);
      if (n >= 0 && n <= 100) {
        empty.projectedScore = n;
        break;
      }
    }
  }
  // Fallback: if there are two "X/100" matches, the second is the projected.
  if (empty.projectedScore === null) {
    const all = [...markdown.matchAll(/\b(\d{1,3})\s*\/\s*100\b/g)].map(m => parseInt(m[1], 10));
    if (all.length >= 2 && all[1] >= 0 && all[1] <= 100) {
      empty.projectedScore = all[1];
    }
  }

  // 5. Sections — locate by structural cues, not by markdown headers. The
  //    Gemini system prompt uses plain-text section labels (no `## `), so
  //    we can't split on heading syntax. Instead we anchor on:
  //      - URL line (end of title block)
  //      - The 3 tables in order (scoring, issues, fixes)
  //      - The projected-score line
  //    Section labels ("What we observed", "Strategic Advantage…") appear
  //    immediately before their content; we strip them from the resulting
  //    paragraphs as short non-table lines.
  const tables = parseTablesAt(lines);
  const urlLineIdx = lines.findIndex(l => URL_RE.test(l));

  // Projected score line: last X/100 occurrence in the doc (the overall
  // score is the first; everything else is the projected line).
  const xOverHundredIndices: number[] = [];
  lines.forEach((l, i) => {
    if (/\b\d{1,3}\s*\/\s*100\b/.test(l)) xOverHundredIndices.push(i);
  });
  const projectedScoreLineIdx = xOverHundredIndices.length >= 2
    ? xOverHundredIndices[xOverHundredIndices.length - 1]
    : -1;

  // observedParagraph: lines between (after URL line) and (just before the
  // first table's label line). The label line is the last short non-blank
  // line before the table.
  if (tables[0] && urlLineIdx >= 0) {
    let start = urlLineIdx + 1;
    let end = tables[0].start;
    // Drop the table's label line (last short line before the table start).
    for (let i = end - 1; i >= start; i -= 1) {
      const t = lines[i].trim();
      if (!t) continue;
      if (looksLikeSectionLabel(t)) { end = i; break; }
      break;
    }
    empty.observedParagraph = stripLeadingLabelAndBlanks(lines.slice(start, end));
  }

  if (tables[0]) empty.scoringRows = mapScoringTable(tables[0]);
  if (tables[1]) empty.issuesRows = mapIssuesTable(tables[1]);
  if (tables[2]) empty.fixesRows = mapFixesTable(tables[2]);

  // strategicAdvantage: text after the projected-score line, or — if no
  // projected line was emitted — text after the last table's end.
  let strategicStart = -1;
  if (projectedScoreLineIdx >= 0) {
    strategicStart = projectedScoreLineIdx + 1;
  } else if (tables.length > 0) {
    strategicStart = tables[tables.length - 1].end + 1;
  }
  if (strategicStart >= 0 && strategicStart < lines.length) {
    empty.strategicAdvantage = stripLeadingLabelAndBlanks(lines.slice(strategicStart));
  }

  return empty;
}

// A "section label" is a short line that introduces a paragraph or table —
// the prompt's plain-text headings like "What we observed" or "Strategic
// Advantage for Bookassist" (translated). Heuristic: short (< 70 chars),
// no terminal punctuation, no pipe chars, no digit at the start, contains
// at least one letter.
function looksLikeSectionLabel(text: string): boolean {
  const t = text.trim().replace(/^#+\s*/, '');
  if (t.length === 0 || t.length > 70) return false;
  if (/[|]/.test(t)) return false;
  if (/[.!?](?:\s|$)/.test(t)) return false;
  if (/^\d/.test(t)) return false;
  if (!/[A-Za-zÀ-ÿĀ-￿]/.test(t)) return false;
  return true;
}

function stripLeadingLabelAndBlanks(lines: string[]): string | null {
  let i = 0;
  while (i < lines.length && lines[i].trim() === '') i += 1;
  if (i < lines.length && looksLikeSectionLabel(lines[i])) {
    i += 1;
    while (i < lines.length && lines[i].trim() === '') i += 1;
  }
  // Also strip trailing blanks and any trailing short label-looking line
  // (e.g. an out-of-place label that survived).
  let end = lines.length;
  while (end > i && lines[end - 1].trim() === '') end -= 1;
  const body = lines.slice(i, end).join('\n').trim();
  return body.length > 0 ? body : null;
}

function mapScoringTable(table: TableData): ScoringRow[] | null {
  if (table.rows.length === 0) return null;
  const rows: ScoringRow[] = table.rows
    .map(cells => {
      // Expect at least 3 columns: Category | Weight | Score
      if (cells.length < 3) return null;
      const category = cells[0].trim();
      const weight = parseIntSafe(cells[1]);
      const score = parseIntSafe(cells[2]);
      if (!category || weight <= 0) return null;
      return { category, weight, score };
    })
    .filter((r): r is ScoringRow => r !== null);
  return rows.length > 0 ? rows : null;
}

function mapIssuesTable(table: TableData): IssueRow[] | null {
  if (table.rows.length === 0) return null;
  const rows: IssueRow[] = table.rows
    .map(cells => {
      if (cells.length < 2) return null;
      return {
        issue: cells[0]?.trim() || '',
        impact: cells[1]?.trim() || '',
        pagesAffected: cells[2]?.trim() || '',
      };
    })
    .filter((r): r is IssueRow => r !== null && r.issue.length > 0);
  return rows.length > 0 ? rows : null;
}

function mapFixesTable(table: TableData): FixRow[] | null {
  if (table.rows.length === 0) return null;
  const rows: FixRow[] = table.rows
    .map(cells => {
      if (cells.length < 2) return null;
      const fix = cells[0]?.trim() || '';
      const ptsCell = cells[1] || '';
      const m = ptsCell.match(POINTS_RE);
      const pointsIncrease = m ? parseInt(m[1].replace(/\s+/g, ''), 10) : 0;
      if (!fix) return null;
      return { fix, pointsIncrease };
    })
    .filter((r): r is FixRow => r !== null);
  return rows.length > 0 ? rows : null;
}

// ----- Tier helpers -----

export type TierKey = 'optimised' | 'near' | 'below' | 'low';

export function tierFromScore(score: number | null): TierKey | null {
  if (score === null) return null;
  if (score >= 80) return 'optimised';
  if (score >= 60) return 'near';
  if (score >= 40) return 'below';
  return 'low';
}

export function tierColor(tier: TierKey | null): string {
  switch (tier) {
    case 'optimised': return '#2A9D8F'; // brand-success
    case 'near': return '#F59E0B';      // amber
    case 'below': return '#FF8F1B';     // brand-yellow-ish orange
    case 'low': return '#E63946';       // brand-accent
    default: return '#9CA3AF';          // grey
  }
}
