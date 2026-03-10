import api from './api';
import { getCached, setCache, invalidateCache } from '../utils/apiCache';

export interface CommunityApiResponse {

  id?: string;
  title: string;
  name?: string;
  slug?: string;
  titleAr?: string;
  description: string;
  descriptionAr?: string;
  type: string | string[];
  category: string;
  location: string;
  city?: string;
  country?: string;
  area?: string;
  image?: string;
  logo?: string;
  trackId?: string;
  primaryTracks?: string[];
  trackName?: string;
  distance?: number;
  terrain?: string;
  isActive: boolean;
  isFeatured?: boolean;
  /** Backend: boolean true = enabled, false = disabled */
  status?: boolean | string;
  visibility?: string;
  joinMode?: string;
  displayPriority?: number;
  allowPosts?: boolean;
  allowGallery?: boolean;
  createdAt?: string;
  associatedTeams?: string[];
  featured?: boolean;
  memberCount?: string;
  upcomingEventCount?: string;
  manager?: string;
  eventsCount?: number;
  foundedYear?: number;
  purposeType?: string;
  ridesThisMonth?: number | string;
  weeklyRides?: number | string;
  fundsRaised?: number | string;
  communityType?: string;
  gallery?: string[];
  stats?: {
    members?: number;
    upcomingEvents?: number;
    ridesThisMonth?: number;
    weeklyRides?: number;
    fundsRaised?: number;
  };
  postsCount?: number;
  isPublic?: boolean;
}

/** Backend-allowed location values */
export const COMMUNITY_LOCATION_OPTIONS = ['Abu Dhabi', 'Dubai', 'Al Ain', 'Sharjah'] as const;
export type CommunityLocation = (typeof COMMUNITY_LOCATION_OPTIONS)[number];

export interface CreateCommunityRequest {
  title: string;
  titleAr?: string;
  description: string;
  descriptionAr?: string;
  type: string | string[];
  category: string;
  location?: string;
  image?: string;
  trackName?: string;
  distance?: number;
  foundedYear?: number;
  terrain?: string;
  isActive: boolean;
  isFeatured?: boolean;
  /** Backend: boolean true = enabled, false = disabled */
  status?: boolean;
  /** Community logo (square) */
  logo?: string;
  /** Backend expects string (not null) */
  purposeType?: string;
  /** Backend expects string (not number) */
  ridesThisMonth?: string;
  /** Backend expects string (not null) */
  weeklyRides?: string;
  /** Backend expects string (not null) */
  fundsRaised?: string;
  isPublic?: boolean;
  manager?: string;
  area?: string;
  city?: string;
} 

// Get community by ID
export const getCommunityById = async (id: string): Promise<CommunityApiResponse> => {
  try {
    const response = await api.get<any>(`/v1/communities/${id}`);
    // console.log('📥 getCommunityById response:', response.data);
    
    // Handle nested response structure
    if ((response.data as any).data) {
      return (response.data as any).data;
    }
    return response.data;
  } catch (error) {
    console.error('Error fetching community:', error);
    throw error;
  }
};

// Create community
export const createCommunity = async (communityData: CreateCommunityRequest): Promise<CommunityApiResponse> => {
  invalidateCache('communities');
  try {
    const response = await api.post<any>('/v1/communities', communityData);
    // console.log('📥 createCommunity response:', response.data);
    
    // Handle nested response structure
    if ((response.data as any).data) {
      return (response.data as any).data;
    }
    return response.data;
  } catch (error) {
    console.error('Error creating community:', error);
    throw error;
  }
};

// Update community
export const updateCommunity = async (id: string, communityData: Partial<CreateCommunityRequest>): Promise<CommunityApiResponse> => {
  invalidateCache('communities');
  try {
    const response = await api.patch<any>(`/v1/communities/${id}`, communityData);
    // console.log('📥 updateCommunity response:', response.data);
    
    // Handle nested response structure
    if ((response.data as any).data) {
      return (response.data as any).data;
    }
    return response.data;
  } catch (error) {
    console.error('Error updating community:', error);
    throw error;
  }
};

