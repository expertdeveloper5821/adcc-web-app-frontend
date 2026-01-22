import api from './api';

export interface EventApiResponse {
  _id?: string;
  id?: string;
  title: string;
  description: string;
  mainImage?: string;
  eventImage?: string;
  eventDate: string;
  eventTime: string;
  address: string;
  maxParticipants: number;
  minAge?: number;
  maxAge?: number;
  youtubeLink?: string;
  status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled' | 'Draft' | 'Published' | 'Cancelled';
  createdAt?: string;
  updatedAt?: string;
  views?: number;
  registrations?: number;
  rating?: number;
  shares?: number;
  featured?: boolean;
  registrationOpen?: boolean;
}

export interface GetEventsParams {
  status?: 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
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

// Get all events with optional filtering and pagination
export const getAllEvents = async (params?: GetEventsParams): Promise<EventApiResponse[]> => {
  console.log('📋 getAllEvents called with params:', params);
  try {
    const requestParams = {
      status: params?.status,
      page: params?.page || 1,
      limit: params?.limit || 10,
    };
    console.log('📤 Making API request with params:', requestParams);
    
    const response = await api.get<GetEventsResponse | EventApiResponse[]>('/v1/events', {
      params: requestParams,
    });
    
    console.log('📥 Raw API response:', response);
    console.log('📥 Response data:', response.data);
    console.log('📥 Response data type:', Array.isArray(response.data) ? 'Array' : 'Object');
    
    // Handle different response formats
    let events: EventApiResponse[] = [];
    
    if (Array.isArray(response.data)) {
      // Direct array response
      events = response.data;
      console.log('✅ Response is array, events count:', events.length);
    } else if ((response.data as any).data?.events) {
      // Nested structure: { success, message, data: { events, pagination } }
      const apiResponse = response.data as GetEventsResponse;
      events = apiResponse.data.events || [];
      console.log('✅ Response has nested data.events, events count:', events.length);
      console.log('📊 Pagination info:', apiResponse.data.pagination);
    } else if ((response.data as any).events) {
      // Direct events property: { events, pagination }
      events = (response.data as any).events || [];
      console.log('✅ Response has direct events property, events count:', events.length);
    } else {
      console.warn('⚠️ Unexpected response structure:', response.data);
      events = [];
    }
    
    console.log('📊 Final events array:', events);
    return events;
  } catch (error) {
    console.error('❌ Error in getAllEvents:', error);
    console.error('❌ Error details:', {
      message: (error as any)?.message,
      response: (error as any)?.response,
      request: (error as any)?.request,
    });
    throw error;
  }
};

// Get event by ID
export const getEventById = async (id: string): Promise<EventApiResponse> => {
  try {
    console.log('📋 getEventById called with id:', id);
    const response = await api.get<any>(`/v1/events/${id}`);
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

    console.log(eventData ,'event')
    try {
    console.log('📋 createEvent called with data:', eventData);
    const response = await api.post<any>('/v1/events', eventData);
    console.log('📥 createEvent response:', response.data);
    
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
  try {
    console.log('📋 updateEvent called with id:', id, 'data:', eventData);
    const response = await api.patch<any>(`/v1/events/${id}`, eventData);
    console.log('📥 updateEvent response:', response.data);
    
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
  try {
    await api.delete(`/v1/events/${id}`);
  } catch (error) {
    console.error('Error deleting event:', error);
    throw error;
  }
};
