import Link from 'next/link';
import { Tv, Github, Twitter, Globe } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-black border-t border-white/5 mt-20">
      <div className="max-w-screen-2xl mx-auto px-4 md:px-8 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-10">
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center">
                <Tv className="w-4 h-4 text-white" />
              </div>
              <span className="text-white text-lg font-black">OTT<span className="text-red-500">Stream</span></span>
            </Link>
            <p className="text-white/50 text-sm leading-relaxed">
              Watch live TV channels from around the world. Sports, news, entertainment and more.
            </p>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-3 text-sm">Browse</h4>
            <ul className="space-y-2">
              {['Sports', 'News', 'Entertainment', 'Movies', 'Kids', 'Music'].map((cat) => (
                <li key={cat}>
                  <Link
                    href={`/search?category=${cat.toLowerCase()}`}
                    className="text-white/50 hover:text-white text-sm transition-colors"
                  >
                    {cat}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-3 text-sm">Account</h4>
            <ul className="space-y-2">
              {[
                { label: 'Sign In', href: '/auth/login' },
                { label: 'Register', href: '/auth/register' },
                { label: 'Profile', href: '/profile' },
                { label: 'Settings', href: '/settings' },
                { label: 'Favorites', href: '/profile?tab=favorites' },
              ].map(({ label, href }) => (
                <li key={href}>
                  <Link href={href} className="text-white/50 hover:text-white text-sm transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-3 text-sm">Features</h4>
            <ul className="space-y-2">
              {[
                { label: 'TV Guide', href: '/guide' },
                { label: 'Import Playlist', href: '/settings?tab=playlists' },
                { label: 'Admin Panel', href: '/admin' },
                { label: 'Search Channels', href: '/search' },
              ].map(({ label, href }) => (
                <li key={href}>
                  <Link href={href} className="text-white/50 hover:text-white text-sm transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-white/5 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-white/30 text-xs">
            © {new Date().getFullYear()} OTTStream. All rights reserved. For personal use only.
          </p>
          <div className="flex items-center gap-4">
            <span className="text-white/30 text-xs">Built with Next.js 15 · Firebase · HLS.js</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
