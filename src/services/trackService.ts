import { api } from './api';

export type FacilityType =
  | 'water'
  | 'troilets'
  | 'parking'
  | 'lights'
  | 'cafes'
  | 'bikeRental'
  | 'firstAid'
  | 'changingRooms';

export interface ITrackFacility {
  facilities?: FacilityType[];
}

export const UAE_CITIES = [
  'Abu Dhabi',
  'Dubai',
  'Sharjah',
  'Ajman',
  'Umm Al Quwain',
  'Ras Al Khaimah',
  'Fujairah',
  'Al Ain'
];


export interface Track {
  id: string;
  title: string;
  city: string;
  area: string;
  distance: number;
  elevation?: string;
  difficulty: 'easy' | 'medium' | 'hard';
  hasLighting: boolean;
  safetyLevel: 'low' | 'medium' | 'high';
  trafficLevel: 'lLow' | 'medium' | 'high';
  helmetRequired: boolean;
  nightRidingAllowed: boolean;
  safetyNotes: string;
  shortDescription: string;
  // status: 'Active' | 'Draft';
  eventsCount: number;
  image: string;
  coverImage?: string;
  galleryImages?: string[];
  mapPreview?: string;
  trackType?: string;
  country?: string;
  visibility?: string;
  displayPriority?: string;
  latitude?: number;
  longitude?: number;
  estimatedTime?: string;
  loopOptions?: number[];
  surfaceType: 'Asphalt' | 'Concrete';
  status: 'open' | 'limited' | 'closed' | 'archived' | 'disabled';
  slug?: string;
  avgtime?: string;
  facilities?: ITrackFacility[];
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

    if ((response.data as any).data) {
      return (response.data as any).data;
    }
  } catch (error) {
    console.error('Error fetching tracks:', error);
    throw error;
  }
};


// Get track by ID
export const getTrackById = async (trackId: string): Promise<Track> => {
  try {
    const response = await api.get<any>(`/v1/tracks/${trackId}`);
    // console.log('getTrackById response:', response.data);
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
export const updateTrack = async (trackId: string, trackData: Partial<TrackFormData>): Promise<Track> => {
  try {
    const response = await api.patch<any>(`/v1/tracks/${trackId}`, trackData);
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

// disable track
export const disableTrack = async (id: string): Promise<void> => {
  try {
        await api.patch(`/v1/tracks/${id}/disable`);
    } catch (error) {
        console.error('Error deleting track:', error);
        throw error;
    }
}
// enable track
export const enableTrack = async (id: string): Promise<void> => {
  try {
        await api.patch(`/v1/tracks/${id}/enable`);
    } catch (error) {
        console.error('Error deleting track:', error);
        throw error;
    }
}


/**
 * Track related Events
 */

export const getTrackResults = async (trackId: string): Promise<any[]> => {
  try {
    const response = await api.get(`/v1/tracks/${trackId}/events/results`);
    // return response.data.data;
    if ((response.data as any).data) {
        return (response.data as any).data;
    }
  } catch (error) {
    console.error('Error fetching track events:', error);
    throw error;
  }
};


/**
 * Track Community related Events
 */

export const trackCommunityResults = async (trackId: string): Promise<any[]> => {
  try {
    const response = await api.get(`/v1/tracks/${trackId}/events/results`);
    return response.data.data;
  } catch (error) {
    console.error('Error fetching track events:', error);
    throw error;
  }
};


export const archiveTrack = async (id: string) => {
  try {
    const response = await api.patch(`/v1/tracks/${id}/archive`);
    return response.data;
  } catch (error) {
    console.error('Error track archive:', error);
    throw error;
  }
};


