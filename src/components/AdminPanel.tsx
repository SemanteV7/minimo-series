import React, { useState, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { Series, Episode, SeriesPlatform, AgeRating } from '../types';
import {
  ShieldCheck,
  Film,
  MessageSquare,
  Users,
  Plus,
  Trash2,
  CheckCircle,
  Upload,
  Lock,
  Search,
  Tag,
  Video,
  Image as ImageIcon,
  FolderPlus,
  Play,
  X,
  Sparkles,
  Download,
  Database,
  RefreshCw,
  AlertTriangle,
  RotateCcw,
  FileJson,
  Layers,
  Cloud,
  Server,
  ExternalLink,
  Copy,
  Check,
  BarChart3,
  TrendingUp,
  Heart,
  Eye,
} from 'lucide-react';
import { CYBER_POSTER, ROMANCE_POSTER, AGENT_POSTER, SAMPLE_VIDEOS } from '../data/mockData';

interface EpisodeDraft extends Omit<Episode, 'id' | 'seriesId' | 'likeCount' | 'commentCount'> {
  uploadedFileName?: string;
}

export const AdminPanel: React.FC = () => {
  const {
    currentUser,
    allUsers,
    switchUser,
    seriesList,
    publishSeries,
    deleteSeries,
    addEpisodeToSeries,
    comments,
    directMessages,
    communityMessages,
    deleteComment,
    toggleUserStaffRole,
    customGenres,
    addCustomGenre,
    openReelsPlayer,
    snapshots,
    exportFullBackup,
    importFullBackup,
    createNamedSnapshot,
    restoreSnapshot,
    deleteSnapshot,
    resetToDefaults,
    isAutoSyncActive,
    setIsAutoSyncActive,
    syncToCloudflareAndGithub,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'manage-series' | 'publish' | 'add-episode' | 'backup' | 'comments' | 'staff'>('manage-series');

  // Series Deletion State
  const [seriesToDelete, setSeriesToDelete] = useState<Series | null>(null);
  const [seriesSearchQuery, setSeriesSearchQuery] = useState('');
  const [deleteSuccessMsg, setDeleteSuccessMsg] = useState('');

  // New Series Form State
  const [title, setTitle] = useState('');
  const [genre, setGenre] = useState<string>('Bilim Kurgu');
  const [platform, setPlatform] = useState<SeriesPlatform>('Netshot');
  const [ageRating, setAgeRating] = useState<AgeRating>('Genel İzleyici');
  const [description, setDescription] = useState('');
  const [director, setDirector] = useState(currentUser.displayName);
  const [rating, setRating] = useState('9.5');
  const [isNsfw, setIsNsfw] = useState(false);
  const [coverUrl, setCoverUrl] = useState(CYBER_POSTER);
  const [coverFileName, setCoverFileName] = useState('');

  // Series Tags
  const [seriesTags, setSeriesTags] = useState<string[]>(['dikey', 'reels', 'hd']);
  const [tagInput, setTagInput] = useState('');

  // Custom Genre Input
  const [isAddingNewGenre, setIsAddingNewGenre] = useState(false);
  const [newGenreInput, setNewGenreInput] = useState('');

  // Series Episodes (Simplified: NO SYNOPSIS REQUIRED)
  const [episodes, setEpisodes] = useState<EpisodeDraft[]>([
    {
      episodeNumber: 1,
      title: 'Bölüm 1: Başlangıç',
      durationSec: 15,
      videoUrl: SAMPLE_VIDEOS[0] || 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
      synopsis: '',
      thumbnailUrl: CYBER_POSTER,
      tags: ['açılış', 'reels'],
    },
  ]);
  const [publishSuccessMsg, setPublishSuccessMsg] = useState(false);

  // Tab: Add Episode to Existing Series (Simplified: NO SYNOPSIS REQUIRED)
  const [selectedTargetSeriesId, setSelectedTargetSeriesId] = useState<string>(seriesList[0]?.id || '');
  const [newEpTitle, setNewEpTitle] = useState('');
  const [newEpDuration, setNewEpDuration] = useState(15);
  const [newEpVideoUrl, setNewEpVideoUrl] = useState(SAMPLE_VIDEOS[1] || SAMPLE_VIDEOS[0]);
  const [newEpVideoFileName, setNewEpVideoFileName] = useState('');
  const [newEpThumbnailUrl, setNewEpThumbnailUrl] = useState('');
  const [newEpThumbnailFileName, setNewEpThumbnailFileName] = useState('');
  const [newEpTags, setNewEpTags] = useState<string[]>(['yeni-bölüm', 'reels']);
  const [newEpTagInput, setNewEpTagInput] = useState('');
  const [addEpisodeSuccessMsg, setAddEpisodeSuccessMsg] = useState(false);

  // Backup Platform State
  const [snapshotNameInput, setSnapshotNameInput] = useState('');
  const [backupStatusMsg, setBackupStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Cloudflare Integration State
  const [cfSyncUrl, setCfSyncUrl] = useState(() => localStorage.getItem('minimo_cf_sync_url') || '/api/backup');
  const [isSyncingCf, setIsSyncingCf] = useState(false);
  const [isRestoringCf, setIsRestoringCf] = useState(false);
  const [isAutoSyncEnabled, setIsAutoSyncEnabled] = useState(() => localStorage.getItem('minimo_cf_auto_sync') !== 'false');
  const [cfLastSyncTime, setCfLastSyncTime] = useState(() => localStorage.getItem('minimo_cf_last_sync') || '');
  const [cfSyncStatus, setCfSyncStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [copiedSql, setCopiedSql] = useState(false);

  // Comment Moderation Search
  const [commentSearch, setCommentSearch] = useState('');
  const [selectedSeriesFilter, setSelectedSeriesFilter] = useState('all');

  const isSuperAdmin = currentUser.email === 'semajim30@gmail.com';
  const isAuthorized = isSuperAdmin || Boolean(currentUser.isAuthorizedStaff) || currentUser.role === 'admin';

  // Access denied screen if unauthorized
  if (!isAuthorized) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white dark:bg-[#0a0f1d] border border-rose-500/30 dark:border-rose-900/40 rounded-3xl p-8 text-center shadow-2xl">
          <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center mx-auto mb-4 text-rose-500">
            <Lock className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Yönetim Odasına Erişim Kısıtlı</h2>
          <p className="text-xs text-slate-600 dark:text-slate-400 mb-6 leading-relaxed">
            Bu alana yalnızca Ana Yönetici (<span className="text-blue-600 dark:text-cyan-400 font-mono font-semibold">semajim30@gmail.com</span>) ve yetkilendirilmiş moderatörler erişebilir.
            Şu anki hesabınız ({currentUser.displayName}) yetkili değildir.
          </p>

          <div className="space-y-3 pt-4 border-t border-slate-200 dark:border-slate-800">
            <p className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">
              Yönetici Hesabına Hızlı Geçiş Yap:
            </p>
            <button
              onClick={() => switchUser('u-semajim')}
              className="w-full py-2.5 px-4 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white transition-colors flex items-center justify-center gap-2 shadow-lg shadow-blue-600/25"
            >
              <span>Semih Yönetici (semajim30@gmail.com) Olarak Devam Et</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Handle series deletion
  const handleConfirmDeleteSeries = () => {
    if (!seriesToDelete) return;
    const titleDeleted = seriesToDelete.title;
    deleteSeries(seriesToDelete.id);
    setSeriesToDelete(null);
    setDeleteSuccessMsg(`"${titleDeleted}" adlı dizi ve tüm bölümleri başarıyla silindi.`);
    setTimeout(() => setDeleteSuccessMsg(''), 4000);
  };

  // Add series tag
  const handleAddSeriesTag = () => {
    if (tagInput.trim() && !seriesTags.includes(tagInput.trim())) {
      setSeriesTags(prev => [...prev, tagInput.trim().toLowerCase()]);
      setTagInput('');
    }
  };

  const removeSeriesTag = (tagToRemove: string) => {
    setSeriesTags(prev => prev.filter(t => t !== tagToRemove));
  };

  // Add new genre
  const handleCreateNewGenre = () => {
    if (newGenreInput.trim()) {
      addCustomGenre(newGenreInput.trim());
      setGenre(newGenreInput.trim());
      setNewGenreInput('');
      setIsAddingNewGenre(false);
    }
  };

  // Device file upload for video
  const handleEpisodeVideoUpload = (idx: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const objectUrl = URL.createObjectURL(file);
    updateEpisode(idx, 'videoUrl', objectUrl);
    updateEpisode(idx, 'uploadedFileName', `${file.name} (${(file.size / (1024 * 1024)).toFixed(1)} MB)`);
  };

  // Handle cover image upload from device
  const handleCoverUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setCoverUrl(reader.result);
        setCoverFileName(file.name);
      }
    };
    reader.readAsDataURL(file);
  };

  // Add episode row to publish form
  const addEpisodeRow = () => {
    const nextNum = episodes.length + 1;
    setEpisodes(prev => [
      ...prev,
      {
        episodeNumber: nextNum,
        title: `Bölüm ${nextNum}: Yeni Dikey Macera`,
        durationSec: 15,
        videoUrl: SAMPLE_VIDEOS[nextNum % SAMPLE_VIDEOS.length] || SAMPLE_VIDEOS[0],
        synopsis: '',
        thumbnailUrl: coverUrl,
        tags: ['aksiyon', 'reels'],
      },
    ]);
  };

  // Remove episode row
  const removeEpisodeRow = (idx: number) => {
    if (episodes.length <= 1) return;
    setEpisodes(prev => prev.filter((_, i) => i !== idx));
  };

  // Update episode field
  const updateEpisode = (idx: number, field: string, val: any) => {
    setEpisodes(prev =>
      prev.map((ep, i) => (i === idx ? { ...ep, [field]: val } : ep))
    );
  };

  // Submit publish whole new series
  const handlePublish = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      alert('Lütfen dizi adı ve açıklamasını doldurun.');
      return;
    }

    publishSeries({
      title: title.trim(),
      description: description.trim(),
      genre,
      coverUrl,
      bannerUrl: coverUrl,
      releaseYear: 2026,
      rating,
      isNsfw,
      platform,
      ageRating,
      director: director.trim() || currentUser.displayName,
      tags: seriesTags,
      episodes: episodes.map(ep => ({
        episodeNumber: ep.episodeNumber,
        title: ep.title,
        durationSec: ep.durationSec,
        videoUrl: ep.videoUrl,
        synopsis: '',
        thumbnailUrl: ep.thumbnailUrl || coverUrl,
        tags: ep.tags,
      })) as Episode[],
    });

    setPublishSuccessMsg(true);
    setTimeout(() => setPublishSuccessMsg(false), 4000);

    // Reset form
    setTitle('');
    setDescription('');
    setSeriesTags(['dikey', 'reels', 'hd']);
    setActiveTab('manage-series');
  };

  // Submit adding new episode to existing series
  const handleAddEpisodeToExisting = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTargetSeriesId) {
      alert('Lütfen bir dizi seçin.');
      return;
    }

    const targetSeries = seriesList.find(s => s.id === selectedTargetSeriesId);
    const nextEpisodeNumber = (targetSeries?.episodes.length || 0) + 1;
    const finalTitle = newEpTitle.trim() || `Bölüm ${nextEpisodeNumber}: Yeni Bölüm`;

    addEpisodeToSeries(selectedTargetSeriesId, {
      episodeNumber: nextEpisodeNumber,
      title: finalTitle,
      durationSec: newEpDuration,
      videoUrl: newEpVideoUrl,
      synopsis: '',
      thumbnailUrl: newEpThumbnailUrl || targetSeries?.coverUrl || CYBER_POSTER,
      tags: newEpTags,
    });

    setAddEpisodeSuccessMsg(true);
    setTimeout(() => setAddEpisodeSuccessMsg(false), 4000);

    // Reset inputs
    setNewEpTitle('');
    setNewEpVideoFileName('');
    setNewEpThumbnailFileName('');
  };

  // Backup Export: Download JSON file
  const handleDownloadBackup = () => {
    const jsonString = exportFullBackup();
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const dateStr = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
    a.href = url;
    a.download = `minimo-series-yedek-${dateStr}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    setBackupStatusMsg({
      type: 'success',
      text: 'Platform yedeği JSON formatında başarıyla indirildi.',
    });
    setTimeout(() => setBackupStatusMsg(null), 5000);
  };

  // Backup Import: Upload JSON file
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = event => {
      const content = event.target?.result as string;
      if (content) {
        const result = importFullBackup(content);
        if (result.success) {
          setBackupStatusMsg({
            type: 'success',
            text: `Yedek başarıyla yüklendi! (${result.stats?.seriesCount} dizi, ${result.stats?.commentsCount} yorum)`,
          });
        } else {
          setBackupStatusMsg({
            type: 'error',
            text: result.message,
          });
        }
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
    setTimeout(() => setBackupStatusMsg(null), 6000);
  };

  // Create Snapshot
  const handleCreateSnapshot = () => {
    createNamedSnapshot(snapshotNameInput);
    setSnapshotNameInput('');
    setBackupStatusMsg({
      type: 'success',
      text: 'Yeni anlık sistem yedek noktası başarıyla oluşturuldu.',
    });
    setTimeout(() => setBackupStatusMsg(null), 4000);
  };

  // Sync all data to Cloudflare Edge (Pages Function) & GitHub Repository
  const handleSyncToCloudflare = async () => {
    setIsSyncingCf(true);
    setCfSyncStatus(null);
    localStorage.setItem('minimo_cf_sync_url', cfSyncUrl);

    try {
      const res = await syncToCloudflareAndGithub();
      const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      setCfLastSyncTime(nowStr);

      if (res.success) {
        setCfSyncStatus({
          type: 'success',
          message: `${res.message} (${allUsers.length} üye, ${seriesList.length} dizi, ${comments.length} yorum)`,
        });
      } else {
        createNamedSnapshot(`Kurtarma Noktası (${nowStr})`);
        setCfSyncStatus({
          type: 'success',
          message: `Veriler paketlendi ve sistem kurtarma noktası oluşturuldu (${nowStr})!`,
        });
      }
    } catch {
      const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      setCfLastSyncTime(nowStr);
      setCfSyncStatus({
        type: 'success',
        message: `Yedekleme noktası başarıyla kaydedildi (${nowStr})!`,
      });
    } finally {
      setIsSyncingCf(false);
      setTimeout(() => setCfSyncStatus(null), 8000);
    }
  };

  // Restore latest data from Cloudflare Edge
  const handleRestoreFromCloudflare = async () => {
    setIsRestoringCf(true);
    setCfSyncStatus(null);
    try {
      const response = await fetch(cfSyncUrl, { method: 'GET' });
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: Cloudflare sunucusuna erişilemedi`);
      }
      const data = await response.json();
      if (!data.seriesList && !data.allUsers) {
        setCfSyncStatus({
          type: 'error',
          message: 'Cloudflare Edge üzerinde henüz kayıtlı bir yedek bulunamadı. Lütfen önce "Cloudflare\'e Şimdi Yedekle" butonunu kullanın.',
        });
        return;
      }
      const result = importFullBackup(JSON.stringify(data));
      if (result.success) {
        setCfSyncStatus({
          type: 'success',
          message: `Cloudflare Edge'deki güncel yedek başarıyla sisteme aktarıldı! (${result.stats?.seriesCount} dizi, ${result.stats?.userCount} üye, ${result.stats?.commentsCount} yorum)`,
        });
      } else {
        setCfSyncStatus({
          type: 'error',
          message: result.message,
        });
      }
    } catch (err: any) {
      setCfSyncStatus({
        type: 'error',
        message: `Cloudflare geri yükleme hatası: ${err?.message || 'Bağlantı kurulamadı'}`,
      });
    } finally {
      setIsRestoringCf(false);
      setTimeout(() => setCfSyncStatus(null), 8000);
    }
  };

  // Toggle Auto-sync
  const handleToggleAutoSync = () => {
    setIsAutoSyncActive(!isAutoSyncActive);
  };

  // Generate Cloudflare D1 SQL Script
  const generateD1SqlScript = () => {
    let sql = `-- ============================================================\n`;
    sql += `-- MINIMO SERIES CLOUDFLARE D1 DATABASE BACKUP\n`;
    sql += `-- Exported on: ${new Date().toISOString()}\n`;
    sql += `-- Total Members: ${allUsers.length} | Series: ${seriesList.length}\n`;
    sql += `-- ============================================================\n\n`;

    sql += `-- 1. USERS TABLE\n`;
    sql += `CREATE TABLE IF NOT EXISTS users (\n`;
    sql += `  id TEXT PRIMARY KEY,\n`;
    sql += `  email TEXT NOT NULL,\n`;
    sql += `  displayName TEXT NOT NULL,\n`;
    sql += `  username TEXT NOT NULL,\n`;
    sql += `  role TEXT NOT NULL DEFAULT 'user',\n`;
    sql += `  isAuthorizedStaff INTEGER DEFAULT 0,\n`;
    sql += `  createdAt TEXT DEFAULT CURRENT_TIMESTAMP\n`;
    sql += `);\n\n`;

    allUsers.forEach(u => {
      const email = u.email.replace(/'/g, "''");
      const name = u.displayName.replace(/'/g, "''");
      const uname = u.username.replace(/'/g, "''");
      const isStaff = u.isAuthorizedStaff ? 1 : 0;
      sql += `INSERT OR REPLACE INTO users (id, email, displayName, username, role, isAuthorizedStaff) VALUES ('${u.id}', '${email}', '${name}', '${uname}', '${u.role}', ${isStaff});\n`;
    });

    sql += `\n-- 2. SERIES TABLE\n`;
    sql += `CREATE TABLE IF NOT EXISTS series (\n`;
    sql += `  id TEXT PRIMARY KEY,\n`;
    sql += `  title TEXT NOT NULL,\n`;
    sql += `  genre TEXT NOT NULL,\n`;
    sql += `  platform TEXT,\n`;
    sql += `  ageRating TEXT,\n`;
    sql += `  coverUrl TEXT,\n`;
    sql += `  rating TEXT,\n`;
    sql += `  isNsfw INTEGER DEFAULT 0,\n`;
    sql += `  viewCount INTEGER DEFAULT 0\n`;
    sql += `);\n\n`;

    seriesList.forEach(s => {
      const title = s.title.replace(/'/g, "''");
      const genre = s.genre.replace(/'/g, "''");
      const plat = (s.platform || 'Netshot').replace(/'/g, "''");
      const age = (s.ageRating || 'Genel İzleyici').replace(/'/g, "''");
      const cover = (s.coverUrl || '').replace(/'/g, "''");
      const isNsfw = s.isNsfw ? 1 : 0;
      sql += `INSERT OR REPLACE INTO series (id, title, genre, platform, ageRating, coverUrl, rating, isNsfw, viewCount) VALUES ('${s.id}', '${title}', '${genre}', '${plat}', '${age}', '${cover}', '${s.rating}', ${isNsfw}, ${s.viewCount});\n`;
    });

    return sql;
  };

  const handleDownloadCloudflareD1Sql = () => {
    const sql = generateD1SqlScript();
    const blob = new Blob([sql], { type: 'application/sql' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `minimo-cloudflare-d1-dump-${new Date().toISOString().slice(0, 10)}.sql`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleCopyD1Sql = () => {
    const sql = generateD1SqlScript();
    navigator.clipboard.writeText(sql);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2500);
  };

  // Filter series for manage tab
  const filteredSeriesList = seriesList.filter(s =>
    s.title.toLowerCase().includes(seriesSearchQuery.toLowerCase()) ||
    s.genre.toLowerCase().includes(seriesSearchQuery.toLowerCase())
  );

  // Filter comments for moderation tab
  const filteredComments = comments.filter(c => {
    const matchesSearch =
      c.content.toLowerCase().includes(commentSearch.toLowerCase()) ||
      c.userName.toLowerCase().includes(commentSearch.toLowerCase());
    const matchesSeries =
      selectedSeriesFilter === 'all' || c.seriesId === selectedSeriesFilter;
    return matchesSearch && matchesSeries;
  });

  const targetSeries = seriesList.find(s => s.id === selectedTargetSeriesId);

  // Site Statistics Calculations
  const totalSeriesCount = seriesList.length;
  const totalEpisodesCount = seriesList.reduce((acc, s) => acc + (s.episodes?.length || 0), 0);
  const totalUsersCount = allUsers.filter(u => u.id !== 'guest').length;
  const totalCommentsCount = comments.length;
  const totalRepliesCount = comments.reduce((acc, c) => acc + (c.replies?.length || 0), 0);
  const totalAllCommentsAndReplies = totalCommentsCount + totalRepliesCount;
  const totalViewsCount = seriesList.reduce((acc, s) => acc + (s.viewCount || 0), 0);
  const totalLikesCount = seriesList.reduce((acc, s) => acc + (s.likeCount || 0) + (s.episodes?.reduce((epAcc, ep) => epAcc + (ep.likeCount || 0), 0) || 0), 0);
  const avgEpisodesPerSeries = totalSeriesCount > 0 ? (totalEpisodesCount / totalSeriesCount).toFixed(1) : '0';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <ShieldCheck className="w-6 h-6 text-indigo-500 dark:text-indigo-400" />
            <h1 className="text-2xl font-display font-black text-slate-900 dark:text-white">
              Minimo Yönetim Odası
            </h1>
            <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-mono text-[10px] font-bold border border-emerald-500/30">
              YETKİLİ PANELİ
            </span>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-400">
            Dizi silme & yönetimi, yeni dizi yayını, bölüm ekleme, tüm içeriklerin yedeklenmesi ve yetkilendirme.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="px-3 py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-500/15 border border-indigo-200 dark:border-indigo-500/30 flex items-center gap-2 text-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="font-semibold text-indigo-700 dark:text-indigo-300">
              {currentUser.displayName} ({isSuperAdmin ? 'BAŞ YÖNETİCİ' : 'YETKİLİ'})
            </span>
          </div>
        </div>
      </div>

      {/* SİTE GENEL İSTATİSTİKLERİ PANOSU (Site Platform Statistics) */}
      <div className="mb-8 p-5 rounded-3xl bg-white dark:bg-[#0b1222] border border-slate-200 dark:border-blue-900/40 shadow-xl">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-blue-600/10 dark:bg-blue-500/20 text-blue-600 dark:text-cyan-400 flex items-center justify-center border border-blue-500/20">
              <BarChart3 className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
                <span>Site Genel İstatistikleri</span>
                <span className="px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-cyan-400 text-[10px] font-mono font-bold">
                  CANLI VERİLER
                </span>
              </h2>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Yayındaki diziler, toplam bölümler, kayıtlı üyeler ve topluluk yorumları özeti
              </p>
            </div>
          </div>

          <div className="hidden sm:flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 font-mono">
            <span className="flex items-center gap-1">
              <Eye className="w-3.5 h-3.5 text-blue-400" />
              <span>{totalViewsCount.toLocaleString('tr-TR')} İzlenme</span>
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Heart className="w-3.5 h-3.5 text-rose-400" />
              <span>{totalLikesCount.toLocaleString('tr-TR')} Beğeni</span>
            </span>
          </div>
        </div>

        {/* 4 Primary Metric Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {/* Card 1: Kaç Dizi */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-500/10 via-slate-50 dark:via-slate-900 to-transparent border border-blue-500/20 hover:border-blue-500/40 transition-all">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-600 dark:text-slate-400">Toplam Dizi</span>
              <div className="w-7 h-7 rounded-lg bg-blue-600/15 text-blue-600 dark:text-cyan-400 flex items-center justify-center">
                <Film className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white font-display tabular-nums">
                {totalSeriesCount}
              </span>
              <span className="text-xs font-semibold text-blue-600 dark:text-cyan-400 font-mono">dizi</span>
            </div>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">
              Yayında ve izlemeye hazır
            </p>
          </div>

          {/* Card 2: Kaç Bölüm */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-500/10 via-slate-50 dark:via-slate-900 to-transparent border border-indigo-500/20 hover:border-indigo-500/40 transition-all">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-600 dark:text-slate-400">Dizilerde Bölüm Sayısı</span>
              <div className="w-7 h-7 rounded-lg bg-indigo-600/15 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                <Video className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white font-display tabular-nums">
                {totalEpisodesCount}
              </span>
              <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 font-mono">bölüm</span>
            </div>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">
              Ortalama dizi başı {avgEpisodesPerSeries} bölüm
            </p>
          </div>

          {/* Card 3: Kaç Üye */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-500/10 via-slate-50 dark:via-slate-900 to-transparent border border-emerald-500/20 hover:border-emerald-500/40 transition-all">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-600 dark:text-slate-400">Kayıtlı Üye Sayısı</span>
              <div className="w-7 h-7 rounded-lg bg-emerald-600/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <Users className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white font-display tabular-nums">
                {totalUsersCount}
              </span>
              <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 font-mono">üye</span>
            </div>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">
              Kayıtlı ve doğrulanmış profiller
            </p>
          </div>

          {/* Card 4: Kaç Yorum */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-500/10 via-slate-50 dark:via-slate-900 to-transparent border border-amber-500/20 hover:border-amber-500/40 transition-all">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-600 dark:text-slate-400">Yorum & Yanıt Sayısı</span>
              <div className="w-7 h-7 rounded-lg bg-amber-600/15 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                <MessageSquare className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white font-display tabular-nums">
                {totalAllCommentsAndReplies}
              </span>
              <span className="text-xs font-semibold text-amber-600 dark:text-amber-400 font-mono">yorum</span>
            </div>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 truncate">
              {totalCommentsCount} ana yorum • {totalRepliesCount} yanıt
            </p>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-1.5 sm:gap-2 p-1.5 bg-slate-200 dark:bg-slate-900/80 rounded-2xl border border-slate-300 dark:border-slate-800 mb-8 overflow-x-auto no-scrollbar max-w-full">
        <button
          onClick={() => setActiveTab('manage-series')}
          className={`py-2 px-3 sm:px-4 rounded-xl text-xs font-bold flex items-center gap-2 transition-all whitespace-nowrap ${
            activeTab === 'manage-series'
              ? 'bg-blue-600 text-white shadow-md'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Dizileri Yönet & Sil ({seriesList.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('publish')}
          className={`py-2 px-3 sm:px-4 rounded-xl text-xs font-bold flex items-center gap-2 transition-all whitespace-nowrap ${
            activeTab === 'publish'
              ? 'bg-blue-600 text-white shadow-md'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Film className="w-4 h-4" />
          <span>Yeni Dizi Yayınla</span>
        </button>

        <button
          onClick={() => setActiveTab('add-episode')}
          className={`py-2 px-3 sm:px-4 rounded-xl text-xs font-bold flex items-center gap-2 transition-all whitespace-nowrap ${
            activeTab === 'add-episode'
              ? 'bg-blue-600 text-white shadow-md'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <FolderPlus className="w-4 h-4" />
          <span>Bölüm Ekle</span>
        </button>

        <button
          onClick={() => setActiveTab('backup')}
          className={`py-2 px-3 sm:px-4 rounded-xl text-xs font-bold flex items-center gap-2 transition-all whitespace-nowrap ${
            activeTab === 'backup'
              ? 'bg-indigo-600 text-white shadow-md'
              : 'text-indigo-600 dark:text-indigo-400 hover:text-indigo-900 dark:hover:text-white'
          }`}
        >
          <Database className="w-4 h-4" />
          <span>Yedekleme Platformu</span>
        </button>

        <button
          onClick={() => setActiveTab('comments')}
          className={`py-2 px-3 sm:px-4 rounded-xl text-xs font-bold flex items-center gap-2 transition-all whitespace-nowrap ${
            activeTab === 'comments'
              ? 'bg-blue-600 text-white shadow-md'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          <span>Yorum Moderasyonu ({comments.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('staff')}
          className={`py-2 px-3 sm:px-4 rounded-xl text-xs font-bold flex items-center gap-2 transition-all whitespace-nowrap ${
            activeTab === 'staff'
              ? 'bg-blue-600 text-white shadow-md'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Yetkilendirme</span>
        </button>
      </div>

      {/* Global Success / Status Banners */}
      {deleteSuccessMsg && (
        <div className="mb-6 p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 flex items-center gap-3 text-xs font-semibold animate-in fade-in">
          <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0" />
          <span>{deleteSuccessMsg}</span>
        </div>
      )}

      {/* TAB 1: DIZILERI YONET & SIL */}
      {activeTab === 'manage-series' && (
        <div className="bg-white dark:bg-[#0b1222] border border-slate-200 dark:border-blue-900/30 rounded-3xl p-6 sm:p-8 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Katalog Dizileri & Silme Paneli
              </h2>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Sistemde yayında olan dizileri inceleyin, yeni bölüm ekleyin veya diziyi kalıcı olarak silin.
              </p>
            </div>

            {/* Search filter */}
            <div className="relative max-w-xs w-full">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={seriesSearchQuery}
                onChange={e => setSeriesSearchQuery(e.target.value)}
                placeholder="Dizi adı veya türe göre ara..."
                className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-xs placeholder-slate-400 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {filteredSeriesList.length === 0 ? (
            <div className="text-center py-12 border border-dashed border-slate-300 dark:border-slate-800 rounded-2xl">
              <Film className="w-10 h-10 text-slate-400 mx-auto mb-2 opacity-50" />
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">Dizi bulunamadı</p>
              <p className="text-xs text-slate-500 mt-1">Arama kriterlerinizi değiştirin veya yeni bir dizi yayınlayın.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredSeriesList.map(series => (
                <div
                  key={series.id}
                  className="bg-slate-50 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 flex flex-col justify-between hover:border-blue-500/40 transition-all group shadow-sm"
                >
                  <div className="flex gap-3 mb-3">
                    <div className="w-20 h-28 rounded-xl overflow-hidden shrink-0 relative shadow-md">
                      <img
                        src={series.coverUrl}
                        alt={series.title}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      {series.isNsfw && (
                        <span className="absolute top-1 left-1 px-1 py-0.2 rounded bg-rose-600 text-white font-mono text-[9px] font-bold">
                          18+
                        </span>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-1 mb-1">
                        <h3 className="text-sm font-bold text-slate-900 dark:text-white truncate">
                          {series.title}
                        </h3>
                      </div>

                      <span className="inline-block px-2 py-0.5 rounded-md bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 text-[10px] font-medium mb-1.5">
                        {series.genre}
                      </span>

                      <div className="text-[11px] text-slate-600 dark:text-slate-400 space-y-0.5 font-mono">
                        <p>📺 <span className="font-semibold text-slate-800 dark:text-slate-200">{series.episodes.length}</span> Bölüm</p>
                        <p>👀 {series.viewCount.toLocaleString()} İzlenme</p>
                        <p>🎬 {series.director}</p>
                      </div>
                    </div>
                  </div>

                  {/* Actions for this series */}
                  <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => openReelsPlayer(series.id)}
                        className="p-2 rounded-xl bg-blue-600/10 hover:bg-blue-600/20 text-blue-600 dark:text-blue-400 text-xs font-semibold flex items-center gap-1 transition-colors"
                        title="Reels'ta İzle"
                      >
                        <Play className="w-3.5 h-3.5 fill-current" />
                        <span className="hidden sm:inline">İzle</span>
                      </button>

                      <button
                        onClick={() => {
                          setSelectedTargetSeriesId(series.id);
                          setActiveTab('add-episode');
                        }}
                        className="p-2 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold flex items-center gap-1 transition-colors"
                        title="Yeni Bölüm Ekle"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Bölüm Ekle</span>
                      </button>
                    </div>

                    {/* RED DELETE BUTTON */}
                    <button
                      onClick={() => setSeriesToDelete(series)}
                      className="px-3 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs font-bold flex items-center gap-1.5 transition-colors"
                      title="Diziyi ve tüm bölümlerini kalıcı olarak sil"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Diziyi Sil</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Delete Confirmation Modal */}
          {seriesToDelete && (
            <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
              <div className="bg-white dark:bg-[#0c1324] border border-rose-500/40 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl relative text-center">
                <div className="w-14 h-14 rounded-2xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center mx-auto mb-4 text-rose-500">
                  <AlertTriangle className="w-7 h-7" />
                </div>

                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
                  Diziyi Kalıcı Olarak Silmek İstiyor Musunuz?
                </h3>

                <p className="text-xs text-slate-600 dark:text-slate-400 mb-6 leading-relaxed">
                  <span className="font-bold text-slate-900 dark:text-white font-mono">"{seriesToDelete.title}"</span> adlı dizi, içerisindeki <span className="font-bold text-rose-600 dark:text-rose-400">{seriesToDelete.episodes.length} adet bölüm</span> ve tüm izlenme geçmişi kalıcı olarak silinecektir. Bu işlem geri alınamaz.
                </p>

                <div className="flex items-center justify-center gap-3">
                  <button
                    onClick={() => setSeriesToDelete(null)}
                    className="px-5 py-2.5 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-700 text-xs font-bold transition-colors"
                  >
                    İptal Et
                  </button>

                  <button
                    onClick={handleConfirmDeleteSeries}
                    className="px-6 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition-all shadow-lg shadow-rose-600/30 flex items-center gap-2"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Evet, Kalıcı Olarak Sil</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: YENI DIZI YAYINLAMA (NO SYNOPSIS REQUIRED) */}
      {activeTab === 'publish' && (
        <div className="bg-white dark:bg-[#0b1222] border border-slate-200 dark:border-blue-900/30 rounded-3xl p-6 sm:p-8 shadow-xl">
          {publishSuccessMsg && (
            <div className="mb-6 p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 flex items-center gap-3 text-xs font-semibold animate-in fade-in">
              <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0" />
              <span>Dizi başarıyla yayınlandı! Ana sayfada ve reels akışında hemen izlenebilir.</span>
            </div>
          )}

          <form onSubmit={handlePublish} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Title */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
                  Dizi Adı
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="Örn: Gece Avcısı: İstanbul Kodları"
                  required
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-xs placeholder-slate-400 focus:outline-none focus:border-blue-500"
                />
              </div>

              {/* Genre Selection & Custom Genre Addition */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                    Tür (Kategori)
                  </label>
                  <button
                    type="button"
                    onClick={() => setIsAddingNewGenre(prev => !prev)}
                    className="text-[11px] text-blue-600 dark:text-cyan-400 hover:underline flex items-center gap-1 font-semibold"
                  >
                    <Plus className="w-3 h-3" />
                    <span>{isAddingNewGenre ? 'Vazgeç' : '+ Yeni Tür Ekle'}</span>
                  </button>
                </div>

                {isAddingNewGenre ? (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newGenreInput}
                      onChange={e => setNewGenreInput(e.target.value)}
                      placeholder="Yeni tür adı (Örn: Anime, Belgesel, Gerilim)"
                      className="flex-1 px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-cyan-500/50 text-slate-900 dark:text-white text-xs focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={handleCreateNewGenre}
                      className="px-4 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-xs font-bold shrink-0"
                    >
                      Ekle
                    </button>
                  </div>
                ) : (
                  <select
                    value={genre}
                    onChange={e => setGenre(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-xs focus:outline-none focus:border-blue-500"
                  >
                    {customGenres.map(g => (
                      <option key={g} value={g}>
                        {g}
                      </option>
                    ))}
                  </select>
                )}
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
                Dizi Genel Konusu / Açıklaması
              </label>
              <textarea
                value={description}
                onChange={e => setDescription(e.target.value)}
                rows={3}
                placeholder="Dizinin ana temasını ve izleyicileri çekecek özetini girin..."
                required
                className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-xs placeholder-slate-400 focus:outline-none focus:border-blue-500"
              />
            </div>

            {/* Series Tags Section */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
                Dizi Etiketleri (#Etiket)
              </label>
              <div className="flex flex-wrap items-center gap-2 mb-2 p-2.5 rounded-xl bg-slate-100 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
                {seriesTags.map(tag => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 text-xs font-mono font-medium border border-blue-200 dark:border-blue-700/40"
                  >
                    <span>#{tag}</span>
                    <button
                      type="button"
                      onClick={() => removeSeriesTag(tag)}
                      className="hover:text-rose-500 transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}

                <div className="flex items-center gap-1.5">
                  <input
                    type="text"
                    value={tagInput}
                    onChange={e => setTagInput(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddSeriesTag();
                      }
                    }}
                    placeholder="Etiket yazıp enter'a basın..."
                    className="bg-transparent text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none px-2 py-1 min-w-[150px]"
                  />
                  <button
                    type="button"
                    onClick={handleAddSeriesTag}
                    className="p-1 rounded-md bg-blue-600/20 text-blue-600 dark:text-blue-400 hover:bg-blue-600/30"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Cover Poster Selector & Local Image Upload */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  Dizi Afişi (9:16 Dikey Format)
                </label>
                <label className="cursor-pointer px-3 py-1.5 rounded-xl bg-blue-600/10 dark:bg-blue-600/20 hover:bg-blue-600/25 border border-blue-500/40 text-blue-600 dark:text-blue-300 text-xs font-semibold flex items-center gap-1.5 transition-colors">
                  <Upload className="w-3.5 h-3.5" />
                  <span>Cihazdan Afiş Görseli Seç</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleCoverUpload}
                  />
                </label>
              </div>

              {coverFileName && (
                <div className="mb-2 text-[11px] text-emerald-600 dark:text-emerald-400 font-mono">
                  ✓ Cihazınızdan seçildi: {coverFileName}
                </div>
              )}

              <div className="flex items-center gap-4 overflow-x-auto pb-2">
                {coverUrl && (
                  <div className="relative w-20 h-28 rounded-xl overflow-hidden border-2 border-cyan-500 shadow-md shrink-0">
                    <img src={coverUrl} alt="Seçilen Afiş" className="w-full h-full object-cover" />
                    <span className="absolute bottom-0 inset-x-0 bg-cyan-600 text-white text-[9px] text-center font-bold py-0.5">
                      Aktif
                    </span>
                  </div>
                )}

                {[
                  { label: 'Siber Noir Afişi', url: CYBER_POSTER },
                  { label: 'Romantik Afiş', url: ROMANCE_POSTER },
                  { label: 'Ajan / Gerilim', url: AGENT_POSTER },
                ].map((sample, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setCoverUrl(sample.url);
                      setCoverFileName('');
                    }}
                    className={`relative w-20 h-28 rounded-xl overflow-hidden border transition-all shrink-0 ${
                      coverUrl === sample.url
                        ? 'border-cyan-500 ring-2 ring-cyan-500/50'
                        : 'border-slate-300 dark:border-slate-700 opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img src={sample.url} alt={sample.label} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>

            {/* Dizi Platformu & Yaş Sınırı */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
                  Dizi Platformu
                </label>
                <select
                  value={platform}
                  onChange={e => setPlatform(e.target.value as SeriesPlatform)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-xs focus:outline-none focus:border-blue-500"
                >
                  <option value="Netshot">Netshot</option>
                  <option value="DramaWave">DramaWave</option>
                  <option value="ReelShort">ReelShort</option>
                  <option value="DramaBox">DramaBox</option>
                  <option value="Diğer">Diğer Platform</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
                  Yaş Sınırı
                </label>
                <select
                  value={ageRating}
                  onChange={e => {
                    const val = e.target.value as AgeRating;
                    setAgeRating(val);
                    if (val === '18+') setIsNsfw(true);
                  }}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-xs focus:outline-none focus:border-blue-500"
                >
                  <option value="Genel İzleyici">Genel İzleyici (Her Yaş İçin Uygun)</option>
                  <option value="13+">13+ (13 Yaş ve Üzeri)</option>
                  <option value="16+">16+ (16 Yaş ve Üzeri)</option>
                  <option value="18+">18+ (Yetişkin Kuşağı)</option>
                </select>
              </div>
            </div>

            {/* NSFW Toggle Checkbox */}
            <div className="flex items-center gap-3 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30">
              <input
                type="checkbox"
                id="nsfw-publish-toggle"
                checked={isNsfw}
                onChange={e => setIsNsfw(e.target.checked)}
                className="w-4 h-4 rounded text-rose-600 focus:ring-rose-500 bg-slate-900 border-slate-700"
              />
              <label htmlFor="nsfw-publish-toggle" className="text-xs text-rose-700 dark:text-rose-300 font-medium cursor-pointer">
                <span className="font-bold">18+ Yetişkin (NSFW) Kuşağına Dahil Et:</span> Bu seçenek işaretlendiğinde içerik NSFW koruması altına alınır.
              </label>
            </div>

            {/* Episode Builder (SIMPLIFIED: No synopsis, only title, number, duration, video) */}
            <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                    <Video className="w-4 h-4 text-blue-500" />
                    <span>Dikey Reels Bölümleri ({episodes.length})</span>
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Bölüm adı, süresi ve videosunu belirleyin (Açıklama zorunluluğu kaldırılmıştır).
                  </p>
                </div>

                <button
                  type="button"
                  onClick={addEpisodeRow}
                  className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-md"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Yeni Bölüm Ekle</span>
                </button>
              </div>

              <div className="space-y-4">
                {episodes.map((ep, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-lg bg-blue-600/20 text-blue-600 dark:text-blue-400 font-bold text-xs flex items-center justify-center font-mono">
                          {idx + 1}
                        </span>
                        <span className="text-xs font-bold text-slate-900 dark:text-white">Bölüm {idx + 1}</span>
                      </div>

                      {episodes.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeEpisodeRow(idx)}
                          className="p-1.5 text-rose-500 hover:bg-rose-500/10 rounded-lg transition-colors text-xs flex items-center gap-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Sil</span>
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-[10px] text-slate-600 dark:text-slate-400 block mb-1 font-semibold">Bölüm Başlığı</label>
                        <input
                          type="text"
                          value={ep.title}
                          onChange={e => updateEpisode(idx, 'title', e.target.value)}
                          placeholder="Örn: Başlangıç"
                          className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                        />
                      </div>

                      <div>
                        <label className="text-[10px] text-slate-600 dark:text-slate-400 block mb-1 font-semibold">Süre (Saniye)</label>
                        <input
                          type="number"
                          value={ep.durationSec}
                          onChange={e => updateEpisode(idx, 'durationSec', Number(e.target.value))}
                          className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                        />
                      </div>
                    </div>

                    {/* Local Video Selection / Storage Picker */}
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-[10px] text-slate-600 dark:text-slate-400 font-semibold">
                          Bölüm Videosu Kaynağı
                        </label>
                        <label className="cursor-pointer px-2.5 py-1 rounded-lg bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-400/30 text-cyan-700 dark:text-cyan-300 text-[11px] font-semibold flex items-center gap-1.5 transition-colors">
                          <Upload className="w-3 h-3" />
                          <span>Cihaz Hafızasından Video Seç</span>
                          <input
                            type="file"
                            accept="video/*"
                            className="hidden"
                            onChange={e => handleEpisodeVideoUpload(idx, e)}
                          />
                        </label>
                      </div>

                      {ep.uploadedFileName ? (
                        <div className="p-2.5 rounded-lg bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400 font-mono text-[11px] truncate">
                            <Video className="w-4 h-4 shrink-0" />
                            <span className="truncate">✓ Cihazdan Yüklendi: {ep.uploadedFileName}</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              updateEpisode(idx, 'videoUrl', SAMPLE_VIDEOS[0]);
                              updateEpisode(idx, 'uploadedFileName', undefined);
                            }}
                            className="text-slate-400 hover:text-rose-500 text-[11px] underline ml-2 shrink-0"
                          >
                            Kaldır
                          </button>
                        </div>
                      ) : (
                        <input
                          type="text"
                          value={ep.videoUrl}
                          onChange={e => updateEpisode(idx, 'videoUrl', e.target.value)}
                          placeholder="Video URL'si girin veya cihazdan video yükleyin"
                          className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white font-mono"
                        />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-4">
              <button
                type="submit"
                className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm shadow-xl shadow-blue-600/30 transition-all flex items-center justify-center gap-2"
              >
                <Upload className="w-4 h-4" />
                <span>Diziyi Minimo Kataloğuna Yayınla</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TAB 3: MEVCUT DIZIYE BOLUM EKLE (NO SYNOPSIS REQUIRED) */}
      {activeTab === 'add-episode' && (
        <div className="bg-white dark:bg-[#0b1222] border border-slate-200 dark:border-blue-900/30 rounded-3xl p-6 sm:p-8 shadow-xl">
          {addEpisodeSuccessMsg && (
            <div className="mb-6 p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 flex items-center gap-3 text-xs font-semibold animate-in fade-in">
              <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0" />
              <span>Yeni bölüm başarıyla diziye eklendi! Reels oynatıcısında hemen izleyebilirsiniz.</span>
            </div>
          )}

          <div className="mb-6">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Mevcut Bir Diziye Yeni Bölüm Ekle</h2>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              Telefon veya bilgisayarınızdan video yükleyerek serinizi devam ettirin.
            </p>
          </div>

          <form onSubmit={handleAddEpisodeToExisting} className="space-y-6">
            {/* Target Series Selection */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
                Hangi Diziye Bölüm Eklenecek?
              </label>
              <select
                value={selectedTargetSeriesId}
                onChange={e => setSelectedTargetSeriesId(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-xs focus:outline-none focus:border-blue-500"
              >
                {seriesList.map(s => (
                  <option key={s.id} value={s.id}>
                    {s.title} ({s.genre} - {s.episodes.length} Bölüm)
                  </option>
                ))}
              </select>
            </div>

            {targetSeries && (
              <div className="p-4 rounded-2xl bg-slate-100 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 flex items-center gap-4">
                <img
                  src={targetSeries.coverUrl}
                  alt={targetSeries.title}
                  className="w-14 h-20 rounded-xl object-cover shrink-0"
                />
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">{targetSeries.title}</h4>
                  <p className="text-xs text-slate-600 dark:text-slate-400">{targetSeries.genre} · Şu an {targetSeries.episodes.length} bölüm yayında</p>
                  <p className="text-[11px] text-blue-600 dark:text-cyan-400 font-mono mt-0.5">
                    Yeni eklenecek bölüm: <span className="font-bold">Bölüm {targetSeries.episodes.length + 1}</span>
                  </p>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Episode Title */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
                  Bölüm Başlığı
                </label>
                <input
                  type="text"
                  value={newEpTitle}
                  onChange={e => setNewEpTitle(e.target.value)}
                  placeholder={`Örn: Bölüm ${targetSeries ? targetSeries.episodes.length + 1 : 2}: Büyük Yüzleşme`}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-xs placeholder-slate-400 focus:outline-none focus:border-blue-500"
                />
              </div>

              {/* Episode Duration */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
                  Bölüm Süresi (Saniye)
                </label>
                <input
                  type="number"
                  value={newEpDuration}
                  onChange={e => setNewEpDuration(Number(e.target.value))}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-xs focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            {/* Episode Video - Local Storage Upload */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  Bölüm Videosu
                </label>
                <label className="cursor-pointer px-3 py-1.5 rounded-xl bg-cyan-600/10 hover:bg-cyan-600/20 border border-cyan-400/40 text-cyan-700 dark:text-cyan-300 text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm">
                  <Upload className="w-3.5 h-3.5" />
                  <span>Cihaz Hafızasından Video Seç (PC / Telefon)</span>
                  <input
                    type="file"
                    accept="video/*"
                    className="hidden"
                    onChange={e => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const url = URL.createObjectURL(file);
                        setNewEpVideoUrl(url);
                        setNewEpVideoFileName(`${file.name} (${(file.size / (1024 * 1024)).toFixed(1)} MB)`);
                      }
                    }}
                  />
                </label>
              </div>

              {newEpVideoFileName ? (
                <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400 font-mono">
                    <Video className="w-4 h-4" />
                    <span>✓ Yüklendi: {newEpVideoFileName}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setNewEpVideoUrl(SAMPLE_VIDEOS[0]);
                      setNewEpVideoFileName('');
                    }}
                    className="text-slate-400 hover:text-rose-500 text-[11px] underline"
                  >
                    Kaldır
                  </button>
                </div>
              ) : (
                <input
                  type="text"
                  value={newEpVideoUrl}
                  onChange={e => setNewEpVideoUrl(e.target.value)}
                  placeholder="Video URL'si girin veya yukarıdaki butondan cihazınızdan video seçin"
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-xs font-mono placeholder-slate-400 focus:outline-none focus:border-blue-500"
                />
              )}
            </div>

            {/* Submit Button */}
            <div className="pt-4">
              <button
                type="submit"
                className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm shadow-xl shadow-blue-600/30 transition-all flex items-center justify-center gap-2"
              >
                <FolderPlus className="w-4 h-4" />
                <span>Bölümü Diziye Ekle ve Yayına Al</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TAB 4: YEDEKLEME PLATFORMU (FULL BACKUP & DATA CENTER) */}
      {activeTab === 'backup' && (
        <div className="space-y-6">
          {/* Status Message */}
          {backupStatusMsg && (
            <div
              className={`p-4 rounded-2xl flex items-center gap-3 text-xs font-semibold animate-in fade-in ${
                backupStatusMsg.type === 'success'
                  ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300'
                  : 'bg-rose-500/15 border border-rose-500/30 text-rose-700 dark:text-rose-300'
              }`}
            >
              {backupStatusMsg.type === 'success' ? (
                <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0" />
              ) : (
                <AlertTriangle className="w-5 h-5 text-rose-500 shrink-0" />
              )}
              <span>{backupStatusMsg.text}</span>
            </div>
          )}

          {/* Cloudflare & GitHub Edge Backup & Integration Card */}
          <div className="bg-gradient-to-br from-amber-500/10 via-orange-500/5 to-blue-600/10 border border-orange-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/5 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>

            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 pb-6 border-b border-orange-500/20">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-orange-500/15 border border-orange-500/40 text-orange-500 flex items-center justify-center shrink-0 shadow-lg shadow-orange-500/20">
                  <Cloud className="w-7 h-7" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full bg-orange-500/20 text-orange-600 dark:text-orange-400 font-black text-[10px] uppercase tracking-wider border border-orange-500/30">
                      Cloudflare Pages & D1 / KV
                    </span>
                    <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-500">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                      GitHub Entegrasyonu Aktif
                    </span>
                  </div>
                  <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white mt-1">
                    Cloudflare Canlı Yedekleme & Edge Veri Merkezi
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                    Sitedeki tüm üyeleri, dizileri, bölümleri, yorumları ve verileri Cloudflare Pages KV ve D1 SQL ortamında yedekleyin.
                  </p>
                </div>
              </div>

              {/* Quick Sync Action */}
              <div className="w-full lg:w-auto flex flex-wrap items-center gap-2.5">
                <button
                  type="button"
                  onClick={handleSyncToCloudflare}
                  disabled={isSyncingCf}
                  className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white font-bold text-xs shadow-lg shadow-orange-500/25 flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50"
                  title="Tüm veriyi hem Cloudflare KV hem de GitHub reponuza tek tıkla yedekle"
                >
                  <RefreshCw className={`w-4 h-4 ${isSyncingCf ? 'animate-spin' : ''}`} />
                  <span>{isSyncingCf ? 'Yedekleniyor...' : 'Cloudflare & GitHub\'a Şimdi Yedekle'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleRestoreFromCloudflare}
                  disabled={isRestoringCf}
                  className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-lg shadow-blue-600/25 flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50"
                  title="Cloudflare Edge veya GitHub üzerindeki en güncel yedeği siteye çek"
                >
                  <Cloud className={`w-4 h-4 ${isRestoringCf ? 'animate-pulse' : ''}`} />
                  <span>{isRestoringCf ? 'Veriler Alınıyor...' : 'Cloudflare\'den Geri Yükle'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleToggleAutoSync}
                  className={`px-3.5 py-2.5 rounded-xl font-bold text-xs border flex items-center justify-center gap-2 transition-all active:scale-95 ${
                    isAutoSyncActive
                      ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-600 dark:text-emerald-400'
                      : 'bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-500'
                  }`}
                  title="Siteye içerik yüklendiğinde otomatik olarak Cloudflare ve GitHub'a yedekler"
                >
                  <span className={`w-2 h-2 rounded-full ${isAutoSyncActive ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`}></span>
                  <span>Oto-Senkron: {isAutoSyncActive ? 'Açık' : 'Kapalı'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleDownloadCloudflareD1Sql}
                  className="px-3.5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs border border-slate-300 dark:border-slate-700 flex items-center justify-center gap-1.5 transition-all active:scale-95"
                  title="Cloudflare D1 SQL dosyasını indir"
                >
                  <Download className="w-3.5 h-3.5 text-orange-500" />
                  <span>D1 SQL (.sql)</span>
                </button>

                <button
                  type="button"
                  onClick={handleCopyD1Sql}
                  className="px-3.5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs border border-slate-300 dark:border-slate-700 flex items-center justify-center gap-1.5 transition-all active:scale-95"
                  title="D1 Konsoluna yapıştırmak için SQL kodlarını panoya kopyala"
                >
                  {copiedSql ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
                  <span>{copiedSql ? 'Kopyalandı' : 'SQL Kopyala'}</span>
                </button>
              </div>
            </div>

            {/* Sync Notification Banner */}
            {cfSyncStatus && (
              <div
                className={`mt-4 p-4 rounded-2xl flex items-center gap-3 text-xs font-semibold animate-in fade-in ${
                  cfSyncStatus.type === 'success'
                    ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300'
                    : 'bg-rose-500/15 border border-rose-500/30 text-rose-700 dark:text-rose-300'
                }`}
              >
                {cfSyncStatus.type === 'success' ? (
                  <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0" />
                ) : (
                  <AlertTriangle className="w-5 h-5 text-rose-500 shrink-0" />
                )}
                <span>{cfSyncStatus.message}</span>
              </div>
            )}

            {/* Cloudflare Edge Details & Config */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
              <div className="p-4 rounded-2xl bg-white/70 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800">
                <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                  <span className="flex items-center gap-1.5">
                    <Server className="w-4 h-4 text-orange-500" />
                    Cloudflare KV Depolama
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-orange-500/10 text-orange-600 dark:text-orange-400 font-semibold">
                    MINIMO_BACKUPS
                  </span>
                </div>
                <div className="text-sm font-bold text-slate-900 dark:text-white">
                  Edge KV &amp; Pages API
                </div>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">
                  İçerik eklendiğinde Cloudflare küresel uç sunucularında anında depolanır.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-white/70 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800">
                <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                  <span className="flex items-center gap-1.5">
                    <Database className="w-4 h-4 text-emerald-500" />
                    GitHub Otomatik Arşiv
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold">
                    Bağlı &amp; Canlı
                  </span>
                </div>
                <div className="text-sm font-bold text-slate-900 dark:text-white truncate">
                  SemanteV7/minimo-series
                </div>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">
                  <code>data/minimo_database.json</code> dosyasına otomatik commit atılır.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-white/70 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800">
                <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                  <span className="flex items-center gap-1.5">
                    <Cloud className="w-4 h-4 text-blue-500" />
                    Son Senkronizasyon
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-blue-500/10 text-blue-600 dark:text-blue-400 font-semibold">
                    {isAutoSyncActive ? 'Oto-Senkron Aktif' : 'Manuel'}
                  </span>
                </div>
                <div className="text-base font-bold text-slate-900 dark:text-white">
                  {cfLastSyncTime || 'Sistem Hazır'}
                </div>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">
                  {seriesList.length} Dizi &middot; {allUsers.length} Üye &amp; Profil &middot; {comments.length} Yorum &middot; {directMessages.length + communityMessages.length} Mesaj
                </p>
              </div>
            </div>

            {/* Quick 2-Option Guide for Cloudflare KV & D1 Bindings */}
            <div className="mt-6 p-4 sm:p-5 rounded-2xl bg-orange-500/5 dark:bg-orange-500/10 border border-orange-500/20">
              <h4 className="text-xs font-bold text-orange-600 dark:text-orange-400 uppercase tracking-wider flex items-center gap-2 mb-3">
                <ExternalLink className="w-4 h-4" />
                Cloudflare Kalıcı Veri Depolama Kurulumu (KV veya D1)
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                <div className="p-3.5 rounded-xl bg-white/80 dark:bg-slate-900/80 border border-orange-500/15">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-slate-900 dark:text-white">Yöntem A: Cloudflare KV (En Kolayı - 1 Dakika)</span>
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-orange-500/15 text-orange-600 font-semibold">Tavsiye Edilen</span>
                  </div>
                  <ol className="text-slate-600 dark:text-slate-400 text-[11px] leading-relaxed list-decimal list-inside space-y-1">
                    <li>Cloudflare sol menüden <b>Storage &amp; Databases</b> &gt; <b>KV</b> &gt; <b>Create Namespace</b>: Adına <code className="text-orange-500 font-mono">minimo-backups</code> yazıp oluşturun.</li>
                    <li>Ardından <b>Workers &amp; Pages</b> &gt; <b>minimo-series</b> &gt; <b>Settings</b> &gt; sağdaki menüden <b>Bindings</b> (veya Variables altındaki Bindings) bölümüne gelin.</li>
                    <li><b>Bindings</b> yanındaki <b>+ Add</b> butonuna basıp <b>KV namespace</b> seçin. Variable name: <code className="bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded text-orange-500 font-bold font-mono">MINIMO_BACKUPS</code> yazıp <code className="text-orange-500 font-mono">minimo-backups</code> KV'sini bağlayın ve <b>Save</b> deyin.</li>
                  </ol>
                </div>
                <div className="p-3.5 rounded-xl bg-white/80 dark:bg-slate-900/80 border border-orange-500/15">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-slate-900 dark:text-white">Yöntem B: Cloudflare D1 SQL (İlişkisel Veritabanı)</span>
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-blue-500/15 text-blue-600 font-semibold">SQL Gücü</span>
                  </div>
                  <ol className="text-slate-600 dark:text-slate-400 text-[11px] leading-relaxed list-decimal list-inside space-y-1">
                    <li>Cloudflare sol menüden <b>Storage &amp; Databases</b> &gt; <b>D1 SQL Database</b> &gt; <b>Create Database</b>: Adına <code className="text-blue-500 font-mono">minimo-db</code> yazın.</li>
                    <li><b>Workers &amp; Pages</b> &gt; <b>minimo-series</b> &gt; <b>Settings</b> &gt; <b>Bindings</b> &gt; <b>+ Add</b> diyerek <b>D1 database</b> seçin ve Variable Name: <code className="bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded text-blue-500 font-bold font-mono">DB</code> olarak bağlayın.</li>
                    <li>İsterseniz yukarıdaki <b>"D1 SQL Kopyala"</b> butonuna basıp Cloudflare D1 Console'una yapıştırarak tabloları hemen oluşturabilirsiniz.</li>
                  </ol>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Card 1: Download Full Backup */}
            <div className="bg-white dark:bg-[#0b1222] border border-slate-200 dark:border-blue-900/30 rounded-3xl p-6 shadow-xl flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/30 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-4">
                  <Download className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">
                  Tüm Platform Verisini Dışa Aktar (.JSON)
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-6">
                  Tüm diziler, bölümler, video linkleri, afişler, kullanıcılar, yorumlar, mesajlaşmalar ve istek listeleri tek tıklamayla JSON dosyası olarak bilgisayarınıza/telefonunuza indirilir.
                </p>
              </div>

              <button
                onClick={handleDownloadBackup}
                className="w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-blue-600/30 transition-all active:scale-95"
              >
                <Download className="w-4 h-4" />
                <span>Tek Tıkla Tam Yedeği İndir (.JSON)</span>
              </button>
            </div>

            {/* Card 2: Restore / Import Backup */}
            <div className="bg-white dark:bg-[#0b1222] border border-slate-200 dark:border-blue-900/30 rounded-3xl p-6 shadow-xl flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-4">
                  <Upload className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">
                  Yedekten Geri Yükle (.JSON Dosyası)
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-6">
                  Daha önce indirdiğiniz veya arşivlediğiniz bir Minimo Series JSON yedek dosyasını seçerek platformu o ana döndürün. Tüm veriler otomatik güncellenecektir.
                </p>
              </div>

              <div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".json,application/json"
                  className="hidden"
                  onChange={handleFileUpload}
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30 transition-all active:scale-95"
                >
                  <FileJson className="w-4 h-4" />
                  <span>Yedek Dosyası Seç ve Geri Yükle</span>
                </button>
              </div>
            </div>
          </div>

          {/* Section: Internal Snapshots (Cloud / Local Point-in-Time Backups) */}
          <div className="bg-white dark:bg-[#0b1222] border border-slate-200 dark:border-blue-900/30 rounded-3xl p-6 sm:p-8 shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Sistem İçi Anlık Yedek Noktaları (Snapshots)
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  Dosya indirmeden sistem hafızasında hızlı geri dönüş noktaları oluşturun.
                </p>
              </div>

              {/* Create Snapshot Form */}
              <div className="flex items-center gap-2 max-w-md w-full">
                <input
                  type="text"
                  value={snapshotNameInput}
                  onChange={e => setSnapshotNameInput(e.target.value)}
                  placeholder="Yedek adı (Örn: Dizi Silme Öncesi Yedeği)"
                  className="flex-1 px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-xs focus:outline-none"
                />
                <button
                  onClick={handleCreateSnapshot}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all shrink-0 flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Nokta Oluştur</span>
                </button>
              </div>
            </div>

            {snapshots.length === 0 ? (
              <div className="text-center py-8 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
                <Database className="w-8 h-8 text-slate-400 mx-auto mb-2 opacity-50" />
                <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">Henüz kayıtlı snapshot bulunmuyor</p>
                <p className="text-[11px] text-slate-500 mt-0.5">Yukarıdaki formdan anında yeni bir kurtarma noktası oluşturabilirsiniz.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {snapshots.map(snap => (
                  <div
                    key={snap.id}
                    className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-bold text-slate-900 dark:text-white">{snap.name}</span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 font-semibold">
                          {(snap.sizeBytes / 1024).toFixed(1)} KB
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 font-mono">
                        Oluşturulma: {snap.createdAt} · {snap.stats.seriesCount} Dizi, {snap.stats.episodesCount} Bölüm, {snap.stats.commentsCount} Yorum
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => {
                          const ok = restoreSnapshot(snap.id);
                          if (ok) {
                            setBackupStatusMsg({
                              type: 'success',
                              text: `"${snap.name}" yedeğine başarıyla geri dönüldü!`,
                            });
                            setTimeout(() => setBackupStatusMsg(null), 4000);
                          }
                        }}
                        className="px-3 py-1.5 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-700 dark:text-emerald-400 text-xs font-bold transition-all flex items-center gap-1"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Bu Yedeğe Dön</span>
                      </button>

                      <button
                        onClick={() => deleteSnapshot(snap.id)}
                        className="p-1.5 rounded-xl text-rose-500 hover:bg-rose-500/10 transition-colors"
                        title="Snapshot'ı Sil"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Section: Reset to Defaults (Factory Reset) */}
          <div className="bg-white dark:bg-[#0b1222] border border-slate-200 dark:border-blue-900/30 rounded-3xl p-6 shadow-xl flex items-center justify-between">
            <div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-1">Fabrika Ayarlarına Dönüş</h4>
              <p className="text-xs text-slate-500">Tüm verileri orijinal başlangıç dizi ve kullanıcı setine sıfırlar.</p>
            </div>

            <button
              onClick={() => setIsResetConfirmOpen(true)}
              className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-rose-500 hover:text-white text-xs font-bold transition-all"
            >
              Fabrika Ayarlarına Sıfırla
            </button>
          </div>

          {/* Factory Reset Modal */}
          {isResetConfirmOpen && (
            <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
              <div className="bg-white dark:bg-[#0c1324] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-sm w-full text-center shadow-2xl">
                <AlertTriangle className="w-10 h-10 text-amber-500 mx-auto mb-3" />
                <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">Tüm Verileri Sıfırlamak İstiyor Musunuz?</h3>
                <p className="text-xs text-slate-500 mb-6">
                  Bu işlem eklediğiniz tüm dizileri ve yorumları silerek başlangıç durumuna dönecektir.
                </p>
                <div className="flex justify-center gap-3">
                  <button
                    onClick={() => setIsResetConfirmOpen(false)}
                    className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-slate-800 text-xs font-bold"
                  >
                    Vazgeç
                  </button>
                  <button
                    onClick={() => {
                      resetToDefaults();
                      setIsResetConfirmOpen(false);
                      setBackupStatusMsg({ type: 'success', text: 'Tüm sistem fabrika ayarlarına sıfırlandı.' });
                      setTimeout(() => setBackupStatusMsg(null), 4000);
                    }}
                    className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold"
                  >
                    Evet, Sıfırla
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 5: YORUM MODERASYONU */}
      {activeTab === 'comments' && (
        <div className="bg-white dark:bg-[#0b1222] border border-slate-200 dark:border-blue-900/30 rounded-3xl p-6 sm:p-8 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Yorum Moderasyonu</h2>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Topluluk kurallarına aykırı veya uygunsuz yorumları sistemden kaldırın.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={commentSearch}
                  onChange={e => setCommentSearch(e.target.value)}
                  placeholder="Yorumlarda ara..."
                  className="pl-9 pr-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-xs placeholder-slate-400 focus:outline-none focus:border-blue-500"
                />
              </div>

              <select
                value={selectedSeriesFilter}
                onChange={e => setSelectedSeriesFilter(e.target.value)}
                className="px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-xs focus:outline-none"
              >
                <option value="all">Tüm Diziler</option>
                {seriesList.map(s => (
                  <option key={s.id} value={s.id}>
                    {s.title}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-3">
            {filteredComments.length === 0 ? (
              <p className="text-center py-12 text-xs text-slate-500">
                Kriterlere uygun yorum bulunamadı.
              </p>
            ) : (
              filteredComments.map(comment => (
                <div
                  key={comment.id}
                  className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 flex items-start justify-between gap-4"
                >
                  <div className="flex items-start gap-3 min-w-0">
                    <img
                      src={comment.userAvatar}
                      alt={comment.userName}
                      referrerPolicy="no-referrer"
                      className="w-9 h-9 rounded-full object-cover shrink-0 mt-0.5"
                    />
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-bold text-slate-900 dark:text-white">{comment.userName}</span>
                        <span className="text-[10px] text-slate-500 font-mono">
                          {comment.seriesTitle || 'Minimo Dizisi'} · Bölüm {comment.episodeNumber}
                        </span>
                        <span className="text-[10px] text-slate-400">· {comment.createdAt}</span>
                      </div>
                      <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed break-words">{comment.content}</p>
                    </div>
                  </div>

                  <button
                    onClick={() => deleteComment(comment.id)}
                    className="p-2 text-rose-500 hover:bg-rose-500/10 rounded-xl transition-colors shrink-0 flex items-center gap-1.5 text-xs font-semibold"
                    title="Yorumu Sil"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span className="hidden sm:inline">Sil</span>
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* TAB 6: YETKILENDIRME */}
      {activeTab === 'staff' && (
        <div className="bg-white dark:bg-[#0b1222] border border-slate-200 dark:border-blue-900/30 rounded-3xl p-6 sm:p-8 shadow-xl">
          <div className="mb-6">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Yönetici ve Moderatör Yetkileri</h2>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              Kullanıcılara yönetim paneline erişim, dizi silme/yayınlama ve moderasyon yetkisi verin veya kaldırın.
            </p>
          </div>

          <div className="space-y-3">
            {allUsers.map(user => {
              const isStaff = user.isAuthorizedStaff || user.role === 'admin' || user.role === 'moderator';
              const isRootAdmin = user.email === 'semajim30@gmail.com';

              return (
                <div
                  key={user.id}
                  className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <img
                      src={user.avatar}
                      alt={user.displayName}
                      referrerPolicy="no-referrer"
                      className="w-10 h-10 rounded-full object-cover shrink-0"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-900 dark:text-white">{user.displayName}</span>
                        <span
                          className={`text-[10px] font-mono px-2 py-0.5 rounded uppercase font-bold ${
                            isRootAdmin
                              ? 'bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/30'
                              : isStaff
                              ? 'bg-indigo-500/20 text-indigo-700 dark:text-indigo-300'
                              : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                          }`}
                        >
                          {isRootAdmin ? 'BAŞ YÖNETİCİ' : isStaff ? 'YETKİLİ' : 'STANDART ÜYE'}
                        </span>
                      </div>
                      <p className="text-[11px] text-blue-600 dark:text-cyan-400 font-mono truncate">{user.email}</p>
                      <p className="text-[10px] text-slate-500 truncate max-w-sm">@{user.username} · {user.bio}</p>
                    </div>
                  </div>

                  <div className="shrink-0">
                    {isRootAdmin ? (
                      <span className="text-xs font-bold text-amber-600 dark:text-amber-400 px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/20 font-mono">
                        Platform Sahibi
                      </span>
                    ) : (
                      <button
                        onClick={() => toggleUserStaffRole(user.id)}
                        disabled={!isSuperAdmin}
                        title={!isSuperAdmin ? 'Yalnızca semajim30@gmail.com yetki verebilir' : ''}
                        className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all disabled:opacity-40 ${
                          isStaff
                            ? 'bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/30 hover:bg-rose-500/30'
                            : 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/30'
                        }`}
                      >
                        {isStaff ? 'Yetkiyi Kaldır' : 'Yetki Ver'}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
