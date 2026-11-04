import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Bookmark,
  Play,
  Clock,
  Trash2,
  History,
  Dices,
} from 'lucide-react';

export const LibraryView: React.FC = () => {
  const {
    seriesList,
    currentUser,
    watchProgressList,
    resumeProgress,
    openReelsPlayer,
    toggleBookmark,
    getRandomSeries,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'continue' | 'favorites' | 'history'>('continue');

  // Favorite series
  const favoriteSeries = seriesList.filter(s =>
    currentUser.bookmarkedSeriesIds.includes(s.id)
  );

  // Continue watching series mapped
  const continueWatchingItems = watchProgressList
    .map(progress => {
      const series = seriesList.find(s => s.id === progress.seriesId);
      const episode = series?.episodes.find(e => e.id === progress.episodeId);
      if (!series || !episode) return null;
      const percent = Math.min(100, Math.round((progress.currentTimeSec / Math.max(1, progress.durationSec)) * 100));
      return {
        series,
        episode,
        progress,
        percent,
      };
    })
    .filter(Boolean) as {
      series: (typeof seriesList)[0];
      episode: (typeof seriesList)[0]['episodes'][0];
      progress: (typeof watchProgressList)[0];
      percent: number;
    }[];

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const rem = secs % 60;
    return `${mins}:${rem < 10 ? '0' : ''}${rem}`;
  };

  const handleRandomPick = () => {
    const random = getRandomSeries();
    if (random) {
      openReelsPlayer(random.id);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Bookmark className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            <h1 className="text-2xl font-display font-black text-slate-900 dark:text-white">
              Kişisel Kütüphanem
            </h1>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-400">
            Kaldığın yerden devam et, favori dizilerini listele ve izleme geçmişini görüntüle.
          </p>
        </div>

        {/* Random series shortcut button */}
        <button
          onClick={handleRandomPick}
          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-blue-600/25 transition-all self-start sm:self-auto"
        >
          <Dices className="w-4 h-4" />
          <span>Rastgele Dizi Başlat</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 p-1.5 bg-slate-200 dark:bg-slate-900/80 rounded-2xl border border-slate-300 dark:border-slate-800 mb-8 max-w-lg">
        <button
          onClick={() => setActiveTab('continue')}
          className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${
            activeTab === 'continue'
              ? 'bg-blue-600 text-white shadow-md'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>Kaldığım Yerden ({continueWatchingItems.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('favorites')}
          className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${
            activeTab === 'favorites'
              ? 'bg-blue-600 text-white shadow-md'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Bookmark className="w-4 h-4" />
          <span>Favorilerim ({favoriteSeries.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('history')}
          className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${
            activeTab === 'history'
              ? 'bg-blue-600 text-white shadow-md'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <History className="w-4 h-4" />
          <span>Geçmiş</span>
        </button>
      </div>

      {/* Tab 1: Kaldığım Yerden Devam Et */}
      {activeTab === 'continue' && (
        <div>
          {continueWatchingItems.length === 0 ? (
            <div className="p-12 text-center rounded-3xl bg-white dark:bg-[#0b1222] border border-slate-200 dark:border-blue-900/30 shadow-sm">
              <Clock className="w-12 h-12 text-blue-500/40 dark:text-blue-400/40 mx-auto mb-3" />
              <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">Henüz Yarıda Bıraktığın Dizi Yok</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto mb-5">
                Reels akışından bir mini dizi izlemeye başladığında kaldığın saniye otomatik buraya kaydedilir.
              </p>
              <button
                onClick={handleRandomPick}
                className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all shadow-md inline-flex items-center gap-2"
              >
                <Play className="w-3.5 h-3.5 fill-white" />
                <span>Hemen Dizi Keşfet</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {continueWatchingItems.map(({ series, episode, progress, percent }) => (
                <div
                  key={`${progress.seriesId}-${progress.episodeId}`}
                  className="p-4 rounded-2xl bg-white dark:bg-[#0b1222] border border-slate-200 dark:border-blue-900/30 hover:border-blue-500/50 transition-all flex flex-col justify-between group shadow-sm"
                >
                  <div className="flex gap-3.5 mb-3">
                    <div className="relative w-20 aspect-[9/14] rounded-xl overflow-hidden shrink-0 bg-slate-900 shadow-md">
                      <img
                        src={episode.thumbnailUrl || series.coverUrl}
                        alt={series.title}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                        <Play className="w-5 h-5 fill-white text-white drop-shadow" />
                      </div>
                    </div>

                    <div className="flex-1 min-w-0">
                      <span className="text-[10px] font-mono font-bold text-blue-600 dark:text-blue-400 uppercase">
                        {series.genre} · Bölüm {episode.episodeNumber}
                      </span>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate mt-0.5">{series.title}</h4>
                      <p className="text-xs text-slate-600 dark:text-slate-300 truncate mt-0.5">{episode.title}</p>
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono mt-1 block">
                        Kaldığın Yer: {formatTime(progress.currentTimeSec)} / {formatTime(progress.durationSec)}
                      </span>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="space-y-2">
                    <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-blue-600 to-cyan-400 rounded-full"
                        style={{ width: `${percent}%` }}
                      />
                    </div>

                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-500 dark:text-slate-400 font-mono">%{percent} Tamamlandı</span>
                      <button
                        onClick={() => resumeProgress(series.id, episode.id)}
                        className="px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-1.5 transition-colors shadow-sm"
                      >
                        <Play className="w-3.5 h-3.5 fill-white" />
                        <span>Kaldığın Yerden İzle</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Favorilerim */}
      {activeTab === 'favorites' && (
        <div>
          {favoriteSeries.length === 0 ? (
            <div className="p-12 text-center rounded-3xl bg-white dark:bg-[#0b1222] border border-slate-200 dark:border-blue-900/30 shadow-sm">
              <Bookmark className="w-12 h-12 text-blue-500/40 dark:text-blue-400/40 mx-auto mb-3" />
              <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">Favori Listen Boş</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto mb-5">
                Dizilerin üzerindeki veya Reels oynatıcısındaki favori butonuna tıklayarak dizileri buraya kaydedebilirsin.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {favoriteSeries.map(series => (
                <div
                  key={series.id}
                  className="rounded-2xl overflow-hidden bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 hover:border-blue-500/50 transition-all flex flex-col group shadow-sm"
                >
                  <div className="relative aspect-[9/14] w-full overflow-hidden bg-slate-950">
                    <img
                      src={series.coverUrl}
                      alt={series.title}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-80" />

                    <div className="absolute bottom-2 left-2 right-2">
                      <span className="text-[10px] text-cyan-400 font-semibold">{series.genre}</span>
                      <h4 className="text-xs font-bold text-white truncate">{series.title}</h4>
                      <span className="text-[10px] text-slate-300">{series.episodes.length} Dikey Bölüm</span>
                    </div>

                    <button
                      onClick={() => toggleBookmark(series.id)}
                      className="absolute top-2 right-2 p-1.5 rounded-full bg-black/60 text-amber-400 hover:bg-black/90 transition-colors"
                      title="Favorilerden Kaldır"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="p-2.5 bg-slate-50 dark:bg-slate-900/90 flex items-center gap-1.5">
                    <button
                      onClick={() => openReelsPlayer(series.id)}
                      className="w-full py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center justify-center gap-1 transition-colors"
                    >
                      <Play className="w-3 h-3 fill-white" />
                      <span>İzle</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 3: İzleme Geçmişi */}
      {activeTab === 'history' && (
        <div className="space-y-3">
          {continueWatchingItems.map(({ series, episode, progress }) => (
            <div
              key={`hist-${progress.seriesId}-${progress.episodeId}`}
              className="p-3.5 rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-4 shadow-sm"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-14 rounded-lg overflow-hidden shrink-0 bg-slate-950">
                  <img
                    src={episode.thumbnailUrl || series.coverUrl}
                    alt={series.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">{series.title}</h4>
                  <p className="text-[11px] text-slate-600 dark:text-slate-400">Bölüm {episode.episodeNumber}: {episode.title}</p>
                  <span className="text-[10px] text-slate-500 dark:text-slate-500 font-mono">Son İzleme: {progress.updatedAt}</span>
                </div>
              </div>

              <button
                onClick={() => resumeProgress(series.id, episode.id)}
                className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-1.5 transition-colors shrink-0 shadow-sm"
              >
                <Play className="w-3 h-3 fill-white" />
                <span>Tekrar İzle</span>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
