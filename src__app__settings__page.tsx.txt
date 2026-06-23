'use client';

import { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { List, Plus, Trash2, Upload, Link as LinkIcon, Loader2, Check, X, RefreshCw } from 'lucide-react';
import { useAppStore } from '@/store';
import { fetchM3UFromUrl, m3uEntriesToChannels } from '@/lib/m3u-parser';
import { PLAYLIST_SOURCES } from '@/lib/channels-data';
import toast from 'react-hot-toast';
import { cn } from '@/lib/utils';

function SettingsContent() {
  const searchParams = useSearchParams();
  const activeTab = searchParams.get('tab') || 'playlists';
  const { importedPlaylists, addPlaylist, removePlaylist, channels } = useAppStore();

  const [playlistUrl, setPlaylistUrl] = useState('');
  const [playlistName, setPlaylistName] = useState('');
  const [importing, setImporting] = useState(false);
  const [importSuccess, setImportSuccess] = useState(false);

  const handleImportUrl = async () => {
    if (!playlistUrl.trim()) { toast.error('Please enter a playlist URL'); return; }
    setImporting(true);
    setImportSuccess(false);
    try {
      const entries = await fetchM3UFromUrl(playlistUrl);
      if (entries.length === 0) { toast.error('No channels found in this playlist'); return; }
      const parsedChannels = m3uEntriesToChannels(entries);
      const id = `playlist-${Date.now()}`;
      const name = playlistName.trim() || new URL(playlistUrl).hostname;
      addPlaylist({ id, name, channels: parsedChannels });
      setImportSuccess(true);
      setPlaylistUrl('');
      setPlaylistName('');
      toast.success(`Imported ${parsedChannels.length} channels from "${name}"`);
    } catch (error) {
      toast.error('Failed to import playlist. Check the URL and try again.');
    } finally {
      setImporting(false);
    }
  };

  const handleQuickImport = async (source: typeof PLAYLIST_SOURCES[number]) => {
    setPlaylistUrl(source.url);
    setPlaylistName(source.name);
  };

  return (
    <div className="min-h-screen bg-black">
      <div className="max-w-4xl mx-auto px-4 md:px-8 py-10">
        <h1 className="text-white text-3xl font-black mb-8">Settings</h1>

        {/* Import Playlist Section */}
        <div className="bg-zinc-900 border border-white/10 rounded-2xl p-6 mb-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-red-600/20 rounded-xl flex items-center justify-center">
              <List className="w-5 h-5 text-red-400" />
            </div>
            <div>
              <h2 className="text-white font-bold text-lg">Import Playlist</h2>
              <p className="text-white/50 text-sm">Add M3U playlist URLs to expand your channel library</p>
            </div>
          </div>

          {/* URL Input */}
          <div className="space-y-3 mb-6">
            <div>
              <label className="text-white/60 text-sm mb-2 block">Playlist Name (optional)</label>
              <input
                type="text"
                value={playlistName}
                onChange={(e) => setPlaylistName(e.target.value)}
                placeholder="My Custom Playlist"
                className="w-full bg-zinc-800 border border-white/10 text-white placeholder-white/20 rounded-xl px-4 py-3 focus:outline-none focus:border-red-500 transition-colors text-sm"
              />
            </div>
            <div>
              <label className="text-white/60 text-sm mb-2 block">M3U Playlist URL</label>
              <div className="flex gap-3">
                <div className="relative flex-1">
                  <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                  <input
                    type="url"
                    value={playlistUrl}
                    onChange={(e) => setPlaylistUrl(e.target.value)}
                    placeholder="https://example.com/playlist.m3u"
                    className="w-full bg-zinc-800 border border-white/10 text-white placeholder-white/20 rounded-xl pl-11 pr-4 py-3 focus:outline-none focus:border-red-500 transition-colors text-sm"
                  />
                </div>
                <button
                  onClick={handleImportUrl}
                  disabled={importing || !playlistUrl.trim()}
                  className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-xl font-semibold text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                >
                  {importing ? <Loader2 className="w-4 h-4 animate-spin" /> : importSuccess ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                  {importing ? 'Importing...' : 'Import'}
                </button>
              </div>
            </div>
          </div>

          {/* Quick Import Sources */}
          <div>
            <p className="text-white/40 text-xs font-semibold uppercase tracking-wider mb-3">Quick Import Sources</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {PLAYLIST_SOURCES.map((source) => (
                <button
                  key={source.id}
                  onClick={() => handleQuickImport(source)}
                  className="flex items-center gap-2 bg-zinc-800 hover:bg-zinc-700 border border-white/5 hover:border-white/15 rounded-xl px-3 py-2.5 text-left transition-all group"
                >
                  <LinkIcon className="w-3.5 h-3.5 text-white/30 group-hover:text-red-400 flex-shrink-0" />
                  <span className="text-white/60 group-hover:text-white text-xs font-medium truncate">{source.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Imported Playlists */}
        {importedPlaylists.length > 0 && (
          <div className="bg-zinc-900 border border-white/10 rounded-2xl p-6">
            <h3 className="text-white font-bold mb-4 flex items-center gap-2">
              <Upload className="w-5 h-5 text-red-400" />
              Imported Playlists ({importedPlaylists.length})
            </h3>
            <div className="space-y-3">
              {importedPlaylists.map((playlist) => (
                <div key={playlist.id} className="flex items-center justify-between bg-zinc-800 border border-white/5 rounded-xl px-4 py-3">
                  <div>
                    <p className="text-white font-medium text-sm">{playlist.name}</p>
                    <p className="text-white/40 text-xs mt-0.5">{playlist.channels.length} channels</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="bg-green-500/10 text-green-400 text-xs px-2.5 py-1 rounded-full font-medium">Active</span>
                    <button
                      onClick={() => { removePlaylist(playlist.id); toast.success(`Removed "${playlist.name}"`); }}
                      className="text-white/30 hover:text-red-400 transition-colors p-1.5 rounded-lg hover:bg-red-500/10"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Channel Stats */}
        <div className="mt-6 grid grid-cols-3 gap-4">
          {[
            { label: 'Total Channels', value: channels.length },
            { label: 'Imported Playlists', value: importedPlaylists.length },
            { label: 'Categories', value: new Set(channels.map((c) => c.category)).size },
          ].map(({ label, value }) => (
            <div key={label} className="bg-zinc-900 border border-white/10 rounded-xl p-4 text-center">
              <p className="text-white text-2xl font-black">{value}</p>
              <p className="text-white/50 text-xs mt-1">{label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function SettingsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-black" />}>
      <SettingsContent />
    </Suspense>
  );
}
