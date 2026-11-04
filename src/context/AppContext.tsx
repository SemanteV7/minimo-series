import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import {
  Series,
  Episode,
  User,
  Comment,
  Notification,
  DirectMessage,
  CommunityChatMessage,
  WatchProgress,
  SeriesRequest,
  ActiveView,
  BackupSnapshot,
} from '../types';
import {
  INITIAL_SERIES,
  INITIAL_USERS,
  INITIAL_COMMENTS,
  INITIAL_NOTIFICATIONS,
  INITIAL_DMS,
  INITIAL_COMMUNITY_MESSAGES,
} from '../data/mockData';

const INITIAL_WATCH_PROGRESS: WatchProgress[] = [];

const INITIAL_SERIES_REQUESTS: SeriesRequest[] = [];

interface AppContextType {
  seriesList: Series[];
  currentUser: User;
  allUsers: User[];
  isNsfwEnabled: boolean;
  isDarkMode: boolean;
  activeView: 'home' | 'reels' | 'community' | 'library' | 'admin' | 'profile';
  selectedSeries: Series | null;
  currentEpisode: Episode | null;
  comments: Comment[];
  notifications: Notification[];
  unreadNotifsCount: number;
  directMessages: DirectMessage[];
  communityMessages: CommunityChatMessage[];
  watchProgressList: WatchProgress[];
  seriesRequests: SeriesRequest[];
  isDmModalOpen: boolean;
  activeDmUserId: string | null;
  activeProfileUser: User | null;
  isAdvancedSearchOpen: boolean;
  setIsAdvancedSearchOpen: (open: boolean) => void;
  activeInfoModal: 'about' | 'copyright' | 'contact' | null;
  isLoggedIn: boolean;
  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (open: boolean) => void;
  
  // Actions
  login: (email: string, pass?: string) => { success: boolean; message: string };
  register: (displayName: string, email: string, password?: string) => { success: boolean; message: string };
  resetPasswordWithEmail: (email: string, newPass: string) => { success: boolean; message: string };
  loginWithGoogle: (email: string, name?: string, avatar?: string) => { success: boolean; message: string };
  logout: () => void;
  setActiveView: (view: 'home' | 'reels' | 'community' | 'library' | 'admin' | 'profile') => void;
  openReelsPlayer: (seriesId: string, episodeId?: string) => void;
  nextEpisode: () => void;
  prevEpisode: () => void;
  jumpToEpisode: (episodeId: string) => void;
  toggleNsfw: () => void;
  toggleTheme: () => void;
  switchUser: (userId: string) => void;
  followUser: (targetUserId: string) => void;
  addComment: (episodeId: string, seriesId: string, content: string) => void;
  replyToComment: (commentId: string, content: string) => void;
  deleteComment: (commentId: string) => void;
  publishSeries: (seriesData: Omit<Series, 'id' | 'viewCount' | 'likeCount' | 'slug'>) => void;
  deleteSeries: (seriesId: string) => void;
  toggleUserStaffRole: (targetUserId: string) => void;
  sendDirectMessage: (receiverId: string, text: string) => void;
  sendCommunityMessage: (text: string, seriesMention?: string) => void;
  updateWatchProgress: (seriesId: string, episodeId: string, episodeNumber: number, currentTimeSec: number, durationSec: number) => void;
  addSeriesRequest: (title: string, genre: string, description: string) => void;
  upvoteSeriesRequest: (requestId: string) => void;
  getRandomSeries: () => Series | null;
  resumeProgress: (seriesId: string, episodeId: string) => void;
  markNotificationsAsRead: () => void;
  toggleBookmark: (seriesId: string) => void;
  toggleLikeEpisode: (episodeId: string) => void;
  openDmWithUser: (userId: string) => void;
  closeDmModal: () => void;
  setIsDmModalOpen: (open: boolean) => void;
  viewUserProfile: (user: User) => void;
  closeUserProfile: () => void;
  customGenres: string[];
  addCustomGenre: (genre: string) => void;
  addEpisodeToSeries: (seriesId: string, episodeData: Omit<Episode, 'id' | 'seriesId' | 'likeCount' | 'commentCount'>) => void;
  updateUserProfile: (userId: string, data: Partial<User>) => void;
  changeUserPassword: (userId: string, oldPass: string, newPass: string) => { success: boolean; message: string };
  removeFollower: (followerUserId: string) => void;
  blockUser: (targetUserId: string) => void;
  unblockUser: (targetUserId: string) => void;
  openInfoModal: (modal: 'about' | 'copyright' | 'contact' | null) => void;

  // Backup & Restore Platform
  snapshots: BackupSnapshot[];
  exportFullBackup: () => string;
  importFullBackup: (jsonData: string) => { success: boolean; message: string; stats?: { seriesCount: number; userCount: number; commentsCount: number } };
  createNamedSnapshot: (name: string) => void;
  restoreSnapshot: (snapshotId: string) => boolean;
  deleteSnapshot: (snapshotId: string) => void;
  resetToDefaults: () => void;
  isAutoSyncActive: boolean;
  setIsAutoSyncActive: (active: boolean) => void;
  syncToCloudflareAndGithub: (customPayload?: any) => Promise<{ success: boolean; message: string; githubCommitUrl?: string }>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // One-time clean slate for production launch (wiping sample demo series, comments, users)
  if (typeof window !== 'undefined' && !localStorage.getItem('minimo_production_clean_v1')) {
    localStorage.removeItem('minimo_series');
    localStorage.removeItem('minimo_comments');
    localStorage.removeItem('minimo_notifications');
    localStorage.removeItem('minimo_dms');
    localStorage.removeItem('minimo_community_chat');
    localStorage.removeItem('minimo_watch_progress');
    localStorage.removeItem('minimo_series_requests');
    localStorage.removeItem('minimo_users');
    localStorage.setItem('minimo_production_clean_v1', 'true');
  }

