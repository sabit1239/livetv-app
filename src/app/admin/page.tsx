'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Shield, Tv, Users, TrendingUp, Plus, Edit, Trash2, Search, BarChart3, Eye, RefreshCw } from 'lucide-react';
import { useAppStore } from '@/store';
import { Channel } from '@/types';
import { CATEGORY_CONFIG } from '@/lib/channels-data';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';

type TabType = 'dashboard' | 'channels' | 'users';

const TABS: { id: TabType; label: string }[] = [
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'channels', label: 'Channels' },
  { id: 'users', label: 'Users' },
];

export default function AdminPage() {
  const router = useRouter();
  const { user, channels, addChannel, updateChannel, deleteChannel } = useAppStore();
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingChannel, setEditingChannel] = useState<Channel | null>(null);
  const [formData, setFormData] = useState({
    name: '', url: '', logo: '', category: 'sports' as Channel['category'],
    country: '', language: '', description: '', isHD: true, isLive: true,
    isFeatured: false, isTrending: false,
  });

  useEffect(() => {
    if (user && !user.isAdmin) { toast.error('Admin access required'); router.push('/'); }
  }, [user, router]);

  const filteredChannels = channels.filter((c) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const stats = [
    { label: 'Total Channels', value: channels.length, color: 'text-blue-400', bg: 'bg-blue-400/10' },
    { label: 'Sports', value: channels.filter((c) => c.category === 'sports').length, color: 'text-green-400', bg: 'bg-green-400/10' },
    { label: 'Featured', value: channels.filter((c) => c.isFeatured).length, color: 'text-yellow-400', bg: 'bg-yellow-400/10' },
    { label: 'Categories', value: new Set(channels.map((c) => c.category)).size, color: 'text-purple-400', bg: 'bg-purple-400/10' },
  ];

  const resetForm = () => {
    setFormData({ name: '', url: '', logo: '', category: 'sports', country: '', language: '', description: '', isHD: true, isLive: true, isFeatured: false, isTrending: false });
    setEditingChannel(null);
    setShowAddForm(false);
  };

  const handleSave = () => {
    if (!formData.name || !formData.url) { toast.error('Name and URL are required'); return; }
    if (editingChannel) { updateChannel(editingChannel.id, formData); toast.success('Channel updated'); }
    else { addChannel({ ...formData, id: `custom-${Date.now()}`, tags: [], addedAt: new Date().toISOString() }); toast.success('Channel added'); }
    resetForm();
  };

  const handleEdit = (channel: Channel) => {
    setEditingChannel(channel);
    setFormData({ name: channel.name, url: channel.url, logo: channel.logo, category: channel.category, country: channel.country || '', language: channel.language || '', description: channel.description || '', isHD: channel.isHD || false, isLive: channel.isLive || false, isFeatured: channel.isFeatured || false, isTrending: channel.isTrending || false });
    setShowAddForm(true);
  };

  const handleDelete = (channel: Channel) => {
    if (confirm(`Delete "${channel.name}"?`)) { deleteChannel(channel.id); toast.success('Channel deleted'); }
  };

  if (!user?.isAdmin) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <Shield className="w-16 h-16 text-white/20 mx-auto mb-4" />
          <h2 className="text-white text-xl font-bold mb-2">Admin Access Required</h2>
          <Link href="/" className="bg-red-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-red-700 transition-colors">Go Home</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      <div className="max-w-screen-2xl mx-auto px-4 md:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-600 rounded-xl flex items-center justify-center"><Shield className="w-5 h-5 text-white" /></div>
            <div><h1 className="text-white text-2xl font-black">Admin Panel</h1><p className="text-white/50 text-sm">Manage channels and content</p></div>
          </div>
          <Link href="/" className="text-white/50 hover:text-white text-sm transition-colors">← Back to Site</Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {stats.map(({ label, value, color, bg }) => (
            <div key={label} className="bg-zinc-900 border border-white/10 rounded-xl p-5">
              <p className={cn('text-2xl font-black', color)}>{value}</p>
              <p className="text-white/50 text-sm mt-0.5">{label}</p>
            </div>
          ))}
        </div>

        <div className="flex gap-2 mb-6 border-b border-white/10">
          {TABS.map(({ id, label }) => (
            <button key={id} onClick={() => setActiveTab(id)}
              className={cn('px-4 py-3 text-sm font-semibold transition-all border-b-2 -mb-px',
                activeTab === id ? 'text-white border-red-500' : 'text-white/50 hover:text-white border-transparent')}>
              {label}
            </button>
          ))}
        </div>

        {activeTab === 'channels' && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search channels..."
                  className="w-full bg-zinc-900 border border-white/10 text-white placeholder-white/20 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-red-500" />
              </div>
              <button onClick={() => { resetForm(); setShowAddForm(true); }}
                className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors">
                <Plus className="w-4 h-4" />Add Channel
              </button>
            </div>

            {showAddForm && (
              <div className="bg-zinc-900 border border-white/10 rounded-2xl p-6 mb-6">
                <h3 className="text-white font-bold mb-4">{editingChannel ? 'Edit Channel' : 'Add New Channel'}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { key: 'name', label: 'Channel Name *', placeholder: 'e.g. BBC News' },
                    { key: 'url', label: 'Stream URL (M3U8) *', placeholder: 'https://...' },
                    { key: 'logo', label: 'Logo URL', placeholder: 'https://...' },
                    { key: 'country', label: 'Country', placeholder: 'e.g. United Kingdom' },
                    { key: 'language', label: 'Language', placeholder: 'e.g. English' },
                  ].map(({ key, label, placeholder }) => (
                    <div key={key}>
                      <label className="text-white/60 text-xs mb-1.5 block">{label}</label>
                      <input type="text" value={formData[key as keyof typeof formData] as string}
                        onChange={(e) => setFormData({ ...formData, [key]: e.target.value })} placeholder={placeholder}
                        className="w-full bg-zinc-800 border border-white/10 text-white placeholder-white/20 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-red-500" />
                    </div>
                  ))}
                  <div>
                    <label className="text-white/60 text-xs mb-1.5 block">Category</label>
                    <select value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value as Channel['category'] })}
                      className="w-full bg-zinc-800 border border-white/10 text-white rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-red-500">
                      {Object.entries(CATEGORY_CONFIG).map(([key, config]) => (
                        <option key={key} value={key}>{config.icon} {config.label}</option>
                      ))}
                    </select>
                  </div>
                  <div className="md:col-span-2 flex flex-wrap gap-4">
                    {[
                      { key: 'isLive', label: 'Live Stream' },
                      { key: 'isHD', label: 'HD Quality' },
                      { key: 'isFeatured', label: 'Featured' },
                      { key: 'isTrending', label: 'Trending' },
                    ].map(({ key, label }) => (
                      <label key={key} className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" checked={formData[key as keyof typeof formData] as boolean}
                          onChange={(e) => setFormData({ ...formData, [key]: e.target.checked })} className="w-4 h-4 accent-red-500" />
                        <span className="text-white/70 text-sm">{label}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <div className="flex gap-3 mt-5">
                  <button onClick={handleSave} className="bg-red-600 hover:bg-red-700 text-white px-6 py-2.5 rounded-xl text-sm font-semibold transition-colors">
                    {editingChannel ? 'Update' : 'Add Channel'}
                  </button>
                  <button onClick={resetForm} className="bg-zinc-800 hover:bg-zinc-700 text-white/70 px-6 py-2.5 rounded-xl text-sm font-semibold transition-colors">Cancel</button>
                </div>
              </div>
            )}

            <div className="space-y-2">
              {filteredChannels.map((channel) => {
                const config = CATEGORY_CONFIG[channel.category] || CATEGORY_CONFIG.other;
                return (
                  <div key={channel.id} className="flex items-center gap-4 bg-zinc-900 border border-white/5 hover:border-white/10 rounded-xl p-4 group">
                    <div className="w-10 h-10 bg-zinc-800 rounded-lg flex items-center justify-center flex-shrink-0">
                      {channel.logo
                        ? <img src={channel.logo} alt={channel.name} className="w-8 h-8 object-contain" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                        : <span>{config.icon}</span>}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-semibold text-sm truncate">{channel.name}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-white/40 text-xs capitalize">{config.label}</span>
                        {channel.isLive && <span className="text-red-400 text-xs">● LIVE</span>}
                        {channel.isFeatured && <span className="bg-yellow-500/10 text-yellow-400 text-xs px-1.5 py-0.5 rounded">Featured</span>}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => router.push(`/channel/${channel.id}`)} className="p-2 text-white/40 hover:text-white hover:bg-white/10 rounded-lg transition-all"><Eye className="w-4 h-4" /></button>
                      <button onClick={() => handleEdit(channel)} className="p-2 text-white/40 hover:text-blue-400 hover:bg-blue-400/10 rounded-lg transition-all"><Edit className="w-4 h-4" /></button>
                      <button onClick={() => handleDelete(channel)} className="p-2 text-white/40 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-all"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {activeTab === 'dashboard' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-zinc-900 border border-white/10 rounded-xl p-6">
              <h3 className="text-white font-bold mb-4">Channels by Category</h3>
              <div className="space-y-3">
                {Object.entries(CATEGORY_CONFIG).map(([key, config]) => {
                  const count = channels.filter((c) => c.category === key).length;
                  if (!count) return null;
                  return (
                    <div key={key} className="flex items-center gap-3">
                      <span className="text-lg w-6">{config.icon}</span>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-white/70 text-sm">{config.label}</span>
                          <span className="text-white text-sm font-bold">{count}</span>
                        </div>
                        <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                          <div className={cn('h-full rounded-full', config.color)} style={{ width: `${(count / channels.length) * 100}%` }} />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="bg-zinc-900 border border-white/10 rounded-xl p-6">
              <h3 className="text-white font-bold mb-4">Quick Actions</h3>
              <div className="space-y-3">
                {[
                  { label: 'Add New Channel', action: () => { setActiveTab('channels'); setShowAddForm(true); } },
                  { label: 'Browse All Channels', action: () => router.push('/search') },
                  { label: 'Import Playlist', action: () => router.push('/settings?tab=playlists') },
                ].map(({ label, action }) => (
                  <button key={label} onClick={action}
                    className="w-full flex items-center gap-3 bg-zinc-800 hover:bg-zinc-700 text-white/70 hover:text-white px-4 py-3 rounded-xl text-sm font-medium transition-all text-left">
                    <Plus className="w-4 h-4 text-red-400" />{label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'users' && (
          <div className="text-center py-16">
            <Users className="w-14 h-14 text-white/10 mx-auto mb-4" />
            <h3 className="text-white font-bold mb-2">User Management</h3>
            <p className="text-white/40 text-sm">Users are stored locally in browser storage.</p>
          </div>
        )}
      </div>
    </div>
  );
}