// Get all communities (optionally with pagination)
export const getAllCommunities = async (params?: { page?: number; limit?: number }): Promise<CommunityApiResponse[]> => {
  const limit = params?.limit ?? 20;
  const cacheKey = `communities:${params?.page ?? 1}:${limit}`;
  const cached = getCached<CommunityApiResponse[]>(cacheKey);
  if (cached) return cached;

  try {
    const response = await api.get<any>('/v1/communities', {
      params: { page: params?.page ?? 1, limit },
    });
    const data = response.data;
    const inner = (data as any).data;
    let result: CommunityApiResponse[];
    if (inner?.communities) result = inner.communities;
    else if (Array.isArray((data as any).communities)) result = (data as any).communities;
    else if (Array.isArray(inner)) result = inner;
    else if (Array.isArray(data)) result = data;
    else result = [];
    setCache(cacheKey, result);
    return result;
  } catch (error) {
    console.error('Error fetching communities:', error);
    throw error;
  }
};

// Delete community
export const deleteCommunity = async (id: string): Promise<void> => {
  invalidateCache('communities');
  try {
    await api.delete(`/v1/communities/${id}`);
    // console.log('✅ deleteCommunity successful');
  } catch (error) {
    console.error('Error deleting community:', error);
    throw error;
  }
};


// Get Community Members
export const getCommunityMembers = async(id: string): Promise<void> => {
  try{
      const response = await api.get<any>(`/v1/communities/${id}/communityMembers`);
      if ((response.data as any).data) {
          return (response.data as any).data;
      }
    return response.data;
  } catch (error) {
    console.error('Error community members:', error);
    throw error;
  }
}

// Add gallery images to community
export const addGalleryImages = async (id: string, images: string[] ): Promise<any> => {
  try {
    const response = await api.post<any>(
      `/v1/communities/${id}/gallery`,
      { images }
    );
    console.log('📥 addGalleryImages response:', response.data);
    
    // Handle nested response structure
    if ((response.data as any).data) {
      return (response.data as any).data;
    }
    return response.data;
  } catch (error) {
    console.error('Error adding gallery images:', error);
    throw error;
  }
};

// Delete gallery image from community
export const deleteGalleryImage = async (
  id: string,
  imageUrl: string
): Promise<any> => {
  try {
    const response = await api.delete<any>(
      `/v1/communities/${id}/gallery`,
      { data: { imageUrl } }
    );
    console.log('📥 deleteGalleryImage response:', response.data);
    
    // Handle nested response structure
    if ((response.data as any).data) {
      return (response.data as any).data;
    }
    return response.data;
  } catch (error) {
    console.error('Error deleting gallery image:', error);
    throw error;
  }
};

// Get available cities for communities (with fallback to static data)
export const getAvailableCities = async (): Promise<string[]> => {
  try {
    const response = await api.get<any>('/v1/communities/metadata/cities');
    if ((response.data as any).data) {
      return (response.data as any).data;
    }
    return response.data;
  } catch (error) {
    console.warn('⚠️ Failed to fetch cities from API, using fallback data:', error);
    // Fallback to static data
    const { availableCities } = await import('../data/communitiesData');
    return availableCities;
  }
};

// Get available categories for communities (with fallback to static data)
export const getAvailableCategories = async (): Promise<string[]> => {
  try {
    const response = await api.get<any>('/v1/communities/metadata/categories');
    if ((response.data as any).data) {
      return (response.data as any).data;
    }
    return response.data;
  } catch (error) {
    console.warn('⚠️ Failed to fetch categories from API, using fallback data:', error);
    // Fallback to static data
    const { availableCategories } = await import('../data/communitiesData');
    return availableCategories;
  }
};
