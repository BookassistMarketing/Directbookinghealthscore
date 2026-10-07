import { Montserrat } from 'next/font/google';
import './event.css';

// Shared by the stand page and its QR idle screen (/event/<slug>/qr).
const montserrat = Montserrat({
  subsets: ['latin', 'latin-ext'],
  weight: ['700', '800'],
  variable: '--ev-head',
  display: 'swap',
});

export default function EventLayout({ children }: { children: React.ReactNode }) {
  return <div className={montserrat.variable}>{children}</div>;
}
