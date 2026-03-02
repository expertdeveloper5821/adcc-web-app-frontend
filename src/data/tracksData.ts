// UNIFIED TRACK ENTITY - Single Source of Truth
// Used across: Tracks module, Communities module (Primary Tracks), Events module (Event Track)

type Community = {
  primaryTracks?: string[];
};

export interface Track {
  id: string;
  name: string;
  slug: string;
  description: string;
  trackType: 'Road' | 'Circuit' | 'Coastal' | 'Desert' | 'Urban';
  country: string;
  city: string;
  area: string;
  distance: number; // km
  difficulty: 'Easy' | 'Medium' | 'Hard';
  surfaceType: 'Asphalt' | 'Concrete' | 'Mixed';
  elevationGain?: number; // meters
  estimatedTime?: string; // e.g., "2-3 hours"
  loopOptions: number[]; // e.g., [8, 15, 22, 35] km
  facilities: string[]; // ['Lighting', 'Water Stations', 'Parking', 'Restrooms', 'Cafes', 'Bike Rental', 'First Aid', 'Changing Rooms']
  safetyNotes: string;
  helmetRequired: boolean;
  nightRidingAllowed: boolean;
  status: 'Open' | 'Limited' | 'Closed';
  visibility: 'Public' | 'Hidden';
  displayPriority: number;
  thumbnailImage: string;
  coverImage: string;
  galleryImages: string[];
  createdAt: string;
  updatedAt: string;
  totalViews?: number;
}

