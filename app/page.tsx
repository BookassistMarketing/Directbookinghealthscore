'use client';

import { useRouter } from 'next/navigation';
import { Home } from '../components/Home';

export default function HomePage() {
  const router = useRouter();
  return <Home onStart={() => router.push('/hotel-audit')} />;
}
