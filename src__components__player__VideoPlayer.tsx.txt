'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import Hls, { Level } from 'hls.js';
import {
  Play, Pause, Volume2, VolumeX, Maximize, Minimize,
  Settings, Radio, Loader2, AlertCircle, RefreshCw,
  PictureInPicture2, ChevronUp, FastForward, Rewind,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Channel } from '@/types';

interface VideoPlayerProps {
  channel: Channel;
  autoPlay?: boolean;
  className?: string;
  onError?: (err: string) => void;
}

export default function VideoPlayer({ channel, autoPlay = true, className, onError }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const controlsTimerRef = useRef<NodeJS.Timeout | null>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isBuffering, setIsBuffering] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showControls, setShowControls] = useState(true);
  const [qualities, setQualities] = useState<Level[]>([]);
  const [currentQuality, setCurrentQuality] = useState(-1);
  const [showQualityMenu, setShowQualityMenu] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [isPiP, setIsPiP] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [showRateMenu, setShowRateMenu] = useState(false);
  const [stats, setStats] = useState({ bandwidth: 0, dropped: 0 });

  const MAX_RETRIES = 5;
  const RETRY_DELAY = 3000;

  const initHls = useCallback(() => {
    const video = videoRef.current;
    if (!video || !channel.url) return;

    // Destroy existing instance
    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }

    setError(null);
    setIsLoading(true);

    // Native HLS (Safari)
    if (video.canPlayType('application/vnd.apple.mpegurl') && !Hls.isSupported()) {
      video.src = channel.url;
      video.addEventListener('loadedmetadata', () => setIsLoading(false));
      if (autoPlay) video.play().catch(console.error);
      return;
    }

    if (!Hls.isSupported()) {
      setError('HLS is not supported in this browser.');
      return;
    }

    const hls = new Hls({
      enableWorker: true,
      lowLatencyMode: true,
      backBufferLength: 90,
      maxBufferLength: 30,
      maxMaxBufferLength: 600,
      startLevel: -1,
      abrEwmaDefaultEstimate: 500000,
      fragLoadingTimeOut: 20000,
      manifestLoadingTimeOut: 20000,
      levelLoadingTimeOut: 20000,
      fragLoadingMaxRetry: 6,
      manifestLoadingMaxRetry: 4,
      levelLoadingMaxRetry: 4,
    });

    hlsRef.current = hls;
    hls.loadSource(channel.url);
    hls.attachMedia(video);

    hls.on(Hls.Events.MANIFEST_PARSED, (_, data) => {
      setQualities(data.levels);
      setIsLoading(false);
      if (autoPlay) video.play().catch(console.error);
    });

    hls.on(Hls.Events.LEVEL_SWITCHED, (_, data) => {
      setCurrentQuality(data.level);
    });

    hls.on(Hls.Events.FRAG_BUFFERED, () => {
      setIsBuffering(false);
    });

    hls.on(Hls.Events.BUFFER_STALLED, () => {
      setIsBuffering(true);
    });

    hls.on(Hls.Events.STATS, (_, data) => {
      setStats({ bandwidth: Math.round((data as any).bandwidth / 1000), dropped: 0 });
    });

    hls.on(Hls.Events.ERROR, (_, data) => {
      console.error('HLS Error:', data);
      if (data.fatal) {
        switch (data.type) {
          case Hls.ErrorTypes.NETWORK_ERROR:
            if (retryCount < MAX_RETRIES) {
              setTimeout(() => {
                setRetryCount((r) => r + 1);
                hls.startLoad();
              }, RETRY_DELAY);
            } else {
              setError('Stream unavailable. Please try again later.');
              onError?.('Network error');
            }
            break;
          case Hls.ErrorTypes.MEDIA_ERROR:
            hls.recoverMediaError();
            break;
          default:
            setError('Playback error. Click retry to try again.');
            onError?.('Fatal error');
            break;
        }
      }
    });

    return () => {
      hls.destroy();
    };
  }, [channel.url, autoPlay, retryCount, onError]);

  useEffect(() => {
    initHls();
    return () => {
      hlsRef.current?.destroy();
    };
  }, [channel.id]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handlers = {
      play: () => setIsPlaying(true),
      pause: () => setIsPlaying(false),
      waiting: () => setIsBuffering(true),
      canplay: () => { setIsBuffering(false); setIsLoading(false); },
      error: () => setError('Video playback error'),
    };

    Object.entries(handlers).forEach(([event, handler]) => {
      video.addEventListener(event, handler);
    });

    return () => {
      Object.entries(handlers).forEach(([event, handler]) => {
        video.removeEventListener(event, handler);
      });
    };
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (!containerRef.current?.contains(document.activeElement) && document.activeElement !== document.body) return;
      switch (e.key) {
        case ' ':
        case 'k':
          e.preventDefault();
          togglePlay();
          break;
        case 'm':
          toggleMute();
          break;
        case 'f':
          toggleFullscreen();
          break;
        case 'ArrowUp':
          e.preventDefault();
          setVolume((v) => Math.min(1, v + 0.1));
          break;
        case 'ArrowDown':
          e.preventDefault();
          setVolume((v) => Math.max(0, v - 0.1));
          break;
        case 'r':
          handleRetry();
          break;
      }
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, []);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.volume = volume;
      videoRef.current.muted = isMuted;
    }
  }, [volume, isMuted]);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.playbackRate = playbackRate;
    }
  }, [playbackRate]);

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) video.play().catch(console.error);
    else video.pause();
  };

  const toggleMute = () => setIsMuted((m) => !m);

  const toggleFullscreen = async () => {
    const container = containerRef.current;
    if (!container) return;
    if (!document.fullscreenElement) {
      await container.requestFullscreen();
      setIsFullscreen(true);
    } else {
      await document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const togglePiP = async () => {
    const video = videoRef.current;
    if (!video) return;
    try {
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture();
        setIsPiP(false);
      } else {
        await video.requestPictureInPicture();
        setIsPiP(true);
      }
    } catch (e) {
      console.error('PiP not supported', e);
    }
  };

  const handleRetry = () => {
    setRetryCount(0);
    setError(null);
    initHls();
  };

  const setQuality = (levelIndex: number) => {
    if (hlsRef.current) {
      hlsRef.current.currentLevel = levelIndex;
      setCurrentQuality(levelIndex);
    }
    setShowQualityMenu(false);
  };

  const showControlsTemporarily = () => {
    setShowControls(true);
    if (controlsTimerRef.current) clearTimeout(controlsTimerRef.current);
    controlsTimerRef.current = setTimeout(() => {
      if (isPlaying) setShowControls(false);
    }, 3000);
  };

  const getQualityLabel = (level: number): string => {
    if (level === -1) return 'Auto';
    const q = qualities[level];
    if (!q) return 'Unknown';
    return q.height ? `${q.height}p` : `Level ${level + 1}`;
  };

  const rates = [0.5, 0.75, 1, 1.25, 1.5, 2];

  return (
    <div
      ref={containerRef}
      className={cn(
        'relative bg-black rounded-xl overflow-hidden group select-none',
        'aspect-video w-full',
        className
      )}
      onMouseMove={showControlsTemporarily}
      onMouseLeave={() => isPlaying && setShowControls(false)}
      onClick={togglePlay}
      tabIndex={0}
    >
      {/* Video Element */}
      <video
        ref={videoRef}
        className="w-full h-full object-contain"
        playsInline
        onClick={(e) => e.stopPropagation()}
      />

      {/* Loading Spinner */}
      {(isLoading || isBuffering) && !error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 z-10">
          <Loader2 className="w-12 h-12 text-red-500 animate-spin mb-3" />
          <p className="text-white/80 text-sm">{isLoading ? 'Loading stream...' : 'Buffering...'}</p>
          {stats.bandwidth > 0 && (
            <p className="text-white/50 text-xs mt-1">{stats.bandwidth} kbps</p>
          )}
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 z-10 p-6">
          <AlertCircle className="w-14 h-14 text-red-500 mb-4" />
          <p className="text-white text-center font-semibold mb-2">{error}</p>
          <p className="text-white/60 text-sm text-center mb-6">
            The stream may be temporarily unavailable.
          </p>
          <button
            onClick={(e) => { e.stopPropagation(); handleRetry(); }}
            className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Retry Stream
          </button>
        </div>
      )}

      {/* Live Badge */}
      <div className="absolute top-4 left-4 z-20 flex items-center gap-2">
        <span className="flex items-center gap-1.5 bg-red-600 text-white text-xs font-bold px-2.5 py-1 rounded-full">
          <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse-live" />
          LIVE
        </span>
        {channel.isHD && (
          <span className="bg-black/60 text-white text-xs font-bold px-2 py-1 rounded border border-white/20">
            HD
          </span>
        )}
      </div>

      {/* Channel Info Top Right */}
      <div className="absolute top-4 right-4 z-20">
        <div className="bg-black/60 backdrop-blur-sm rounded-lg px-3 py-1.5 flex items-center gap-2">
          {channel.logo && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={channel.logo} alt={channel.name} className="w-5 h-5 object-contain" />
          )}
          <span className="text-white text-xs font-medium">{channel.name}</span>
        </div>
      </div>

      {/* Controls Overlay */}
      <div
        className={cn(
          'absolute inset-0 z-20 flex flex-col justify-end transition-opacity duration-300',
          showControls || !isPlaying ? 'opacity-100' : 'opacity-0 pointer-events-none'
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />

        {/* Bottom Controls */}
        <div className="relative p-4 space-y-3">
          {/* Channel Name */}
          <div>
            <p className="text-white font-bold text-lg leading-tight">{channel.name}</p>
            <p className="text-white/60 text-sm capitalize">{channel.category}</p>
          </div>

          {/* Control Buttons */}
          <div className="flex items-center gap-2">
            {/* Play/Pause */}
            <button
              onClick={togglePlay}
              className="text-white hover:text-red-400 transition-colors p-2 rounded-lg hover:bg-white/10"
            >
              {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
            </button>

            {/* Volume */}
            <button
              onClick={toggleMute}
              className="text-white hover:text-red-400 transition-colors p-2 rounded-lg hover:bg-white/10"
            >
              {isMuted || volume === 0 ? <VolumeX className="w-6 h-6" /> : <Volume2 className="w-6 h-6" />}
            </button>
            <input
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={isMuted ? 0 : volume}
              onChange={(e) => {
                setVolume(parseFloat(e.target.value));
                setIsMuted(false);
              }}
              className="w-20 accent-red-500 cursor-pointer"
            />

            {/* Live indicator */}
            <div className="flex items-center gap-1.5 ml-2">
              <Radio className="w-4 h-4 text-red-500 animate-pulse-live" />
              <span className="text-white/70 text-xs">LIVE</span>
            </div>

            {/* Spacer */}
            <div className="flex-1" />

            {/* Playback Speed */}
            <div className="relative">
              <button
                onClick={() => { setShowRateMenu((r) => !r); setShowQualityMenu(false); }}
                className="text-white hover:text-red-400 transition-colors p-2 rounded-lg hover:bg-white/10 text-xs font-bold"
              >
                {playbackRate}x
              </button>
              {showRateMenu && (
                <div className="absolute bottom-12 right-0 bg-black/90 backdrop-blur-sm border border-white/10 rounded-xl p-2 min-w-[90px] shadow-2xl">
                  <p className="text-white/50 text-xs px-2 py-1 mb-1">Speed</p>
                  {rates.map((rate) => (
                    <button
                      key={rate}
                      onClick={() => { setPlaybackRate(rate); setShowRateMenu(false); }}
                      className={cn(
                        'w-full text-left px-3 py-1.5 rounded-lg text-sm transition-colors',
                        playbackRate === rate
                          ? 'bg-red-600 text-white'
                          : 'text-white/80 hover:bg-white/10'
                      )}
                    >
                      {rate === 1 ? 'Normal' : `${rate}x`}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Quality */}
            {qualities.length > 0 && (
              <div className="relative">
                <button
                  onClick={() => { setShowQualityMenu((q) => !q); setShowRateMenu(false); }}
                  className="text-white hover:text-red-400 transition-colors p-2 rounded-lg hover:bg-white/10"
                >
                  <Settings className="w-5 h-5" />
                </button>
                {showQualityMenu && (
                  <div className="absolute bottom-12 right-0 bg-black/90 backdrop-blur-sm border border-white/10 rounded-xl p-2 min-w-[130px] shadow-2xl">
                    <p className="text-white/50 text-xs px-2 py-1 mb-1">Quality</p>
                    <button
                      onClick={() => setQuality(-1)}
                      className={cn(
                        'w-full text-left px-3 py-1.5 rounded-lg text-sm transition-colors',
                        currentQuality === -1
                          ? 'bg-red-600 text-white'
                          : 'text-white/80 hover:bg-white/10'
                      )}
                    >
                      Auto
                    </button>
                    {qualities.map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setQuality(i)}
                        className={cn(
                          'w-full text-left px-3 py-1.5 rounded-lg text-sm transition-colors',
                          currentQuality === i
                            ? 'bg-red-600 text-white'
                            : 'text-white/80 hover:bg-white/10'
                        )}
                      >
                        {getQualityLabel(i)}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* PiP */}
            {'pictureInPictureEnabled' in document && (
              <button
                onClick={togglePiP}
                className={cn(
                  'text-white hover:text-red-400 transition-colors p-2 rounded-lg hover:bg-white/10',
                  isPiP && 'text-red-400'
                )}
              >
                <PictureInPicture2 className="w-5 h-5" />
              </button>
            )}

            {/* Fullscreen */}
            <button
              onClick={toggleFullscreen}
              className="text-white hover:text-red-400 transition-colors p-2 rounded-lg hover:bg-white/10"
            >
              {isFullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Center Play Icon Flash */}
      {!isPlaying && !isLoading && !error && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
          <div className="bg-black/50 rounded-full p-5">
            <Play className="w-12 h-12 text-white fill-white" />
          </div>
        </div>
      )}
    </div>
  );
}
