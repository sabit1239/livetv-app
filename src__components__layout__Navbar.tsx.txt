'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { Tv, Search, User, Menu, X, Sun, Moon, Settings, LogOut, Shield, Heart, History, List } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAppStore } from '@/store';

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const { user, logoutUser, theme, setTheme, searchQuery, setSearchQuery } = useAppStore();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) { router.push(`/search?q=${encodeURIComponent(searchQuery)}`); setSearchOpen(false); }
  };

  const handleSignOut = () => {
    logoutUser();
    router.push('/');
    setUserMenuOpen(false);
  };

  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/search?category=sports', label: 'Sports' },
    { href: '/search?category=news', label: 'News' },
    { href: '/search?category=entertainment', label: 'Entertainment' },
    { href: '/search?category=movies', label: 'Movies' },
    { href: '/guide', label: 'TV Guide' },
  ];

  return (
    <>
      <nav className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
        scrolled || mobileMenuOpen ? 'bg-black/95 backdrop-blur-xl border-b border-white/5 shadow-xl' : 'bg-gradient-to-b from-black/80 to-transparent'
      )}>
        <div className="max-w-screen-2xl mx-auto px-4 md:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2.5 flex-shrink-0">
              <div className="w-9 h-9 bg-red-600 rounded-xl flex items-center justify-center shadow-lg shadow-red-600/30">
                <Tv className="w-5 h-5 text-white" />
              </div>
              <span className="text-white text-xl font-black tracking-tight hidden sm:block">OTT<span className="text-red-500">Stream</span></span>
            </Link>

            <div className="hidden lg:flex items-center gap-1">
              {navLinks.map((link) => (
                <Link key={link.href} href={link.href}
                  className={cn('px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                    pathname === link.href ? 'text-white bg-white/10' : 'text-white/70 hover:text-white hover:bg-white/5')}>
                  {link.label}
                </Link>
              ))}
            </div>

            <div className="flex items-center gap-2">
              {searchOpen ? (
                <form onSubmit={handleSearch} className="flex items-center">
                  <input type="text" autoFocus value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search channels..."
                    className="bg-white/10 border border-white/20 text-white placeholder-white/40 rounded-xl px-4 py-2 text-sm w-48 md:w-64 focus:outline-none focus:border-red-500 transition-all" />
                  <button type="button" onClick={() => setSearchOpen(false)} className="text-white/60 hover:text-white p-2">
                    <X className="w-4 h-4" />
                  </button>
                </form>
              ) : (
                <button onClick={() => setSearchOpen(true)} className="text-white/70 hover:text-white p-2 rounded-lg hover:bg-white/10 transition-colors">
                  <Search className="w-5 h-5" />
                </button>
              )}

              <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className="text-white/70 hover:text-white p-2 rounded-lg hover:bg-white/10 transition-colors hidden md:block">
                {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>

              {user ? (
                <div className="relative">
                  <button onClick={() => setUserMenuOpen((o) => !o)}
                    className="flex items-center gap-2 bg-white/10 hover:bg-white/20 rounded-xl px-3 py-2 transition-colors">
                    <div className="w-6 h-6 bg-red-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                      {user.displayName?.[0]?.toUpperCase() || 'U'}
                    </div>
                    <span className="text-white text-sm font-medium hidden md:block max-w-24 truncate">{user.displayName}</span>
                  </button>

                  {userMenuOpen && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setUserMenuOpen(false)} />
                      <div className="absolute right-0 top-12 z-50 bg-zinc-900 border border-white/10 rounded-2xl p-2 w-56 shadow-2xl">
                        <div className="px-3 py-2 mb-1">
                          <p className="text-white font-semibold text-sm truncate">{user.displayName}</p>
                          <p className="text-white/50 text-xs truncate">{user.email}</p>
                        </div>
                        <div className="border-t border-white/10 my-1" />
                        {[
                          { icon: User, label: 'Profile', href: '/profile' },
                          { icon: Heart, label: 'Favorites', href: '/profile?tab=favorites' },
                          { icon: History, label: 'Watch History', href: '/profile?tab=history' },
                          { icon: List, label: 'My Playlists', href: '/settings?tab=playlists' },
                          { icon: Settings, label: 'Settings', href: '/settings' },
                        ].map(({ icon: Icon, label, href }) => (
                          <Link key={href} href={href} onClick={() => setUserMenuOpen(false)}
                            className="flex items-center gap-3 px-3 py-2 rounded-xl text-white/70 hover:text-white hover:bg-white/10 transition-colors text-sm">
                            <Icon className="w-4 h-4" />{label}
                          </Link>
                        ))}
                        {user.isAdmin && (
                          <>
                            <div className="border-t border-white/10 my-1" />
                            <Link href="/admin" onClick={() => setUserMenuOpen(false)}
                              className="flex items-center gap-3 px-3 py-2 rounded-xl text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors text-sm">
                              <Shield className="w-4 h-4" />Admin Panel
                            </Link>
                          </>
                        )}
                        <div className="border-t border-white/10 my-1" />
                        <button onClick={handleSignOut}
                          className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-white/70 hover:text-red-400 hover:bg-red-500/10 transition-colors text-sm">
                          <LogOut className="w-4 h-4" />Sign Out
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ) : (
                <Link href="/auth/login" className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-xl text-sm font-semibold transition-colors">
                  Sign In
                </Link>
              )}

              <button onClick={() => setMobileMenuOpen((o) => !o)}
                className="lg:hidden text-white/70 hover:text-white p-2 rounded-lg hover:bg-white/10 transition-colors">
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-white/10 py-4 px-4">
            {navLinks.map((link) => (
              <Link key={link.href} href={link.href} onClick={() => setMobileMenuOpen(false)}
                className="block px-4 py-3 text-white/70 hover:text-white hover:bg-white/5 rounded-xl transition-colors text-sm font-medium">
                {link.label}
              </Link>
            ))}
          </div>
        )}
      </nav>
      <div className="h-16" />
    </>
  );
}
