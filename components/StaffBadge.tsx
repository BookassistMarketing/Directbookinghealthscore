'use client';

import React from 'react';
import { ShieldCheck, BadgeCheck, LogOut } from 'lucide-react';
import type { StaffRole } from '../lib/staffBypass';

/**
 * Unified "signed in as Bookassist staff" badge — used on the staff hub,
 * AI Audit and Tech Audit. Two visual treatments so the role is obvious
 * at a glance: yellow ShieldCheck for the global staff password,
 * brand-blue BadgeCheck for the marketing password (which unlocks the
 * sample-report preview shortcut on the AI Audit idle view). Sign-out
 * button is always rendered next to it so the user can leave from
 * anywhere the badge is visible.
 */
interface StaffBadgeProps {
  role: StaffRole;
  onSignOut: () => void;
  className?: string;
}

export function StaffBadge({ role, onSignOut, className }: StaffBadgeProps) {
  const isMarketing = role === 'marketing';
  const Icon = isMarketing ? BadgeCheck : ShieldCheck;
  const badgeClasses = isMarketing
    ? 'bg-brand-blue text-white'
    : 'bg-brand-yellow text-gray-900';
  const label = isMarketing
    ? 'Signed in as Bookassist marketing'
    : 'Signed in as Bookassist staff';

  return (
    <div className={`inline-flex flex-wrap items-center gap-3 ${className ?? ''}`}>
      <span
        className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest shadow-sm ${badgeClasses}`}
      >
        <Icon className="w-3.5 h-3.5" />
        {label}
      </span>
      <button
        type="button"
        onClick={onSignOut}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-brand-accent transition-colors uppercase tracking-widest"
      >
        <LogOut className="w-3 h-3" />
        Sign out
      </button>
    </div>
  );
}
