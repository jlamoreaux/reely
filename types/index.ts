import { Id } from '../convex/_generated/dataModel';

// User Types
export interface User {
  _id: Id<'users'>;
  clerkId?: string;
  username: string;
  displayName: string;
  bio?: string;
  profileImage?: string;
  isVerified: boolean;
  verificationDomain?: string;
  createdAt: number;
  followerCount: number;
  followingCount: number;
  videoCount: number;
  settings: UserSettings;
}

export interface UserSettings {
  isPrivate: boolean;
  allowMessages: boolean;
  allowComments: boolean;
}

export interface UserProfile extends User {
  isFollowing?: boolean;
  isFollower?: boolean;
}

// Video Types
export interface Video {
  _id: Id<'videos'>;
  userId: Id<'users'>;
  videoUrl: string;
  thumbnailUrl: string;
  duration: number;
  description?: string;
  viewCount: number;
  likeCount: number;
  commentCount: number;
  shareCount: number;
  isDeleted: boolean;
  createdAt: number;
  metadata: VideoMetadata;
  // Relations (populated on fetch)
  user?: User;
  isLiked?: boolean;
  isBookmarked?: boolean;
}

export interface VideoMetadata {
  deviceType: string;
  appVersion: string;
  recordedAt: number;
}

export interface VideoUpload {
  videoData: string; // Base64 or blob reference
  thumbnailTimestamp: number;
  duration: number;
  description?: string;
  deviceMetadata: {
    deviceType: string;
    appVersion: string;
  };
}

// Social Types
export interface Follow {
  _id: Id<'follows'>;
  followerId: Id<'users'>;
  followingId: Id<'users'>;
  createdAt: number;
  // Relations
  follower?: User;
  following?: User;
}

export interface Like {
  _id: Id<'likes'>;
  userId: Id<'users'>;
  videoId: Id<'videos'>;
  createdAt: number;
  // Relations
  user?: User;
  video?: Video;
}

export interface Comment {
  _id: Id<'comments'>;
  userId: Id<'users'>;
  videoId: Id<'videos'>;
  content: string;
  parentId?: Id<'comments'>;
  likeCount: number;
  createdAt: number;
  isDeleted: boolean;
  // Relations
  user?: User;
  replies?: Comment[];
  isLiked?: boolean;
}

export interface Bookmark {
  _id: Id<'bookmarks'>;
  userId: Id<'users'>;
  videoId: Id<'videos'>;
  createdAt: number;
  // Relations
  video?: Video;
}

// Feed Types
export interface FeedItem {
  video: Video;
  engagement: {
    isLiked: boolean;
    isBookmarked: boolean;
    isFollowing: boolean;
  };
}

export interface FeedResponse {
  items: FeedItem[];
  nextCursor?: string;
  hasMore: boolean;
}

// Auth Types
export interface SignUpData {
  email: string;
  password: string;
  username: string;
  displayName: string;
}

export interface SignInData {
  email: string;
  password: string;
}

export interface AuthUser {
  id: string;
  email: string;
  username?: string;
  displayName?: string;
  profileImage?: string;
  emailVerified: boolean;
}

// API Response Types
export interface ApiResponse<T> {
  data?: T;
  error?: ApiError;
  success: boolean;
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, any>;
}

export interface PaginatedResponse<T> {
  items: T[];
  nextCursor?: string;
  previousCursor?: string;
  hasMore: boolean;
  totalCount?: number;
}

// Search Types
export interface SearchFilters {
  query: string;
  type?: 'users' | 'videos' | 'hashtags';
  verified?: boolean;
  minFollowers?: number;
}

export interface SearchResult {
  users?: User[];
  videos?: Video[];
  hashtags?: string[];
}

// Notification Types
export interface Notification {
  _id: Id<'notifications'>;
  userId: Id<'users'>;
  type: NotificationType;
  title: string;
  message: string;
  metadata?: Record<string, any>;
  read: boolean;
  createdAt: number;
}

export type NotificationType = 
  | 'follow'
  | 'like'
  | 'comment'
  | 'mention'
  | 'video_upload'
  | 'system';

// Analytics Types
export interface VideoAnalytics {
  videoId: Id<'videos'>;
  views: number;
  likes: number;
  comments: number;
  shares: number;
  averageWatchTime: number;
  completionRate: number;
  dailyViews: { date: string; count: number }[];
}

export interface UserAnalytics {
  userId: Id<'users'>;
  totalViews: number;
  totalLikes: number;
  totalFollowers: number;
  followerGrowth: { date: string; count: number }[];
  topVideos: Video[];
}

// Settings Types
export interface AppSettings {
  theme: 'light' | 'dark' | 'system';
  language: string;
  notifications: NotificationSettings;
  privacy: PrivacySettings;
}

export interface NotificationSettings {
  push: boolean;
  email: boolean;
  follows: boolean;
  likes: boolean;
  comments: boolean;
  mentions: boolean;
}

export interface PrivacySettings {
  profileVisibility: 'public' | 'private';
  allowMessages: 'everyone' | 'followers' | 'none';
  allowComments: 'everyone' | 'followers' | 'none';
  showActivityStatus: boolean;
}

// Component Props Types
export interface VideoPlayerProps {
  video: Video;
  autoPlay?: boolean;
  muted?: boolean;
  onVideoEnd?: () => void;
  onLike?: () => void;
  onComment?: () => void;
  onShare?: () => void;
}

export interface FeedProps {
  type: 'following' | 'discovery';
  userId?: Id<'users'>;
  onRefresh?: () => void;
}

export interface ProfileHeaderProps {
  user: UserProfile;
  onFollow?: () => void;
  onMessage?: () => void;
  onEdit?: () => void;
}

// Form Types
export interface ProfileEditForm {
  displayName: string;
  bio: string;
  profileImage?: File;
}

export interface VideoUploadForm {
  description: string;
  hashtags: string[];
  privacy: 'public' | 'followers';
}

// Utility Types
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
export type Required<T, K extends keyof T> = Omit<T, K> & Required<Pick<T, K>>;

// Enum Types
export enum VideoStatus {
  PROCESSING = 'processing',
  READY = 'ready',
  FAILED = 'failed',
  DELETED = 'deleted',
}

export enum UserRole {
  USER = 'user',
  VERIFIED = 'verified',
  MODERATOR = 'moderator',
  ADMIN = 'admin',
}

export enum ReportType {
  SPAM = 'spam',
  INAPPROPRIATE = 'inappropriate',
  COPYRIGHT = 'copyright',
  HARASSMENT = 'harassment',
  FALSE_INFO = 'false_info',
  OTHER = 'other',
}