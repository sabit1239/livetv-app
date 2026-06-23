import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Channel, WatchHistory, FavoriteChannel } from '@/types';
import { DEFAULT_CHANNELS } from '@/lib/channels-data';
import { LocalUser, generateUid, hashPassword, verifyPassword } from '@/lib/auth';

interface AppState {
  // Channels
  channels: Channel[];
  setChannels: (channels: Channel[]) => void;
  addChannel: (channel: Channel) => void;
  updateChannel: (id: string, data: Partial<Channel>) => void;
  deleteChannel: (id: string) => void;

  // Current channel
  currentChannel: Channel | null;
  setCurrentChannel: (channel: Channel | null) => void;

  // Auth (local, no Firebase)
  user: LocalUser | null;
  setUser: (user: LocalUser | null) => void;
  registeredUsers: { uid: string; email: string; displayName: string; passwordHash: string; isAdmin: boolean; createdAt: string }[];
  registerUser: (email: string, password: string, displayName: string) => { success: boolean; error?: string };
  loginUser: (email: string, password: string) => { success: boolean; error?: string };
  logoutUser: () => void;

  // Watch History
  watchHistory: WatchHistory[];
  addToHistory: (entry: WatchHistory) => void;
  clearHistory: () => void;

  // Favorites
  favorites: FavoriteChannel[];
  toggleFavorite: (channelId: string) => void;
  isFavorite: (channelId: string) => boolean;

  // UI
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  theme: 'dark' | 'light';
  setTheme: (theme: 'dark' | 'light') => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;

  // Playlists
  importedPlaylists: { id: string; name: string; channels: Channel[] }[];
  addPlaylist: (playlist: { id: string; name: string; channels: Channel[] }) => void;
  removePlaylist: (id: string) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      channels: DEFAULT_CHANNELS,
      setChannels: (channels) => set({ channels }),
      addChannel: (channel) => set((state) => ({ channels: [...state.channels, channel] })),
      updateChannel: (id, data) =>
        set((state) => ({ channels: state.channels.map((c) => (c.id === id ? { ...c, ...data } : c)) })),
      deleteChannel: (id) => set((state) => ({ channels: state.channels.filter((c) => c.id !== id) })),

      currentChannel: null,
      setCurrentChannel: (channel) => set({ currentChannel: channel }),

      // ── Local Auth ──
      user: null,
      setUser: (user) => set({ user }),
      registeredUsers: [],

      registerUser: (email, password, displayName) => {
        const { registeredUsers } = get();
        if (registeredUsers.find((u) => u.email === email)) {
          return { success: false, error: 'An account with this email already exists.' };
        }
        const newUser = {
          uid: generateUid(),
          email,
          displayName,
          passwordHash: hashPassword(password),
          isAdmin: registeredUsers.length === 0, // first user is admin
          createdAt: new Date().toISOString(),
        };
        set((state) => ({ registeredUsers: [...state.registeredUsers, newUser] }));
        set({
          user: {
            uid: newUser.uid,
            email: newUser.email,
            displayName: newUser.displayName,
            photoURL: null,
            isAdmin: newUser.isAdmin,
            createdAt: newUser.createdAt,
          },
        });
        return { success: true };
      },

      loginUser: (email, password) => {
        const { registeredUsers } = get();
        const found = registeredUsers.find((u) => u.email === email);
        if (!found) return { success: false, error: 'No account found with this email.' };
        if (!verifyPassword(password, found.passwordHash))
          return { success: false, error: 'Incorrect password.' };
        set({
          user: {
            uid: found.uid,
            email: found.email,
            displayName: found.displayName,
            photoURL: null,
            isAdmin: found.isAdmin,
            createdAt: found.createdAt,
          },
        });
        return { success: true };
      },

      logoutUser: () => set({ user: null }),

      // Watch History
      watchHistory: [],
      addToHistory: (entry) =>
        set((state) => {
          const filtered = state.watchHistory.filter((h) => h.channelId !== entry.channelId);
          return { watchHistory: [entry, ...filtered].slice(0, 50) };
        }),
      clearHistory: () => set({ watchHistory: [] }),

      // Favorites
      favorites: [],
      toggleFavorite: (channelId) =>
        set((state) => {
          const exists = state.favorites.some((f) => f.channelId === channelId);
          if (exists) return { favorites: state.favorites.filter((f) => f.channelId !== channelId) };
          return { favorites: [...state.favorites, { channelId, addedAt: new Date().toISOString() }] };
        }),
      isFavorite: (channelId) => get().favorites.some((f) => f.channelId === channelId),

      // UI
      sidebarOpen: false,
      setSidebarOpen: (open) => set({ sidebarOpen: open }),
      theme: 'dark',
      setTheme: (theme) => set({ theme }),
      searchQuery: '',
      setSearchQuery: (query) => set({ searchQuery: query }),
      selectedCategory: 'all',
      setSelectedCategory: (category) => set({ selectedCategory: category }),

      // Playlists
      importedPlaylists: [],
      addPlaylist: (playlist) =>
        set((state) => ({
          importedPlaylists: [...state.importedPlaylists.filter((p) => p.id !== playlist.id), playlist],
          channels: [
            ...state.channels.filter(
              (c) => !state.importedPlaylists.find((p) => p.id === playlist.id)?.channels.some((pc) => pc.id === c.id)
            ),
            ...playlist.channels,
          ],
        })),
      removePlaylist: (id) =>
        set((state) => {
          const playlist = state.importedPlaylists.find((p) => p.id === id);
          return {
            importedPlaylists: state.importedPlaylists.filter((p) => p.id !== id),
            channels: playlist
              ? state.channels.filter((c) => !playlist.channels.some((pc) => pc.id === c.id))
              : state.channels,
          };
        }),
    }),
    {
      name: 'ottstream-storage',
      partialize: (state) => ({
        channels: state.channels,
        watchHistory: state.watchHistory,
        favorites: state.favorites,
        theme: state.theme,
        importedPlaylists: state.importedPlaylists,
        user: state.user,
        registeredUsers: state.registeredUsers,
      }),
    }
  )
);
