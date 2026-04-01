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
  trackId?: string | string[] | { _id?: string; id?: string } | Array<{ _id?: string; id?: string }>;
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
export const COMMUNITY_LOCATION_OPTIONS = ['Abu Dhabi', 'Dubai', 'Al Ain', 'Sharjah' , 'Ras Al Khaimah', 'Fujairah', 'Umm Al Quwain', 'Ajman', 'Al Fujairah', 'Al Sharjah', 'Al Ain', 'Abu Dhabi', 'Dubai', 'Sharjah', 'Ajman', 'Umm Al Quwain', 'Fujairah', 'Ras Al Khaimah' , 'Al Dhafra' , 'Al Fujairah' , 'Al Sharjah' , 'Al Ain' , 'Abu Dhabi' , 'Dubai' , 'Sharjah' , 'Ajman' , 'Umm Al Quwain' , 'Fujairah' , 'Ras Al Khaimah' , 'Al Dhafra' ] as const;
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
  trackId?: string | string[];
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

/** For FormData uploads: image, coverImage, logo as File (same key names as backend multer) */
export type CommunityImageFiles = {
  image?: File;
  coverImage?: File;
  logo?: File;
};

// Get community by ID
export const getCommunityById = async (id: string, options?: { lang?: string }): Promise<CommunityApiResponse> => {
  try {
    const headers: Record<string, string> = {};
    if (options?.lang) {
      headers['Accept-Language'] = options.lang;
    }
    const response = await api.get<any>(`/v1/communities/${id}`, { headers });
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

// Create community (FormData: no base64; image/coverImage/logo sent as File with same key names)
export const createCommunity = async (
  communityData: CreateCommunityRequest & { image?: string | File; logo?: string | File; coverImage?: File },
  imageFiles?: CommunityImageFiles
): Promise<CommunityApiResponse> => {
  invalidateCache('communities');
  try {
    const formData = new FormData();
    const d = (communityData as unknown) as Record<string, unknown>;
    const scalarKeys = [
      'title', 'titleAr', 'description', 'descriptionAr', 'type', 'category', 'location',
      'trackId', 'purposeType', 'ridesThisMonth', 'weeklyRides', 'fundsRaised', 'foundedYear',
      'area', 'manager', 'city' ,'country', 'isActive', 'isFeatured', 'status', 'isPublic'
    ];
    scalarKeys.forEach((key) => {
      const val = d[key];
      if (val === undefined || val === null) return;
      if (Array.isArray(val)) {
        formData.append(key, JSON.stringify(val));
        return;
      }
      formData.append(key, String(val));
    });

    if (imageFiles?.image instanceof File) formData.append('image', imageFiles.image);
    if (imageFiles?.coverImage instanceof File) formData.append('coverImage', imageFiles.coverImage);
    if (imageFiles?.logo instanceof File) formData.append('logo', imageFiles.logo);

    const response = await api.post<any>('/v1/communities', formData);
    if ((response.data as any).data) return (response.data as any).data;
    return response.data;
  } catch (error) {
    console.error('Error creating community:', error);
    throw error;
  }
};

// Update community (always FormData so backend multer middleware is satisfied)
export const updateCommunity = async (
  id: string,
  communityData: Partial<CreateCommunityRequest>,
  imageFiles?: CommunityImageFiles
): Promise<CommunityApiResponse> => {
  invalidateCache('communities');
  try {
    const formData = new FormData();
    const d = (communityData as unknown) as Record<string, unknown>;
    const scalarKeys = [
      'title', 'titleAr', 'description', 'descriptionAr', 'type', 'category', 'location',
      'trackId', 'purposeType', 'ridesThisMonth', 'weeklyRides', 'fundsRaised', 'foundedYear',
      'area', 'manager', 'city', 'isActive', 'isFeatured', 'status', 'isPublic',
    ];
    scalarKeys.forEach((key) => {
      const val = d[key];
      if (val === undefined || val === null) return;
      if (Array.isArray(val)) {
        formData.append(key, JSON.stringify(val));
        return;
      }
      formData.append(key, String(val));
    });

    if (imageFiles?.image instanceof File) formData.append('image', imageFiles.image);
    if (imageFiles?.coverImage instanceof File) formData.append('coverImage', imageFiles.coverImage);
    if (imageFiles?.logo instanceof File) formData.append('logo', imageFiles.logo);

    const response = await api.patch<any>(`/v1/communities/${id}`, formData);
    if ((response.data as any).data) return (response.data as any).data;
    return response.data;
  } catch (error) {
    console.error('Error updating community:', error);
    throw error;
  }
};

// Get all communities (fetches all pages automatically)
export const getAllCommunities = async (params?: { page?: number; limit?: number }): Promise<CommunityApiResponse[]> => {
  const limit = params?.limit ?? 100;
  const page = params?.page ?? 1;
  const cacheKey = `communities:all`;
  const cached = getCached<CommunityApiResponse[]>(cacheKey);
  if (cached) return cached;

  try {
    let allCommunities: CommunityApiResponse[] = [];
    let currentPage = page;
    let totalPages = 1;

    do {
      const response = await api.get<any>('/v1/communities', {
        params: { page: currentPage, limit },
      });
      const data = response.data;
      const inner = (data as any).data;

      let result: CommunityApiResponse[] = [];
      if (inner?.communities) result = inner.communities;
      else if (Array.isArray((data as any).communities)) result = (data as any).communities;
      else if (Array.isArray(inner)) result = inner;
      else if (Array.isArray(data)) result = data;

      allCommunities = [...allCommunities, ...result];

      // Check pagination info to see if there are more pages
      const pagination = inner?.pagination || (data as any).pagination;
      if (pagination?.pages) {
        totalPages = pagination.pages;
      } else {
        // No pagination info or no more results — stop
        break;
      }

      currentPage++;
    } while (currentPage <= totalPages);

    setCache(cacheKey, allCommunities);
    return allCommunities;
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


export interface CommunityMember {
  _id?: string;
  id?: string;
  fullName?: string;
  email?: string;
  phoneNumber?: string;
  createdAt?: string;
  status?: string;
  [key: string]: unknown;
}

// Get Community Members
export const getCommunityMembers = async (id: string): Promise<CommunityMember[]> => {
  try {
    const response = await api.get<any>(`/v1/communities/${id}/communityMembers`);
    const root = response.data as any;
    const data = root?.data ?? root;

    // Support common backend response shapes:
    // - []
    // - { data: [] }
    // - { data: { members: [] } }
    // - { data: { communityMembers: [] } }
    // - { members: [] } / { communityMembers: [] }
    if (Array.isArray(data)) return data as CommunityMember[];
    if (Array.isArray(data?.members)) return data.members as CommunityMember[];
    if (Array.isArray(data?.communityMembers)) return data.communityMembers as CommunityMember[];
    if (Array.isArray(root?.members)) return root.members as CommunityMember[];
    if (Array.isArray(root?.communityMembers)) return root.communityMembers as CommunityMember[];
    return [];
  } catch (error) {
    console.error('Error community members:', error);
    throw error;
  }
};

// Add gallery images to community (sends multipart/form-data so backend receive multipart with boundary)
export const addGalleryImages = async (id: string, files: File[]): Promise<any> => {
  try {
    const formData = new FormData();
    files.forEach((file) => formData.append('gallery', file));
    const response = await api.post<any>(`/v1/communities/${id}/gallery`, formData);
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
  imageUrls: string
): Promise<any> => {
  try {
    const response = await api.delete<any>(
      `/v1/communities/${id}/gallery`,
      { data: { imageUrls } }
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
