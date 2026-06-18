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
    unrecognisedSections: [],
  };

  if (!markdown || typeof markdown !== 'string') return empty;

  const lines = markdown.split('\n');

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

  // 3. Hotel name — the first non-empty, non-header, non-URL, non-score line
  //    of the document, OR the first H1 if there is one.
  const firstH1 = lines.find(l => /^#\s+/.test(l));
  if (firstH1) {
    empty.hotelName = stripMarkdown(firstH1);
  } else {
    for (const line of lines) {
      const t = line.trim();
      if (!t) continue;
      if (/^#+\s/.test(t)) continue;
      if (URL_RE.test(t)) continue;
      if (/\/\s*100/.test(t)) continue;
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

  // 5. Body sections — find first H2/H3 and parse onwards.
  const firstSectionLine = lines.findIndex(l => /^#{2,4}\s+/.test(l));
  if (firstSectionLine === -1) return empty;

  const allSections = splitIntoSections(lines, firstSectionLine);

  // The first section is usually the report title ("AI Visibility &
  // Optimisation Summary") whose body contains the score + URL lines we
  // already extracted above. Drop it so the position-based mapping below
  // aligns with the 5 content sections that follow.
  const containsScoreLine = (s: RawSection) =>
    s.bodyLines.some(line => /\/\s*100\b/.test(line));
  const sections = allSections.length > 0 && containsScoreLine(allSections[0])
    ? allSections.slice(1)
    : allSections;

  // Map by position to: observed → scoring → issues → fixes → strategic
  // If sections.length < 5, we still try to render what's there. Extra
  // sections beyond the 5 expected are kept in `unrecognisedSections`.
  const TOTAL_EXPECTED = 5;
  for (let i = 0; i < sections.length; i += 1) {
    const section = sections[i];
    if (i === 0) {
      empty.observedParagraph = sectionFirstParagraph(section) ?? sectionMarkdown(section) ?? null;
    } else if (i === 1) {
      const tables = sectionTables(section);
      if (tables.length > 0) empty.scoringRows = mapScoringTable(tables[0]);
    } else if (i === 2) {
      const tables = sectionTables(section);
      if (tables.length > 0) empty.issuesRows = mapIssuesTable(tables[0]);
    } else if (i === 3) {
      const tables = sectionTables(section);
      if (tables.length > 0) empty.fixesRows = mapFixesTable(tables[0]);
    } else if (i === 4) {
      empty.strategicAdvantage = sectionMarkdown(section) || null;
    } else {
      empty.unrecognisedSections.push({
        heading: section.heading,
        body: sectionMarkdown(section),
      });
    }
    if (i >= TOTAL_EXPECTED) break;
  }

  return empty;
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