let tracks: Track[] = [
  {
    id: '1',
    name: 'Yas Marina Circuit',
    slug: 'yas-marina-circuit',
    description: 'World-famous F1 circuit perfect for competitive cycling events. Features professional-grade track surface and state-of-the-art facilities. This iconic venue hosts international racing events and provides a premium cycling experience with world-class safety standards.',
    trackType: 'Circuit',
    country: 'UAE',
    city: 'Abu Dhabi',
    area: 'Yas Island',
    distance: 42,
    difficulty: 'Hard',
    surfaceType: 'Asphalt',
    elevationGain: 120,
    estimatedTime: '2-3 hours',
    loopOptions: [15, 22, 35, 42],
    facilities: ['Lighting', 'Water Stations', 'Parking', 'Restrooms', 'Cafes', 'First Aid', 'Changing Rooms', 'Bike Rental'],
    safetyNotes: 'Professional F1-grade circuit with excellent safety features. Medical support available on-site. All riders must follow track rules and marshal instructions.',
    helmetRequired: true,
    nightRidingAllowed: true,
    status: 'Open',
    visibility: 'Public',
    displayPriority: 10,
    thumbnailImage: 'https://images.unsplash.com/photo-1541625602330-2277a4c46182?w=400',
    coverImage: 'https://images.unsplash.com/photo-1541625602330-2277a4c46182?w=800',
    galleryImages: [
      'https://images.unsplash.com/photo-1541625602330-2277a4c46182?w=800',
      'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800',
    ],
    createdAt: '2025-06-01',
    updatedAt: '2026-01-15',
    totalViews: 2450,
  },
  {
    id: '2',
    name: 'Dubai Autodrome',
    slug: 'dubai-autodrome',
    description: 'Professional racing circuit with excellent facilities and safety features. Ideal for training and competitive events. Multiple loop configurations available for different skill levels.',
    trackType: 'Circuit',
    country: 'UAE',
    city: 'Dubai',
    area: 'Motor City',
    distance: 35,
    difficulty: 'Medium',
    surfaceType: 'Asphalt',
    elevationGain: 80,
    estimatedTime: '1.5-2 hours',
    loopOptions: [12, 20, 28, 35],
    facilities: ['Lighting', 'Water Stations', 'Parking', 'Restrooms', 'First Aid', 'Changing Rooms'],
    safetyNotes: 'Well-maintained circuit with clear signage. Riders must stay in designated cycling lanes. Safety briefing required for first-time riders.',
    helmetRequired: true,
    nightRidingAllowed: true,
    status: 'Open',
    visibility: 'Public',
    displayPriority: 9,
    thumbnailImage: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400',
    coverImage: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800',
    galleryImages: [
      'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800',
    ],
    createdAt: '2025-06-10',
    updatedAt: '2026-01-20',
    totalViews: 1890,
  },
  {
    id: '3',
    name: 'Sharjah Waterfront Track',
    slug: 'sharjah-waterfront-track',
    description: 'Scenic waterfront cycling path perfect for community rides and beginner-friendly events. Beautiful views of the Arabian Gulf with well-maintained facilities.',
    trackType: 'Coastal',
    country: 'UAE',
    city: 'Sharjah',
    area: 'Al Khan',
    distance: 15,
    difficulty: 'Easy',
    surfaceType: 'Asphalt',
    elevationGain: 20,
    estimatedTime: '45-60 minutes',
    loopOptions: [5, 10, 15],
    facilities: ['Water Stations', 'Parking', 'Restrooms', 'Cafes'],
    safetyNotes: 'Family-friendly coastal path. Watch for pedestrians. Best ridden during early morning or evening to avoid midday heat.',
    helmetRequired: true,
    nightRidingAllowed: false,
    status: 'Open',
    visibility: 'Public',
    displayPriority: 7,
    thumbnailImage: 'https://images.unsplash.com/photo-1517649763962-0c623066013b?w=400',
    coverImage: 'https://images.unsplash.com/photo-1517649763962-0c623066013b?w=800',
    galleryImages: [],
    createdAt: '2025-07-01',
    updatedAt: '2026-01-18',
    totalViews: 1120,
  },
  {
    id: '4',
    name: 'Al Ain Oasis Loop',
    slug: 'al-ain-oasis-loop',
    description: 'Peaceful ride through the historic Al Ain Oasis. Flat terrain ideal for families and recreational cycling. UNESCO World Heritage site with unique cultural experience.',
    trackType: 'Urban',
    country: 'UAE',
    city: 'Al Ain',
    area: 'Oasis District',
    distance: 25,
    difficulty: 'Easy',
    surfaceType: 'Asphalt',
    elevationGain: 15,
    estimatedTime: '1-1.5 hours',
    loopOptions: [8, 15, 25],
    facilities: ['Water Stations', 'Parking', 'Restrooms'],
    safetyNotes: 'Shared path with pedestrians. Slow speeds required in oasis areas. Respect cultural site rules.',
    helmetRequired: true,
    nightRidingAllowed: false,
    status: 'Open',
    visibility: 'Public',
    displayPriority: 6,
    thumbnailImage: 'https://images.unsplash.com/photo-1517649763962-0c623066013b?w=400',
    coverImage: 'https://images.unsplash.com/photo-1517649763962-0c623066013b?w=800',
    galleryImages: [],
    createdAt: '2025-07-10',
    updatedAt: '2026-01-10',
    totalViews: 890,
  },
  {
    id: '5',
    name: 'Abu Dhabi Corniche',
    slug: 'abu-dhabi-corniche',
    description: 'Beautiful coastal cycling path along the Abu Dhabi Corniche. Popular route for morning and evening rides with stunning city skyline views.',
    trackType: 'Coastal',
    country: 'UAE',
    city: 'Abu Dhabi',
    area: 'Corniche',
    distance: 18,
    difficulty: 'Easy',
    surfaceType: 'Asphalt',
    elevationGain: 10,
    estimatedTime: '45-60 minutes',
    loopOptions: [6, 12, 18],
    facilities: ['Lighting', 'Water Stations', 'Parking', 'Restrooms', 'Cafes'],
    safetyNotes: 'Popular tourist area - watch for pedestrians. Evening rides recommended for cooler temperatures.',
    helmetRequired: true,
    nightRidingAllowed: true,
    status: 'Open',
    visibility: 'Public',
    displayPriority: 8,
    thumbnailImage: 'https://images.unsplash.com/photo-1758608906924-57a6ca140153?w=400',
    coverImage: 'https://images.unsplash.com/photo-1758608906924-57a6ca140153?w=800',
    galleryImages: [
      'https://images.unsplash.com/photo-1758608906924-57a6ca140153?w=800',
    ],
    createdAt: '2025-08-01',
    updatedAt: '2026-01-25',
    totalViews: 2100,
  },
  {
    id: '6',
    name: 'Al Qudra Cycle Track',
    slug: 'al-qudra-cycle-track',
    description: 'Long-distance desert cycling track. Challenging route for experienced cyclists with stunning desert scenery. Purpose-built cycling path through protected desert area.',
    trackType: 'Desert',
    country: 'UAE',
    city: 'Dubai',
    area: 'Al Qudra',
    distance: 86,
    difficulty: 'Hard',
    surfaceType: 'Asphalt',
    elevationGain: 240,
    estimatedTime: '3-5 hours',
    loopOptions: [20, 40, 60, 86],
    facilities: ['Water Stations', 'Parking', 'Restrooms'],
    safetyNotes: 'Remote desert location - carry adequate water and sun protection. Ride in groups recommended. No shade available. Emergency services may take time to reach location.',
    helmetRequired: true,
    nightRidingAllowed: false,
    status: 'Open',
    visibility: 'Public',
    displayPriority: 9,
    thumbnailImage: 'https://images.unsplash.com/photo-1718527192815-bb68dd23ce74?w=400',
    coverImage: 'https://images.unsplash.com/photo-1718527192815-bb68dd23ce74?w=800',
    galleryImages: [
      'https://images.unsplash.com/photo-1718527192815-bb68dd23ce74?w=800',
    ],
    createdAt: '2025-08-15',
    updatedAt: '2026-01-22',
    totalViews: 3200,
  },
  {
    id: '7',
    name: 'Mushrif Park Loop',
    slug: 'mushrif-park-loop',
    description: 'Family-friendly park loop with shaded paths. Perfect for weekend community rides and kids events. Natural forest setting with diverse wildlife.',
    trackType: 'Urban',
    country: 'UAE',
    city: 'Dubai',
    area: 'Mushrif',
    distance: 12,
    difficulty: 'Easy',
    surfaceType: 'Mixed',
    elevationGain: 30,
    estimatedTime: '30-45 minutes',
    loopOptions: [4, 8, 12],
    facilities: ['Water Stations', 'Parking', 'Restrooms', 'Cafes'],
    safetyNotes: 'Park operating hours apply. Watch for children and families. Some paths may be unpaved.',
    helmetRequired: true,
    nightRidingAllowed: false,
    status: 'Open',
    visibility: 'Public',
    displayPriority: 5,
    thumbnailImage: 'https://images.unsplash.com/photo-1532444458054-01a7dd3e9fca?w=400',
    coverImage: 'https://images.unsplash.com/photo-1532444458054-01a7dd3e9fca?w=800',
    galleryImages: [],
    createdAt: '2025-09-01',
    updatedAt: '2026-01-12',
    totalViews: 760,
  },
  {
    id: '8',
    name: 'Ras Al Khaimah Coast Road',
    slug: 'ras-al-khaimah-coast-road',
    description: 'Coastal road with moderate traffic. Beautiful seaside views and rolling terrain. Popular weekend route for experienced riders.',
    trackType: 'Road',
    country: 'UAE',
    city: 'Ras Al Khaimah',
    area: 'Coastal Area',
    distance: 28,
    difficulty: 'Medium',
    surfaceType: 'Asphalt',
    elevationGain: 150,
    estimatedTime: '1.5-2 hours',
    loopOptions: [10, 18, 28],
    facilities: ['Water Stations', 'Parking'],
    safetyNotes: 'Shared road with vehicles - stay alert. Moderate traffic on weekends. High visibility clothing recommended.',
    helmetRequired: true,
    nightRidingAllowed: false,
    status: 'Limited',
    visibility: 'Public',
    displayPriority: 4,
    thumbnailImage: 'https://images.unsplash.com/photo-1541625602330-2277a4c46182?w=400',
    coverImage: 'https://images.unsplash.com/photo-1541625602330-2277a4c46182?w=800',
    galleryImages: [],
    createdAt: '2025-09-15',
    updatedAt: '2026-01-08',
    totalViews: 650,
  },
];

