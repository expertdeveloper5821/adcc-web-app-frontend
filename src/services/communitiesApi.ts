import api from './api';

export interface CommunityApiResponse {
  _id?: string;
  id?: string;
  title: string;
  description: string;
  type: string;
  category: string[];
  location: string;
  image?: string;
  trackName?: string;
  distance?: number;
  terrain?: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
  associatedTeams?: string[];
  visibility?: string;
  featured?: boolean;
  manager?: string;
  membersCount?: number;
  eventsCount?: number;
}

export interface CreateCommunityRequest {
  title: string;
  description: string;
  type: string;
  category: string[];
  location: string;
  image?: string;
  trackName?: string;
  distance?: number;
  terrain?: string;
  isActive: boolean;
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
