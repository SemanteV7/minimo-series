export interface Episode {
  id: string;
  seriesId: string;
  episodeNumber: number;
  title: string;
  durationSec: number;
  videoUrl: string;
  synopsis?: string;
  likeCount: number;
  commentCount: number;
  thumbnailUrl?: string;
  tags?: string[];
}

export interface BackupSnapshot {
  id: string;
  name: string;
  createdAt: string;
  sizeBytes: number;
  data: string;
  stats: {
    seriesCount: number;
    episodesCount: number;
    commentsCount: number;
    usersCount: number;
  };
}

export type SeriesPlatform = 'Netshot' | 'DramaWave' | 'ReelShort' | 'DramaBox' | 'Diğer';
export type AgeRating = 'Genel İzleyici' | '13+' | '16+' | '18+';

export interface Series {
  id: string;
  title: string;
  slug: string;
  description: string;
  genre: string; // Dynamic genres (allows custom genres created by admin)
  coverUrl: string;
  bannerUrl: string;
  releaseYear: number;
  rating: string; // e.g. "9.4"
  isNsfw: boolean;
  ageRating?: AgeRating;
  platform?: SeriesPlatform;
  viewCount: number;
  likeCount: number;
  director: string;
  episodes: Episode[];
  featured?: boolean;
  tags?: string[];
}

export interface CommentReply {
  id: string;
  commentId: string;
  userId: string;
  userName: string;
  userAvatar: string;
  content: string;
  createdAt: string;
}

export interface Comment {
  id: string;
  seriesId: string;
  seriesTitle?: string;
  episodeId: string;
  episodeNumber: number;
  userId: string;
  userName: string;
  userAvatar: string;
  content: string;
  createdAt: string;
  likes: number;
  replies: CommentReply[];
}

export interface User {
  id: string;
  email: string;
  username: string;
  displayName: string;
  avatar: string;
  bio: string;
  role: 'admin' | 'moderator' | 'user';
  followersCount: number;
  followingCount: number;
  followingUserIds: string[];
  bookmarkedSeriesIds: string[];
  likedEpisodeIds: string[];
  isAuthorizedStaff?: boolean;
  // Personalization, Privacy & Security
  bannerUrl?: string;
  customMood?: string;
  isPrivateAccount?: boolean;
  hideWatchHistory?: boolean;
  dmPrivacy?: 'everyone' | 'followers' | 'none';
  blockedUserIds?: string[];
  password?: string;
}

export interface Notification {
  id: string;
  recipientId: string;
  type: 'follow' | 'comment_reply' | 'series_published' | 'system';
  actorId: string;
  actorName: string;
  actorAvatar: string;
  message: string;
  seriesId?: string;
  episodeId?: string;
  createdAt: string;
  isRead: boolean;
}

export interface DirectMessage {
  id: string;
  senderId: string;
  receiverId: string;
  text: string;
  timestamp: string;
  isRead: boolean;
}

export interface CommunityChatMessage {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  role: 'admin' | 'moderator' | 'user';
  text: string;
  timestamp: string;
  seriesMention?: string;
}

export interface WatchProgress {
  seriesId: string;
  episodeId: string;
  episodeNumber: number;
  currentTimeSec: number;
  durationSec: number;
  updatedAt: string;
}

export interface SeriesRequest {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  title: string;
  genre: string;
  description: string;
  upvotes: number;
  upvotedByUserIds: string[];
  status: 'İnceleniyor' | 'Çekim Aşamasında' | 'Yayında';
  createdAt: string;
}

export type ActiveView = 'home' | 'reels' | 'community' | 'library' | 'admin' | 'profile';
