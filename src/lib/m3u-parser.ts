import { Channel, ParsedM3UEntry, ChannelCategory } from '@/types';

export function parseM3U(content: string): ParsedM3UEntry[] {
  const lines = content.split('\n').map((l) => l.trim()).filter(Boolean);
  const entries: ParsedM3UEntry[] = [];

  if (!lines[0]?.startsWith('#EXTM3U')) {
    // Try to parse as simple URL list
    return lines
      .filter((l) => l.startsWith('http'))
      .map((url, i) => ({ name: `Channel ${i + 1}`, url }));
  }

  let currentEntry: Partial<ParsedM3UEntry> | null = null;

  for (const line of lines) {
    if (line.startsWith('#EXTINF')) {
      currentEntry = parseExtInf(line);
    } else if (line.startsWith('http') || line.startsWith('rtmp') || line.startsWith('rtsp')) {
      if (currentEntry) {
        entries.push({ ...currentEntry, url: line } as ParsedM3UEntry);
        currentEntry = null;
      } else {
        entries.push({ name: 'Unknown Channel', url: line });
      }
    }
  }

  return entries;
}

function parseExtInf(line: string): Partial<ParsedM3UEntry> {
  const entry: Partial<ParsedM3UEntry> = {};

  // Extract name (after the last comma)
  const lastComma = line.lastIndexOf(',');
  if (lastComma !== -1) {
    entry.name = line.substring(lastComma + 1).trim();
  }

  // Extract tvg-logo
  const logoMatch = line.match(/tvg-logo="([^"]*)"/);
  if (logoMatch) entry.logo = logoMatch[1];

  // Extract group-title
  const groupMatch = line.match(/group-title="([^"]*)"/);
  if (groupMatch) entry.group = groupMatch[1];

  // Extract tvg-id
  const tvgIdMatch = line.match(/tvg-id="([^"]*)"/);
  if (tvgIdMatch) entry.tvgId = tvgIdMatch[1];

  // Extract tvg-name
  const tvgNameMatch = line.match(/tvg-name="([^"]*)"/);
  if (tvgNameMatch) entry.tvgName = tvgNameMatch[1];

  return entry;
}

export function m3uEntriesToChannels(entries: ParsedM3UEntry[]): Channel[] {
  return entries.map((entry, index) => ({
    id: `imported-${index}-${Date.now()}`,
    name: entry.name || `Channel ${index + 1}`,
    logo: entry.logo || '',
    url: entry.url,
    category: guessCategory(entry.group || entry.name || ''),
    description: entry.tvgName || entry.name,
    tags: entry.group ? [entry.group] : [],
    isLive: true,
    isHD: entry.name?.toLowerCase().includes('hd') || false,
    addedAt: new Date().toISOString(),
  }));
}

function guessCategory(text: string): ChannelCategory {
  const lower = text.toLowerCase();
  if (/sport|football|cricket|tennis|basketball|soccer|nfl|nba|nhl|mlb|ufc|boxing/.test(lower))
    return 'sports';
  if (/news|cnn|bbc|fox news|breaking/.test(lower)) return 'news';
  if (/movie|cinema|film/.test(lower)) return 'movies';
  if (/kids|cartoon|children|junior|disney/.test(lower)) return 'kids';
  if (/music|mtv|vh1|radio/.test(lower)) return 'music';
  if (/documentary|discovery|national|nature/.test(lower)) return 'documentary';
  if (/lifestyle|cooking|travel|fashion/.test(lower)) return 'lifestyle';
  if (/education|school|learn/.test(lower)) return 'education';
  if (/entertain|comedy|drama|series/.test(lower)) return 'entertainment';
  return 'other';
}

export async function fetchM3UFromUrl(url: string): Promise<ParsedM3UEntry[]> {
  try {
    const response = await fetch(url, {
      headers: { 'Accept': 'text/plain, application/x-mpegurl, */*' },
      cache: 'no-store',
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const text = await response.text();
    return parseM3U(text);
  } catch (error) {
    console.error('Failed to fetch M3U:', error);
    throw error;
  }
}

export function generateChannelId(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
}
