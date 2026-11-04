import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import {
  Search,
  X,
  RotateCcw,
  Play,
  Star,
  Film,
  Layers,
  ShieldAlert,
  ArrowUpDown,
  Tag,
  Bookmark,
  Sparkles,
  SlidersHorizontal,
  Tv,
  Check,
} from 'lucide-react';
import { Series, SeriesPlatform, AgeRating } from '../types';
import {
  Users,
  UserCheck,
  UserPlus,
  Eye,
} from 'lucide-react';

export const AdvancedSearchModal: React.FC = () => {
  const {
    isAdvancedSearchOpen,
    setIsAdvancedSearchOpen,
    seriesList,
    customGenres,
    openReelsPlayer,
    currentUser,
    toggleBookmark,
    isNsfwEnabled,
    toggleNsfw,
    allUsers,
    followUser,
    viewUserProfile,
  } = useApp();

  // Search Type: 'series' (Diziler) or 'users' (Üyeler / Kullanıcılar)
  const [searchType, setSearchType] = useState<'series' | 'users'>('series');

  // General Text Search
  const [searchQuery, setSearchQuery] = useState('');

  // 1. Dizi Platformu Filter (Netshot, DramaWave, ReelShort, DramaBox)
  const [selectedPlatform, setSelectedPlatform] = useState<string>('Tümü');

  // 2. Dizi Türü Filter
  const [selectedGenre, setSelectedGenre] = useState<string>('Tümü');

  // 3. Yaş Sınırı Filter (Genel İzleyici, 13+, 16+, 18+)
  const [selectedAgeRating, setSelectedAgeRating] = useState<string>('Tümü');

  // 4. Etiket Arama Kısmı (Tag Search & Selection)
  const [tagQuery, setTagQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  // Sorting
  const [sortBy, setSortBy] = useState<'popular' | 'rating' | 'newest' | 'episodes_desc' | 'az'>('popular');

  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input when modal opens
  useEffect(() => {
    if (isAdvancedSearchOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [isAdvancedSearchOpen]);

  // Close on ESC
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isAdvancedSearchOpen) {
        setIsAdvancedSearchOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isAdvancedSearchOpen, setIsAdvancedSearchOpen]);

  // Extract all available tags across all series
  const allTags = useMemo(() => {
    const tagsSet = new Set<string>();
    seriesList.forEach(s => {
      s.tags?.forEach(t => tagsSet.add(t.toLowerCase()));
    });
    return Array.from(tagsSet);
  }, [seriesList]);

  // Filtered tags based on tagQuery
  const filteredTags = useMemo(() => {
    if (!tagQuery.trim()) return allTags;
    const q = tagQuery.toLowerCase().trim();
    return allTags.filter(t => t.includes(q));
  }, [allTags, tagQuery]);

  // Available genres
  const allGenres = useMemo(() => {
    const genresSet = new Set<string>(['Tümü', ...customGenres]);
    seriesList.forEach(s => genresSet.add(s.genre));
    return Array.from(genresSet);
  }, [seriesList, customGenres]);

  const PLATFORMS = ['Tümü', 'Netshot', 'DramaWave', 'ReelShort', 'DramaBox'] as const;
  const AGE_RATINGS = ['Tümü', 'Genel İzleyici', '13+', '16+', '18+'] as const;

  // Reset all filters
  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedPlatform('Tümü');
    setSelectedGenre('Tümü');
    setSelectedAgeRating('Tümü');
    setSelectedTag(null);
    setTagQuery('');
    setSortBy('popular');
    inputRef.current?.focus();
  };

  const isFiltered =
    searchQuery.trim() !== '' ||
    selectedPlatform !== 'Tümü' ||
    selectedGenre !== 'Tümü' ||
    selectedAgeRating !== 'Tümü' ||
    selectedTag !== null ||
    sortBy !== 'popular';

  // Filter and sort logic
  const filteredResults = useMemo(() => {
    return seriesList
      .filter(series => {
        // 1. Text Query (Search in Title, Description, Director, Tags, and Episodes)
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase().trim();
          const matchTitle = series.title.toLowerCase().includes(q);
          const matchDesc = series.description.toLowerCase().includes(q);
          const matchDirector = series.director.toLowerCase().includes(q);
          const matchGenre = series.genre.toLowerCase().includes(q);
          const matchTags = series.tags?.some(t => t.toLowerCase().includes(q));
          const matchPlatform = series.platform?.toLowerCase().includes(q);
          const matchEpisode = series.episodes.some(ep => ep.title.toLowerCase().includes(q));

          if (!matchTitle && !matchDesc && !matchDirector && !matchGenre && !matchTags && !matchPlatform && !matchEpisode) {
            return false;
          }
        }

        // 2. Dizi Platformu Filter (Netshot, DramaWave, ReelShort, DramaBox)
        if (selectedPlatform !== 'Tümü') {
          const matchesPlatform =
            series.platform === selectedPlatform ||
            series.tags?.some(t => t.toLowerCase() === selectedPlatform.toLowerCase()) ||
            series.description.toLowerCase().includes(selectedPlatform.toLowerCase()) ||
            series.title.toLowerCase().includes(selectedPlatform.toLowerCase());
          if (!matchesPlatform) return false;
        }

        // 3. Dizi Türü Filter
        if (selectedGenre !== 'Tümü' && series.genre !== selectedGenre) {
          return false;
        }

        // 4. Yaş Sınırı Filter
        if (selectedAgeRating !== 'Tümü') {
          if (selectedAgeRating === '18+') {
            if (!series.isNsfw && series.ageRating !== '18+') return false;
          } else if (selectedAgeRating === 'Genel İzleyici') {
            if (series.isNsfw || (series.ageRating && series.ageRating !== 'Genel İzleyici')) return false;
          } else {
            if (series.ageRating && series.ageRating !== selectedAgeRating) return false;
          }
        }

        // 5. Etiket Filter
        if (selectedTag) {
          const hasTag = series.tags?.some(t => t.toLowerCase() === selectedTag.toLowerCase());
          if (!hasTag) return false;
        }

        // Global NSFW check
        if (!isNsfwEnabled && series.isNsfw && selectedAgeRating !== '18+') {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'popular') {
          return b.viewCount - a.viewCount;
        }
        if (sortBy === 'rating') {
          return parseFloat(b.rating || '0') - parseFloat(a.rating || '0');
        }
        if (sortBy === 'newest') {
          return b.releaseYear - a.releaseYear;
        }
        if (sortBy === 'episodes_desc') {
          return b.episodes.length - a.episodes.length;
        }
        if (sortBy === 'az') {
          return a.title.localeCompare(b.title);
        }
        return 0;
      });
  }, [
    seriesList,
    searchQuery,
    selectedPlatform,
    selectedGenre,
    selectedAgeRating,
    selectedTag,
    sortBy,
    isNsfwEnabled,
  ]);

  // Filtered members by username, displayName or bio
  const filteredUsers = useMemo(() => {
    const q = searchQuery.toLowerCase().trim().replace(/^@/, '');
    const validUsers = allUsers.filter(u => u.id !== 'guest');
    if (!q) return validUsers;
    return validUsers.filter(u =>
      u.username.toLowerCase().includes(q) ||
      u.displayName.toLowerCase().includes(q) ||
      u.bio?.toLowerCase().includes(q)
    );
  }, [allUsers, searchQuery]);

  if (!isAdvancedSearchOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-md flex items-start justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl bg-white dark:bg-[#0b1222] rounded-3xl border border-slate-200 dark:border-blue-900/40 shadow-2xl overflow-hidden my-4 sm:my-8 text-slate-900 dark:text-slate-100 transition-colors">
        {/* Header Bar with Mode Toggle (Diziler vs Üyeler) */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50 dark:bg-slate-900/80">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-600/10 dark:bg-cyan-500/15 text-blue-600 dark:text-cyan-400 flex items-center justify-center border border-blue-500/20">
              {searchType === 'series' ? <SlidersHorizontal className="w-4 h-4" /> : <Users className="w-4 h-4" />}
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span>{searchType === 'series' ? 'Gelişmiş Dizi Arama' : 'Üye & Arkadaş Arama'}</span>
                <span className="text-[11px] font-normal text-slate-500 dark:text-slate-400">
                  ({searchType === 'series' ? `${filteredResults.length} dizi` : `${filteredUsers.length} üye`})
                </span>
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            {/* Mode Toggle Buttons */}
            <div className="flex items-center p-1 rounded-xl bg-slate-200 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs font-bold">
              <button
                onClick={() => setSearchType('series')}
                className={`px-3 py-1 rounded-lg flex items-center gap-1.5 transition-all ${
                  searchType === 'series'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Film className="w-3.5 h-3.5" />
                <span>Diziler ({filteredResults.length})</span>
              </button>
              <button
                onClick={() => setSearchType('users')}
                className={`px-3 py-1 rounded-lg flex items-center gap-1.5 transition-all ${
                  searchType === 'users'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                <span>Üyeler ({filteredUsers.length})</span>
              </button>
            </div>

            {isFiltered && searchType === 'series' && (
              <button
                onClick={handleResetFilters}
                className="px-2.5 py-1 text-xs rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 flex items-center gap-1.5 transition-colors font-medium"
              >
                <RotateCcw className="w-3 h-3" />
                <span className="hidden sm:inline">Temizle</span>
              </button>
            )}

            <button
              onClick={() => setIsAdvancedSearchOpen(false)}
              className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white flex items-center justify-center transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Search Input Box */}
        <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800/80 bg-white dark:bg-[#080d19]">
          <div className="relative">
            <Search className="w-5 h-5 text-blue-500 dark:text-cyan-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              ref={inputRef}
              type="text"
              value={searchQuery}
              onChange={e => {
                const val = e.target.value;
                setSearchQuery(val);
                if (val.startsWith('@') && searchType !== 'users') {
                  setSearchType('users');
                }
              }}
              placeholder={
                searchType === 'series'
                  ? 'Dizi adı, oyuncu, konu veya etiket arayın (Üye aramak için @kullanıcıadı yazabilirsiniz)...'
                  : 'Kullanıcı adı (@kullaniciadi) veya üye ismi ile arayın...'
              }
              className="w-full pl-11 pr-10 py-3 rounded-2xl bg-slate-100 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 text-sm font-medium text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 dark:focus:border-cyan-400 shadow-inner"
            />
            {searchQuery && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  inputRef.current?.focus();
                }}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-slate-300 dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center justify-center hover:bg-slate-400 dark:hover:bg-slate-700 text-xs"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* 4 DEDICATED FILTER SECTIONS (ONLY IN SERIES MODE) */}
        {searchType === 'series' && (
          <div className="p-4 sm:p-6 border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-[#0a101f] space-y-4">
            {/* TAB 1: DİZİ PLATFORMU (Netshot, DramaWave, ReelShort, DramaBox) */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Tv className="w-3.5 h-3.5 text-blue-500" />
                  <span>Dizi Platformu</span>
                </label>
                {selectedPlatform !== 'Tümü' && (
                  <button
                    onClick={() => setSelectedPlatform('Tümü')}
                    className="text-[10px] text-blue-600 dark:text-cyan-400 hover:underline font-semibold"
                  >
                    Sıfırla
                  </button>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {PLATFORMS.map(platform => {
                  const isSelected = selectedPlatform === platform;
                  return (
                    <button
                      key={platform}
                      onClick={() => setSelectedPlatform(platform)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border flex items-center gap-1.5 ${
                        isSelected
                          ? 'bg-blue-600 text-white border-blue-500 shadow-md shadow-blue-600/30'
                          : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700/80 hover:border-blue-400'
                      }`}
                    >
                      {platform === 'Netshot' && <span className="w-2 h-2 rounded-full bg-red-500" />}
                      {platform === 'DramaWave' && <span className="w-2 h-2 rounded-full bg-cyan-400" />}
                      {platform === 'ReelShort' && <span className="w-2 h-2 rounded-full bg-amber-400" />}
                      {platform === 'DramaBox' && <span className="w-2 h-2 rounded-full bg-emerald-400" />}
                      <span>{platform}</span>
                      {isSelected && <Check className="w-3.5 h-3.5 ml-0.5" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* GRID: TAB 2 (DİZİ TÜRÜ) & TAB 3 (YAŞ SINIRI) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-slate-200/80 dark:border-slate-800/80">
              {/* TAB 2: DİZİ TÜRÜ */}
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Film className="w-3.5 h-3.5 text-indigo-500" />
                  <span>Dizi Türü</span>
                </label>
                <select
                  value={selectedGenre}
                  onChange={e => setSelectedGenre(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:outline-none focus:border-blue-500 font-semibold"
                >
                  {allGenres.map(genre => (
                    <option key={genre} value={genre}>
                      {genre === 'Tümü' ? 'Tüm Dizi Türleri' : genre}
                    </option>
                  ))}
                </select>
              </div>

              {/* TAB 3: YAŞ SINIRI */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                    <ShieldAlert className="w-3.5 h-3.5 text-rose-500" />
                    <span>Yaş Sınırı</span>
                  </label>
                  {selectedAgeRating !== 'Tümü' && (
                    <button
                      onClick={() => setSelectedAgeRating('Tümü')}
                      className="text-[10px] text-blue-600 dark:text-cyan-400 hover:underline font-semibold"
                    >
                      Sıfırla
                    </button>
                  )}
                </div>
                <div className="flex flex-wrap items-center gap-1.5">
                  {AGE_RATINGS.map(rating => {
                    const isSelected = selectedAgeRating === rating;
                    let colorClass = 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700';

                    if (isSelected) {
                      if (rating === 'Genel İzleyici') colorClass = 'bg-emerald-600 text-white border-emerald-500 shadow-sm';
                      else if (rating === '13+') colorClass = 'bg-blue-600 text-white border-blue-500 shadow-sm';
                      else if (rating === '16+') colorClass = 'bg-amber-600 text-white border-amber-500 shadow-sm';
                      else if (rating === '18+') colorClass = 'bg-rose-600 text-white border-rose-500 shadow-sm';
                      else colorClass = 'bg-blue-600 text-white border-blue-500 shadow-sm';
                    }

                    return (
                      <button
                        key={rating}
                        onClick={() => {
                          setSelectedAgeRating(rating);
                          if (rating === '18+' && !isNsfwEnabled) {
                            toggleNsfw();
                          }
                        }}
                        className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all border ${colorClass}`}
                      >
                        {rating}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* TAB 4: ETİKET ARAMA KISMI */}
            <div className="pt-2 border-t border-slate-200/80 dark:border-slate-800/80">
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5 text-cyan-500" />
                  <span>Etiket Arama Kısmı</span>
                </label>
                {selectedTag && (
                  <button
                    onClick={() => setSelectedTag(null)}
                    className="text-[10px] text-rose-500 hover:underline font-bold flex items-center gap-1"
                  >
                    <X className="w-3 h-3" />
                    <span>#{selectedTag} Etiketini Kaldır</span>
                  </button>
                )}
              </div>

              {/* Tag Search Input */}
              <div className="relative mb-2">
                <Tag className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={tagQuery}
                  onChange={e => setTagQuery(e.target.value)}
                  placeholder="Etiket arayın (Örn: #romantik, #intikam, #ceo, #dikey)..."
                  className="w-full pl-9 pr-8 py-2 text-xs rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500"
                />
                {tagQuery && (
                  <button
                    onClick={() => setTagQuery('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Clickable Tag Chips */}
              <div className="flex flex-wrap items-center gap-1.5 max-h-24 overflow-y-auto no-scrollbar">
                {filteredTags.length > 0 ? (
                  filteredTags.map(tag => {
                    const isSelected = selectedTag === tag;
                    return (
                      <button
                        key={tag}
                        onClick={() => setSelectedTag(isSelected ? null : tag)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-all border ${
                          isSelected
                            ? 'bg-cyan-500 text-slate-950 border-cyan-400 font-bold shadow-sm shadow-cyan-500/30'
                            : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700/80 hover:border-cyan-500/50'
                        }`}
                      >
                        #{tag}
                      </button>
                    );
                  })
                ) : (
                  <span className="text-xs text-slate-400 italic">Eşleşen etiket bulunamadı.</span>
                )}
              </div>
            </div>

            {/* Sort Selection Row */}
            <div className="pt-2 border-t border-slate-200/80 dark:border-slate-800/80 flex items-center justify-between text-xs">
              <span className="font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1">
                <ArrowUpDown className="w-3.5 h-3.5 text-blue-500" /> Sıralama:
              </span>
              <select
                value={sortBy}
                onChange={e => setSortBy(e.target.value as any)}
                className="px-3 py-1.5 text-xs rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:outline-none focus:border-blue-500 font-semibold"
              >
                <option value="popular">En Popüler (İzlenme Sayısı)</option>
                <option value="rating">En Yüksek Puan (IMDb)</option>
                <option value="newest">En Yeni Eklenenler (Yıl)</option>
                <option value="episodes_desc">Bölüm Sayısı (Çoktan Aza)</option>
                <option value="az">Alfabetik (A'dan Z'ye)</option>
              </select>
            </div>
          </div>
        )}

        {/* Search Results List / Cards */}
        <div className="p-4 sm:p-6 max-h-[50vh] overflow-y-auto">
          {searchType === 'users' ? (
            <div>
              {filteredUsers.length === 0 ? (
                <div className="py-12 text-center">
                  <Users className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto mb-3" />
                  <p className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Eşleşen Üye Bulunamadı
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                    Farklı bir kullanıcı adı (@kullaniciadi) veya isim deneyebilirsiniz.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
                  {filteredUsers.map(u => {
                    const isMe = u.id === currentUser.id;
                    const isFollowingThisUser = currentUser.followingUserIds.includes(u.id);

                    return (
                      <div
                        key={u.id}
                        className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 flex flex-col justify-between gap-3 hover:border-blue-500/40 transition-all shadow-sm"
                      >
                        <div
                          onClick={() => {
                            viewUserProfile(u);
                            setIsAdvancedSearchOpen(false);
                          }}
                          className="flex items-start gap-3 cursor-pointer group"
                        >
                          <div className="relative shrink-0">
                            <img
                              src={u.avatar}
                              alt={u.displayName}
                              className="w-12 h-12 rounded-2xl object-cover border border-blue-500/30 group-hover:ring-2 ring-blue-500 transition-all"
                            />
                            {u.role === 'admin' && (
                              <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full bg-amber-500 border-2 border-white dark:border-slate-900" title="Yönetici" />
                            )}
                          </div>

                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-1.5">
                              <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate group-hover:text-blue-500 dark:group-hover:text-cyan-400 transition-colors">
                                {u.displayName}
                              </h4>
                              {isMe && (
                                <span className="text-[10px] text-blue-500 font-bold font-mono">(Sen)</span>
                              )}
                            </div>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-mono truncate">
                              @{u.username}
                            </p>
                            <p className="text-[11px] text-slate-600 dark:text-slate-300 line-clamp-1 mt-1">
                              {u.bio || 'Minimo üyesi'}
                            </p>
                          </div>
                        </div>

                        {/* Stats & Actions */}
                        <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                          <span className="font-mono">
                            <strong className="text-slate-900 dark:text-white">{u.followersCount || 0}</strong> takipçi
                          </span>

                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => {
                                viewUserProfile(u);
                                setIsAdvancedSearchOpen(false);
                              }}
                              className="px-2.5 py-1 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold transition-colors"
                            >
                              Profili Gör
                            </button>

                            {!isMe && (
                              <button
                                onClick={() => followUser(u.id)}
                                className={`px-3 py-1 rounded-xl text-xs font-bold flex items-center gap-1 transition-all ${
                                  isFollowingThisUser
                                    ? 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                                    : 'bg-blue-600 text-white hover:bg-blue-500 shadow-sm'
                                }`}
                              >
                                {isFollowingThisUser ? (
                                  <>
                                    <UserCheck className="w-3 h-3 text-blue-400" />
                                    <span>Takipte</span>
                                  </>
                                ) : (
                                  <>
                                    <UserPlus className="w-3 h-3" />
                                    <span>Takip Et</span>
                                  </>
                                )}
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ) : filteredResults.length === 0 ? (
            <div className="py-12 text-center">
              <Film className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto mb-3" />
              <p className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">
                Eşleşen Dizi Bulunamadı
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto mb-4">
                Arama kriterlerinizi değiştirerek veya filtreleri temizleyerek tekrar deneyebilirsiniz.
              </p>
              <button
                onClick={handleResetFilters}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-md transition-all inline-flex items-center gap-2"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Tüm Filtreleri Temizle</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {filteredResults.map(series => {
                const isBookmarked = currentUser.bookmarkedSeriesIds.includes(series.id);

                return (
                  <div
                    key={series.id}
                    className="group relative bg-slate-50 dark:bg-slate-900/60 rounded-2xl border border-slate-200 dark:border-slate-800/80 overflow-hidden hover:border-blue-500/50 dark:hover:border-cyan-500/50 transition-all flex flex-col"
                  >
                    {/* Poster */}
                    <div className="relative aspect-[9/14] overflow-hidden bg-slate-950">
                      <img
                        src={series.coverUrl}
                        alt={series.title}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30" />

                      {/* Top Badges */}
                      <div className="absolute top-2 left-2 flex flex-col gap-1">
                        {series.platform && (
                          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-blue-600 text-white uppercase tracking-wider shadow">
                            {series.platform}
                          </span>
                        )}
                        {series.ageRating && (
                          <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md text-white shadow ${
                            series.ageRating === '18+'
                              ? 'bg-rose-600'
                              : series.ageRating === '16+'
                              ? 'bg-amber-600'
                              : series.ageRating === '13+'
                              ? 'bg-blue-600'
                              : 'bg-emerald-600'
                          }`}>
                            {series.ageRating}
                          </span>
                        )}
                      </div>

                      {/* Bookmark Button */}
                      <button
                        onClick={e => {
                          e.stopPropagation();
                          toggleBookmark(series.id);
                        }}
                        className={`absolute top-2 right-2 w-7 h-7 rounded-full backdrop-blur-md flex items-center justify-center transition-colors ${
                          isBookmarked
                            ? 'bg-blue-600 text-white'
                            : 'bg-black/40 hover:bg-black/70 text-white'
                        }`}
                        title={isBookmarked ? 'Favorilerden Çıkar' : 'Favorilere Ekle'}
                      >
                        <Bookmark className="w-3.5 h-3.5 fill-current" />
                      </button>

                      {/* Overlay Play Button */}
                      <button
                        onClick={() => {
                          openReelsPlayer(series.id);
                          setIsAdvancedSearchOpen(false);
                        }}
                        className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 bg-black/40 transition-opacity"
                      >
                        <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-lg shadow-blue-600/50 hover:scale-110 transition-transform">
                          <Play className="w-4 h-4 fill-white translate-x-0.5" />
                        </div>
                      </button>

                      {/* Bottom Info on Poster */}
                      <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between text-[11px] text-white/90 font-mono">
                        <span className="flex items-center gap-1 font-bold text-amber-400">
                          <Star className="w-3 h-3 fill-amber-400" />
                          <span>{series.rating}</span>
                        </span>
                        <span>{series.episodes.length} Bölüm</span>
                      </div>
                    </div>

                    {/* Card Content */}
                    <div className="p-3 flex-1 flex flex-col justify-between">
                      <div>
                        <h4 className="text-xs font-bold text-slate-900 dark:text-white line-clamp-1 mb-1">
                          {series.title}
                        </h4>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 line-clamp-1">
                          {series.genre} • {series.releaseYear}
                        </p>
                      </div>

                      {series.tags && series.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {series.tags.slice(0, 2).map(tag => (
                            <span
                              key={tag}
                              className="text-[9px] px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-mono"
                            >
                              #{tag}
                            </span>
                          ))}
                        </div>
                      )}

                      <button
                        onClick={() => {
                          openReelsPlayer(series.id);
                          setIsAdvancedSearchOpen(false);
                        }}
                        className="mt-3 w-full py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-[11px] font-bold flex items-center justify-center gap-1 shadow-sm transition-all"
                      >
                        <Play className="w-3 h-3 fill-white" />
                        <span>Hemen İzle</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
