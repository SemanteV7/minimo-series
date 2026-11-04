import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { User } from '../types';
import {
  UserCheck,
  UserPlus,
  MessageCircle,
  Heart,
  Bookmark,
  Shield,
  ArrowLeft,
  Camera,
  KeyRound,
  ShieldAlert,
  UserX,
  Ban,
  Check,
  Edit3,
  Lock,
  Eye,
  EyeOff,
  Sparkles,
  Settings,
  Sliders,
  CheckCircle2,
  AlertCircle,
  Trash2,
  LogOut,
} from 'lucide-react';
import { ISOLATED_MASCOT } from '../data/mockData';

export const ProfileView: React.FC = () => {
  const {
    currentUser,
    allUsers,
    activeProfileUser,
    closeUserProfile,
    followUser,
    openDmWithUser,
    seriesList,
    openReelsPlayer,
    comments,
    setActiveView,
    updateUserProfile,
    changeUserPassword,
    removeFollower,
    blockUser,
    unblockUser,
    logout,
    viewUserProfile,
  } = useApp();

  const profileUser = activeProfileUser || currentUser;
  const isMe = profileUser.id === currentUser.id;
  const isFollowing = currentUser.followingUserIds.includes(profileUser.id);
  const isBlockedByMe = currentUser.blockedUserIds?.includes(profileUser.id);

  const [activeTab, setActiveTab] = useState<'bookmarks' | 'likes' | 'comments' | 'followers' | 'following' | 'settings'>('bookmarks');

  // Edit Profile State (Kişiselleştirme)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editDisplayName, setEditDisplayName] = useState(profileUser.displayName);
  const [editBio, setEditBio] = useState(profileUser.bio);
  const [editCustomMood, setEditCustomMood] = useState(profileUser.customMood || '🎬 Minimo Dizi Tutkunu');
  const [editAvatarUrl, setEditAvatarUrl] = useState(profileUser.avatar);
  const [avatarFileName, setAvatarFileName] = useState('');
  const [editBannerUrl, setEditBannerUrl] = useState(profileUser.bannerUrl || '');

  // Privacy & Password Form State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordFeedback, setPasswordFeedback] = useState<{ success?: boolean; message?: string } | null>(null);

  // Privacy Toggles
  const [isPrivateAccount, setIsPrivateAccount] = useState(Boolean(currentUser.isPrivateAccount));
  const [hideWatchHistory, setHideWatchHistory] = useState(Boolean(currentUser.hideWatchHistory));
  const [dmPrivacy, setDmPrivacy] = useState<'everyone' | 'followers' | 'none'>(currentUser.dmPrivacy || 'everyone');
  const [settingsSuccessMsg, setSettingsSuccessMsg] = useState(false);

  // Avatar presets
  const AVATAR_PRESETS = [
    ISOLATED_MASCOT,
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150&auto=format&fit=crop&q=80',
  ];

  // Bookmarked series
  const userBookmarks = seriesList.filter(s =>
    profileUser.bookmarkedSeriesIds?.includes(s.id)
  );

  // User comments
  const userComments = comments.filter(c => c.userId === profileUser.id);

  // Liked episodes
  const likedEpisodes: { series: (typeof seriesList)[0]; episode: (typeof seriesList)[0]['episodes'][0] }[] = [];
  seriesList.forEach(s => {
    s.episodes.forEach(e => {
      if (profileUser.likedEpisodeIds?.includes(e.id)) {
        likedEpisodes.push({ series: s, episode: e });
      }
    });
  });

  // Followers of this user (who has profileUser.id in their followingUserIds)
  const userFollowers = allUsers.filter(u =>
    u.followingUserIds.includes(profileUser.id) && !(currentUser.blockedUserIds || []).includes(u.id)
  );

  // Following users
  const userFollowing = allUsers.filter(u =>
    profileUser.followingUserIds.includes(u.id) && !(currentUser.blockedUserIds || []).includes(u.id)
  );

  // Blocked users list
  const blockedUsersList = allUsers.filter(u =>
    (currentUser.blockedUserIds || []).includes(u.id)
  );

  // Handle avatar upload from device
  const handleAvatarFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setEditAvatarUrl(reader.result);
        setAvatarFileName(file.name);
      }
    };
    reader.readAsDataURL(file);
  };

  // Handle banner upload from device
  const handleBannerFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setEditBannerUrl(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  // Save profile personalization
  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateUserProfile(currentUser.id, {
      displayName: editDisplayName.trim() || currentUser.displayName,
      bio: editBio.trim() || currentUser.bio,
      customMood: editCustomMood.trim(),
      avatar: editAvatarUrl,
      bannerUrl: editBannerUrl,
    });
    setIsEditModalOpen(false);
  };

  // Save Password Change
  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setPasswordFeedback({ success: false, message: 'Yeni şifreler birbiriyle eşleşmiyor!' });
      return;
    }
    const res = changeUserPassword(currentUser.id, currentPassword, newPassword);
    setPasswordFeedback(res);
    if (res.success) {
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setPasswordFeedback(null), 4000);
    }
  };

  // Save Privacy Settings
  const handleSavePrivacySettings = () => {
    updateUserProfile(currentUser.id, {
      isPrivateAccount,
      hideWatchHistory,
      dmPrivacy,
    });
    setSettingsSuccessMsg(true);
    setTimeout(() => setSettingsSuccessMsg(false), 3000);
  };

  // Password strength calculation
  const getPasswordStrength = (pass: string) => {
    if (!pass) return { label: 'Yok', percent: 0, color: 'bg-slate-700' };
    if (pass.length < 5) return { label: 'Zayıf', percent: 30, color: 'bg-rose-500' };
    if (pass.length < 8) return { label: 'Orta', percent: 65, color: 'bg-amber-500' };
    return { label: 'Güçlü', percent: 100, color: 'bg-emerald-500' };
  };

  const strength = getPasswordStrength(newPassword);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      {/* Back button if viewing another user's profile */}
      {activeProfileUser && (
        <button
          onClick={closeUserProfile}
          className="mb-4 text-xs font-semibold text-slate-400 hover:text-white flex items-center gap-1.5 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Geri Dön</span>
        </button>
      )}

      {/* Profile Card */}
      <div className="bg-white dark:bg-[#0b1222] border border-slate-200 dark:border-blue-900/30 rounded-3xl overflow-hidden shadow-2xl mb-8">
        {/* Cover Backdrop */}
        <div
          className="h-36 sm:h-52 bg-gradient-to-r from-blue-900 via-indigo-950 to-slate-900 relative bg-cover bg-center"
          style={profileUser.bannerUrl ? { backgroundImage: `url(${profileUser.bannerUrl})` } : {}}
        >
          <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px]" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0b1222] via-transparent to-transparent" />

          {/* Quick Edit Cover Button for current user */}
          {isMe && (
            <label className="absolute top-4 right-4 cursor-pointer px-3 py-1.5 rounded-xl bg-black/50 hover:bg-black/70 backdrop-blur-md text-slate-200 border border-white/20 text-xs font-semibold flex items-center gap-1.5 transition-all">
              <Camera className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Kapağı Değiştir</span>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleBannerFileUpload}
              />
            </label>
          )}
        </div>

        {/* Profile Details Container */}
        <div className="px-6 pb-6 pt-0 relative">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 -mt-14 mb-4">
            {/* Avatar & Badges */}
            <div className="relative group">
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden border-4 border-[#0b1222] shadow-2xl bg-slate-900 relative">
                <img
                  src={profileUser.avatar}
                  alt={profileUser.displayName}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />

                {isMe && (
                  <label className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center cursor-pointer text-white text-[10px] font-semibold gap-1">
                    <Camera className="w-5 h-5 text-cyan-400" />
                    <span>Değiştir</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleAvatarFileUpload}
                    />
                  </label>
                )}
              </div>
            </div>

            {/* Actions (Follow, DM, Edit Profile, Block) */}
            <div className="flex items-center gap-2 flex-wrap">
              {!isMe && (
                <>
                  <button
                    onClick={() => followUser(profileUser.id)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-md ${
                      isFollowing
                        ? 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                        : 'bg-blue-600 text-white hover:bg-blue-500 shadow-blue-500/20'
                    }`}
                  >
                    {isFollowing ? (
                      <>
                        <UserCheck className="w-4 h-4 text-blue-400" />
                        <span>Takip Ediliyor</span>
                      </>
                    ) : (
                      <>
                        <UserPlus className="w-4 h-4" />
                        <span>Takip Et</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => openDmWithUser(profileUser.id)}
                    className="p-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white transition-colors"
                    title="Mesaj Gönder"
                  >
                    <MessageCircle className="w-4 h-4" />
                  </button>

                  {/* Block / Unblock Button */}
                  <button
                    onClick={() => {
                      if (isBlockedByMe) {
                        unblockUser(profileUser.id);
                      } else {
                        if (confirm(`${profileUser.displayName} adlı kullanıcıyı engellemek istediğinize emin misiniz?`)) {
                          blockUser(profileUser.id);
                        }
                      }
                    }}
                    className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors border ${
                      isBlockedByMe
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/30 hover:bg-amber-500/30'
                        : 'bg-rose-500/10 text-rose-400 border-rose-500/30 hover:bg-rose-500/20'
                    }`}
                  >
                    <Ban className="w-3.5 h-3.5" />
                    <span>{isBlockedByMe ? 'Engeli Kaldır' : 'Engelle'}</span>
                  </button>
                </>
              )}

              {isMe && (
                <>
                  <button
                    onClick={() => setIsEditModalOpen(true)}
                    className="px-4 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white transition-colors flex items-center gap-1.5 shadow-md shadow-blue-600/25"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Profili Düzenle</span>
                  </button>

                  <button
                    onClick={() => setActiveTab('settings')}
                    className="px-3 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center gap-1.5 transition-colors border border-slate-700"
                  >
                    <Settings className="w-3.5 h-3.5 text-blue-400" />
                    <span>Güvenlik & Gizlilik</span>
                  </button>

                  {(currentUser.email === 'semajim30@gmail.com' || Boolean(currentUser.isAuthorizedStaff) || currentUser.role === 'admin') && (
                    <button
                      onClick={() => setActiveView('admin')}
                      className="px-3.5 py-2 rounded-xl text-xs font-bold bg-indigo-600/15 dark:bg-indigo-600/20 border border-indigo-500/30 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-600/25 transition-colors flex items-center gap-1.5"
                    >
                      <Shield className="w-3.5 h-3.5" />
                      <span>Yönetici Paneli</span>
                    </button>
                  )}

                  <button
                    onClick={logout}
                    className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 dark:text-rose-400 flex items-center gap-1.5 transition-colors border border-rose-500/25"
                    title="Hesaptan Güvenli Çıkış Yap"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Çıkış Yap</span>
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Name, Slogan & Bio */}
          <div className="space-y-1 mb-5">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">{profileUser.displayName}</h2>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded font-bold uppercase tracking-wider bg-blue-500/15 text-blue-400 border border-blue-500/20">
                {profileUser.role}
              </span>
              {profileUser.customMood && (
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-cyan-950/60 text-cyan-300 border border-cyan-500/30 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-cyan-400" />
                  <span>{profileUser.customMood}</span>
                </span>
              )}
            </div>
            {/* Privacy-Protected Identity: Email is NEVER visible to public */}
            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 font-mono flex-wrap">
              <span>@{profileUser.username}</span>
              {isMe && profileUser.email && (
                <>
                  <span>·</span>
                  <span className="inline-flex items-center gap-1 text-[11px] text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md border border-slate-200 dark:border-slate-700">
                    <Lock className="w-3 h-3 text-emerald-500" />
                    <span>{profileUser.email}</span>
                    <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">(Gizli · Sadece Sen Görürsün)</span>
                  </span>
                </>
              )}
            </div>
            <p className="text-xs sm:text-sm text-slate-300 pt-2 leading-relaxed max-w-xl">
              {profileUser.bio}
            </p>
          </div>

          {/* Followers / Following Stats */}
          <div className="flex items-center gap-6 pt-4 border-t border-slate-800/80 text-xs text-slate-400">
            <button
              onClick={() => setActiveTab('followers')}
              className="hover:text-blue-400 transition-colors text-left"
            >
              <span className="font-bold text-white text-base mr-1 tabular-nums font-mono">
                {userFollowers.length}
              </span>
              <span>Takipçi</span>
            </button>

            <button
              onClick={() => setActiveTab('followers')}
              className="hover:text-blue-400 transition-colors text-left"
            >
              <span className="font-bold text-white text-base mr-1 tabular-nums font-mono">
                {userFollowing.length}
              </span>
              <span>Takip Edilen</span>
            </button>

            <div>
              <span className="font-bold text-white text-base mr-1 tabular-nums font-mono">
                {userBookmarks.length}
              </span>
              <span>Kayıtlı Dizi</span>
            </div>
          </div>
        </div>
      </div>

      {/* Profile Content Tabs */}
      <div className="flex items-center gap-1.5 sm:gap-2 p-1.5 bg-slate-200 dark:bg-slate-900/80 rounded-2xl border border-slate-300 dark:border-slate-800 mb-6 overflow-x-auto no-scrollbar max-w-2xl">
        <button
          onClick={() => setActiveTab('bookmarks')}
          className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center gap-2 transition-all whitespace-nowrap ${
            activeTab === 'bookmarks'
              ? 'bg-blue-600 text-white shadow-md'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Bookmark className="w-4 h-4" />
          <span>{isMe ? 'Kayıtlı Dizilerim' : 'Takip Ettiği Diziler'} ({userBookmarks.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('followers')}
          className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center gap-2 transition-all whitespace-nowrap ${
            activeTab === 'followers'
              ? 'bg-blue-600 text-white shadow-md'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <UserCheck className="w-4 h-4" />
          <span>{isMe ? 'Takipçilerim' : 'Takipçileri'} ({userFollowers.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('following')}
          className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center gap-2 transition-all whitespace-nowrap ${
            activeTab === 'following'
              ? 'bg-blue-600 text-white shadow-md'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <UserPlus className="w-4 h-4" />
          <span>{isMe ? 'Takip Ettiklerim' : 'Takip Ettikleri'} ({userFollowing.length})</span>
        </button>

        {isMe && (
          <>
            <button
              onClick={() => setActiveTab('likes')}
              className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center gap-2 transition-all whitespace-nowrap ${
                activeTab === 'likes'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Heart className="w-4 h-4" />
              <span>Beğeniler ({likedEpisodes.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('comments')}
              className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center gap-2 transition-all whitespace-nowrap ${
                activeTab === 'comments'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <MessageCircle className="w-4 h-4" />
              <span>Yorumlar ({userComments.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('settings')}
              className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center gap-2 transition-all whitespace-nowrap ${
                activeTab === 'settings'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <KeyRound className="w-4 h-4" />
              <span>Şifre & Gizlilik</span>
            </button>
          </>
        )}
      </div>

      {/* Tab: Bookmarks */}
      {activeTab === 'bookmarks' && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {userBookmarks.length === 0 ? (
            <div className="col-span-full text-center py-12 text-xs text-slate-400">
              Henüz listeye eklenen dizi bulunmuyor.
            </div>
          ) : (
            userBookmarks.map(series => (
              <div
                key={series.id}
                onClick={() => openReelsPlayer(series.id)}
                className="group rounded-2xl overflow-hidden bg-slate-900 border border-slate-800 hover:border-blue-500/50 cursor-pointer transition-all"
              >
                <div className="relative aspect-[9/13] w-full overflow-hidden bg-slate-950">
                  <img
                    src={series.coverUrl}
                    alt={series.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-80" />
                  <div className="absolute bottom-2 left-2 right-2">
                    <span className="text-[10px] text-blue-400 font-semibold">{series.genre}</span>
                    <h4 className="text-xs font-bold text-white truncate">{series.title}</h4>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Tab: Likes */}
      {activeTab === 'likes' && (
        <div className="space-y-3">
          {likedEpisodes.length === 0 ? (
            <div className="text-center py-12 text-xs text-slate-400">
              Henüz beğenilen bölüm bulunmuyor.
            </div>
          ) : (
            likedEpisodes.map(({ series, episode }) => (
              <div
                key={episode.id}
                onClick={() => openReelsPlayer(series.id, episode.id)}
                className="p-3 rounded-2xl bg-slate-900 border border-slate-800 hover:border-blue-500/40 cursor-pointer flex items-center justify-between gap-4 transition-all"
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
                    <span className="text-[10px] text-blue-400 font-bold uppercase">
                      {series.title} · Bölüm {episode.episodeNumber}
                    </span>
                    <h5 className="text-xs font-bold text-white">{episode.title}</h5>
                    <p className="text-[11px] text-slate-400 line-clamp-1">{episode.synopsis}</p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 text-rose-400 text-xs font-semibold shrink-0">
                  <Heart className="w-4 h-4 fill-rose-500" />
                  <span>Beğenildi</span>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Tab: Comments */}
      {activeTab === 'comments' && (
        <div className="space-y-3">
          {userComments.length === 0 ? (
            <div className="text-center py-12 text-xs text-slate-400">
              Henüz yapılan yorum bulunmuyor.
            </div>
          ) : (
            userComments.map(c => (
              <div key={c.id} className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="text-xs font-bold text-blue-400">{c.seriesTitle || 'Dizi'}</span>
                  <span className="text-[10px] font-mono text-slate-500">Bölüm {c.episodeNumber}</span>
                  <span className="text-[10px] text-slate-600">· {c.createdAt}</span>
                </div>
                <p className="text-xs text-slate-200">{c.content}</p>
              </div>
            ))
          )}
        </div>
      )}

      {/* Tab: Followers & Blocked Users (Takipçi Silme & Engelleme) */}
      {activeTab === 'followers' && (
        <div className="space-y-6">
          {/* Followers Section */}
          <div className="bg-[#0b1222] border border-blue-900/30 rounded-3xl p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <UserCheck className="w-4 h-4 text-blue-400" />
                  <span>Takipçiler ({userFollowers.length})</span>
                </h3>
                <p className="text-[11px] text-slate-400">
                  {isMe ? 'İstemediğiniz takipçileri çıkarabilir veya doğrudan engelleyebilirsiniz.' : 'Bu kullanıcıyı takip edenler.'}
                </p>
              </div>
            </div>

            <div className="space-y-3">
              {userFollowers.length === 0 ? (
                <p className="text-xs text-slate-400 py-4 text-center">Henüz takipçi bulunmuyor.</p>
              ) : (
                userFollowers.map(follower => {
                  const isFollowingThisUser = currentUser.followingUserIds.includes(follower.id);

                  return (
                    <div
                      key={follower.id}
                      className="p-3 rounded-2xl bg-slate-900/90 border border-slate-800 flex items-center justify-between gap-3 hover:border-blue-500/30 transition-all"
                    >
                      <div
                        onClick={() => viewUserProfile(follower)}
                        className="flex items-center gap-3 min-w-0 cursor-pointer group flex-1"
                      >
                        <img
                          src={follower.avatar}
                          alt={follower.displayName}
                          className="w-10 h-10 rounded-full object-cover shrink-0 group-hover:ring-2 ring-blue-500 transition-all"
                        />
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-bold text-white truncate group-hover:text-blue-400 transition-colors">
                              {follower.displayName}
                            </span>
                            <span className="text-[10px] text-slate-500 font-mono">@{follower.username}</span>
                          </div>
                          <p className="text-[11px] text-slate-400 truncate">{follower.bio}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {currentUser.id !== follower.id && (
                          <button
                            onClick={() => followUser(follower.id)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 ${
                              isFollowingThisUser
                                ? 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                                : 'bg-blue-600 hover:bg-blue-500 text-white shadow-sm'
                            }`}
                          >
                            {isFollowingThisUser ? (
                              <>
                                <UserCheck className="w-3.5 h-3.5 text-blue-400" />
                                <span>Takip Ediliyor</span>
                              </>
                            ) : (
                              <>
                                <UserPlus className="w-3.5 h-3.5" />
                                <span>Takip Et</span>
                              </>
                            )}
                          </button>
                        )}

                        {isMe && (
                          <>
                            {/* Remove Follower Button */}
                            <button
                              onClick={() => {
                                if (confirm(`${follower.displayName} adlı kullanıcıyı takipçilerinizden silmek istiyor musunuz?`)) {
                                  removeFollower(follower.id);
                                }
                              }}
                              className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium flex items-center gap-1 transition-colors"
                              title="Takipçiden Çıkar"
                            >
                              <UserX className="w-3.5 h-3.5 text-amber-400" />
                              <span className="hidden sm:inline">Çıkar</span>
                            </button>

                            {/* Block User Button */}
                            <button
                              onClick={() => {
                                if (confirm(`${follower.displayName} adlı kullanıcıyı engellemek istediğinize emin misiniz?`)) {
                                  blockUser(follower.id);
                                }
                              }}
                              className="px-2.5 py-1.5 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 text-rose-400 border border-rose-500/30 text-xs font-semibold flex items-center gap-1 transition-colors"
                              title="Kullanıcıyı Engelle"
                            >
                              <Ban className="w-3.5 h-3.5" />
                              <span className="hidden sm:inline">Engelle</span>
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Blocked Users Section (Only visible for current user) */}
          {isMe && (
            <div className="bg-[#0b1222] border border-rose-900/30 rounded-3xl p-6 shadow-xl">
              <div className="mb-4">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Ban className="w-4 h-4 text-rose-400" />
                  <span>Engellenen Kullanıcılar ({blockedUsersList.length})</span>
                </h3>
                <p className="text-[11px] text-slate-400">
                  Engellediğiniz kullanıcılar profilinizi göremez, size mesaj gönderemez ve sizi takip edemez.
                </p>
              </div>

              <div className="space-y-3">
                {blockedUsersList.length === 0 ? (
                  <p className="text-xs text-slate-500 py-3 text-center">Şu an engellenmiş hiçbir kullanıcı yok.</p>
                ) : (
                  blockedUsersList.map(blocked => (
                    <div
                      key={blocked.id}
                      className="p-3 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-3">
                        <img
                          src={blocked.avatar}
                          alt={blocked.displayName}
                          className="w-9 h-9 rounded-full object-cover shrink-0 grayscale"
                        />
                        <div>
                          <p className="text-xs font-bold text-slate-300">{blocked.displayName}</p>
                          <p className="text-[10px] text-slate-500 font-mono">@{blocked.username}</p>
                        </div>
                      </div>

                      <button
                        onClick={() => unblockUser(blocked.id)}
                        className="px-3 py-1.5 rounded-xl bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 border border-blue-500/30 text-xs font-semibold transition-colors"
                      >
                        Engeli Kaldır
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab: Following (Takip Edilen Kullanıcılar) */}
      {activeTab === 'following' && (
        <div className="bg-[#0b1222] border border-blue-900/30 rounded-3xl p-6 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <UserPlus className="w-4 h-4 text-blue-400" />
                <span>Takip Edilenler ({userFollowing.length})</span>
              </h3>
              <p className="text-[11px] text-slate-400">
                {isMe ? 'Takip ettiğiniz üyeler.' : `${profileUser.displayName} tarafından takip edilen üyeler.`}
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {userFollowing.length === 0 ? (
              <p className="text-xs text-slate-400 py-4 text-center">Henüz takip edilen üye bulunmuyor.</p>
            ) : (
              userFollowing.map(followed => {
                const isFollowingThisUser = currentUser.followingUserIds.includes(followed.id);

                return (
                  <div
                    key={followed.id}
                    className="p-3 rounded-2xl bg-slate-900/90 border border-slate-800 flex items-center justify-between gap-3 hover:border-blue-500/30 transition-all"
                  >
                    <div
                      onClick={() => viewUserProfile(followed)}
                      className="flex items-center gap-3 min-w-0 cursor-pointer group flex-1"
                    >
                      <img
                        src={followed.avatar}
                        alt={followed.displayName}
                        className="w-10 h-10 rounded-full object-cover shrink-0 group-hover:ring-2 ring-blue-500 transition-all"
                      />
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-bold text-white truncate group-hover:text-blue-400 transition-colors">
                            {followed.displayName}
                          </span>
                          <span className="text-[10px] text-slate-500 font-mono">@{followed.username}</span>
                        </div>
                        <p className="text-[11px] text-slate-400 truncate">{followed.bio}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {currentUser.id !== followed.id && (
                        <button
                          onClick={() => followUser(followed.id)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 ${
                            isFollowingThisUser
                              ? 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                              : 'bg-blue-600 hover:bg-blue-500 text-white shadow-sm'
                          }`}
                        >
                          {isFollowingThisUser ? (
                            <>
                              <UserCheck className="w-3.5 h-3.5 text-blue-400" />
                              <span>Takip Ediliyor</span>
                            </>
                          ) : (
                            <>
                              <UserPlus className="w-3.5 h-3.5" />
                              <span>Takip Et</span>
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* Tab: Settings (Şifre Değiştirme ve Gizlilik & Güvenlik) */}
      {isMe && activeTab === 'settings' && (
        <div className="space-y-6">
          {/* Password Change Form */}
          <div className="bg-[#0b1222] border border-blue-900/30 rounded-3xl p-6 sm:p-8 shadow-xl">
            <div className="mb-6">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <KeyRound className="w-5 h-5 text-blue-400" />
                <span>Şifre Değiştirme</span>
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Hesap güvenliğiniz için şifrenizi düzenli aralıklarla güncelleyin.
              </p>
            </div>

            {passwordFeedback && (
              <div
                className={`mb-4 p-3 rounded-xl flex items-center gap-2 text-xs font-semibold ${
                  passwordFeedback.success
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                }`}
              >
                {passwordFeedback.success ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                )}
                <span>{passwordFeedback.message}</span>
              </div>
            )}

            <form onSubmit={handlePasswordChange} className="space-y-4 max-w-md">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                  Mevcut Şifre
                </label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={e => setCurrentPassword(e.target.value)}
                  placeholder="Mevcut şifreniz (varsayılan: 1234)"
                  className="w-full px-4 py-2 text-xs rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                  Yeni Şifre
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  placeholder="En az 4 karakter"
                  required
                  className="w-full px-4 py-2 text-xs rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                />

                {/* Password Strength Indicator */}
                {newPassword && (
                  <div className="mt-2 space-y-1">
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="text-slate-400">Şifre Gücü:</span>
                      <span className="font-semibold text-white">{strength.label}</span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                      <div
                        className={`h-full ${strength.color} transition-all`}
                        style={{ width: `${strength.percent}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                  Yeni Şifre (Tekrar)
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  placeholder="Yeni şifrenizi doğrulayın"
                  required
                  className="w-full px-4 py-2 text-xs rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                />
              </div>

              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-lg shadow-blue-600/30 transition-all flex items-center gap-2"
              >
                <KeyRound className="w-3.5 h-3.5" />
                <span>Şifreyi Güncelle</span>
              </button>
            </form>
          </div>

          {/* Privacy & Account Safety Settings */}
          <div className="bg-[#0b1222] border border-blue-900/30 rounded-3xl p-6 sm:p-8 shadow-xl">
            <div className="mb-6">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Shield className="w-5 h-5 text-indigo-400" />
                <span>Hesap Gizlilik ve Güvenlik Tercihleri</span>
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Profilinizin kimler tarafından görüntülenebileceğini ve mesajlaşma izinlerinizi yönetin.
              </p>
            </div>

            {settingsSuccessMsg && (
              <div className="mb-4 p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 flex items-center gap-2 text-xs font-semibold animate-in fade-in">
                <Check className="w-4 h-4 text-emerald-400" />
                <span>Gizlilik ayarlarınız başarıyla kaydedildi!</span>
              </div>
            )}

            <div className="space-y-4 max-w-lg">
              {/* Private Account Toggle */}
              <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-white">Gizli Hesap</h4>
                  <p className="text-[11px] text-slate-400">
                    Açık olduğunda yalnızca sizi takip eden kullanıcılar profilinizi görebilir.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={isPrivateAccount}
                  onChange={e => setIsPrivateAccount(e.target.checked)}
                  className="w-5 h-5 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                />
              </div>

              {/* Hide Watch History Toggle */}
              <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-white">İzleme Geçmişini Gizle</h4>
                  <p className="text-[11px] text-slate-400">
                    Kaldığınız yer ve son izleme geçmişiniz diğer izleyicilere gizlenir.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={hideWatchHistory}
                  onChange={e => setHideWatchHistory(e.target.checked)}
                  className="w-5 h-5 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                />
              </div>

              {/* DM Privacy Radio */}
              <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
                <h4 className="text-xs font-bold text-white mb-2">Bana Kimler Mesaj Gönderebilir (DM)?</h4>
                <div className="space-y-2 text-xs text-slate-300">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="dmPrivacy"
                      value="everyone"
                      checked={dmPrivacy === 'everyone'}
                      onChange={() => setDmPrivacy('everyone')}
                      className="text-blue-600 focus:ring-blue-500"
                    />
                    <span>Tüm Minimo Üyeleri</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="dmPrivacy"
                      value="followers"
                      checked={dmPrivacy === 'followers'}
                      onChange={() => setDmPrivacy('followers')}
                      className="text-blue-600 focus:ring-blue-500"
                    />
                    <span>Yalnızca Takip Ettiğim Kişiler</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="dmPrivacy"
                      value="none"
                      checked={dmPrivacy === 'none'}
                      onChange={() => setDmPrivacy('none')}
                      className="text-blue-600 focus:ring-blue-500"
                    />
                    <span>Hiç Kimse (DM Kutusunu Kapat)</span>
                  </label>
                </div>
              </div>

              <button
                type="button"
                onClick={handleSavePrivacySettings}
                className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-lg shadow-blue-600/30 transition-all flex items-center gap-2"
              >
                <Check className="w-4 h-4" />
                <span>Gizlilik Ayarlarını Kaydet</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Profile Modal (Kişiselleştirme Modalı) */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="max-w-lg w-full bg-[#0c1324] border border-blue-900/50 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto no-scrollbar">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-cyan-400" />
                <h3 className="text-base font-bold text-white">Profili Kişiselleştir</h3>
              </div>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-4">
              {/* Profile Photo / Avatar Picker & Device Upload */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
                  Profil Resmi
                </label>

                <div className="flex items-center gap-4 mb-3">
                  <div className="w-16 h-16 rounded-2xl overflow-hidden border-2 border-cyan-400 shadow-md shrink-0 bg-slate-900">
                    <img src={editAvatarUrl} alt="Avatar Önizleme" className="w-full h-full object-cover" />
                  </div>

                  <div className="space-y-1.5 flex-1">
                    <label className="cursor-pointer px-3 py-1.5 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-400/40 text-cyan-300 text-xs font-semibold inline-flex items-center gap-1.5 transition-colors">
                      <Camera className="w-3.5 h-3.5" />
                      <span>Cihazdan Fotoğraf Seç (Telefon/PC)</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleAvatarFileUpload}
                      />
                    </label>
                    {avatarFileName && (
                      <p className="text-[10px] text-emerald-400 font-mono truncate">
                        ✓ {avatarFileName} seçildi
                      </p>
                    )}
                  </div>
                </div>

                {/* Preset Avatars */}
                <div className="flex items-center gap-2 overflow-x-auto pb-1">
                  {AVATAR_PRESETS.map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setEditAvatarUrl(preset);
                        setAvatarFileName('');
                      }}
                      className={`w-9 h-9 rounded-xl overflow-hidden border-2 shrink-0 transition-transform ${
                        editAvatarUrl === preset ? 'border-cyan-400 scale-110' : 'border-slate-800 opacity-60 hover:opacity-100'
                      }`}
                    >
                      <img src={preset} alt="preset" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              </div>

              {/* Display Name */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                  Görünen İsim
                </label>
                <input
                  type="text"
                  value={editDisplayName}
                  onChange={e => setEditDisplayName(e.target.value)}
                  required
                  className="w-full px-4 py-2 text-xs rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-cyan-400"
                />
              </div>

              {/* Custom Mood / Title */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                  Özel Ruh Hali / Başlık
                </label>
                <input
                  type="text"
                  value={editCustomMood}
                  onChange={e => setEditCustomMood(e.target.value)}
                  placeholder="Örn: 🎬 Bilim kurgu bağımlısı, ⚡ Dizi kurdu"
                  className="w-full px-4 py-2 text-xs rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                />
              </div>

              {/* Bio */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                  Biyografi
                </label>
                <textarea
                  value={editBio}
                  onChange={e => setEditBio(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-2 text-xs rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                />
              </div>

              {/* Custom Banner URL or preset */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">
                    Kapak Arka Planı
                  </label>
                  <label className="cursor-pointer text-[11px] text-cyan-400 hover:underline flex items-center gap-1">
                    <Camera className="w-3 h-3" />
                    <span>Cihazdan Seç</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleBannerFileUpload}
                    />
                  </label>
                </div>
                <input
                  type="text"
                  value={editBannerUrl}
                  onChange={e => setEditBannerUrl(e.target.value)}
                  placeholder="Görsel bağlantısı veya cihazdan seçin"
                  className="w-full px-4 py-2 text-xs rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white text-xs font-bold shadow-lg shadow-blue-600/30 transition-all flex items-center gap-2"
                >
                  <Check className="w-4 h-4" />
                  <span>Değişiklikleri Kaydet</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
