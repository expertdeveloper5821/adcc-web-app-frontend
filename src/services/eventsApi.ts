import api from './api';
import { getCached, setCache, invalidateCache } from '../utils/apiCache';
export interface EventApiResponse {
  _id?: string;
  id?: string;
  title: string;
  titleAr?: string;
  description: string;
  descriptionAr?: string;
  mainImage?: string;
  eventImage?: string;
  eventDate: string;
  eventTime: string;
  endTime: string;
  address: string;
  country?: string;
  city?: string;
  maxParticipants: number;
  minAge?: number;
  maxAge?: number;
  youtubeLink?: string;
  status: 'Draft' | 'Open' | 'Full' | 'Completed' | 'Archived' | 'draft' | 'open' | 'full' | 'completed' | 'archived' | 'cancelled' | 'reoprn' | 'disable';
  createdAt?: string;
  updatedAt?: string;
  views?: number;
  registrations?: number;
  rating?: number;
  shares?: number;
  difficulty?: string;
  distance?: number;
  featured?: boolean;
  amenities?: string[];
  schedule?: { time: string; title: string; titleAr?: string; description?: string; descriptionAr?: string; order?: number }[];
  registrationOpen?: boolean;
  category?: string;
  categories?: 'race' | 'community Ride' | 'Training & Clinics' | 'Awareness Rides' | 'Family & Kids' | 'Corporate Events' | 'National Events';
  rewards: {
    points: number;
    badgeName: string;
    badgeImage?: string;
  };
  slug?: string;
  communityId?: string;
  trackId?: string;
  isFeatured?: boolean;
  allowCancellation?: boolean;
  galleryImages: string[];
}

export interface GetEventsParams {
  status?: 'draft' | 'open' | 'full' | 'completed' | 'archived';
  page?: number;
  limit?: number;
}

