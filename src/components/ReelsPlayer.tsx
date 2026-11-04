import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useApp } from '../context/AppContext';
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Heart,
  MessageCircle,
  Share2,
  ListVideo,
  ChevronUp,
  ChevronDown,
  RotateCcw,
  Sparkles,
  ShieldAlert,
  Send,
  X,
  Trash2,
  CornerDownRight,
  Sliders,
  Check,
  Bookmark,
} from 'lucide-react';

export const ReelsPlayer: React.FC = () => {
  const {
    seriesList,
    selectedSeries,
    currentEpisode,
    nextEpisode,
    prevEpisode,
    jumpToEpisode,
    isNsfwEnabled,
    toggleNsfw,
    currentUser,
    followUser,
    comments,
    addComment,
    replyToComment,
    deleteComment,
    toggleLikeEpisode,
    toggleBookmark,
    updateWatchProgress,
    allUsers,
    viewUserProfile,
  } = useApp();

  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Player playback states
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [isMuted, setIsMuted] = useState<boolean>(true); // Start muted for browser autoplay policy
  const [progress, setProgress] = useState<number>(0);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const [autoAdvance, setAutoAdvance] = useState<boolean>(true);
  const [autoAdvanceCountdown, setAutoAdvanceCountdown] = useState<number | null>(null);

  // Panels & overlays
  const [showComments, setShowComments] = useState<boolean>(false);
  const [showEpisodesList, setShowEpisodesList] = useState<boolean>(false);
  const [showShareToast, setShowShareToast] = useState<boolean>(false);
  const [newCommentText, setNewCommentText] = useState<string>('');
  const [replyingToCommentId, setReplyingToCommentId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState<string>('');
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState<boolean>(false);

  // Swipe gesture tracking
  const touchStartY = useRef<number>(0);
  const touchEndY = useRef<number>(0);
  const lastScrollTime = useRef<number>(0);

  const series = selectedSeries || seriesList[0];
  const episode = currentEpisode || series?.episodes[0];
  const isEpisodeLiked = currentUser.likedEpisodeIds.includes(episode?.id || '');
  const isSeriesNsfwRestricted = series?.isNsfw && !isNsfwEnabled;

  // Find creator or director user if available
  const creatorUser = allUsers.find(u => u.displayName.includes('Minimo') || u.id === 'u-semajim') || allUsers[0];
  const isFollowingCreator = creatorUser ? currentUser.followingUserIds.includes(creatorUser.id) : false;

  // Episode comments filtered
  const episodeComments = comments.filter(c => c.episodeId === episode?.id);

  const isSeriesBookmarked = currentUser.bookmarkedSeriesIds.includes(series?.id || '');

  // Video time update
  const handleTimeUpdate = () => {
    if (!videoRef.current) return;
    const current = videoRef.current.currentTime;
    const total = videoRef.current.duration || 1;
    setCurrentTime(current);
    setDuration(total);
    setProgress((current / total) * 100);

    // Save progress every couple of seconds
    if (series && episode && current > 1) {
      updateWatchProgress(series.id, episode.id, episode.episodeNumber, current, total);
    }
  };

  // Video ended - auto-advance logic
  const handleVideoEnded = useCallback(() => {
    if (autoAdvance) {
      setAutoAdvanceCountdown(3);
    } else {
      setIsPlaying(false);
    }
  }, [autoAdvance]);

  // Countdown timer for auto-advance
  useEffect(() => {
    if (autoAdvanceCountdown === null) return;
    if (autoAdvanceCountdown <= 0) {
      setAutoAdvanceCountdown(null);
      nextEpisode();
      return;
    }

    const timer = setTimeout(() => {
      setAutoAdvanceCountdown(prev => (prev !== null ? prev - 1 : null));
    }, 1000);

    return () => clearTimeout(timer);
  }, [autoAdvanceCountdown, nextEpisode]);

  // Play / Pause toggle
  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play().catch(() => {});
      setIsPlaying(true);
    }
  };

  // Mute toggle
  const toggleMute = () => {
    if (!videoRef.current) return;
    videoRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  // Speed change
  const cycleSpeed = () => {
    const speeds = [1, 1.25, 1.5, 2];
    const nextIdx = (speeds.indexOf(playbackSpeed) + 1) % speeds.length;
    const newSpeed = speeds[nextIdx];
    setPlaybackSpeed(newSpeed);
    if (videoRef.current) {
      videoRef.current.playbackRate = newSpeed;
    }
  };

  // Scrubber drag
  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!videoRef.current) return;
    const newPercent = parseFloat(e.target.value);
    const newTime = (newPercent / 100) * (videoRef.current.duration || 1);
    videoRef.current.currentTime = newTime;
    setProgress(newPercent);
  };

  // Reset playback when episode changes
  useEffect(() => {
    setAutoAdvanceCountdown(null);
    setProgress(0);
    setCurrentTime(0);
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.playbackRate = playbackSpeed;
      if (!isSeriesNsfwRestricted) {
        videoRef.current.play().catch(() => {
          setIsPlaying(false);
        });
        setIsPlaying(true);
      }
    }
  }, [episode?.id, isSeriesNsfwRestricted, playbackSpeed]);

  // Wheel scrolling handler for desktop reels feel
  const handleWheel = (e: React.WheelEvent) => {
    const now = Date.now();
    if (now - lastScrollTime.current < 600) return; // Debounce wheel
    if (Math.abs(e.deltaY) > 40) {
      lastScrollTime.current = now;
      if (e.deltaY > 0) {
        nextEpisode();
      } else {
        prevEpisode();
      }
    }
  };

  // Touch swipe gestures for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    touchEndY.current = e.changedTouches[0].clientY;
    const diff = touchStartY.current - touchEndY.current;
    if (Math.abs(diff) > 50) {
      if (diff > 0) {
        nextEpisode(); // Swipe Up -> Next
      } else {
        prevEpisode(); // Swipe Down -> Prev
      }
    }
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) return;
      if (e.key === 'ArrowDown' || e.key === 'j') {
        e.preventDefault();
        nextEpisode();
      } else if (e.key === 'ArrowUp' || e.key === 'k') {
        e.preventDefault();
        prevEpisode();
      } else if (e.key === ' ' || e.key === 'k') {
        e.preventDefault();
        togglePlay();
      } else if (e.key === 'm') {
        e.preventDefault();
        toggleMute();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [nextEpisode, prevEpisode, isPlaying, isMuted]);

  // Share handler
  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setShowShareToast(true);
      setTimeout(() => setShowShareToast(false), 2200);
    }
  };

  const handleSendComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommentText.trim() || !episode) return;
    addComment(episode.id, series.id, newCommentText);
    setNewCommentText('');
  };

  const handleSendReply = (commentId: string) => {
    if (!replyText.trim()) return;
    replyToComment(commentId, replyText);
    setReplyText('');
    setReplyingToCommentId(null);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const currentIndex = series?.episodes.findIndex(e => e.id === episode?.id) ?? 0;
  const totalEpisodes = series?.episodes.length ?? 0;

  if (!series || !episode) {
    return (
      <div className="w-full min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center p-6 text-center bg-[#f8fafc] dark:bg-[#070b14] text-slate-800 dark:text-slate-100 transition-colors">
        <div className="w-16 h-16 rounded-2xl bg-blue-600/10 dark:bg-blue-600/20 text-blue-600 dark:text-cyan-400 border border-blue-500/30 flex items-center justify-center mb-4">
          <ListVideo className="w-8 h-8" />
        </div>
        <h2 className="text-xl sm:text-2xl font-bold mb-2">Henüz Yayınlanmış Dizi Yok</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mb-6 leading-relaxed">
          Tüm örnek diziler temizlendi. Yönetim Odası'ndan ilk dikey mini dizinizi ve video bölümlerinizi yüklediğinizde dikey reels akışı otomatik olarak burada oynatılmaya başlayacaktır.
        </p>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      onWheel={handleWheel}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      className="relative w-full h-[calc(100vh-4rem)] max-h-[920px] bg-[#050811] flex items-center justify-center overflow-hidden select-none"
    >
      {/* Background ambient lighting */}
      <div className="absolute inset-0 bg-radial from-blue-900/15 via-[#050811] to-[#050811] pointer-events-none" />

      {/* Main Reels Vertical Container (9:16 Aspect ratio container) */}
      <div className="relative w-full max-w-[430px] h-full sm:h-[95%] sm:rounded-3xl overflow-hidden shadow-2xl shadow-blue-950/60 border border-blue-900/30 bg-black flex flex-col justify-between">
        {/* Top Floating Controls */}
        <div className="absolute top-0 left-0 right-0 z-20 p-4 bg-gradient-to-b from-black/80 via-black/40 to-transparent flex items-center justify-between pointer-events-auto">
          {/* Series badge & episode indicator */}
          <div className="flex items-center gap-2">
            <span className="font-display text-xs font-bold text-white tracking-wide truncate max-w-[170px]">
              {series?.title}
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-blue-600/70 text-white font-semibold backdrop-blur-sm">
              {currentIndex + 1}/{totalEpisodes}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Auto advance toggle */}
            <button
              onClick={() => setAutoAdvance(prev => !prev)}
              title={autoAdvance ? 'Otomatik Sonraki Bölüm: Açık' : 'Otomatik Sonraki Bölüm: Kapalı'}
              className={`text-[10px] font-medium px-2 py-1 rounded-full flex items-center gap-1 transition-colors ${
                autoAdvance
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  : 'bg-white/10 text-slate-300'
              }`}
            >
              <Sparkles className="w-3 h-3 text-emerald-400" />
              <span className="hidden sm:inline">Oto Geçiş</span>
            </button>

            {/* Speed toggle */}
            <button
              onClick={cycleSpeed}
              className="text-[11px] font-mono font-bold px-2 py-0.5 rounded bg-black/40 text-white border border-white/20 hover:bg-black/60 transition-colors"
            >
              {playbackSpeed}x
            </button>

            {/* Mute button */}
            <button
              onClick={toggleMute}
              className="p-1.5 rounded-full bg-black/40 text-white border border-white/20 hover:bg-black/60 transition-colors"
            >
              {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-blue-400" />}
            </button>
          </div>
        </div>

        {/* Video Element & Fallback */}
        <div className="relative w-full h-full flex items-center justify-center bg-black cursor-pointer" onClick={togglePlay}>
          {episode ? (
            <video
              ref={videoRef}
              src={episode.videoUrl}
              poster={episode.thumbnailUrl || series?.coverUrl}
              playsInline
              loop={false}
              muted={isMuted}
              onTimeUpdate={handleTimeUpdate}
              onEnded={handleVideoEnded}
              className={`w-full h-full object-cover transition-all duration-300 ${
                isSeriesNsfwRestricted ? 'blur-2xl scale-110 filter brightness-50' : ''
              }`}
            />
          ) : (
            <div className="text-center p-6 text-slate-400">Bölüm yükleniyor...</div>
          )}

          {/* Play/Pause state HUD on tap */}
          {!isPlaying && !isSeriesNsfwRestricted && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/30 pointer-events-none">
              <div className="w-16 h-16 rounded-full bg-blue-600/80 backdrop-blur-md flex items-center justify-center text-white shadow-xl">
                <Play className="w-8 h-8 ml-1 fill-white" />
              </div>
            </div>
          )}

          {/* Auto-Advance Countdown Banner */}
          {autoAdvanceCountdown !== null && (
            <div className="absolute inset-0 z-30 bg-black/75 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center animate-in fade-in">
              <div className="w-16 h-16 rounded-full border-4 border-blue-500 border-t-transparent animate-spin mb-4 flex items-center justify-center">
                <span className="font-mono text-xl font-bold text-white">{autoAdvanceCountdown}</span>
              </div>
              <h4 className="text-lg font-bold text-white mb-1">Bölüm Tamamlandı!</h4>
              <p className="text-xs text-slate-300 mb-5">
                Sonraki bölüme otomatik geçiliyor: <span className="text-blue-400 font-semibold">{series?.episodes[currentIndex + 1]?.title || 'Sonraki Dizi'}</span>
              </p>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setAutoAdvanceCountdown(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-white/10 text-white hover:bg-white/20 transition-colors"
                >
                  İptal Et
                </button>
                <button
                  onClick={() => {
                    setAutoAdvanceCountdown(null);
                    nextEpisode();
                  }}
                  className="px-5 py-2 rounded-xl text-xs font-semibold bg-blue-600 text-white shadow-lg shadow-blue-500/30 hover:bg-blue-500 transition-colors"
                >
                  Hemen Geç
                </button>
              </div>
            </div>
          )}

          {/* NSFW Blur Shield Gate */}
          {isSeriesNsfwRestricted && (
            <div
              className="absolute inset-0 z-30 flex flex-col items-center justify-center p-6 text-center bg-black/60 backdrop-blur-xl"
              onClick={e => e.stopPropagation()}
            >
              <div className="w-16 h-16 rounded-2xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center mb-4 text-rose-400 shadow-xl shadow-rose-950/50">
                <ShieldAlert className="w-9 h-9" />
              </div>
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-rose-400 mb-1">
                18+ Yetişkin İçerik Koruması
              </span>
              <h3 className="text-lg font-extrabold text-white mb-2">Bu Bölüm NSFW İçerir</h3>
              <p className="text-xs text-slate-300 max-w-xs leading-relaxed mb-6">
                İzlemeye devam etmek için yetişkin modunu onaylayıp NSFW korumasını açabilirsiniz.
              </p>
              <button
                onClick={toggleNsfw}
                className="px-6 py-2.5 rounded-xl text-xs font-bold bg-rose-600 text-white hover:bg-rose-500 shadow-lg shadow-rose-600/30 transition-all active:scale-95 flex items-center gap-2"
              >
                <span>18+ Modunu Aç ve İzle</span>
              </button>
            </div>
          )}
        </div>

        {/* Right Side Vertical Reels Actions (Like, Comment, Share, Episodes) */}
        <div
          className="absolute right-3 bottom-24 z-20 flex flex-col items-center gap-4.5 pointer-events-auto"
          onClick={e => e.stopPropagation()}
        >
          {/* Creator Avatar & Follow Button */}
          <div className="relative mb-1">
            <div className="w-11 h-11 rounded-full overflow-hidden border-2 border-blue-400 shadow-lg">
              <img
                src={creatorUser.avatar}
                alt={creatorUser.displayName}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
            </div>
            {!isFollowingCreator && (
              <button
                onClick={() => followUser(creatorUser.id)}
                title="Takip Et"
                className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold hover:scale-110 transition-transform shadow-md"
              >
                +
              </button>
            )}
          </div>

          {/* Like Button */}
          <button
            onClick={() => episode && toggleLikeEpisode(episode.id)}
            className="group flex flex-col items-center focus:outline-none"
          >
            <div
              className={`w-11 h-11 rounded-full flex items-center justify-center transition-all ${
                isEpisodeLiked
                  ? 'bg-rose-500/20 text-rose-500 scale-110'
                  : 'bg-black/50 text-white hover:bg-black/70 backdrop-blur-md'
              }`}
            >
              <Heart
                className={`w-5 h-5 transition-transform group-hover:scale-110 ${
                  isEpisodeLiked ? 'fill-rose-500 text-rose-500' : ''
                }`}
              />
            </div>
            <span className="text-[10px] font-mono font-medium text-white/90 mt-1 tabular-nums">
              {((episode?.likeCount || 0) / 1000).toFixed(1)}k
            </span>
          </button>

          {/* Comments Button */}
          <button
            onClick={() => setShowComments(prev => !prev)}
            className="group flex flex-col items-center focus:outline-none"
          >
            <div className="w-11 h-11 rounded-full bg-black/50 text-white hover:bg-black/70 backdrop-blur-md flex items-center justify-center transition-all group-hover:scale-110">
              <MessageCircle className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-mono font-medium text-white/90 mt-1 tabular-nums">
              {episodeComments.length}
            </span>
          </button>

          {/* Favorite / Bookmark Button */}
          <button
            onClick={() => series && toggleBookmark(series.id)}
            className="group flex flex-col items-center focus:outline-none"
            title={isSeriesBookmarked ? 'Favorilerden Çıkar' : 'Favorilere Ekle'}
          >
            <div
              className={`w-11 h-11 rounded-full flex items-center justify-center transition-all ${
                isSeriesBookmarked
                  ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                  : 'bg-black/50 text-white hover:bg-black/70 backdrop-blur-md'
              }`}
            >
              <Bookmark className={`w-5 h-5 ${isSeriesBookmarked ? 'fill-amber-400 text-amber-400' : ''}`} />
            </div>
            <span className="text-[10px] font-medium text-white/90 mt-1">
              {isSeriesBookmarked ? 'Favori' : 'Kaydet'}
            </span>
          </button>

          {/* Episodes List Drawer Button */}
          <button
            onClick={() => setShowEpisodesList(prev => !prev)}
            className="group flex flex-col items-center focus:outline-none"
            title="Tüm Bölümler"
          >
            <div className="w-11 h-11 rounded-full bg-black/50 text-white hover:bg-black/70 backdrop-blur-md flex items-center justify-center transition-all group-hover:scale-110">
              <ListVideo className="w-5 h-5 text-blue-400" />
            </div>
            <span className="text-[10px] font-medium text-white/90 mt-1">Bölümler</span>
          </button>

          {/* Share Button */}
          <button
            onClick={handleShare}
            className="group flex flex-col items-center focus:outline-none"
            title="Paylaş"
          >
            <div className="w-11 h-11 rounded-full bg-black/50 text-white hover:bg-black/70 backdrop-blur-md flex items-center justify-center transition-all group-hover:scale-110">
              <Share2 className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-medium text-white/90 mt-1">Paylaş</span>
          </button>
        </div>

        {/* Bottom Overlay: Title, Episode Details & Scrubber */}
        <div
          className="absolute bottom-0 left-0 right-0 z-20 p-4 pb-5 bg-gradient-to-t from-black via-black/80 to-transparent flex flex-col gap-2 pointer-events-auto"
          onClick={e => e.stopPropagation()}
        >
          <div className="pr-14">
            <div className="flex items-center gap-2 mb-0.5">
              <span className="font-bold text-sm text-white hover:underline cursor-pointer">
                {episode?.title}
              </span>
              {series?.isNsfw && (
                <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded bg-rose-600/80 text-white">
                  18+
                </span>
              )}
            </div>

            <div className="flex items-center gap-2 text-xs text-cyan-300 font-medium">
              <span>Bölüm {episode?.episodeNumber}</span>
              <span className="w-1 h-1 rounded-full bg-cyan-400/60" />
              <span>{series?.genre}</span>
            </div>
          </div>

          {/* Scrubber & Time */}
          <div className="flex items-center gap-2 pt-1">
            <span className="text-[10px] font-mono text-slate-300 tabular-nums">
              {formatTime(currentTime)}
            </span>
            <input
              type="range"
              min="0"
              max="100"
              value={progress}
              onChange={handleSeek}
              className="flex-1 h-1.5 bg-white/20 rounded-lg appearance-none cursor-pointer accent-blue-500"
            />
            <span className="text-[10px] font-mono text-slate-400 tabular-nums">
              {formatTime(duration)}
            </span>
          </div>
        </div>

        {/* Share Copied Toast */}
        {showShareToast && (
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 px-4 py-2 rounded-xl bg-blue-600/90 backdrop-blur-md text-white text-xs font-semibold shadow-2xl flex items-center gap-2 animate-in fade-in zoom-in-95">
            <Check className="w-4 h-4" />
            <span>Bağlantı panoya kopyalandı!</span>
          </div>
        )}

        {/* Floating Side Quick Navigation Buttons (Desktop) */}
        <div className="hidden sm:flex absolute -right-16 top-1/2 -translate-y-1/2 flex-col gap-2">
          <button
            onClick={prevEpisode}
            disabled={currentIndex === 0}
            title="Önceki Bölüm (Yukarı Kaydır)"
            className="w-10 h-10 rounded-full bg-slate-900/80 hover:bg-blue-600 text-white border border-blue-900/40 flex items-center justify-center transition-colors disabled:opacity-30 disabled:hover:bg-slate-900/80 shadow-lg"
          >
            <ChevronUp className="w-5 h-5" />
          </button>
          <button
            onClick={nextEpisode}
            title="Sonraki Bölüm (Aşağı Kaydır)"
            className="w-10 h-10 rounded-full bg-slate-900/80 hover:bg-blue-600 text-white border border-blue-900/40 flex items-center justify-center transition-colors shadow-lg"
          >
            <ChevronDown className="w-5 h-5" />
          </button>
        </div>

        {/* Episodes Quick Selector Sheet */}
        {showEpisodesList && (
          <div
            className="absolute inset-x-0 bottom-0 top-16 z-40 bg-slate-950/95 backdrop-blur-xl p-4 flex flex-col animate-in slide-in-from-bottom duration-200 border-t border-blue-900/30"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <h4 className="text-sm font-bold text-white">{series?.title}</h4>
                <p className="text-[11px] text-slate-400">Tüm Dikey Bölümler</p>
              </div>
              <button
                onClick={() => setShowEpisodesList(false)}
                className="w-8 h-8 rounded-full bg-slate-800 text-slate-300 flex items-center justify-center hover:bg-slate-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto py-3 space-y-2 no-scrollbar">
              {series?.episodes.map(ep => (
                <div
                  key={ep.id}
                  onClick={() => {
                    jumpToEpisode(ep.id);
                    setShowEpisodesList(false);
                  }}
                  className={`p-3 rounded-xl flex items-center gap-3 cursor-pointer transition-all border ${
                    ep.id === episode?.id
                      ? 'bg-blue-600/20 border-blue-500 text-white shadow-md'
                      : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <div className="relative w-12 h-16 rounded-lg overflow-hidden shrink-0 bg-slate-800">
                    <img
                      src={ep.thumbnailUrl || series.coverUrl}
                      alt={ep.title}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                    {ep.id === episode?.id && (
                      <div className="absolute inset-0 bg-blue-600/60 flex items-center justify-center">
                        <Play className="w-4 h-4 fill-white text-white" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-[10px] font-mono text-blue-400 font-bold uppercase">
                      Bölüm {ep.episodeNumber}
                    </span>
                    <h5 className="text-xs font-bold truncate text-white">{ep.title}</h5>
                    <p className="text-[11px] text-cyan-400/80">{series.genre}</p>
                  </div>
                  <span className="text-[10px] font-mono text-slate-500 tabular-nums shrink-0">
                    {formatTime(ep.durationSec)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Comments Drawer Sheet */}
        {showComments && (
          <div
            className="absolute inset-x-0 bottom-0 top-20 z-40 bg-slate-950/95 backdrop-blur-xl p-4 flex flex-col animate-in slide-in-from-bottom duration-200 border-t border-blue-900/30"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <MessageCircle className="w-4 h-4 text-blue-400" />
                <h4 className="text-xs font-bold text-white">Yorumlar ({episodeComments.length})</h4>
              </div>
              <button
                onClick={() => setShowComments(false)}
                className="w-7 h-7 rounded-full bg-slate-800 text-slate-300 flex items-center justify-center hover:bg-slate-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Comments List */}
            <div className="flex-1 overflow-y-auto py-3 space-y-3 no-scrollbar">
              {episodeComments.length === 0 ? (
                <div className="text-center py-10 text-xs text-slate-400">
                  Henüz yorum yapılmamış. İlk yorumu sen yap!
                </div>
              ) : (
                episodeComments.map(c => {
                const commentUser = allUsers.find(u => u.id === c.userId || u.displayName === c.userName);

                return (
                  <div key={c.id} className="space-y-2">
                    <div className="flex items-start gap-2.5 group">
                      <button
                        type="button"
                        onClick={() => {
                          if (commentUser) {
                            viewUserProfile(commentUser);
                            setShowComments(false);
                          }
                        }}
                        title={`${c.userName} profilini gör`}
                        className="cursor-pointer shrink-0"
                      >
                        <img
                          src={c.userAvatar}
                          alt={c.userName}
                          referrerPolicy="no-referrer"
                          className="w-7 h-7 rounded-full object-cover shrink-0 mt-0.5 border border-blue-500/30 hover:ring-2 ring-blue-500 transition-all"
                        />
                      </button>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <button
                            type="button"
                            onClick={() => {
                              if (commentUser) {
                                viewUserProfile(commentUser);
                                setShowComments(false);
                              }
                            }}
                            className="text-xs font-semibold text-slate-200 hover:text-blue-400 transition-colors text-left"
                          >
                            {c.userName}
                          </button>
                          <span className="text-[10px] text-slate-500">{c.createdAt}</span>
                        </div>
                        <p className="text-xs text-slate-300 mt-0.5 leading-snug">{c.content}</p>

                        <div className="flex items-center gap-3 mt-1.5 text-[11px] text-slate-400">
                          <button
                            onClick={() => setReplyingToCommentId(replyingToCommentId === c.id ? null : c.id)}
                            className="hover:text-blue-400 flex items-center gap-1"
                          >
                            <CornerDownRight className="w-3 h-3" />
                            <span>Yanıtla</span>
                          </button>

                          {/* Delete option for admin / authorized staff */}
                          {(currentUser.role === 'admin' || currentUser.role === 'moderator' || currentUser.isAuthorizedStaff) && (
                            <button
                              onClick={() => deleteComment(c.id)}
                              className="text-rose-400 hover:text-rose-300 flex items-center gap-1"
                              title="Yönetici: Yorumu Sil"
                            >
                              <Trash2 className="w-3 h-3" />
                              <span>Sil</span>
                            </button>
                          )}
                        </div>

                        {/* Inline Reply Box */}
                        {replyingToCommentId === c.id && (
                          <div className="mt-2 flex items-center gap-1.5">
                            <input
                              type="text"
                              value={replyText}
                              onChange={e => setReplyText(e.target.value)}
                              placeholder={`${c.userName} kişisine yanıt yaz...`}
                              className="flex-1 px-2.5 py-1 text-xs bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                            />
                            <button
                              onClick={() => handleSendReply(c.id)}
                              className="px-2.5 py-1 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-500"
                            >
                              Gönder
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Replies */}
                    {c.replies.map(r => {
                      const replyUser = allUsers.find(u => u.id === r.userId || u.displayName === r.userName);

                      return (
                        <div key={r.id} className="ml-8 pl-2.5 border-l-2 border-slate-800 flex items-start gap-2 pt-1">
                          <button
                            type="button"
                            onClick={() => {
                              if (replyUser) {
                                viewUserProfile(replyUser);
                                setShowComments(false);
                              }
                            }}
                            title={`${r.userName} profilini gör`}
                            className="cursor-pointer shrink-0"
                          >
                            <img
                              src={r.userAvatar}
                              alt={r.userName}
                              referrerPolicy="no-referrer"
                              className="w-5 h-5 rounded-full object-cover shrink-0 mt-0.5 hover:ring-2 ring-blue-500 transition-all"
                            />
                          </button>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <button
                                type="button"
                                onClick={() => {
                                  if (replyUser) {
                                    viewUserProfile(replyUser);
                                    setShowComments(false);
                                  }
                                }}
                                className="text-[11px] font-semibold text-slate-300 hover:text-blue-400 transition-colors text-left"
                              >
                                {r.userName}
                              </button>
                              <span className="text-[9px] text-slate-500">{r.createdAt}</span>
                            </div>
                            <p className="text-[11px] text-slate-400 mt-0.5">{r.content}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })
              )}
            </div>

            {/* Comment Form */}
            <form onSubmit={handleSendComment} className="pt-2 border-t border-slate-800 flex items-center gap-2">
              <input
                type="text"
                value={newCommentText}
                onChange={e => setNewCommentText(e.target.value)}
                placeholder="Bu bölüme bir yorum yaz..."
                className="flex-1 px-3 py-2 text-xs bg-slate-900 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />
              <button
                type="submit"
                disabled={!newCommentText.trim()}
                className="p-2 bg-blue-600 text-white rounded-xl hover:bg-blue-500 disabled:opacity-40 transition-colors"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
