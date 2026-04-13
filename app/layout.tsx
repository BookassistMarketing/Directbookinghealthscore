import type { Metadata } from 'next';
import Script from 'next/script';
import { ContentProvider } from '../contexts/ContentContext';
import { AppShell } from '../components/AppShell';
import './globals.css';

export const metadata: Metadata = {
  title: 'Direct Booking Health Score | Digital Audit',
  description: 'Professional hotel technology and marketing audit tool with AI-powered strategic assessments.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link
          rel="icon"
          type="image/svg+xml"
          href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Crect width='24' height='24' rx='4' fill='%23003366'/%3E%3Cpath d='M22 12h-4l-3 9L9 3l-3 9H2' fill='none' stroke='white' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <Script
          src="https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js"
          strategy="beforeInteractive"
        />
        <Script
          src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"
          strategy="beforeInteractive"
        />
        <Script
          src="https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js"
          strategy="beforeInteractive"
        />
        <ContentProvider>
          <AppShell>{children}</AppShell>
        </ContentProvider>
      </body>
    </html>
  );
}
