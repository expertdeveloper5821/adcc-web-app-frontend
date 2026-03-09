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
  maxParticipants: number;
  minAge?: number;
  maxAge?: number;
  youtubeLink?: string;
  status: 'draft' | 'open' | 'full' | 'completed' | 'archived' |  'cancelled' | 'reoprn' | 'disable';
  createdAt?: string;
  updatedAt?: string;
  views?: number;
  registrations?: number;
  rating?: number;
  shares?: number;
  difficulty?: string;
  featured?: boolean;
  amenities?: string[];
  registrationOpen?: boolean;
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
export const createEvent = async (eventData: Partial<EventApiResponse>): Promise<EventApiResponse> => {
//     eventData = {
//         "title": "Abu Dhabi Cycling Challenge 2025",
//         "description": "Join us for the annual Abu Dhabi Cycling Challenge. A challenging ride through the city.",
//         "mainImage": "data:image/png;base64,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"
// ,
//         "eventImage": "data:image/png;base64,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"
// ,
//         "eventDate": "2025-02-17",
//         "eventTime": "06:00",
//         "address": "Yas Marina Circuit, Abu Dhabi",
//         "maxParticipants": 500,
//         "minAge": 16,
//         "maxAge": 70,
//         "youtubeLink": "https://www.youtube.com/watch?v=example",
//         "status": "upcoming"
//     }

  invalidateCache('events');
  try {
    const response = await api.post<any>('/v1/events', eventData);
    
    // Handle nested response structure
    if ((response.data as any).data) {
      return (response.data as any).data;
    }
    return response.data;
  } catch (error) {
    console.error('Error creating event:', error);
    throw error;
  }
};

// Update event
export const updateEvent = async (id: string, eventData: Partial<EventApiResponse>): Promise<EventApiResponse> => {
  invalidateCache('events');
  try {
    const response = await api.patch<any>(`/v1/events/${id}`, eventData);
    
    // Handle nested response structure
    if ((response.data as any).data) {
      return (response.data as any).data;
    }
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
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error('Error getting event results:', error);
    throw error;
  }
};
