import type { Metadata } from 'next';
import localFont from 'next/font/local';
import './globals.css';
import { DataProvider } from '@/lib/store';
import Sidebar from '@/components/Sidebar';
import FeedRail from '@/components/FeedRail';

const grotesk = localFont({
  src: [
    { path: '../fonts/SpaceGrotesk-500.woff2', weight: '500', style: 'normal' },
    { path: '../fonts/SpaceGrotesk-600.woff2', weight: '600', style: 'normal' },
    { path: '../fonts/SpaceGrotesk-700.woff2', weight: '700', style: 'normal' },
  ],
  variable: '--font-grotesk',
  display: 'swap',
});

const inter = localFont({
  src: [
    { path: '../fonts/Inter-400.woff2', weight: '400', style: 'normal' },
    { path: '../fonts/Inter-500.woff2', weight: '500', style: 'normal' },
    { path: '../fonts/Inter-600.woff2', weight: '600', style: 'normal' },
    { path: '../fonts/Inter-700.woff2', weight: '700', style: 'normal' },
  ],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'RIVO Mission Control',
  description: 'La squadra growth di Rivolio, in tempo reale.',
  icons: { icon: '/logo.png' },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="it" className={`${grotesk.variable} ${inter.variable}`}>
      <body>
        <div className="page-bg" />
        <DataProvider>
          <div className="flex min-h-screen">
            <Sidebar />
            <main className="min-w-0 flex-1 px-5 pb-10 pt-5 lg:px-8">{children}</main>
            <FeedRail />
          </div>
        </DataProvider>
      </body>
    </html>
  );
}
