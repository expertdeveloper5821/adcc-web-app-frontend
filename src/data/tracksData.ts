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
}

export const tracksData: Track[] = [
  {
    id: '1',
    name: 'Al Wathba Circuit',
    city: 'Abu Dhabi',
    area: 'Al Wathba',
    distance: 25,
    elevation: 150,
    difficulty: 'Medium',
    surfaceType: 'Road',
    hasLighting: true,
    safetyLevel: 'High',
    trafficLevel: 'Low',
    helmetRequired: true,
    nightRidingAllowed: true,
    safetyNotes: 'Well-maintained circuit with dedicated cycling lanes and safety barriers.',
    shortDescription: 'Professional cycling circuit with excellent facilities',
    status: 'Active',
    eventsCount: 24,
    image: 'https://images.unsplash.com/photo-1553547358-e8a4ee2dcfeb?w=800',
    mapPreview: 'https://images.unsplash.com/photo-1757860150436-faf5d20b8893?w=400',
    createdAt: '2025-06-15',
  },
  {
    id: '2',
    name: 'Yas Marina Circuit',
    city: 'Abu Dhabi',
    area: 'Yas Island',
    distance: 18,
    elevation: 80,
    difficulty: 'Medium',
    surfaceType: 'Road',
    hasLighting: true,
    safetyLevel: 'High',
    trafficLevel: 'Low',
    helmetRequired: true,
    nightRidingAllowed: true,
    safetyNotes: 'F1 grade circuit with world-class safety standards.',
    shortDescription: 'World-famous F1 circuit for cycling events',
    status: 'Active',
    eventsCount: 18,
    image: 'https://images.unsplash.com/photo-1716738634956-1494117b349b?w=800',
    createdAt: '2025-06-20',
  },
  {
    id: '3',
    name: 'Corniche Road',
    city: 'Abu Dhabi',
    area: 'Corniche',
    distance: 15,
    elevation: 20,
    difficulty: 'Easy',
    surfaceType: 'Road',
    hasLighting: true,
    safetyLevel: 'Medium',
    trafficLevel: 'Medium',
    helmetRequired: true,
    nightRidingAllowed: false,
    safetyNotes: 'Scenic coastal route with moderate traffic during peak hours.',
    shortDescription: 'Beautiful coastal cycling route',
    status: 'Active',
    eventsCount: 12,
    image: 'https://images.unsplash.com/photo-1758608906924-57a6ca140153?w=800',
    createdAt: '2025-07-01',
  },
  {
    id: '4',
    name: 'Desert Route 1',
    city: 'Al Ain',
    area: 'Desert Region',
    distance: 30,
    elevation: 200,
    difficulty: 'Hard',
    surfaceType: 'Mixed',
    hasLighting: false,
    safetyLevel: 'Medium',
    trafficLevel: 'Low',
    helmetRequired: true,
    nightRidingAllowed: false,
    safetyNotes: 'Remote desert route. Ride in groups and carry adequate water.',
    shortDescription: 'Challenging desert cycling experience',
    status: 'Active',
    eventsCount: 8,
    image: 'https://images.unsplash.com/photo-1718527192815-bb68dd23ce74?w=800',
    createdAt: '2025-07-10',
  },
];

export let tracks = [...tracksData];

export function addTrack(track: Track) {
  tracks.push(track);
}

export function updateTrack(id: string, updates: Partial<Track>) {
  const index = tracks.findIndex(t => t.id === id);
  if (index !== -1) {
    tracks[index] = { ...tracks[index], ...updates };
  }
}

export function deleteTrack(id: string) {
  tracks = tracks.filter(t => t.id !== id);
}

export function getTrack(id: string): Track | undefined {
  return tracks.find(t => t.id === id);
}

export function getAllTracks(): Track[] {
  return tracks;
}
