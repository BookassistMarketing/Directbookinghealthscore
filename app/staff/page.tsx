import type { Metadata } from 'next';
import { StaffHub } from './StaffHub';

export const metadata: Metadata = {
  title: 'Staff Access',
  robots: { index: false, follow: false },
};

export default function StaffPage() {
  return <StaffHub />;
}
