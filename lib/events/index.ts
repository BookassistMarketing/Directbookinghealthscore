import type { EventSkin } from './types';
import { TTG_2026 } from './ttg-2026';

// Every event stand page. To add one: copy ttg-2026.ts, put its images in
// public/events/<slug>/, register it here. See lib/events/README.md.
const SKINS: EventSkin[] = [TTG_2026];

export const EVENTS: Record<string, EventSkin> = Object.fromEntries(SKINS.map(s => [s.slug, s]));

export function getEvent(slug: string): EventSkin | null {
  return Object.prototype.hasOwnProperty.call(EVENTS, slug) ? EVENTS[slug] : null;
}

export type { EventSkin } from './types';
