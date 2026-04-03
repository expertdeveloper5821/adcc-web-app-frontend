import api from './api';

export interface DashboardLandingStats {
  totalUsers: number;
  activeUsers: number;
  eventsThisMonth: number;
  activeTracks: number;
  activeCommunities: number;
  pendingFeedPosts: number;
  pendingStoreItems: number;
  reportedFeedPosts: number;
}

export interface CommunityStatsMonthPoint {
  month: number;
  label: string;
  count: number;
}

export interface CommunityStatsByMonth {
  year: number;
  range: { from: string; to: string };
  series: CommunityStatsMonthPoint[];
}

/** Next upcoming event as returned by GET /v1/dashboard/landing (shape may include populated relations). */
export interface DashboardLandingUpcomingEvent {
  _id?: string;
  id?: string;
  title?: string;
  name?: string;
  city?: string;
  eventDate?: string;
  eventTime?: string;
  trackId?: string;
  track?: { name?: string; title?: string } | string;
  trackName?: string;
  mainImage?: string;
  eventImage?: string;
  maxParticipants?: number;
  registrations?: number;
  rating?: number;
}

/** Track summary embedded in `tracksRankedByEvents` (landing API). */
export interface LandingTrackSummary {
  _id?: string;
  title?: string;
  titleAr?: string;
  city?: string;
  area?: string;
  country?: string;
}

export interface TrackRankedByEvents {
  eventCount: number;
  track: LandingTrackSummary;
}

export interface DashboardLandingData {
  stats: DashboardLandingStats;
  upcomingEvent: DashboardLandingUpcomingEvent | null;
  communityStatsByMonth: CommunityStatsByMonth;
  tracksRankedByEvents?: TrackRankedByEvents[];
  meta?: {
    eventsThisMonthRange?: { from: string; to: string };
  };
}

interface DashboardLandingResponse {
  success: boolean;
  message: string;
  data: DashboardLandingData;
}

export async function getDashboardLanding(): Promise<DashboardLandingData> {
  const { data } = await api.get<DashboardLandingResponse>('/v1/dashboard/landing');
  if (!data?.data) {
    throw new Error(data?.message || 'Failed to load dashboard');
  }
  return data.data;
}

/** GET /v1/dashboard/summary — shared by community manager, content manager, moderator dashboards */
export interface DashboardSummaryContent {
  activeBanners: number;
  eventsPromoted: number;
  feedPosts: number;
  featuredStoreItems: number;
}

export interface DashboardSummaryCommunityEngagement {
  averageEventRating: number | null;
  memberSatisfactionPercent: number | null;
  monthlyActiveMembers: number;
}

export interface DashboardSummaryUpcomingEvent {
  id: string;
  title: string;
  eventDate: string;
  city: string;
  registeredCount: number;
  maxParticipants: number;
  image?: string;
  trackTitle?: string;
}

export interface DashboardSummaryCommunity {
  totalCommunities: number;
  featuredCommunities: number;
  activeCommunities: number;
  openEventsCount: number;
  featuredEventsCount: number;
  totalMembers: number;
  upcomingEventsCount: number;
  monthlyGrowthPercent: number;
  upcomingEvents: DashboardSummaryUpcomingEvent[];
  communityEngagement: DashboardSummaryCommunityEngagement;
}

export interface DashboardSummaryModerationQueueItem {
  id: string;
  type: string;
  title?: string;
  userName: string;
  userId: string;
  statusLabel: string;
  createdAt: string;
}

export interface DashboardSummaryModeration {
  pendingPosts: number;
  reportedContent: number;
  marketplaceQueue: number;
  userReports: number;
  moderationQueue: DashboardSummaryModerationQueueItem[];
  queueItemsPending: number;
}

export interface DashboardSummaryData {
  sections: {
    content: DashboardSummaryContent;
    community: DashboardSummaryCommunity;
    moderation: DashboardSummaryModeration;
  };
}

interface DashboardSummaryResponse {
  success: boolean;
  message: string;
  data: DashboardSummaryData;
}

export async function getDashboardSummary(): Promise<DashboardSummaryData> {
  const { data } = await api.get<DashboardSummaryResponse>('/v1/dashboard/summary');
  if (!data?.data) {
    throw new Error(data?.message || 'Failed to load dashboard summary');
  }
  return data.data;
}
