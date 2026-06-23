import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { AuthProvider } from '@/components/layout/AuthProvider';
import { Toaster } from 'react-hot-toast';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter', display: 'swap' });

export const metadata: Metadata = {
  title: { default: 'OTTStream - Watch Live TV Online', template: '%s | OTTStream' },
  description: 'Watch live TV channels from around the world. Sports, news, entertainment and more.',
  keywords: ['live tv', 'streaming', 'iptv', 'm3u', 'sports', 'news', 'online tv'],
  manifest: '/manifest.json',
  icons: { icon: '/icons/icon-192.png', apple: '/icons/icon-192.png' },
  openGraph: { title: 'OTTStream - Watch Live TV Online', description: 'Watch live TV channels from around the world.', type: 'website' },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: [{ media: '(prefers-color-scheme: dark)', color: '#000000' }],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans bg-black text-white antialiased`}>
        <AuthProvider>
          <Navbar />
          <main className="min-h-screen">{children}</main>
          <Footer />
          <Toaster
            position="bottom-right"
            toastOptions={{
              style: { background: '#18181b', color: '#fff', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' },
              success: { iconTheme: { primary: '#ef4444', secondary: '#fff' } },
            }}
          />
        </AuthProvider>
      </body>
    </html>
  );
}
