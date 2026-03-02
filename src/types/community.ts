// Types for community module
export type GCCCountry = 'UAE' | 'Saudi Arabia' | 'Kuwait' | 'Qatar' | 'Bahrain' | 'Oman';
export type CommunityType = 'city' | 'type' | 'purpose-based';
export type CommunityStatus = 'active' | 'inactive';
export type Visibility = 'public' | 'private';
export type JoinMode = 'open' | 'approval' | 'invite';
export type Terrain = 'Paved Road' | 'Gravel' | 'Mixed' | 'Mountain';

export interface CommunityFormData {
  // Basic Information
  title: string;
  description: string;
  country: GCCCountry;
  city: string;
  area?: string;
  
  // Classification
  communityType: CommunityType;
  categories: string[];
  purposeType?: string | null;
  
  // Tracks
  primaryTrackIds: string[];
  
  // Stats
  foundedYear?: number | null;
  ridesThisMonth?: number | null;
  weeklyRides?: number | null;
  fundsRaised?: number | null;
  
  // Media
  image?: string;
  imageFile?: File | null;
  
  // Admin
  manager?: string;
  
  // Visibility & Rules
  status: CommunityStatus;
  visibility: Visibility;
  joinMode: JoinMode;
  displayPriority: number;
  isFeatured: boolean;
  allowPosts: boolean;
  allowGallery: boolean;
  
  // Legacy fields (for API compatibility)
  type: string;
  category: string;
  location: string;
  trackName?: string;
  distance?: number;
  terrain?: Terrain;
  isActive: boolean;
}

export interface CommunityApiResponse {
  id?: string;
  title: string;
  description: string;
  type: string[];
  category: string;
  location: string;
  image?: string;
  logo?: string;
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
  // membersCount?: number;
  // eventsCount?: number;
}

export interface CreateCommunityRequest {
  title: string;
  description: string;
  type: string[];
  category: string;
  location: string;
  image?: string;
  logo?: string;
  trackName?: string;
  distance?: number;
  terrain?: string;
  isActive: boolean;
}