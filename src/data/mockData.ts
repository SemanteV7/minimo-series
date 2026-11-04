import { Series, User, Comment, Notification, DirectMessage, CommunityChatMessage } from '../types';

export const MASCOT_IMAGE_URL = '/src/assets/images/minimo_mascot_avatar_1793087004479.jpg';
export const ISOLATED_MASCOT = '/src/assets/images/minimo_mascot_isolated_1793088133161.jpg';

// Preset template asset URLs for admin convenience
export const CYBER_POSTER = 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&auto=format&fit=crop&q=80';
export const ROMANCE_POSTER = 'https://images.unsplash.com/photo-1518895949257-7621c3c786d7?w=800&auto=format&fit=crop&q=80';
export const AGENT_POSTER = 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=800&auto=format&fit=crop&q=80';

export const SAMPLE_VIDEOS = [
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
];

// Production Ready Initial Data: Clean slate for live deployment
// All demo series, demo episodes, demo comments, and demo chats are cleared.
export const INITIAL_SERIES: Series[] = [];

export const INITIAL_USERS: User[] = [
  {
    id: 'u-semajim',
    email: 'semajim30@gmail.com',
    username: 'semajim',
    displayName: 'Sema',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    bio: 'Minimo Series Kurucusu & Baş Yöneticisi 🎬',
    role: 'admin',
    followersCount: 0,
    followingCount: 0,
    followingUserIds: [],
    bookmarkedSeriesIds: [],
    likedEpisodeIds: [],
    isAuthorizedStaff: true,
  },
  {
    id: 'u-wattyboon',
    email: 'wattyboontr@gmail.com',
    username: 'wattyboon',
    displayName: 'Watty Boon',
    avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=Watty+Boon&backgroundColor=6366f1&textColor=ffffff',
    bio: 'Minimo Series Üyesi 🍿',
    role: 'user',
    followersCount: 0,
    followingCount: 0,
    followingUserIds: [],
    bookmarkedSeriesIds: [],
    likedEpisodeIds: [],
    isAuthorizedStaff: false,
  },
];

export const INITIAL_COMMENTS: Comment[] = [];

export const INITIAL_NOTIFICATIONS: Notification[] = [];

export const INITIAL_DMS: DirectMessage[] = [];

export const INITIAL_COMMUNITY_MESSAGES: CommunityChatMessage[] = [];
