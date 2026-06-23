export interface Channel {
  id: string;
  name: string;
  logo: string;
  url: string;
  category: ChannelCategory;
  country?: string;
  language?: string;
  description?: string;
  tags?: string[];
  isFeatured?: boolean;
  isTrending?: boolean;
  isHD?: boolean;
  isLive?: boolean;
  viewerCount?: number;
  quality?: StreamQuality[];
  epgId?: string;
  addedAt?: string;
  updatedAt?: string;
}

export type ChannelCategory =
  | 'sports' | 'news' | 'entertainment' | 'movies'
  | 'kids' | 'music' | 'documentary' | 'lifestyle' | 'education' | 'other';

export interface StreamQuality {
  label: string;
  url: string;
  bandwidth?: number;
}

export interface User {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string | null;
  isAdmin: boolean;
  createdAt: string;
}

export interface WatchHistory {
  channelId: string;
  channelName: string;
  channelLogo: string;
  watchedAt: string;
  duration?: number;
}

export interface FavoriteChannel {
  channelId: string;
  addedAt: string;
}

export interface EPGProgram {
  id: string;
  channelId: string;
  title: string;
  description?: string;
  startTime: string;
  endTime: string;
  category?: string;
}

export interface M3UPlaylist {
  id: string;
  name: string;
  url?: string;
  channels: Channel[];
  addedAt: string;
  updatedAt: string;
}

export interface ParsedM3UEntry {
  name: string;
  logo?: string;
  group?: string;
  tvgId?: string;
  tvgName?: string;
  url: string;
}

export interface PlayerState {
  isPlaying: boolean;
  isMuted: boolean;
  volume: number;
  isFullscreen: boolean;
  isPiP: boolean;
  isLoading: boolean;
  isBuffering: boolean;
  error: string | null;
  quality: string;
  playbackRate: number;
}

export interface HLSQualityLevel {
  id: number;
  label: string;
  height: number;
  bitrate?: number;
}
