import api from './api';

export interface CommunityApiResponse {
  title: string;
  description: string;
  type: string;
  category: string;
  location: string;
  image?: string;
  trackId?: string;
  trackName?: string;
  distance?: number;
  terrain?: string;
  isActive: boolean;
  isFeatured: boolean;
  createdAt?: string;
  // updatedAt?: string;
  associatedTeams?: string[];
  visibility?: string;
  featured?: boolean;
  memberCount?: string;
  upcomingEventCount?: string;
  manager?: string;
  // membersCount?: number;
  eventsCount?: number;
  foundedYear?: number;
  gallery?: string[];
}

export interface CreateCommunityRequest {
  title: string;
  description: string;
  type: string;
  category: string;
  location: string;
  image?: string;
  trackName?: string;
  memberCount?: string;
  upcomingEventCount?: string;
  distance?: number;
  foundedYear?: number;
  terrain?: string;
  isActive: boolean;
  isFeatured: boolean;
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

// Get all communities
export const getAllCommunities = async (): Promise<CommunityApiResponse[]> => {
  try {
    const response = await api.get<any>('/v1/communities');
    // console.log('📥 getAllCommunities response:', response.data);
    if ((response.data as any).data) {
      return (response.data as any).data;
    }
    return response.data;
  } catch (error) {
    console.error('Error fetching communities:', error);
    throw error;
  }

};

// Delete community
export const deleteCommunity = async (id: string): Promise<void> => {
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