  // Theme state
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('minimo_theme');
    return saved ? saved === 'dark' : true;
  });

  // NSFW state
  const [isNsfwEnabled, setIsNsfwEnabled] = useState<boolean>(() => {
    return localStorage.getItem('minimo_nsfw') === 'true';
  });

  // Series state
  const [seriesList, setSeriesList] = useState<Series[]>(() => {
    const saved = localStorage.getItem('minimo_series');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return INITIAL_SERIES;
      }
    }
    return INITIAL_SERIES;
  });

  // Users state
  const [allUsers, setAllUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem('minimo_users');
    if (saved) {
      try {
        const parsed: User[] = JSON.parse(saved);
        // Ensure semajim30@gmail.com is present with full admin rights
        if (parsed.some(u => u.email === 'semajim30@gmail.com')) {
          return parsed;
        }
        return INITIAL_USERS;
      } catch {
        return INITIAL_USERS;
      }
    }
    return INITIAL_USERS;
  });

  // Ensure new visitors enter as guests (not auto-logged into admin account)
  if (typeof window !== 'undefined' && !localStorage.getItem('minimo_guest_default_v2')) {
    if (localStorage.getItem('minimo_current_user_id') === 'u-semajim' && localStorage.getItem('minimo_user_manually_logged_in') !== 'true') {
      localStorage.removeItem('minimo_current_user_id');
      localStorage.setItem('minimo_is_logged_in', 'false');
    }
    localStorage.setItem('minimo_guest_default_v2', 'true');
  }

  const GUEST_USER: User = {
    id: 'guest',
    email: '',
    username: 'misafir',
    displayName: 'Misafir İzleyici',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
    bio: 'Minimo Series izleyicisi',
    role: 'user',
    followersCount: 0,
    followingCount: 0,
    followingUserIds: [],
    bookmarkedSeriesIds: [],
    likedEpisodeIds: [],
    isAuthorizedStaff: false,
  };

  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => {
    const saved = localStorage.getItem('minimo_is_logged_in');
    return saved === 'true'; // Defaults to false for new visitors
  });

  // Current active user - only populated when authenticated
  const [currentUserId, setCurrentUserId] = useState<string>(() => {
    const saved = localStorage.getItem('minimo_current_user_id');
    return saved || '';
  });

  const currentUser: User = isLoggedIn && currentUserId
    ? allUsers.find(u => u.id === currentUserId) || GUEST_USER
    : GUEST_USER;

  // Modals & Drawers
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Navigation & View
  const [activeView, setActiveView] = useState<ActiveView>('home');
  const [selectedSeriesId, setSelectedSeriesId] = useState<string>('s-1');
  const [selectedEpisodeId, setSelectedEpisodeId] = useState<string>('ep-1-1');

  // Modals & Drawers
  const [isDmModalOpen, setIsDmModalOpen] = useState(false);
  const [activeDmUserId, setActiveDmUserId] = useState<string | null>(null);
  const [activeProfileUser, setActiveProfileUser] = useState<User | null>(null);
  const [activeInfoModal, setActiveInfoModal] = useState<'about' | 'copyright' | 'contact' | null>(null);
  const [isAdvancedSearchOpen, setIsAdvancedSearchOpen] = useState(false);

  // Social Data
  const [comments, setComments] = useState<Comment[]>(() => {
    const saved = localStorage.getItem('minimo_comments');
    if (saved) {
      try { return JSON.parse(saved); } catch { return INITIAL_COMMENTS; }
    }
    return INITIAL_COMMENTS;
  });

  const [notifications, setNotifications] = useState<Notification[]>(() => {
    const saved = localStorage.getItem('minimo_notifications');
    if (saved) {
      try { return JSON.parse(saved); } catch { return INITIAL_NOTIFICATIONS; }
    }
    return INITIAL_NOTIFICATIONS;
  });

  const [directMessages, setDirectMessages] = useState<DirectMessage[]>(() => {
    const saved = localStorage.getItem('minimo_dms');
    if (saved) {
      try { return JSON.parse(saved); } catch { return INITIAL_DMS; }
    }
    return INITIAL_DMS;
  });

  const [communityMessages, setCommunityMessages] = useState<CommunityChatMessage[]>(() => {
    const saved = localStorage.getItem('minimo_community_chat');
    if (saved) {
      try { return JSON.parse(saved); } catch { return INITIAL_COMMUNITY_MESSAGES; }
    }
    return INITIAL_COMMUNITY_MESSAGES;
  });

  const [watchProgressList, setWatchProgressList] = useState<WatchProgress[]>(() => {
    const saved = localStorage.getItem('minimo_watch_progress');
    if (saved) {
      try { return JSON.parse(saved); } catch { return INITIAL_WATCH_PROGRESS; }
    }
    return INITIAL_WATCH_PROGRESS;
  });

  const [seriesRequests, setSeriesRequests] = useState<SeriesRequest[]>(() => {
    const saved = localStorage.getItem('minimo_series_requests');
    if (saved) {
      try { return JSON.parse(saved); } catch { return INITIAL_SERIES_REQUESTS; }
    }
    return INITIAL_SERIES_REQUESTS;
  });

  const DEFAULT_GENRES = ['Bilim Kurgu', 'Romantik', 'Gerilim', 'Dram', 'Komedi', 'Gizem', 'Aksiyon'];
  const [customGenres, setCustomGenres] = useState<string[]>(() => {
    const saved = localStorage.getItem('minimo_custom_genres');
    if (saved) {
      try { return JSON.parse(saved); } catch { return DEFAULT_GENRES; }
    }
    return DEFAULT_GENRES;
  });

  useEffect(() => {
    localStorage.setItem('minimo_custom_genres', JSON.stringify(customGenres));
  }, [customGenres]);

  // Save changes to localStorage
  useEffect(() => {
    localStorage.setItem('minimo_watch_progress', JSON.stringify(watchProgressList));
  }, [watchProgressList]);

  useEffect(() => {
    localStorage.setItem('minimo_series_requests', JSON.stringify(seriesRequests));
  }, [seriesRequests]);
  useEffect(() => {
    localStorage.setItem('minimo_series', JSON.stringify(seriesList));
  }, [seriesList]);

  useEffect(() => {
    localStorage.setItem('minimo_users', JSON.stringify(allUsers));
  }, [allUsers]);

  useEffect(() => {
    localStorage.setItem('minimo_comments', JSON.stringify(comments));
  }, [comments]);

  useEffect(() => {
    localStorage.setItem('minimo_notifications', JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    localStorage.setItem('minimo_dms', JSON.stringify(directMessages));
  }, [directMessages]);

  useEffect(() => {
    localStorage.setItem('minimo_community_chat', JSON.stringify(communityMessages));
  }, [communityMessages]);

  // Backup snapshots state
  const [snapshots, setSnapshots] = useState<BackupSnapshot[]>(() => {
    const saved = localStorage.getItem('minimo_backup_snapshots');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return [];
      }
    }
    return [];
  });

  useEffect(() => {
    localStorage.setItem('minimo_backup_snapshots', JSON.stringify(snapshots));
  }, [snapshots]);

  useEffect(() => {
    localStorage.setItem('minimo_theme', isDarkMode ? 'dark' : 'light');
    const root = document.documentElement;
    if (isDarkMode) {
      root.classList.add('dark');
      root.classList.remove('light');
      root.setAttribute('data-theme', 'dark');
      root.style.colorScheme = 'dark';
    } else {
      root.classList.remove('dark');
      root.classList.add('light');
      root.setAttribute('data-theme', 'light');
      root.style.colorScheme = 'light';
    }
  }, [isDarkMode]);

  useEffect(() => {
    localStorage.setItem('minimo_nsfw', isNsfwEnabled.toString());
  }, [isNsfwEnabled]);

  // Derived selected series & current episode
  const selectedSeries = seriesList.find(s => s.id === selectedSeriesId) || seriesList[0] || null;
  const currentEpisode = selectedSeries?.episodes.find(e => e.id === selectedEpisodeId) || selectedSeries?.episodes[0] || null;

  // Unread notifications count for current user
  const unreadNotifsCount = notifications.filter(n => n.recipientId === currentUser.id && !n.isRead).length;

  // Latest state ref for accurate timer/debounced backups
  const latestDataRef = useRef({
    seriesList,
    allUsers,
    comments,
    notifications,
    directMessages,
    communityMessages,
    watchProgressList,
    seriesRequests,
    customGenres,
  });

  useEffect(() => {
    latestDataRef.current = {
      seriesList,
      allUsers,
      comments,
      notifications,
      directMessages,
      communityMessages,
      watchProgressList,
      seriesRequests,
      customGenres,
    };
  }, [
    seriesList,
    allUsers,
    comments,
    notifications,
    directMessages,
    communityMessages,
    watchProgressList,
    seriesRequests,
    customGenres,
  ]);

  // Auto-sync state: automatically syncs to Cloudflare KV and GitHub repo on changes
  const [isAutoSyncActive, setIsAutoSyncActive] = useState<boolean>(() => {
    const saved = localStorage.getItem('minimo_auto_sync');
    return saved !== null ? saved === 'true' : true;
  });

  useEffect(() => {
    localStorage.setItem('minimo_auto_sync', isAutoSyncActive.toString());
  }, [isAutoSyncActive]);

  // Export full platform data as formatted JSON string
  const exportFullBackup = (): string => {
    const state = latestDataRef.current || {
      seriesList,
      allUsers,
      comments,
      notifications,
      directMessages,
      communityMessages,
      watchProgressList,
      seriesRequests,
      customGenres,
    };
    const backupData = {
      app: 'Minimo Series',
      version: '2.5.0',
      exportedAt: new Date().toISOString(),
      exportedBy: currentUser?.email || currentUser?.displayName || 'admin',
      data: {
        seriesList: state.seriesList,
        allUsers: state.allUsers,
        comments: state.comments,
        notifications: state.notifications,
        directMessages: state.directMessages,
        communityMessages: state.communityMessages,
        watchProgressList: state.watchProgressList,
        seriesRequests: state.seriesRequests,
        customGenres: state.customGenres,
      },
      stats: {
        seriesCount: state.seriesList.length,
        episodesCount: state.seriesList.reduce((acc, s) => acc + s.episodes.length, 0),
        commentsCount: state.comments.length,
        usersCount: state.allUsers.length,
        directMessagesCount: state.directMessages.length,
        communityMessagesCount: state.communityMessages.length,
      },
    };
    return JSON.stringify(backupData, null, 2);
  };

  // Import full platform data from JSON string
  const importFullBackup = (
    jsonData: string
  ): { success: boolean; message: string; stats?: { seriesCount: number; userCount: number; commentsCount: number } } => {
    try {
      const parsed = JSON.parse(jsonData);
      const data = parsed.data || parsed;
      const incomingSeries = data.seriesList || data.series;
      const incomingUsers = data.allUsers || data.users;
      const incomingComments = data.comments;
      const incomingDms = data.directMessages || data.dms;
      const incomingCommunity = data.communityMessages || data.communityChat;

      if (!incomingSeries || !Array.isArray(incomingSeries)) {
        return { success: false, message: 'Geçersiz yedek dosyası formatı. Dizi verisi bulunamadı.' };
      }

      if (Array.isArray(incomingSeries)) setSeriesList(incomingSeries);
      if (Array.isArray(incomingUsers)) {
        // Ensure semajim30@gmail.com is present with full admin rights
        const hasAdmin = incomingUsers.some((u: User) => u.email === 'semajim30@gmail.com');
        const usersToSave = hasAdmin ? incomingUsers : [INITIAL_USERS[0], ...incomingUsers];
        setAllUsers(usersToSave);
      }
      if (Array.isArray(incomingComments)) setComments(incomingComments);
      if (Array.isArray(data.notifications)) setNotifications(data.notifications);
      if (Array.isArray(incomingDms)) setDirectMessages(incomingDms);
      if (Array.isArray(incomingCommunity)) setCommunityMessages(incomingCommunity);
      if (Array.isArray(data.watchProgressList)) setWatchProgressList(data.watchProgressList);
      if (Array.isArray(data.seriesRequests)) setSeriesRequests(data.seriesRequests);
      if (Array.isArray(data.customGenres)) setCustomGenres(data.customGenres);

      return {
        success: true,
        message: 'Yedekleme başarıyla geri yüklendi! Tüm diziler, üyeler, profil resimleri, yorumlar ve mesajlar senkronize edildi.',
        stats: {
          seriesCount: incomingSeries?.length || 0,
          userCount: incomingUsers?.length || 0,
          commentsCount: incomingComments?.length || 0,
        },
      };
    } catch {
      return { success: false, message: 'Yedek dosyası okunamadı veya JSON yapısı bozuk.' };
    }
  };

  // Sync to Cloudflare KV & GitHub
  const syncToCloudflareAndGithub = async (customPayload?: any) => {
    try {
      const cfUrl = localStorage.getItem('minimo_cf_sync_url') || '/api/backup';
      const rawData = customPayload || JSON.parse(exportFullBackup());
      const res = await fetch(cfUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(rawData),
      });
      const data = await res.json();
      const nowStr = new Date().toLocaleTimeString('tr-TR');
      localStorage.setItem('minimo_cf_last_sync', nowStr);
      return {
        success: data.success !== false,
        message: data.message || `Cloudflare & GitHub senkronize edildi (${nowStr})`,
        githubCommitUrl: data.githubCommitUrl,
      };
    } catch (err: any) {
      return { success: false, message: err?.message || 'Senkronizasyon hatası' };
    }
  };

  // Debounced auto-sync scheduler to prevent flooding Cloudflare/GitHub on fast typing or multiple actions
  const syncDebounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  const scheduleAutoSync = (delayMs: number = 2000) => {
    if (!isAutoSyncActive) return;
    if (syncDebounceTimerRef.current) {
      clearTimeout(syncDebounceTimerRef.current);
    }
    syncDebounceTimerRef.current = setTimeout(() => {
      syncToCloudflareAndGithub();
    }, delayMs);
  };

  const toggleTheme = () => {
    setIsDarkMode(prev => !prev);
  };

  const toggleNsfw = () => {
    setIsNsfwEnabled(prev => !prev);
  };

  const switchUser = (userId: string) => {
    setCurrentUserId(userId);
  };

  const openReelsPlayer = (seriesId: string, episodeId?: string) => {
    const targetSeries = seriesList.find(s => s.id === seriesId);
    if (!targetSeries) return;
    setSelectedSeriesId(seriesId);
    if (episodeId) {
      setSelectedEpisodeId(episodeId);
    } else if (targetSeries.episodes.length > 0) {
      setSelectedEpisodeId(targetSeries.episodes[0].id);
    }
    setActiveView('reels');
  };

  const nextEpisode = () => {
    if (!selectedSeries || selectedSeries.episodes.length === 0) return;
    const currentIndex = selectedSeries.episodes.findIndex(e => e.id === selectedEpisodeId);
    if (currentIndex < selectedSeries.episodes.length - 1) {
      setSelectedEpisodeId(selectedSeries.episodes[currentIndex + 1].id);
    } else {
      // Loop to next available series or loop back to episode 1
      const currentSeriesIdx = seriesList.findIndex(s => s.id === selectedSeries.id);
      const nextSeriesIdx = (currentSeriesIdx + 1) % seriesList.length;
      const nextSeries = seriesList[nextSeriesIdx];
      setSelectedSeriesId(nextSeries.id);
      if (nextSeries.episodes.length > 0) {
        setSelectedEpisodeId(nextSeries.episodes[0].id);
      }
    }
  };

  const prevEpisode = () => {
    if (!selectedSeries || selectedSeries.episodes.length === 0) return;
    const currentIndex = selectedSeries.episodes.findIndex(e => e.id === selectedEpisodeId);
    if (currentIndex > 0) {
      setSelectedEpisodeId(selectedSeries.episodes[currentIndex - 1].id);
    }
  };

  const jumpToEpisode = (episodeId: string) => {
    setSelectedEpisodeId(episodeId);
  };

  // Follow / Unfollow user with notifications
  const followUser = (targetUserId: string) => {
    if (!isLoggedIn || !currentUserId || currentUser.id === 'guest') {
      setIsAuthModalOpen(true);
      return;
    }
    if (targetUserId === currentUser.id) return;

    setAllUsers(prevUsers => {
      return prevUsers.map(u => {
        if (u.id === currentUser.id) {
          const isFollowing = u.followingUserIds.includes(targetUserId);
          const updatedFollowing = isFollowing
            ? u.followingUserIds.filter(id => id !== targetUserId)
            : [...u.followingUserIds, targetUserId];

          return {
            ...u,
            followingCount: updatedFollowing.length,
            followingUserIds: updatedFollowing,
          };
        }
        if (u.id === targetUserId) {
          const isFollowedByMe = currentUser.followingUserIds.includes(targetUserId);
          const delta = isFollowedByMe ? -1 : 1;
          return {
            ...u,
            followersCount: Math.max(0, u.followersCount + delta),
          };
        }
        return u;
      });
    });

    const isCurrentlyFollowing = currentUser.followingUserIds.includes(targetUserId);
    if (!isCurrentlyFollowing) {
      // Create notification for target user
      const newNotif: Notification = {
        id: `notif-${Date.now()}`,
        recipientId: targetUserId,
        type: 'follow',
        actorId: currentUser.id,
        actorName: currentUser.displayName,
        actorAvatar: currentUser.avatar,
        message: `@${currentUser.username} seni takip etmeye başladı.`,
        createdAt: 'Az önce',
        isRead: false,
      };
      setNotifications(prev => [newNotif, ...prev]);
      scheduleAutoSync(2000);
    }
  };

  // Comment Actions
  const addComment = (episodeId: string, seriesId: string, content: string) => {
    if (!content.trim()) return;
    const series = seriesList.find(s => s.id === seriesId);
    const episode = series?.episodes.find(e => e.id === episodeId);

    const newComment: Comment = {
      id: `comment-${Date.now()}`,
      seriesId,
      seriesTitle: series?.title || 'Dizi',
      episodeId,
      episodeNumber: episode?.episodeNumber || 1,
      userId: currentUser.id,
      userName: currentUser.displayName,
      userAvatar: currentUser.avatar,
      content: content.trim(),
      createdAt: 'Az önce',
      likes: 0,
      replies: [],
    };

    setComments(prev => [newComment, ...prev]);

    // Update episode comment count
    setSeriesList(prev =>
      prev.map(s => {
        if (s.id !== seriesId) return s;
        return {
          ...s,
          episodes: s.episodes.map(e =>
            e.id === episodeId ? { ...e, commentCount: e.commentCount + 1 } : e
          ),
        };
      })
    );
    scheduleAutoSync(2000);
  };

  const replyToComment = (commentId: string, content: string) => {
    if (!content.trim()) return;
    const parentComment = comments.find(c => c.id === commentId);
    if (!parentComment) return;

    const newReply = {
      id: `reply-${Date.now()}`,
      commentId,
      userId: currentUser.id,
      userName: currentUser.displayName,
      userAvatar: currentUser.avatar,
      content: content.trim(),
      createdAt: 'Az önce',
    };

    setComments(prev =>
      prev.map(c => (c.id === commentId ? { ...c, replies: [...c.replies, newReply] } : c))
    );

    // Send notification to the comment owner if not self
    if (parentComment.userId !== currentUser.id) {
      const newNotif: Notification = {
        id: `notif-${Date.now()}`,
        recipientId: parentComment.userId,
        type: 'comment_reply',
        actorId: currentUser.id,
        actorName: currentUser.displayName,
        actorAvatar: currentUser.avatar,
        message: `yorumuna yanıt verdi: "${content.slice(0, 35)}..."`,
        seriesId: parentComment.seriesId,
        episodeId: parentComment.episodeId,
        createdAt: 'Az önce',
        isRead: false,
      };
      setNotifications(prev => [newNotif, ...prev]);
    }
    scheduleAutoSync(2000);
  };

  const deleteComment = (commentId: string) => {
    // Only admin or authorized moderator
    if (currentUser.role !== 'admin' && currentUser.role !== 'moderator' && !currentUser.isAuthorizedStaff) {
      alert('Bu işlemi gerçekleştirmek için yönetici yetkisi gereklidir.');
      return;
    }
    setComments(prev => prev.filter(c => c.id !== commentId));
    scheduleAutoSync(1500);
  };

  // Publish Series (Admin / Authorized Staff only)
  const publishSeries = (seriesData: Omit<Series, 'id' | 'viewCount' | 'likeCount' | 'slug'>) => {
    if (currentUser.role !== 'admin' && currentUser.role !== 'moderator' && !currentUser.isAuthorizedStaff) {
      alert('Dizi yayınlama yetkiniz bulunmamaktadır.');
      return;
    }

    const newId = `s-${Date.now()}`;
    const slug = seriesData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const newSeries: Series = {
      ...seriesData,
      id: newId,
      slug,
      viewCount: 1,
      likeCount: 0,
      episodes: seriesData.episodes.map((ep, idx) => ({
        ...ep,
        id: `ep-${newId}-${idx + 1}`,
        seriesId: newId,
        episodeNumber: idx + 1,
        likeCount: 0,
        commentCount: 0,
      })),
    };

    setSeriesList(prev => [newSeries, ...prev]);

    // Send notification to all followers / community
    const notif: Notification = {
      id: `notif-pub-${Date.now()}`,
      recipientId: 'u-semajim',
      type: 'series_published',
      actorId: currentUser.id,
      actorName: currentUser.displayName,
      actorAvatar: currentUser.avatar,
      message: `Yeni dizi yayınlandı: "${newSeries.title}" yayında!`,
      seriesId: newSeries.id,
      episodeId: newSeries.episodes[0]?.id,
      createdAt: 'Az önce',
      isRead: false,
    };
    setNotifications(prev => [notif, ...prev]);

    scheduleAutoSync(1000);
  };

  // Delete Series (Admin / Authorized Staff only)
  const deleteSeries = (seriesId: string) => {
    const isSuperAdmin = currentUser.email === 'semajim30@gmail.com';
    const isStaff = currentUser.isAuthorizedStaff || currentUser.role === 'admin';
    if (!isSuperAdmin && !isStaff) {
      alert('Dizi silme yetkiniz bulunmamaktadır.');
      return;
    }

    setSeriesList(prev => prev.filter(s => s.id !== seriesId));
    // Clean up associated watch progress
    setWatchProgressList(prev => prev.filter(wp => wp.seriesId !== seriesId));
    // Clean up associated comments
    setComments(prev => prev.filter(c => c.seriesId !== seriesId));
    // Fallback selection if currently viewing deleted series
    setSelectedSeriesId(prev => {
      if (prev === seriesId) {
        const remaining = seriesList.filter(s => s.id !== seriesId);
        return remaining.length > 0 ? remaining[0].id : '';
      }
      return prev;
    });

    scheduleAutoSync(1000);
  };

  // Create named snapshot
  const createNamedSnapshot = (name: string) => {
    const rawBackup = exportFullBackup();
    const newSnapshot: BackupSnapshot = {
      id: `snap-${Date.now()}`,
      name: name.trim() || `Yedek Noktası (${new Date().toLocaleDateString('tr-TR')} ${new Date().toLocaleTimeString('tr-TR')})`,
      createdAt: new Date().toLocaleString('tr-TR'),
      sizeBytes: new Blob([rawBackup]).size,
      data: rawBackup,
      stats: {
        seriesCount: seriesList.length,
        episodesCount: seriesList.reduce((acc, s) => acc + s.episodes.length, 0),
        commentsCount: comments.length,
        usersCount: allUsers.length,
      },
    };
    setSnapshots(prev => [newSnapshot, ...prev]);
  };

  // Restore snapshot
  const restoreSnapshot = (snapshotId: string): boolean => {
    const snap = snapshots.find(s => s.id === snapshotId);
    if (!snap) return false;
    const res = importFullBackup(snap.data);
    return res.success;
  };

  // Delete snapshot
  const deleteSnapshot = (snapshotId: string) => {
    setSnapshots(prev => prev.filter(s => s.id !== snapshotId));
  };

  // Initial load auto-fetch: If device has empty series list, attempt fetching from Cloudflare KV or GitHub
  useEffect(() => {
    const fetchLatestEdgeBackup = async () => {
      try {
        const localSaved = localStorage.getItem('minimo_series');
        const localParsed = localSaved ? JSON.parse(localSaved) : [];
        if (!localParsed || localParsed.length === 0) {
          const cfUrl = localStorage.getItem('minimo_cf_sync_url') || '/api/backup';
          const res = await fetch(cfUrl);
          if (!res.ok) return;
          const json = await res.json();
          const payload = json.data || json;
          if (payload?.seriesList && Array.isArray(payload.seriesList) && payload.seriesList.length > 0) {
            importFullBackup(JSON.stringify(payload));
          }
        }
      } catch {
        // offline or initial
      }
    };
    fetchLatestEdgeBackup();
  }, []);

  // Factory reset to defaults
  const resetToDefaults = () => {
    setSeriesList(INITIAL_SERIES);
    setAllUsers(INITIAL_USERS);
    setComments(INITIAL_COMMENTS);
    setNotifications(INITIAL_NOTIFICATIONS);
    setDirectMessages(INITIAL_DMS);
    setCommunityMessages(INITIAL_COMMUNITY_MESSAGES);
    setWatchProgressList(INITIAL_WATCH_PROGRESS);
    setSeriesRequests(INITIAL_SERIES_REQUESTS);
    setCustomGenres(['Bilim Kurgu', 'Romantik', 'Gerilim', 'Dram', 'Komedi', 'Gizem', 'Aksiyon']);
  };

  // Staff permission toggle - only semajim30@gmail.com can grant/revoke staff roles
  const toggleUserStaffRole = (targetUserId: string) => {
    if (currentUser.email !== 'semajim30@gmail.com') {
      alert('Yetki verme veya kaldırma işlemi yalnızca Ana Yönetici (semajim30@gmail.com) tarafından yapılabilir.');
      return;
    }
    setAllUsers(prev =>
      prev.map(u => {
        if (u.id === targetUserId) {
          const newAuth = !u.isAuthorizedStaff;
          return {
            ...u,
            isAuthorizedStaff: newAuth,
            role: newAuth ? (u.role === 'admin' ? 'admin' : 'moderator') : 'user',
          };
        }
        return u;
      })
    );
    scheduleAutoSync(1500);
  };

  // Custom Genres
  const addCustomGenre = (genre: string) => {
    const trimmed = genre.trim();
    if (!trimmed) return;
    if (!customGenres.includes(trimmed)) {
      setCustomGenres(prev => [...prev, trimmed]);
      scheduleAutoSync(2500);
    }
  };

  // Add Episode to existing series (Admin / Authorized Staff)
  const addEpisodeToSeries = (
    seriesId: string,
    episodeData: Omit<Episode, 'id' | 'seriesId' | 'likeCount' | 'commentCount'>
  ) => {
    if (currentUser.role !== 'admin' && currentUser.role !== 'moderator' && !currentUser.isAuthorizedStaff) {
      alert('Bölüm ekleme yetkiniz bulunmamaktadır.');
      return;
    }

    setSeriesList(prev =>
      prev.map(s => {
        if (s.id !== seriesId) return s;
        const nextNum = s.episodes.length + 1;
        const newEp: Episode = {
          ...episodeData,
          id: `ep-${seriesId}-${Date.now()}`,
          seriesId,
          episodeNumber: episodeData.episodeNumber || nextNum,
          likeCount: 0,
          commentCount: 0,
        };
        return {
          ...s,
          episodes: [...s.episodes, newEp],
        };
      })
    );

    const targetSeries = seriesList.find(s => s.id === seriesId);
    if (targetSeries) {
      const notif: Notification = {
        id: `notif-ep-${Date.now()}`,
        recipientId: 'u-semajim',
        type: 'series_published',
        actorId: currentUser.id,
        actorName: currentUser.displayName,
        actorAvatar: currentUser.avatar,
        message: `"${targetSeries.title}" serisine ${episodeData.title} eklendi!`,
        seriesId,
        createdAt: 'Az önce',
        isRead: false,
      };
      setNotifications(prev => [notif, ...prev]);
    }

    scheduleAutoSync(1000);
  };

  // Update user profile (Personalization & Privacy - Avatars, Bio, Name)
  const updateUserProfile = (userId: string, data: Partial<User>) => {
    setAllUsers(prev =>
      prev.map(u => (u.id === userId ? { ...u, ...data } : u))
    );
    scheduleAutoSync(1500);
  };

  // Change user password
  const changeUserPassword = (
    userId: string,
    oldPass: string,
    newPass: string
  ): { success: boolean; message: string } => {
    const user = allUsers.find(u => u.id === userId);
    if (!user) return { success: false, message: 'Kullanıcı bulunamadı.' };

    if (user.password && user.password !== oldPass) {
      return { success: false, message: 'Mevcut şifreniz hatalı.' };
    }
    if (!newPass || newPass.length < 4) {
      return { success: false, message: 'Yeni şifre en az 4 karakter olmalıdır.' };
    }

    setAllUsers(prev =>
      prev.map(u => (u.id === userId ? { ...u, password: newPass } : u))
    );
    scheduleAutoSync(1500);
    return { success: true, message: 'Şifreniz başarıyla güncellendi!' };
  };

  // Remove follower from user's followers list
  const removeFollower = (followerUserId: string) => {
    setAllUsers(prev =>
      prev.map(u => {
        if (u.id === followerUserId) {
          const updatedFollowing = u.followingUserIds.filter(id => id !== currentUser.id);
          return {
            ...u,
            followingCount: updatedFollowing.length,
            followingUserIds: updatedFollowing,
          };
        }
        if (u.id === currentUser.id) {
          return {
            ...u,
            followersCount: Math.max(0, u.followersCount - 1),
          };
        }
        return u;
      })
    );
  };

  // Block a user
  const blockUser = (targetUserId: string) => {
    if (targetUserId === currentUser.id) return;
    setAllUsers(prev =>
      prev.map(u => {
        if (u.id === currentUser.id) {
          const curBlocked = u.blockedUserIds || [];
          const updatedBlocked = curBlocked.includes(targetUserId)
            ? curBlocked
            : [...curBlocked, targetUserId];
          const updatedFollowing = u.followingUserIds.filter(id => id !== targetUserId);
          return {
            ...u,
            blockedUserIds: updatedBlocked,
            followingCount: updatedFollowing.length,
            followingUserIds: updatedFollowing,
            followersCount: Math.max(0, u.followersCount - 1),
          };
        }
        if (u.id === targetUserId) {
          const updatedFollowing = u.followingUserIds.filter(id => id !== currentUser.id);
          return {
            ...u,
            followingCount: updatedFollowing.length,
            followingUserIds: updatedFollowing,
            followersCount: Math.max(0, u.followersCount - 1),
          };
        }
        return u;
      })
    );
  };

  // Unblock a user
  const unblockUser = (targetUserId: string) => {
    setAllUsers(prev =>
      prev.map(u => {
        if (u.id === currentUser.id) {
          const updatedBlocked = (u.blockedUserIds || []).filter(id => id !== targetUserId);
          return {
            ...u,
            blockedUserIds: updatedBlocked,
          };
        }
        return u;
      })
    );
  };

  // Direct Messages
  const sendDirectMessage = (receiverId: string, text: string) => {
    if (!text.trim()) return;
    const newMsg: DirectMessage = {
      id: `dm-${Date.now()}`,
      senderId: currentUser.id,
      receiverId,
      text: text.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isRead: false,
    };
    setDirectMessages(prev => [...prev, newMsg]);

    // Simulate instant reply if chatting with another user
    if (receiverId !== currentUser.id) {
      setTimeout(() => {
        const replyMsg: DirectMessage = {
          id: `dm-rep-${Date.now()}`,
          senderId: receiverId,
          receiverId: currentUser.id,
          text: 'Mesajını aldım! Minimo Series harika bir platform, reels akışında görüşmek üzere 🍿🎬',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          isRead: false,
        };
        setDirectMessages(prev => [...prev, replyMsg]);
        scheduleAutoSync(2500);
      }, 1200);
    }
    scheduleAutoSync(2500);
  };

  // Community Chat
  const sendCommunityMessage = (text: string, seriesMention?: string) => {
    if (!text.trim()) return;
    const newChat: CommunityChatMessage = {
      id: `chat-${Date.now()}`,
      userId: currentUser.id,
      userName: currentUser.displayName,
      userAvatar: currentUser.avatar,
      role: currentUser.role,
      text: text.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      seriesMention,
    };
    setCommunityMessages(prev => [...prev, newChat]);
    scheduleAutoSync(2500);
  };

  const markNotificationsAsRead = () => {
    setNotifications(prev =>
      prev.map(n => (n.recipientId === currentUser.id ? { ...n, isRead: true } : n))
    );
  };

  const toggleBookmark = (seriesId: string) => {
    setAllUsers(prev =>
      prev.map(u => {
        if (u.id === currentUser.id) {
          const isBookmarked = u.bookmarkedSeriesIds.includes(seriesId);
          return {
            ...u,
            bookmarkedSeriesIds: isBookmarked
              ? u.bookmarkedSeriesIds.filter(id => id !== seriesId)
              : [...u.bookmarkedSeriesIds, seriesId],
          };
        }
        return u;
      })
    );
  };

  const toggleLikeEpisode = (episodeId: string) => {
    setAllUsers(prev =>
      prev.map(u => {
        if (u.id === currentUser.id) {
          const isLiked = u.likedEpisodeIds.includes(episodeId);
          return {
            ...u,
            likedEpisodeIds: isLiked
              ? u.likedEpisodeIds.filter(id => id !== episodeId)
              : [...u.likedEpisodeIds, episodeId],
          };
        }
        return u;
      })
    );

    // Update episode like count
    setSeriesList(prev =>
      prev.map(s => ({
        ...s,
        episodes: s.episodes.map(e => {
          if (e.id === episodeId) {
            const isLiked = currentUser.likedEpisodeIds.includes(episodeId);
            return {
              ...e,
              likeCount: Math.max(0, e.likeCount + (isLiked ? -1 : 1)),
            };
          }
          return e;
        }),
      }))
    );
  };

  const openDmWithUser = (userId: string) => {
    setActiveDmUserId(userId);
    setIsDmModalOpen(true);
  };

  const closeDmModal = () => {
    setIsDmModalOpen(false);
    setActiveDmUserId(null);
  };

  const viewUserProfile = (user: User) => {
    setActiveProfileUser(user);
    setActiveView('profile');
  };

  const closeUserProfile = () => {
    setActiveProfileUser(null);
  };

  const openInfoModal = (modal: 'about' | 'copyright' | 'contact' | null) => {
    setActiveInfoModal(modal);
  };

  const updateWatchProgress = (
    seriesId: string,
    episodeId: string,
    episodeNumber: number,
    currentTimeSec: number,
    durationSec: number
  ) => {
    setWatchProgressList(prev => {
      const filtered = prev.filter(p => !(p.seriesId === seriesId && p.episodeId === episodeId));
      const newEntry: WatchProgress = {
        seriesId,
        episodeId,
        episodeNumber,
        currentTimeSec: Math.floor(currentTimeSec),
        durationSec: Math.floor(durationSec),
        updatedAt: 'Az önce',
      };
      return [newEntry, ...filtered].slice(0, 20);
    });
  };

  const resumeProgress = (seriesId: string, episodeId: string) => {
    openReelsPlayer(seriesId, episodeId);
  };

  const addSeriesRequest = (title: string, genre: string, description: string) => {
    if (!title.trim() || !description.trim()) return;
    const newReq: SeriesRequest = {
      id: `req-${Date.now()}`,
      userId: currentUser.id,
      userName: currentUser.displayName,
      userAvatar: currentUser.avatar,
      title: title.trim(),
      genre: genre.trim() || 'Dram',
      description: description.trim(),
      upvotes: 1,
      upvotedByUserIds: [currentUser.id],
      status: 'İnceleniyor',
      createdAt: 'Az önce',
    };
    setSeriesRequests(prev => [newReq, ...prev]);

    // Send notification
    const notif: Notification = {
      id: `notif-req-${Date.now()}`,
      recipientId: 'u-semajim',
      type: 'system',
      actorId: currentUser.id,
      actorName: currentUser.displayName,
      actorAvatar: currentUser.avatar,
      message: `yeni bir dizi talebinde bulundu: "${newReq.title}"`,
      createdAt: 'Az önce',
      isRead: false,
    };
    setNotifications(prev => [notif, ...prev]);
  };

  const upvoteSeriesRequest = (requestId: string) => {
    setSeriesRequests(prev =>
      prev.map(r => {
        if (r.id !== requestId) return r;
        const hasUpvoted = r.upvotedByUserIds.includes(currentUser.id);
        const updatedUserIds = hasUpvoted
          ? r.upvotedByUserIds.filter(id => id !== currentUser.id)
          : [...r.upvotedByUserIds, currentUser.id];
        return {
          ...r,
          upvotes: Math.max(0, r.upvotes + (hasUpvoted ? -1 : 1)),
          upvotedByUserIds: updatedUserIds,
        };
      })
    );
  };

  const logout = () => {
    setIsLoggedIn(false);
    setCurrentUserId('');
    localStorage.setItem('minimo_is_logged_in', 'false');
    localStorage.removeItem('minimo_current_user_id');
    localStorage.removeItem('minimo_user_manually_logged_in');
    if (activeView === 'admin' || activeView === 'profile') {
      setActiveView('home');
    }
  };

  const login = (email: string, pass?: string): { success: boolean; message: string } => {
    const cleanEmail = email.trim().toLowerCase();
    const user = allUsers.find(u => u.email.toLowerCase() === cleanEmail);
    if (!user) {
      if (cleanEmail === 'semajim30@gmail.com') {
        const rootAdmin = INITIAL_USERS[0];
        setAllUsers(prev => [rootAdmin, ...prev.filter(u => u.email !== 'semajim30@gmail.com')]);
        setCurrentUserId(rootAdmin.id);
        setIsLoggedIn(true);
        localStorage.setItem('minimo_current_user_id', rootAdmin.id);
        localStorage.setItem('minimo_is_logged_in', 'true');
        localStorage.setItem('minimo_user_manually_logged_in', 'true');
        return { success: true, message: 'Giriş başarılı! Hoş geldiniz.' };
      }
      return { success: false, message: 'Bu e-posta adresi ile kayıtlı hesap bulunamadı.' };
    }

    if (user.password && pass && user.password !== pass) {
      return { success: false, message: 'Girdiğiniz şifre hatalı.' };
    }

    setCurrentUserId(user.id);
    setIsLoggedIn(true);
    localStorage.setItem('minimo_current_user_id', user.id);
    localStorage.setItem('minimo_is_logged_in', 'true');
    localStorage.setItem('minimo_user_manually_logged_in', 'true');
    return { success: true, message: `Hoş geldiniz, ${user.displayName}!` };
  };

  const register = (displayName: string, email: string, password?: string): { success: boolean; message: string } => {
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !displayName.trim()) {
      return { success: false, message: 'Lütfen isim ve geçerli bir e-posta girin.' };
    }
    if (allUsers.some(u => u.email.toLowerCase() === cleanEmail)) {
      return { success: false, message: 'Bu e-posta adresi zaten kullanımda.' };
    }

    const newUser: User = {
      id: `u-${Date.now()}`,
      email: cleanEmail,
      username: cleanEmail.split('@')[0].replace(/[^a-zA-Z0-9_]/g, '') || `user_${Date.now().toString().slice(-4)}`,
      displayName: displayName.trim(),
      avatar: `https://api.dicebear.com/7.x/identicon/svg?seed=${cleanEmail}`,
      bio: 'Yeni Minimo Series üyesi 🍿',
      role: 'user',
      followersCount: 0,
      followingCount: 0,
      followingUserIds: [],
      bookmarkedSeriesIds: [],
      likedEpisodeIds: [],
      isAuthorizedStaff: false,
      password: password || undefined,
    };

    setAllUsers(prev => [...prev, newUser]);
    setCurrentUserId(newUser.id);
    setIsLoggedIn(true);
    localStorage.setItem('minimo_current_user_id', newUser.id);
    localStorage.setItem('minimo_is_logged_in', 'true');
    localStorage.setItem('minimo_user_manually_logged_in', 'true');
    scheduleAutoSync(1500);
    return { success: true, message: `Hesabınız başarıyla oluşturuldu! Hoş geldiniz, ${newUser.displayName}.` };
  };

  const resetPasswordWithEmail = (email: string, newPass: string): { success: boolean; message: string } => {
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail) {
      return { success: false, message: 'Lütfen geçerli bir e-posta adresi girin.' };
    }
    if (!newPass || newPass.length < 4) {
      return { success: false, message: 'Yeni şifreniz en az 4 karakter olmalıdır.' };
    }

    let targetUser = allUsers.find(u => u.email.toLowerCase() === cleanEmail);

    if (!targetUser && cleanEmail === 'semajim30@gmail.com') {
      const rootAdmin = { ...INITIAL_USERS[0], password: newPass };
      setAllUsers(prev => [rootAdmin, ...prev.filter(u => u.email !== 'semajim30@gmail.com')]);
      setCurrentUserId(rootAdmin.id);
      setIsLoggedIn(true);
      localStorage.setItem('minimo_current_user_id', rootAdmin.id);
      localStorage.setItem('minimo_is_logged_in', 'true');
      scheduleAutoSync(1500);
      return { success: true, message: 'Şifreniz başarıyla yenilendi! Hoş geldiniz.' };
    }

    if (!targetUser) {
      return { success: false, message: 'Bu e-posta adresiyle kayıtlı bir hesap bulunamadı.' };
    }

    setAllUsers(prev =>
      prev.map(u => (u.id === targetUser!.id ? { ...u, password: newPass } : u))
    );
    setCurrentUserId(targetUser.id);
    setIsLoggedIn(true);
    localStorage.setItem('minimo_current_user_id', targetUser.id);
    localStorage.setItem('minimo_is_logged_in', 'true');
    scheduleAutoSync(1500);
    return { success: true, message: 'Şifreniz başarıyla güncellendi ve giriş yapıldı!' };
  };

  const loginWithGoogle = (email: string, name?: string, avatar?: string): { success: boolean; message: string } => {
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail) {
      return { success: false, message: 'Geçerli bir Google hesabı gereklidir.' };
    }

    let user = allUsers.find(u => u.email.toLowerCase() === cleanEmail);
    if (!user) {
      const isSuper = cleanEmail === 'semajim30@gmail.com';
      const displayName = name || cleanEmail.split('@')[0];
      const newUser: User = {
        id: isSuper ? 'u-semajim' : `u-${Date.now()}`,
        email: cleanEmail,
        username: cleanEmail.split('@')[0].replace(/[^a-zA-Z0-9_]/g, '') || `user_${Date.now().toString().slice(-4)}`,
        displayName,
        avatar: avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
        bio: 'Google ile bağlandı 🎬',
        role: isSuper ? 'admin' : 'user',
        followersCount: 0,
        followingCount: 0,
        followingUserIds: [],
        bookmarkedSeriesIds: [],
        likedEpisodeIds: [],
        isAuthorizedStaff: isSuper,
      };
      setAllUsers(prev => [newUser, ...prev]);
      user = newUser;
      scheduleAutoSync(1500);
    }

    setCurrentUserId(user.id);
    setIsLoggedIn(true);
    localStorage.setItem('minimo_current_user_id', user.id);
    localStorage.setItem('minimo_is_logged_in', 'true');
    return { success: true, message: `Google ile başarıyla giriş yapıldı: ${user.displayName}` };
  };

  const getRandomSeries = (): Series | null => {
    if (seriesList.length === 0) return null;
    const pool = isNsfwEnabled ? seriesList : seriesList.filter(s => !s.isNsfw);
    const safePool = pool.length > 0 ? pool : seriesList;
    const randomIndex = Math.floor(Math.random() * safePool.length);
    return safePool[randomIndex] || seriesList[0] || null;
  };

  return (
    <AppContext.Provider
      value={{
        seriesList,
        currentUser,
        allUsers,
        isNsfwEnabled,
        isDarkMode,
        activeView,
        selectedSeries,
        currentEpisode,
        comments,
        notifications,
        unreadNotifsCount,
        directMessages,
        communityMessages,
        watchProgressList,
        seriesRequests,
        isDmModalOpen,
        activeDmUserId,
        activeProfileUser,
        activeInfoModal,
        isAdvancedSearchOpen,
        setIsAdvancedSearchOpen,
        isLoggedIn,
        isAuthModalOpen,
        setIsAuthModalOpen,
        login,
        register,
        resetPasswordWithEmail,
        loginWithGoogle,
        logout,
        setActiveView,
        openReelsPlayer,
        nextEpisode,
        prevEpisode,
        jumpToEpisode,
        toggleNsfw,
        toggleTheme,
        switchUser,
        followUser,
        addComment,
        replyToComment,
        deleteComment,
        publishSeries,
        toggleUserStaffRole,
        sendDirectMessage,
        sendCommunityMessage,
        updateWatchProgress,
        addSeriesRequest,
        upvoteSeriesRequest,
        getRandomSeries,
        resumeProgress,
        markNotificationsAsRead,
        toggleBookmark,
        toggleLikeEpisode,
        openDmWithUser,
        closeDmModal,
        setIsDmModalOpen,
        viewUserProfile,
        closeUserProfile,
        customGenres,
        addCustomGenre,
        addEpisodeToSeries,
        updateUserProfile,
        changeUserPassword,
        removeFollower,
        blockUser,
        unblockUser,
        openInfoModal,
        deleteSeries,
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
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
