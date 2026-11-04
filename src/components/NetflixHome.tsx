import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Series } from '../types';
import {
  Play,
  Plus,
  Check,
  Info,
  Star,
  Flame,
  Clock,
  ShieldAlert,
  Search,
  Sparkles,
  ChevronRight,
  ChevronLeft,
  X,
  Dices,
  SlidersHorizontal,
  Film,
  LogIn,
  UserPlus,
} from 'lucide-react';

export const NetflixHome: React.FC = () => {
  const {
    seriesList,
    openReelsPlayer,
    currentUser,
    toggleBookmark,
    isNsfwEnabled,
    toggleNsfw,
    openInfoModal,
    watchProgressList,
    resumeProgress,
    getRandomSeries,
    setActiveView,
    customGenres,
    setIsAdvancedSearchOpen,
    isLoggedIn,
    setIsAuthModalOpen,
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGenre, setSelectedGenre] = useState<string>('Tümü');
  const [activeModalSeries, setActiveModalSeries] = useState<Series | null>(null);
  const [randomModalSeries, setRandomModalSeries] = useState<Series | null>(null);
  const [isRollingRandom, setIsRollingRandom] = useState(false);

  // Featured hero series (e.g. Siber Gölge or first item)
  const heroSeries = seriesList.find(s => s.featured) || seriesList[0];
  const isHeroBookmarked = currentUser.bookmarkedSeriesIds.includes(heroSeries?.id || '');

  const genres = ['Tümü', ...(customGenres || ['Bilim Kurgu', 'Romantik', 'Gerilim', 'Dram', 'Komedi', 'Gizem', 'Aksiyon'])];

  // Filtered series
  const filteredSeries = seriesList.filter(s => {
    const matchesSearch =
      s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.genre.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesGenre = selectedGenre === 'Tümü' || s.genre === selectedGenre;
    return matchesSearch && matchesGenre;
  });

  const popularSeries = seriesList.filter(s => !s.isNsfw).slice(0, 5);
  const sciFiThriller = seriesList.filter(s => ['Bilim Kurgu', 'Gerilim'].includes(s.genre));
  const romanceDrama = seriesList.filter(s => ['Romantik', 'Dram'].includes(s.genre) && !s.isNsfw);
  const nsfwSeries = seriesList.filter(s => s.isNsfw);
  const bookmarkedList = seriesList.filter(s => currentUser.bookmarkedSeriesIds.includes(s.id));

  // Continue watching items mapped with series & episode info
  const continueWatchingItems = watchProgressList
    .map(p => {
      const s = seriesList.find(item => item.id === p.seriesId);
      const ep = s?.episodes.find(e => e.id === p.episodeId);
      if (!s || !ep) return null;
      const percent = Math.min(100, Math.round((p.currentTimeSec / Math.max(1, p.durationSec)) * 100));
      return { series: s, episode: ep, progress: p, percent };
    })
    .filter(Boolean) as {
      series: Series;
      episode: Series['episodes'][0];
      progress: (typeof watchProgressList)[0];
      percent: number;
    }[];

  const triggerRandomPick = () => {
    if (seriesList.length === 0) return;
    setIsRollingRandom(true);
    let count = 0;
    const interval = setInterval(() => {
      const temp = getRandomSeries();
      if (temp) setRandomModalSeries(temp);
      count++;
      if (count > 5) {
        clearInterval(interval);
        setIsRollingRandom(false);
      }
    }, 100);
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-[#070b14] text-slate-900 dark:text-slate-100 pb-24 transition-colors duration-200">
      {/* 1. Welcome Billboard when empty */}
      {seriesList.length === 0 ? (
        <section className="max-w-2xl mx-auto px-4 sm:px-6 pt-16 pb-12 text-center animate-in fade-in">
          <div className="p-8 sm:p-12 rounded-3xl bg-white dark:bg-[#0b1222] border border-slate-200 dark:border-blue-900/30 shadow-xl">
            <div className="w-16 h-16 rounded-2xl bg-blue-600/10 dark:bg-cyan-500/15 text-blue-600 dark:text-cyan-400 border border-blue-500/30 flex items-center justify-center mx-auto mb-4">
              <Film className="w-8 h-8" />
            </div>

            <h1 className="text-2xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight mb-6">
              Minimo Series'e Hoş Geldiniz!
            </h1>

            {isLoggedIn ? (
              <div className="flex flex-wrap items-center justify-center gap-3">
                <button
                  onClick={() => setActiveView('profile')}
                  className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs sm:text-sm shadow-lg shadow-blue-600/30 transition-all flex items-center gap-2 hover:scale-105 active:scale-95"
                >
                  <span>Profilime Git</span>
                </button>
                <button
                  onClick={() => setIsAdvancedSearchOpen(true)}
                  className="px-5 py-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs sm:text-sm transition-all"
                >
                  <span>Gelişmiş Arama</span>
                </button>
              </div>
            ) : (
              <div className="flex flex-wrap items-center justify-center gap-3">
                <button
                  onClick={() => setIsAuthModalOpen(true)}
                  className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs sm:text-sm shadow-lg shadow-blue-600/30 transition-all flex items-center gap-2 hover:scale-105 active:scale-95"
                >
                  <LogIn className="w-4 h-4" />
                  <span>Giriş Yap</span>
                </button>
                <button
                  onClick={() => setIsAuthModalOpen(true)}
                  className="px-6 py-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100 font-bold text-xs sm:text-sm border border-slate-200 dark:border-slate-700 transition-all flex items-center gap-2 hover:scale-105 active:scale-95"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Kayıt Ol</span>
                </button>
              </div>
            )}
          </div>
        </section>
      ) : (
        heroSeries && (
          <section className="relative w-full h-[68vh] min-h-[500px] max-h-[720px] overflow-hidden flex items-end">
          {/* Billboard background poster with cinema gradient overlay */}
          <div className="absolute inset-0 z-0">
            <img
              src={heroSeries.bannerUrl || heroSeries.coverUrl}
              alt={heroSeries.title}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover object-top opacity-55 scale-105 filter contrast-110"
            />
            {/* Multi-angle cinematic scrims */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#070b14] via-[#070b14]/70 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-r from-[#070b14] via-[#070b14]/80 to-transparent w-full md:w-3/4" />
            <div className="absolute top-0 inset-x-0 h-32 bg-gradient-to-b from-[#070b14]/80 to-transparent" />
          </div>

          {/* Hero Content */}
          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 w-full pb-14">
            <div className="max-w-2xl space-y-4">
              {/* Badges */}
              <div className="flex items-center gap-2.5 flex-wrap">
                <span className="px-2.5 py-1 rounded bg-blue-600/90 text-white font-mono text-[11px] font-extrabold uppercase tracking-widest shadow-md shadow-blue-600/30">
                  Minimo Orijinal
                </span>
                <span className="flex items-center gap-1 text-xs font-semibold text-amber-400 bg-amber-400/10 px-2.5 py-1 rounded border border-amber-400/20">
                  <Star className="w-3.5 h-3.5 fill-amber-400" />
                  {heroSeries.rating} Puan
                </span>
                <span className="text-xs text-slate-300">
                  {heroSeries.releaseYear} · {heroSeries.episodes.length} Bölüm Dikey Dizi · {heroSeries.genre}
                </span>
              </div>

              {/* Title */}
              <h1 className="font-display text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-tight drop-shadow-xl text-balance">
                {heroSeries.title}
              </h1>

              {/* Synopsis */}
              <p className="text-sm sm:text-base text-slate-300 leading-relaxed line-clamp-3 max-w-xl drop-shadow">
                {heroSeries.description}
              </p>

              {/* Action Buttons */}
              <div className="flex items-center gap-3 pt-2">
                <button
                  onClick={() => openReelsPlayer(heroSeries.id)}
                  className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm flex items-center gap-2.5 shadow-xl shadow-blue-600/35 transition-all hover:scale-105 active:scale-95"
                >
                  <Play className="w-4 h-4 fill-white" />
                  <span>Hemen İzle</span>
                </button>

                <button
                  onClick={() => toggleBookmark(heroSeries.id)}
                  className={`px-4 py-3 rounded-xl text-sm font-semibold flex items-center gap-2 backdrop-blur-md transition-all ${
                    isHeroBookmarked
                      ? 'bg-blue-500/20 text-blue-400 border border-blue-500/40'
                      : 'bg-white/10 hover:bg-white/20 text-white border border-white/10'
                  }`}
                >
                  {isHeroBookmarked ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                  <span>{isHeroBookmarked ? 'Listede' : 'Listeme Ekle'}</span>
                </button>

                <button
                  onClick={() => setActiveModalSeries(heroSeries)}
                  className="p-3 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/10 backdrop-blur-md transition-all"
                  title="Detaylı Bilgi"
                >
                  <Info className="w-4 h-4" />
                </button>

                <button
                  onClick={triggerRandomPick}
                  className="px-4 py-3 rounded-xl bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-300 border border-cyan-400/30 text-sm font-semibold flex items-center gap-2 backdrop-blur-md transition-all"
                  title="Rastgele Dizi Öner"
                >
                  <Dices className="w-4 h-4 text-cyan-400" />
                  <span className="hidden sm:inline">Rastgele Öneri</span>
                </button>
              </div>
            </div>
          </div>
        </section>
      )
    )}

      {/* 2. Search & Category Filter Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 my-6">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 bg-slate-900/60 backdrop-blur-md p-3 rounded-2xl border border-blue-900/30">
          {/* Genre Segmented Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
            {genres.map(genre => (
              <button
                key={genre}
                onClick={() => setSelectedGenre(genre)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  selectedGenre === genre
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                {genre}
              </button>
            ))}
          </div>

          {/* Search Box, Advanced Search & Random Action */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setIsAdvancedSearchOpen(true)}
              className="px-3 py-1.5 rounded-xl bg-blue-600/15 hover:bg-blue-600/25 border border-blue-500/30 text-blue-400 hover:text-blue-200 text-xs font-bold flex items-center gap-1.5 shrink-0 transition-colors"
              title="Gelişmiş Filtreler & Sıralama (Bölüm sayısı, yaş sınırı, etiketler)"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-blue-400" />
              <span>Gelişmiş Arama</span>
            </button>

            <button
              onClick={triggerRandomPick}
              className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-cyan-600/25 to-blue-600/25 border border-cyan-400/40 text-cyan-300 hover:text-white text-xs font-bold flex items-center gap-1.5 shrink-0 transition-colors"
              title="Şansıma Ne Çıkarsa"
            >
              <Dices className="w-3.5 h-3.5" />
              <span>Bana Dizi Öner</span>
            </button>

            <div className="relative min-w-[200px]">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Hızlı ara..."
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-white dark:bg-slate-950/80 border border-slate-300 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>
        </div>
      </div>

      {/* 3. Filtered Search Results (if searching or filtering) */}
      {(searchQuery || selectedGenre !== 'Tümü') && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 mb-10">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <span>Arama Sonuçları</span>
            <span className="text-xs font-normal text-slate-500">({filteredSeries.length} dizi bulundu)</span>
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {filteredSeries.map(series => (
              <SeriesCard
                key={series.id}
                series={series}
                onPlay={() => openReelsPlayer(series.id)}
                onOpenDetails={() => setActiveModalSeries(series)}
                isNsfwEnabled={isNsfwEnabled}
                onToggleNsfw={toggleNsfw}
              />
            ))}
          </div>
        </section>
      )}

      {/* 4. Netflix Rows (Default Catalog View) */}
      {!searchQuery && selectedGenre === 'Tümü' && (
        <div className="space-y-10 max-w-7xl mx-auto px-4 sm:px-6">
          {/* Continue Watching Row (Kaldığın Yerden Devam Et) */}
          {continueWatchingItems.length > 0 && (
            <section className="animate-in fade-in">
              <div className="flex items-center justify-between gap-2 mb-3.5">
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-blue-500 dark:text-blue-400" />
                  <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white tracking-tight">Kaldığın Yerden Devam Et</h3>
                </div>
                <button
                  onClick={() => setActiveView('library')}
                  className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-500 font-semibold flex items-center gap-1 transition-colors"
                >
                  <span>Kütüphanem</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {continueWatchingItems.map(({ series, episode, progress, percent }) => (
                  <div
                    key={`home-cont-${series.id}-${episode.id}`}
                    onClick={() => resumeProgress(series.id, episode.id)}
                    className="p-3 rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-blue-900/40 hover:border-blue-500/50 cursor-pointer transition-all group flex flex-col justify-between shadow-sm"
                  >
                    <div className="flex gap-3 mb-2.5">
                      <div className="relative w-16 aspect-[9/13] rounded-xl overflow-hidden shrink-0 bg-slate-950">
                        <img
                          src={episode.thumbnailUrl || series.coverUrl}
                          alt={series.title}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                          <Play className="w-4 h-4 fill-white text-white drop-shadow" />
                        </div>
                      </div>

                      <div className="flex-1 min-w-0">
                        <span className="text-[10px] font-mono font-bold text-blue-400 uppercase">
                          Bölüm {episode.episodeNumber}
                        </span>
                        <h4 className="text-xs font-bold text-white truncate mt-0.5">{series.title}</h4>
                        <p className="text-[11px] text-slate-300 truncate mt-0.5">{episode.title}</p>
                        <span className="text-[10px] text-slate-400 font-mono mt-1 block">
                          {progress.currentTimeSec}sn / {progress.durationSec}sn
                        </span>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-blue-600 to-cyan-400 rounded-full"
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                      <div className="flex items-center justify-between text-[10px]">
                        <span className="text-slate-400 font-mono">%{percent} Tamamlandı</span>
                        <span className="text-blue-400 font-bold group-hover:underline">Hemen Devam Et →</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Row 1: Trend Reels Mini Dizileri */}
          <CatalogRow
            title="Trend Reels Mini Dizileri"
            icon={<Flame className="w-5 h-5 text-orange-400" />}
            seriesList={popularSeries}
            onPlay={openReelsPlayer}
            onOpenDetails={setActiveModalSeries}
            isNsfwEnabled={isNsfwEnabled}
            onToggleNsfw={toggleNsfw}
          />

          {/* Row 2: Bilim Kurgu & Gerilim Kuşağı */}
          {sciFiThriller.length > 0 && (
            <CatalogRow
              title="Bilim Kurgu & Yüksek Tansiyon"
              icon={<Sparkles className="w-5 h-5 text-blue-400" />}
              seriesList={sciFiThriller}
              onPlay={openReelsPlayer}
              onOpenDetails={setActiveModalSeries}
              isNsfwEnabled={isNsfwEnabled}
              onToggleNsfw={toggleNsfw}
            />
          )}

          {/* Row 3: Romantik & Gece Kuşağı */}
          {romanceDrama.length > 0 && (
            <CatalogRow
              title="Romantik & Duygusal Hikayeler"
              icon={<Star className="w-5 h-5 text-rose-400" />}
              seriesList={romanceDrama}
              onPlay={openReelsPlayer}
              onOpenDetails={setActiveModalSeries}
              isNsfwEnabled={isNsfwEnabled}
              onToggleNsfw={toggleNsfw}
            />
          )}


          {/* Row 5: İzleme Listem (Bookmarks) */}
          {bookmarkedList.length > 0 && (
            <CatalogRow
              title="İzleme Listem"
              icon={<Check className="w-5 h-5 text-emerald-400" />}
              seriesList={bookmarkedList}
              onPlay={openReelsPlayer}
              onOpenDetails={setActiveModalSeries}
              isNsfwEnabled={isNsfwEnabled}
              onToggleNsfw={toggleNsfw}
            />
          )}
        </div>
      )}

      {/* 5. Footer with Info, Copyright, and Contact */}
      <footer className="mt-20 border-t border-slate-200 dark:border-slate-800/80 pt-10 pb-8 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-display font-bold text-slate-900 dark:text-white text-sm">Minimo Series</span>
          </div>

          <div className="flex items-center gap-6">
            <button
              onClick={() => openInfoModal('about')}
              className="hover:text-blue-400 transition-colors cursor-pointer"
            >
              Hakkımızda
            </button>
            <button
              onClick={() => openInfoModal('copyright')}
              className="hover:text-blue-400 transition-colors cursor-pointer"
            >
              Telif Hakkı & DMCA
            </button>
            <button
              onClick={() => openInfoModal('contact')}
              className="hover:text-blue-400 transition-colors cursor-pointer"
            >
              İletişim
            </button>
          </div>

          <p className="text-slate-600">© 2026 Minimo Series Inc. Tüm hakları saklıdır.</p>
        </div>
      </footer>

      {/* 6. Series Detail Modal */}
      {activeModalSeries && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-[#0b1222] border border-blue-900/40 rounded-3xl max-w-2xl w-full overflow-hidden shadow-2xl relative max-h-[90vh] flex flex-col">
            <button
              onClick={() => setActiveModalSeries(null)}
              className="absolute top-4 right-4 z-20 w-8 h-8 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/90 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Modal Header Banner */}
            <div className="relative h-64 w-full shrink-0">
              <img
                src={activeModalSeries.bannerUrl || activeModalSeries.coverUrl}
                alt={activeModalSeries.title}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0b1222] via-[#0b1222]/50 to-transparent" />
              <div className="absolute bottom-4 left-6 right-6">
                <span className="text-[11px] font-mono text-blue-400 font-bold uppercase tracking-wider">
                  {activeModalSeries.genre}
                </span>
                <h3 className="text-2xl sm:text-3xl font-extrabold text-white">
                  {activeModalSeries.title}
                </h3>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-5 no-scrollbar">
              <div className="flex items-center gap-4 text-xs text-slate-300">
                <span className="flex items-center gap-1 font-bold text-amber-400">
                  <Star className="w-3.5 h-3.5 fill-amber-400" />
                  {activeModalSeries.rating}
                </span>
                <span>{activeModalSeries.releaseYear}</span>
                <span>{activeModalSeries.episodes.length} Dikey Bölüm</span>
                <span className="text-slate-400">Yönetmen: {activeModalSeries.director}</span>
              </div>

              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                {activeModalSeries.description}
              </p>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => {
                    openReelsPlayer(activeModalSeries.id);
                    setActiveModalSeries(null);
                  }}
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-blue-600/30"
                >
                  <Play className="w-4 h-4 fill-white" />
                  <span>Hemen İzle</span>
                </button>

                <button
                  onClick={() => toggleBookmark(activeModalSeries.id)}
                  className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-semibold text-xs flex items-center gap-1.5"
                >
                  {currentUser.bookmarkedSeriesIds.includes(activeModalSeries.id) ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-400" />
                      <span>Listede</span>
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4" />
                      <span>Listeme Ekle</span>
                    </>
                  )}
                </button>
              </div>

              {/* Episodes List in Modal */}
              <div className="pt-3 border-t border-slate-800">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3">
                  Bölümler ({activeModalSeries.episodes.length})
                </h4>
                <div className="space-y-2">
                  {activeModalSeries.episodes.map(ep => (
                    <div
                      key={ep.id}
                      onClick={() => {
                        openReelsPlayer(activeModalSeries.id, ep.id);
                        setActiveModalSeries(null);
                      }}
                      className="p-3 rounded-xl bg-slate-900/60 hover:bg-blue-900/20 border border-slate-800/80 hover:border-blue-500/40 flex items-center justify-between cursor-pointer transition-all group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-blue-600/20 text-blue-400 flex items-center justify-center font-bold text-xs group-hover:bg-blue-600 group-hover:text-white transition-colors">
                          {ep.episodeNumber}
                        </div>
                        <div>
                          <h5 className="text-xs font-bold text-white group-hover:text-blue-400 transition-colors">
                            {ep.title}
                          </h5>
                          <p className="text-[11px] text-cyan-400/80 font-medium">{activeModalSeries.genre}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-slate-400">
                        <Clock className="w-3.5 h-3.5" />
                        <span className="text-[11px] font-mono">{ep.durationSec}sn</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 7. Random Recommendation Surprise Modal (Şansıma Ne Çıkarsa) */}
      {randomModalSeries && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-[#0b1222] border-2 border-cyan-400/50 rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl relative p-6 text-center">
            <button
              onClick={() => setRandomModalSeries(null)}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-800 text-slate-300 flex items-center justify-center hover:bg-slate-700"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="w-14 h-14 rounded-2xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 flex items-center justify-center mx-auto mb-3 shadow-lg shadow-cyan-500/20">
              <Dices className={`w-7 h-7 ${isRollingRandom ? 'animate-spin' : ''}`} />
            </div>

            <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-cyan-400">
              {isRollingRandom ? 'Kaderin Çarkı Dönüyor...' : 'Sana Özel Rastgele Dizi Seçildi!'}
            </span>
            <h3 className="text-2xl font-black text-white mt-1 mb-2">
              {randomModalSeries.title}
            </h3>

            {/* Poster Preview */}
            <div className="relative w-44 aspect-[9/13] rounded-2xl overflow-hidden mx-auto my-3 border border-blue-500/40 shadow-xl">
              <img
                src={randomModalSeries.coverUrl}
                alt={randomModalSeries.title}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-2 justify-center">
                <span className="text-xs font-semibold text-white">{randomModalSeries.genre} · {randomModalSeries.episodes.length} Bölüm</span>
              </div>
            </div>

            <p className="text-xs text-slate-300 line-clamp-2 max-w-xs mx-auto mb-5">
              {randomModalSeries.description}
            </p>

            <div className="flex items-center justify-center gap-3">
              <button
                onClick={triggerRandomPick}
                disabled={isRollingRandom}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-colors flex items-center gap-1.5"
              >
                <Dices className="w-3.5 h-3.5 text-cyan-400" />
                <span>Tekrar Çevir</span>
              </button>

              <button
                onClick={() => {
                  const targetId = randomModalSeries.id;
                  setRandomModalSeries(null);
                  openReelsPlayer(targetId);
                }}
                className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all shadow-lg shadow-blue-600/30 flex items-center gap-2"
              >
                <Play className="w-4 h-4 fill-white" />
                <span>Hemen İzle</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Catalog Row Component
interface CatalogRowProps {
  title: string;
  icon?: React.ReactNode;
  seriesList: Series[];
  onPlay: (seriesId: string) => void;
  onOpenDetails: (series: Series) => void;
  isNsfwEnabled: boolean;
  onToggleNsfw: () => void;
}

const CatalogRow: React.FC<CatalogRowProps> = ({
  title,
  icon,
  seriesList,
  onPlay,
  onOpenDetails,
  isNsfwEnabled,
  onToggleNsfw,
}) => {
  return (
    <section>
      <div className="flex items-center gap-2 mb-3.5">
        {icon}
        <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white tracking-tight">{title}</h3>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
        {seriesList.map(series => (
          <SeriesCard
            key={series.id}
            series={series}
            onPlay={() => onPlay(series.id)}
            onOpenDetails={() => onOpenDetails(series)}
            isNsfwEnabled={isNsfwEnabled}
            onToggleNsfw={onToggleNsfw}
          />
        ))}
      </div>
    </section>
  );
};

// Series Card Component
interface SeriesCardProps {
  series: Series;
  onPlay: () => void;
  onOpenDetails: () => void;
  isNsfwEnabled: boolean;
  onToggleNsfw: () => void;
}

const SeriesCard: React.FC<SeriesCardProps> = ({
  series,
  onPlay,
  onOpenDetails,
  isNsfwEnabled,
  onToggleNsfw,
}) => {
  const isRestrictedNsfw = series.isNsfw && !isNsfwEnabled;

  return (
    <div className="group relative rounded-2xl overflow-hidden bg-slate-900/60 border border-slate-800/80 hover:border-blue-500/50 transition-all duration-300 hover:shadow-xl hover:shadow-blue-950/40 flex flex-col">
      {/* Poster Image (9:16 Aspect ratio) */}
      <div className="relative aspect-[9/14] w-full overflow-hidden bg-slate-950">
        <img
          src={series.coverUrl}
          alt={series.title}
          referrerPolicy="no-referrer"
          className={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 ${
            isRestrictedNsfw ? 'blur-xl scale-110 filter brightness-40' : ''
          }`}
        />

        {/* Scrim Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />

        {/* Rating & Episode Count Badges */}
        <div className="absolute top-2 left-2 flex items-center gap-1.5 z-10">
          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-black/60 backdrop-blur-md text-amber-400 flex items-center gap-0.5">
            <Star className="w-3 h-3 fill-amber-400" />
            {series.rating}
          </span>
          {series.isNsfw && (
            <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-rose-600 text-white">
              18+
            </span>
          )}
        </div>

        {/* Play Button on Hover */}
        {!isRestrictedNsfw && (
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10 pointer-events-none">
            <div className="w-12 h-12 rounded-full bg-blue-600/90 backdrop-blur-md flex items-center justify-center text-white shadow-xl transform scale-75 group-hover:scale-100 transition-transform">
              <Play className="w-5 h-5 ml-0.5 fill-white" />
            </div>
          </div>
        )}

        {/* NSFW Lock Overlay if restricted */}
        {isRestrictedNsfw && (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center p-3 text-center bg-black/50">
            <ShieldAlert className="w-7 h-7 text-rose-500 mb-1" />
            <span className="text-[10px] font-mono font-bold uppercase text-rose-400">18+ NSFW</span>
            <button
              onClick={e => {
                e.stopPropagation();
                onToggleNsfw();
              }}
              className="mt-2 text-[10px] font-bold px-2 py-1 rounded bg-rose-600 text-white hover:bg-rose-500 transition-colors"
            >
              Kilidi Aç
            </button>
          </div>
        )}

        {/* Series Metadata Footer inside Card */}
        <div className="absolute bottom-2 left-2 right-2 z-10">
          <span className="text-[10px] font-medium text-blue-400">{series.genre}</span>
          <h4 className="text-xs font-bold text-white truncate drop-shadow">{series.title}</h4>
          <span className="text-[10px] text-slate-400">{series.episodes.length} Bölüm</span>
        </div>
      </div>

      {/* Card Quick Action Buttons */}
      <div className="p-2.5 flex items-center gap-1.5 bg-slate-900/90 border-t border-slate-800">
        <button
          onClick={onPlay}
          className="flex-1 py-1.5 px-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-[11px] font-bold flex items-center justify-center gap-1 transition-colors"
        >
          <Play className="w-3 h-3 fill-white" />
          <span>İzle</span>
        </button>

        <button
          onClick={onOpenDetails}
          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
          title="Detaylar"
        >
          <Info className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
