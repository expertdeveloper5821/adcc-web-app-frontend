import { api } from './api';
import { getCached, setCache, invalidateCache } from '../utils/apiCache';

export type FacilityType =
  | 'water'
  | 'toilets'
  | 'parking'
  | 'lights'
  | 'cafes'
  | 'bikeRental'
  | 'firstAid'
  | 'changingRooms';

export interface ITrackFacility {
  facilities?: FacilityType[];
}

/** Backend track type literal (API uses "costal") */
export type TrackTypeBackend = 'circuit' | 'road' | 'costal' | 'desert' | 'urban';

export type SurfaceTypeBackend = 'asphalt' | 'concrete' | 'mixed';

export type TrackStatusBackend = 'open' | 'limited' | 'closed' | 'archived' | 'disabled';

/**
 * Backend ITrack shape (matches API /v1/tracks).
 * Document fields id, createdAt, updatedAt are set by the server.
 */
export interface ITrack {
  _id?: string;
  title: string;
  description: string;
  image?: string;
  coverImage?: string;
  city: string;
  zipcode?: string;
  distance: number;
  elevation: string;
  trackType: TrackTypeBackend;
  avgtime?: string;
  pace?: string;
  /** API accepts flat array of facility options */
  facilities?: FacilityType[];
  estimatedTime?: string;
  loopOptions?: number[];
  difficulty?: string;
  category?: string;
  surfaceType: SurfaceTypeBackend;
  status: TrackStatusBackend;
  slug?: string;
  country?: string;
  safetyNotes?: string;
  helmetRequired?: boolean;
  area?: string;
  displayPriority?: number;
  nightRidingAllowed?: boolean;
  visibility?: string;
  /** Required by backend as array (can be empty []) */
  galleryImages: string[];
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

/** Payload for POST {{baseUrl}}/v1/tracks - create track */
export type CreateTrackRequest = Omit<ITrack, '_id' | 'createdAt' | 'updatedAt'> & {
  title: string;
  description: string;
  city: string;
  distance: number;
  elevation: string;
  trackType: TrackTypeBackend;
  surfaceType: SurfaceTypeBackend;
  status: TrackStatusBackend;
  galleryImages: string[];
};

/** Map form facility keys (e.g. bike_rental) to API FacilityType (e.g. bikeRental) */
export const FACILITY_KEY_TO_API: Record<string, FacilityType> = {
  bike_rental: 'bikeRental',
  first_aid: 'firstAid',
  changing_rooms: 'changingRooms',
  lights: 'lights',
  water: 'water',
  parking: 'parking',
  toilets: 'toilets',
  cafes: 'cafes',
};

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
  titleAr?: string;
  descriptionAr?: string;
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


// Get all tracks (optionally with pagination; default limit 500 for dropdowns)
export const getAllTracks = async (params?: { page?: number; limit?: number }): Promise<Track[]> => {
  const cacheKey = `tracks:${params?.page || 1}:${params?.limit || 500}`;
  const cached = getCached<Track[]>(cacheKey);
  if (cached) return cached;

  try {
    const response = await api.get('/v1/tracks', { params: { limit: params?.limit ?? 500, page: params?.page ?? 1 } });
    const body = response.data as { data?: Track[] | { tracks?: Track[] }; tracks?: Track[] };
    let result: Track[];
    if (Array.isArray(body?.data)) result = body.data;
    else {
      const data = body?.data as { tracks?: Track[] } | undefined;
      if (data && Array.isArray(data.tracks)) result = data.tracks;
      else if (Array.isArray(body?.tracks)) result = body.tracks;
      else if (Array.isArray(body)) result = body;
      else result = [];
    }
    setCache(cacheKey, result);
    return result;
  } catch (error) {
    console.error('Error fetching tracks:', error);
    throw error;
  }
};


// Get all tracks in English (for event forms where country/city filtering needs consistent English values)
export const getAllTracksEn = async (params?: { page?: number; limit?: number }): Promise<Track[]> => {
  const cacheKey = `tracks_en:${params?.page || 1}:${params?.limit || 500}`;
  const cached = getCached<Track[]>(cacheKey);
  if (cached) return cached;

  try {
    const response = await api.get('/v1/en/tracks', { params: { limit: params?.limit ?? 500, page: params?.page ?? 1 } });
    const body = response.data as { data?: Track[] | { tracks?: Track[] }; tracks?: Track[] };
    let result: Track[];
    if (Array.isArray(body?.data)) result = body.data;
    else {
      const data = body?.data as { tracks?: Track[] } | undefined;
      if (data && Array.isArray(data.tracks)) result = data.tracks;
      else if (Array.isArray(body?.tracks)) result = body.tracks;
      else if (Array.isArray(body)) result = body;
      else result = [];
    }
    setCache(cacheKey, result);
    return result;
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

/** Image files for FormData (same key names as backend: image, coverImage, galleryImages) */
export interface TrackImageFiles {
  image?: File;
  coverImage?: File;
  galleryImages?: File[];
}

function buildTrackFormData(trackData: Record<string, unknown>, imageFiles?: TrackImageFiles): FormData {
  const formData = new FormData();
  const scalarKeys = [
    'title', 'titleAr', 'slug', 'description', 'descriptionAr', 'trackType', 'country', 'city', 'area',
    'distance', 'difficulty', 'surfaceType', 'elevation', 'estimatedTime', 'safetyNotes',
    'helmetRequired', 'nightRidingAllowed', 'status', 'visibility', 'displayPriority',
  ];
  scalarKeys.forEach((key) => {
    const val = trackData[key];
    if (val === undefined || val === null) return;
    formData.append(key, String(val));
  });
  if (trackData.loopOptions != null && Array.isArray(trackData.loopOptions)) {
    formData.append('loopOptions', JSON.stringify(trackData.loopOptions));
  }
  if (trackData.facilities != null) {
    const f = trackData.facilities;
    if (Array.isArray(f)) formData.append('facilities', JSON.stringify(f));
    else formData.append('facilities', String(f));
  }
  if (imageFiles?.image instanceof File) formData.append('image', imageFiles.image);
  if (imageFiles?.coverImage instanceof File) formData.append('coverImage', imageFiles.coverImage);
  if (imageFiles?.galleryImages?.length) {
    imageFiles.galleryImages.forEach((file) => formData.append('galleryImages', file));
  }
  return formData;
}

// Create track – send as FormData (same key names as backend)
export const createTrack = async (
  trackData: CreateTrackRequest | TrackFormData,
  imageFiles?: TrackImageFiles
): Promise<Track & { success?: boolean; message?: string }> => {
  invalidateCache('tracks');
  try {
    const d = (trackData as unknown) as Record<string, unknown>;
    const formData = buildTrackFormData(d, imageFiles);
    const response = await api.post<{ data?: Track; success?: boolean; message?: string }>('/v1/tracks', formData);
    const body = response.data as { data?: Track; success?: boolean; message?: string };
    if (body?.data) {
      return { ...body.data, success: body.success ?? true, message: body.message };
    }
    return body as Track & { success?: boolean; message?: string };
  } catch (error) {
    console.error('Error creating track:', error);
    throw error;
  }
};

// Update track – always send FormData (same key names as backend)
export const updateTrack = async (
  trackId: string,
  trackData: Partial<TrackFormData>,
  imageFiles?: TrackImageFiles
): Promise<Track> => {
  invalidateCache('tracks');
  try {
    const d = { ...trackData, galleryImages: trackData.galleryImages ?? [] } as Record<string, unknown>;
    const formData = buildTrackFormData(d, imageFiles);
    const response = await api.patch<any>(`/v1/tracks/${trackId}`, formData);
    if ((response.data as any).data) return (response.data as any).data;
    return response.data;
  } catch (error) {
    console.error('Error updating track:', error);
    throw error;
  }
};

// Delete track
export const deleteTrack = async (id: string): Promise<void> => {
  invalidateCache('tracks');
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