export interface GetEventsResponse {
  success: boolean;
  message: string;
  data: {
    events: EventApiResponse[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  };
}

export const availableCategories = [
  'Race',
  'Community Ride',
  'Training & Clinics',
  'Awareness Rides',
  'Family & Kids',
  'Corporate Events',
  'National Events',
];

// Get all events with optional filtering and pagination
export const getAllEvents = async (params?: GetEventsParams): Promise<EventApiResponse[]> => {
  const cacheKey = `events:${params?.status || 'all'}:${params?.page || 1}:${params?.limit || 10}`;
  const cached = getCached<EventApiResponse[]>(cacheKey);
  if (cached) return cached;

  try {
    const requestParams = {
      status: params?.status,
      page: params?.page || 1,
      limit: params?.limit || 10,
    };

    const response = await api.get<GetEventsResponse | EventApiResponse[]>('/v1/events', {
      params: requestParams,
    });

    // Handle different response formats
    let events: EventApiResponse[] = [];

    if (Array.isArray(response.data)) {
      events = response.data;
    } else if ((response.data as any).data?.events) {
      const apiResponse = response.data as GetEventsResponse;
      events = apiResponse.data.events || [];
    } else if ((response.data as any).events) {
      events = (response.data as any).events || [];
    }

    setCache(cacheKey, events);
    return events;
  } catch (error) {
    console.error('Error in getAllEvents:', error);
    throw error;
  }
};

// Get event by ID
export const getEventById = async (id: string): Promise<EventApiResponse> => {
  try {
    const response = await api.get<any>(`/v1/events/${id}`);
    // console.log('📋 getEventById called with id:', id);
    console.log('📥 getEventById response:', response.data);
    
    // Handle nested response structure
    if ((response.data as any).data) {
      return (response.data as any).data;
    }
    return response.data;
  } catch (error) {
    console.error('Error fetching event:', error);
    throw error;
  }
};

// Create event
// export const createEvent = async (eventData: Partial<EventApiResponse>): Promise<EventApiResponse> => {


//   invalidateCache('events');
//   try {
//     const response = await api.post<any>('/v1/events', eventData);
    
//     // Handle nested response structure
//     if ((response.data as any).data) {
//       return (response.data as any).data;
//     }
//     return response.data;
//   } catch (error) {
//     console.error('Error creating event:', error);
//     throw error;
//   }
// };

export const createEvent = async (
  eventData: any
): Promise<any> => {

  invalidateCache("events");

  try {

    const formData = new FormData();

    formData.append("title", eventData.title || "");
    formData.append("slug", eventData.slug || "");
    formData.append("category", eventData.category || "");
    formData.append("communityId", eventData.communityId || "");
    formData.append("description", eventData.description || "");
    formData.append("address", eventData.address || "");
    formData.append("country", eventData.country || "");
    formData.append("city", eventData.city || "");
    formData.append("trackId", eventData.trackId || "");
    formData.append("eventDate", eventData.eventDate || "");
    formData.append("eventTime", eventData.eventTime || "");
    formData.append("endTime", eventData.endTime || "");
    formData.append("distance", String(eventData.distance ?? ""));
    formData.append("difficulty", eventData.difficulty || "");
    formData.append("maxParticipants", String(eventData.maxParticipants ?? ""));
    formData.append("status", eventData.status || "Draft");
    formData.append("isFeatured", String(eventData.isFeatured ?? false));
    formData.append("allowCancellation", String(eventData.allowCancellation ?? true));
    if (eventData.schedule) {
      formData.append("schedule", JSON.stringify(eventData.schedule));
    }
    // Send amenities as JSON string so backend can parse to array (FormData sends strings only)
    if (eventData.amenities && Array.isArray(eventData.amenities)) {
      formData.append("amenities", JSON.stringify(eventData.amenities));
    }

    // Images: backend multer expects mainImage and eventImage (File objects only)
    if (eventData.mainImage instanceof File) {
      formData.append("mainImage", eventData.mainImage);
    }
    if (eventData.eventImage instanceof File) {
      formData.append("eventImage", eventData.eventImage);
    }

    // Gallery images (if backend supports this field)
    if (eventData.galleryImages && Array.isArray(eventData.galleryImages)) {
      eventData.galleryImages.forEach((file: File) => {
        if (file instanceof File) formData.append("galleryImages", file);
      });
    }

    // Do not set Content-Type: axios sets multipart/form-data with boundary for FormData
    const response = await api.post("/v1/events", formData);

    if (response.data?.data) {
      return response.data.data;
    }

    return response.data;

  } catch (error) {
    console.error("Error creating event:", error);
    throw error;
  }
};

/** Optional image files for multipart update (backend multer: mainImage, eventImage) */
export interface EventUpdateImageFiles {
  mainImage?: File;
  eventImage?: File;
  galleryImages?: File[];
}

// Update event: always send FormData so backend requireMultipartFormData middleware is satisfied
export const updateEvent = async (
  id: string,
  eventData: Partial<EventApiResponse> & { schedule?: { time: string; title: string }[]; amenities?: string[] },
  imageFiles?: EventUpdateImageFiles
): Promise<EventApiResponse> => {
  invalidateCache('events');
  try {
    const formData = new FormData();
    const d = eventData as Record<string, unknown>;
    const append = (key: string, value: unknown) => {
      if (value === undefined || value === null) return;
      if (typeof value === 'object' && !Array.isArray(value) && !(value instanceof File)) {
        formData.append(key, JSON.stringify(value));
        return;
      }
      if (Array.isArray(value)) {
        value.forEach((item) => formData.append(key, typeof item === 'object' ? JSON.stringify(item) : String(item)));
        return;
      }
      formData.append(key, String(value));
    };
    append('title', d.title);
    append('titleAr', d.titleAr);
    append('slug', d.slug);
    append('category', d.category);
    append('communityId', d.communityId);
    append('description', d.description);
    append('descriptionAr', d.descriptionAr);
    append('address', d.address);
    append('country', d.country);
    append('city', d.city);
    append('trackId', d.trackId);
    append('eventDate', d.eventDate);
    append('eventTime', d.eventTime);
    append('endTime', d.endTime);
    append('distance', d.distance);
    append('difficulty', d.difficulty);
    append('maxParticipants', d.maxParticipants);
    // schedule: send as single JSON string so backend gets array (multiple "schedule" fields become object)
    if (Array.isArray(d.schedule)) {
      formData.append('schedule', JSON.stringify(d.schedule));
    } else if (d.schedule !== undefined && d.schedule !== null) {
      formData.append('schedule', JSON.stringify([]));
    }
    if (Array.isArray(d.amenities)) {
      formData.append('amenities', JSON.stringify(d.amenities));
    } else if (d.amenities !== undefined && d.amenities !== null) {
      formData.append('amenities', JSON.stringify([]));
    }
    append('status', d.status);
    append('isFeatured', d.isFeatured);
    append('allowCancellation', d.allowCancellation);
    append('youtubeLink', d.youtubeLink);
    append('minAge', d.minAge);
    append('maxAge', d.maxAge);
    if (d.eligibility != null) append('eligibility', d.eligibility);

    if (imageFiles?.mainImage instanceof File) formData.append('mainImage', imageFiles.mainImage);
    if (imageFiles?.eventImage instanceof File) formData.append('eventImage', imageFiles.eventImage);
    if (imageFiles?.galleryImages?.length) {
      imageFiles.galleryImages.forEach((file) => formData.append('galleryImages', file));
    }

    const response = await api.patch<any>(`/v1/events/${id}`, formData);
    if ((response.data as any).data) return (response.data as any).data;
    return response.data;
  } catch (error) {
    console.error('Error updating event:', error);
    throw error;
  }
};

// Delete event
export const deleteEvent = async (id: string): Promise<void> => {
  invalidateCache('events');
  try {
    await api.delete(`/v1/events/${id}`);
  } catch (error) {
    console.error('Error deleting event:', error);
    throw error;
  }
};

// Get event results/participants
export const getEventResults = async (id: string): Promise<any[]> => {
  try {
    const eventId = id;
    const response = await api.get(`/v1/events/${eventId}/results`);
    // Handle nested response structure
    const data = response.data?.data || response.data || [];
    // console.log("dataaa" , data)
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error('Error getting event results:', error);
    throw error;
  }
};

// Event participants operations

export const checkInParticipant = async (
  eventId: string,
  userId: string
): Promise<any> => {
  try {
    const response = await api.patch(`/v1/events/${eventId}/participants/${userId}/check-in`);
    return (response as any).data?.data ?? response.data;
  } catch (error) {
    console.error('Error checking in participant:', error);
    throw error;
  }
};

export const markParticipantNoShow = async (
  eventId: string,
  userId: string
): Promise<any> => {
  try {
    const response = await api.patch(`/v1/events/${eventId}/participants/${userId}/no-show`);
    return (response as any).data?.data ?? response.data;
  } catch (error) {
    console.error('Error marking participant no-show:', error);
    throw error;
  }
};

export const checkInAllParticipants = async (eventId: string): Promise<any> => {
  try {
    const response = await api.patch(`/v1/events/${eventId}/participants/check-in-all`);
    return (response as any).data?.data ?? response.data;
  } catch (error) {
    console.error('Error checking in all participants:', error);
    throw error;
  }
};

// Mark all event participants as no-show
export const markAllParticipantsNoShow = async (eventId: string): Promise<any> => {
  try {
    const response = await api.patch(`/v1/events/${eventId}/participants/no-show-all`);
    return (response as any).data?.data ?? response.data;
  } catch (error) {
    console.error('Error marking all participants no-show:', error);
    throw error;
  }
};

// Remove a participant from an event
export const removeEventParticipant = async (
  eventId: string,
  userId: string
): Promise<void> => {
  try {
    await api.delete(`/v1/events/${eventId}/participants/${userId}`);
  } catch (error) {
    console.error('Error removing event participant:', error);
    throw error;
  }
};

// Export event results as CSV (goes through axios interceptors)
export const exportEventResultsCsv = async (eventId: string): Promise<Blob> => {
  try {
    const response = await api.get(`/v1/events/${eventId}/results/export`, {
      responseType: 'blob',
    });
    return response.data as Blob;
  } catch (error) {
    console.error('Error exporting event results CSV:', error);
    throw error;
  }
};



