'use client';

import { Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { User, Heart, History, Settings, LogOut, Tv, Clock, Trash2 } from 'lucide-react';
import { useAppStore } from '@/store';
import { CATEGORY_CONFIG } from '@/lib/channels-data';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import toast from 'react-hot-toast';
import Link from 'next/link';

function ProfileContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeTab = searchParams.get('tab') || 'profile';
  const { user, logoutUser, watchHistory, favorites, channels, clearHistory, toggleFavorite } = useAppStore();

  const favoriteChannels = favorites.map((f) => channels.find((c) => c.id === f.channelId)).filter(Boolean);
  const historyWithChannels = watchHistory.map((h) => ({ ...h, channel: channels.find((c) => c.id === h.channelId) }));

  const handleSignOut = () => {
    logoutUser();
    router.push('/');
    toast.success('Signed out');
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <User className="w-16 h-16 text-white/20 mx-auto mb-4" />
          <h2 className="text-white text-xl font-bold mb-2">Sign in Required</h2>
          <p className="text-white/50 mb-6">Sign in to view your profile and watch history</p>
          <Link href="/auth/login" className="bg-red-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-red-700 transition-colors">Sign In</Link>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'favorites', label: `Favorites (${favorites.length})`, icon: Heart },
    { id: 'history', label: `History (${watchHistory.length})`, icon: History },
  ];

  return (
    <div className="min-h-screen bg-black">
      <div className="max-w-4xl mx-auto px-4 md:px-8 py-10">
        <div className="flex items-center gap-5 mb-10">
          <div className="w-20 h-20 bg-red-600 rounded-2xl flex items-center justify-center text-white text-3xl font-black">
            {user.displayName?.[0]?.toUpperCase() || 'U'}
          </div>
          <div>
            <h1 className="text-white text-2xl font-black">{user.displayName}</h1>
            <p className="text-white/50">{user.email}</p>
            {user.isAdmin && (
              <span className="inline-block mt-1 bg-red-600/20 text-red-400 text-xs font-bold px-2.5 py-1 rounded-full border border-red-500/20">Admin</span>
            )}
          </div>
        </div>

        <div className="flex gap-2 mb-8 border-b border-white/10">
          {tabs.map(({ id, label, icon: Icon }) => (
            <Link key={id} href={`/profile${id !== 'profile' ? `?tab=${id}` : ''}`}
              className={cn('flex items-center gap-2 px-4 py-3 text-sm font-semibold transition-all border-b-2 -mb-px',
                activeTab === id ? 'text-white border-red-500' : 'text-white/50 hover:text-white border-transparent')}>
              <Icon className="w-4 h-4" />{label}
            </Link>
          ))}
        </div>

        {activeTab === 'profile' && (
          <div className="space-y-4">
            <div className="bg-zinc-900 border border-white/10 rounded-2xl p-6">
              <h3 className="text-white font-bold mb-4">Account Information</h3>
              <div className="space-y-3">
                {[
                  { label: 'Display Name', value: user.displayName },
                  { label: 'Email', value: user.email },
                  { label: 'Member Since', value: new Date(user.createdAt).toLocaleDateString() },
                  { label: 'Role', value: user.isAdmin ? 'Administrator' : 'Member' },
                ].map(({ label, value }) => (
                  <div key={label} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                    <span className="text-white/50 text-sm">{label}</span>
                    <span className="text-white text-sm font-medium">{value}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              {[
                { label: 'Watched', value: watchHistory.length, icon: '👁️' },
                { label: 'Favorites', value: favorites.length, icon: '❤️' },
                { label: 'Channels', value: channels.length, icon: '📺' },
              ].map(({ label, value, icon }) => (
                <div key={label} className="bg-zinc-900 border border-white/10 rounded-xl p-4 text-center">
                  <div className="text-2xl mb-1">{icon}</div>
                  <p className="text-white text-xl font-black">{value}</p>
                  <p className="text-white/40 text-xs">{label}</p>
                </div>
              ))}
            </div>
            <div className="flex gap-3">
              <Link href="/settings" className="flex items-center gap-2 bg-zinc-900 border border-white/10 text-white/70 hover:text-white px-4 py-3 rounded-xl text-sm font-semibold transition-colors hover:bg-zinc-800">
                <Settings className="w-4 h-4" />Settings
              </Link>
              <button onClick={handleSignOut} className="flex items-center gap-2 bg-red-600/10 border border-red-500/20 text-red-400 hover:bg-red-600/20 px-4 py-3 rounded-xl text-sm font-semibold transition-all">
                <LogOut className="w-4 h-4" />Sign Out
              </button>
            </div>
          </div>
        )}

        {activeTab === 'favorites' && (
          <div>
            {favoriteChannels.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {favoriteChannels.map((channel) => {
                  if (!channel) return null;
                  const config = CATEGORY_CONFIG[channel.category] || CATEGORY_CONFIG.other;
                  return (
                    <div key={channel.id} className="bg-zinc-900 border border-white/10 rounded-xl overflow-hidden group">
                      <div className="aspect-video bg-zinc-800 flex items-center justify-center cursor-pointer relative" onClick={() => router.push(`/channel/${channel.id}`)}>
                        {channel.logo ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={channel.logo} alt={channel.name} className="w-12 h-12 object-contain" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                        ) : <span className="text-2xl">{config.icon}</span>}
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"><Tv className="w-8 h-8 text-white" /></div>
                      </div>
                      <div className="p-3 flex items-center justify-between">
                        <div>
                          <p className="text-white text-sm font-semibold truncate">{channel.name}</p>
                          <p className="text-white/40 text-xs">{config.label}</p>
                        </div>
                        <button onClick={() => { toggleFavorite(channel.id); toast.success('Removed'); }} className="text-red-400 hover:text-red-300 p-1.5">
                          <Heart className="w-4 h-4 fill-red-400" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-16">
                <Heart className="w-14 h-14 text-white/10 mx-auto mb-4" />
                <h3 className="text-white font-bold mb-2">No favorites yet</h3>
                <p className="text-white/40 text-sm mb-6">Heart channels to save them here</p>
                <Link href="/search" className="bg-red-600 text-white px-6 py-2.5 rounded-xl font-semibold text-sm hover:bg-red-700 transition-colors">Browse Channels</Link>
              </div>
            )}
          </div>
        )}

        {activeTab === 'history' && (
          <div>
            {historyWithChannels.length > 0 ? (
              <>
                <div className="flex justify-end mb-4">
                  <button onClick={() => { clearHistory(); toast.success('History cleared'); }} className="flex items-center gap-2 text-white/40 hover:text-red-400 text-sm transition-colors">
                    <Trash2 className="w-4 h-4" />Clear History
                  </button>
                </div>
                <div className="space-y-2">
                  {historyWithChannels.map((item, i) => {
                    const config = item.channel ? CATEGORY_CONFIG[item.channel.category] : CATEGORY_CONFIG.other;
                    return (
                      <div key={`${item.channelId}-${i}`} onClick={() => router.push(`/channel/${item.channelId}`)}
                        className="flex items-center gap-4 bg-zinc-900 hover:bg-zinc-800 border border-white/5 rounded-xl p-4 cursor-pointer transition-all group">
                        <div className="w-12 h-12 bg-zinc-800 rounded-xl flex items-center justify-center flex-shrink-0 overflow-hidden">
                          {item.channelLogo
                            ? <img src={item.channelLogo} alt={item.channelName} className="w-10 h-10 object-contain" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                            : <span className="text-xl">{config?.icon || '📺'}</span>}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-white font-semibold text-sm truncate group-hover:text-red-400 transition-colors">{item.channelName}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <Clock className="w-3 h-3 text-white/30" />
                            <span className="text-white/40 text-xs">{formatDistanceToNow(new Date(item.watchedAt), { addSuffix: true })}</span>
                          </div>
                        </div>
                        <Tv className="w-4 h-4 text-white/20 group-hover:text-white/60 transition-colors flex-shrink-0" />
                      </div>
                    );
                  })}
                </div>
              </>
            ) : (
              <div className="text-center py-16">
                <History className="w-14 h-14 text-white/10 mx-auto mb-4" />
                <h3 className="text-white font-bold mb-2">No watch history</h3>
                <p className="text-white/40 text-sm mb-6">Channels you watch will appear here</p>
                <Link href="/" className="bg-red-600 text-white px-6 py-2.5 rounded-xl font-semibold text-sm hover:bg-red-700 transition-colors">Start Watching</Link>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default function ProfilePage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-black" />}>
      <ProfileContent />
    </Suspense>
  );
}