export const availableFacilities = [
  { key: 'lights', label: 'lighting' },
  { key: 'water', label: 'water stations' },
  { key: 'parking', label: 'parking' },
  { key: 'toilets', label: 'restrooms' },
  { key: 'cafes', label: 'cafes' },
  { key: 'bike_rental', label: 'bike rental' },
  { key: 'first_aid', label: 'first aid' },
  { key: 'changing_rooms', label: 'changing rooms' },
];

export function getAllTracks(): Track[] {
  return tracks;
}

export function getTrack(id: string): Track | undefined {
  return tracks.find(t => t.id === id);
}

export function getTracksByCity(city: string): Track[] {
  return tracks.filter(t => t.city === city);
}

export function addTrack(track: Track): void {
  tracks.push(track);
}

export function updateTrack(id: string, updates: Partial<Track>): void {
  const index = tracks.findIndex(t => t.id === id);
  if (index !== -1) {
    tracks[index] = { ...tracks[index], ...updates, updatedAt: new Date().toISOString().split('T')[0] };
  }
}

export function deleteTrack(id: string, eventsData: any[]): boolean {
  // Check if track is being used by any events
  const hasLinkedEvents = eventsData.some((e: any) => e.trackId === id);
  
  if (hasLinkedEvents) {
    return false; // Cannot delete - track has linked events
  }
  
  tracks = tracks.filter(t => t.id !== id);
  return true;
}

export function archiveTrack(id: string): void {
  updateTrack(id, { status: 'Closed', visibility: 'Hidden' });
}

// Get all events linked to a specific track
export function getTrackEvents(trackId: string, eventsData: any[]): any[] {
  return eventsData.filter((e: any) => e.trackId === trackId);
}

// Get upcoming events for a track
export function getTrackUpcomingEvents(trackId: string, eventsData: any[]): any[] {
  const events = getTrackEvents(trackId, eventsData);
  const today = new Date();
  return events.filter((e: any) => new Date(e.eventDate) >= today);
}

// Get all communities using a specific track
export function getTrackCommunities(
  trackId: string,
  communitiesData: Community[]
): Community[] {
  return communitiesData.filter(
    (c) => c.primaryTracks?.includes(trackId)
  );
}

// Filter tracks by country
export function getTracksByCountry(country: string): Track[] {
  return tracks.filter(track => track.country === country);
}

// Filter tracks by country and city
export function getTracksByCountryAndCity(country: string, city: string): Track[] {
  return tracks.filter(track => track.country === country && track.city === city);
}

// Get available cities for a country (from tracks)
export function getCitiesWithTracks(country: string): string[] {
  const countryTracks = getTracksByCountry(country);
  const cities = [...new Set(countryTracks.map(track => track.city))];
  return cities.sort();
}