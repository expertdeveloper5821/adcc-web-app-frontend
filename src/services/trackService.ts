import { api } from './api';

export interface Track {
  id: string;
  name: string;
  city: string;
  area: string;
  distance: number;
  elevation?: number;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  surfaceType: 'Road' | 'Mixed' | 'Off-road';
  hasLighting: boolean;
  safetyLevel: 'Low' | 'Medium' | 'High';
  trafficLevel: 'Low' | 'Medium' | 'High';
  helmetRequired: boolean;
  nightRidingAllowed: boolean;
  safetyNotes: string;
  shortDescription: string;
  status: 'Active' | 'Draft';
  eventsCount: number;
  image: string;
  mapPreview?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface TrackFormData extends Omit<Track, 'id' | 'createdAt' | 'eventsCount'> {
  id?: string;
}

// Utility types for forms
export type TrackField = keyof Track;

// Validation schema type
export interface TrackValidationRules {
  [key: string]: {
    required?: boolean;
    min?: number;
    max?: number;
    pattern?: RegExp;
    message: string;
  };
}


// Get all tracks
export const getAllTracks = async (): Promise<Track[]> => {
  try {
    const response = await api.get('/v1/tracks');

    return response.data?.data?.tracks ?? [];
  } catch (error) {
    console.error('Error fetching tracks:', error);
    throw error;
  }
};


// Get track by ID
export const getTrackById = async (trackId: string): Promise<Track> => {
  try {
    const response = await api.get<any>(`/v1/tracks/${trackId}`);
    console.log('getTrackById response:', response.data);
    if ((response.data as any).data) {
        return (response.data as any).data;
    }
    return response.data;
  } catch (error) {
    console.error('Error fetching track:', error);
    throw error;
  }
};

// Create track
export const createTrack = async (trackData: TrackFormData): Promise<Track> => {
  try {
    const response = await api.post<any>('/v1/tracks', trackData);
    // console.log('createTrack response:', response.data);
    if ((response.data as any).data) {
        return (response.data as any).data;
    }
    return response.data;
  } catch (error) {
    console.error('Error creating track:', error);
    throw error;
  }
};

// Update track
export const updateTrack = async (id: string, trackData: Partial<TrackFormData>): Promise<Track> => {
  try {
    const response = await api.patch<any>(`/v1/tracks/${id}`, trackData);
    // console.log('updateTrack response:', response.data);
    if ((response.data as any).data) {
        return (response.data as any).data;
    }
    return response.data;
  } catch (error) {
    console.error('Error updating track:', error);
    throw error;
  };
};

// Delete track
export const deleteTrack = async (id: string): Promise<void> => {
  try {
        await api.delete(`/v1/tracks/${id}`);
    } catch (error) {
        console.error('Error deleting track:', error);
        throw error;
    }
}


