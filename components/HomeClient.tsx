'use client';

import { useRouter } from 'next/navigation';
import { Home } from './Home';

export function HomeClient() {
  const router = useRouter();
  return <Home onStart={() => router.push('/hotel-audit')} />;
}
