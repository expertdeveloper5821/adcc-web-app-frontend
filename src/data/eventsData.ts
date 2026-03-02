export interface Event {
  id: string;
  name: string;
  slug: string;
  category: 'Race' | 'Community Ride' | 'Training & Clinics' | 'Awareness Rides' | 'Family & Kids' | 'Corporate Events' | 'National Events';
  communityId: string;
  communityName: string;
  trackId: string;
  trackName: string;
  city: string;
  country: string;
  
  // Purpose-Based Event
  isPurposeBased: boolean;
  purposeType?: 'Awareness' | 'Charity' | 'Education' | 'Corporate' | 'Health' | 'National';
  
  description: string;
  
  eventDate: string;
  startTime: string;
  endTime: string;
  
  distance: number;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  maxParticipants: number;
  currentParticipants: number;
  registrationFee: 'FREE';
  
  schedule: { time: string; activity: string }[];
  amenities: string[];
  
  eligibility: {
    ageRequirement: string;
    bikeType: string;
    experienceLevel: string;
  };
  
  rewards: {
    points: number;
    badgeName: string;
    badgeImage?: string;
  };
  
  coverImage: string;
  galleryImages: string[];
  
  status: 'Draft' | 'Open' | 'Full' | 'Completed' | 'Archived';
  isFeatured: boolean;
  allowCancellation: boolean;
  
  stats?: {
    registered: number;
    checkedIn: number;
    completed: number;
  };
  
  createdAt: string;
  updatedAt: string;
}

export interface EventParticipant {
  id: string;
  eventId: string;
  userId: string;
  userName: string;
  userCommunity: string;
  status: 'registered' | 'checked-in' | 'completed' | 'no-show';
  registeredAt: string;
  checkedInAt?: string;
  rank?: number;
  time?: string;
  points?: number;
}

let events: Event[] = [
  {
    id: '1',
    name: 'Abu Dhabi Night Race Series – Round 3',
    slug: 'abu-dhabi-night-race-series-round-3',
    category: 'Race',
    communityId: '1',
    communityName: 'Abu Dhabi Road Racers',
    trackId: '1',
    trackName: 'Yas Marina Circuit',
    city: 'Abu Dhabi',
    country: 'UAE',
    
    // Purpose-Based Event
    isPurposeBased: false,
    purposeType: undefined,
    
    description: 'Join us for the third round of the exciting Abu Dhabi Night Race Series. Experience the thrill of racing under the stars on the world-famous Yas Marina Circuit.',
    eventDate: '2026-07-18',
    startTime: '05:30',
    endTime: '08:00',
    distance: 42,
    difficulty: 'Hard',
    maxParticipants: 150,
    currentParticipants: 96,
    registrationFee: 'FREE',
    schedule: [
      { time: '05:00', activity: 'Rider check-in' },
      { time: '05:20', activity: 'Safety briefing' },
      { time: '05:30', activity: 'Race start' },
      { time: '07:30', activity: 'Award ceremony' },
    ],
    amenities: ['Water', 'Toilets', 'Parking', 'Lighting', 'Medical support', 'Bike service'],
    eligibility: {
      ageRequirement: '18+',
      bikeType: 'Road bike',
      experienceLevel: 'Advanced',
    },
    rewards: {
      points: 300,
      badgeName: 'Night Racer Champion',
    },
    coverImage: 'https://images.unsplash.com/photo-1541625602330-2277a4c46182?w=800',
    galleryImages: [],
    status: 'Open',
    isFeatured: true,
    allowCancellation: true,
    stats: {
      registered: 96,
      checkedIn: 0,
      completed: 0,
    },
    createdAt: '2026-01-15',
    updatedAt: '2026-01-20',
  },
  {
    id: '2',
    name: 'Al Ain Morning Community Ride',
    slug: 'al-ain-morning-community-ride',
    category: 'Community Ride',
    communityId: '2',
    communityName: 'Al Ain Cycling Hub',
    trackId: '4',
    trackName: 'Al Ain Oasis Loop',
    city: 'Al Ain',
    country: 'UAE',
    
    // Purpose-Based Event
    isPurposeBased: false,
    purposeType: undefined,
    
    description: 'A relaxed morning ride through the beautiful Al Ain Oasis. Perfect for all skill levels.',
    eventDate: '2026-02-05',
    startTime: '06:00',
    endTime: '08:30',
    distance: 25,
    difficulty: 'Easy',
    maxParticipants: 80,
    currentParticipants: 45,
    registrationFee: 'FREE',
    schedule: [
      { time: '06:00', activity: 'Group meeting at Oasis entrance' },
      { time: '06:15', activity: 'Ride begins' },
      { time: '08:00', activity: 'Coffee break' },
    ],
    amenities: ['Water', 'Toilets', 'Parking'],
    eligibility: {
      ageRequirement: '16+',
      bikeType: 'Any',
      experienceLevel: 'Beginner',
    },
    rewards: {
      points: 50,
      badgeName: 'Oasis Explorer',
    },
    coverImage: 'https://images.unsplash.com/photo-1517649763962-0c623066013b?w=800',
    galleryImages: [],
    status: 'Open',
    isFeatured: false,
    allowCancellation: true,
    stats: {
      registered: 45,
      checkedIn: 0,
      completed: 0,
    },
    createdAt: '2026-01-10',
    updatedAt: '2026-01-18',
  },
  {
    id: '3',
    name: 'Dubai Fitness Challenge Training Camp',
    slug: 'dubai-fitness-challenge-training-camp',
    category: 'Training & Clinics',
    communityId: '3',
    communityName: 'Dubai Cycling Club',
    trackId: '2',
    trackName: 'Dubai Autodrome',
    city: 'Dubai',
    country: 'UAE',
    
    // Purpose-Based Event
    isPurposeBased: false,
    purposeType: undefined,
    
    description: 'Intensive training camp to prepare for the Dubai Fitness Challenge. Professional coaching included.',
    eventDate: '2026-02-12',
    startTime: '07:00',
    endTime: '11:00',
    distance: 35,
    difficulty: 'Medium',
    maxParticipants: 60,
    currentParticipants: 60,
    registrationFee: 'FREE',
    schedule: [
      { time: '07:00', activity: 'Warm-up session' },
      { time: '07:30', activity: 'Technique drills' },
      { time: '09:00', activity: 'Endurance ride' },
      { time: '10:30', activity: 'Cool down and Q&A' },
    ],
    amenities: ['Water', 'Toilets', 'Parking', 'Medical support', 'Bike service'],
    eligibility: {
      ageRequirement: '18+',
      bikeType: 'Road bike',
      experienceLevel: 'Intermediate',
    },
    rewards: {
      points: 150,
      badgeName: 'Training Champion',
    },
    coverImage: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800',
    galleryImages: [],
    status: 'Full',
    isFeatured: true,
    allowCancellation: false,
    stats: {
      registered: 60,
      checkedIn: 0,
      completed: 0,
    },
    createdAt: '2026-01-05',
    updatedAt: '2026-01-25',
  },
  {
    id: '4',
    name: 'Pink Ride for Breast Cancer Awareness',
    slug: 'pink-ride-breast-cancer-awareness',
    category: 'Awareness Rides',
    communityId: '5',
    communityName: 'Pink Pedalers',
    trackId: '1',
    trackName: 'Yas Marina Circuit',
    city: 'Abu Dhabi',
    country: 'UAE',
    
    // Purpose-Based Event
    isPurposeBased: true,
    purposeType: 'Awareness',
    
    description: 'Annual breast cancer awareness ride. All proceeds support cancer research and patient care. Wear pink and ride for a cause!',
    eventDate: '2026-03-08',
    startTime: '06:30',
    endTime: '09:00',
    distance: 20,
    difficulty: 'Easy',
    maxParticipants: 200,
    currentParticipants: 134,
    registrationFee: 'FREE',
    schedule: [
      { time: '06:00', activity: 'Registration and jersey collection' },
      { time: '06:30', activity: 'Opening ceremony' },
      { time: '07:00', activity: 'Ride begins' },
      { time: '08:30', activity: 'Closing ceremony' },
    ],
    amenities: ['Water', 'Toilets', 'Parking', 'Medical support'],
    eligibility: {
      ageRequirement: 'All ages',
      bikeType: 'Any',
      experienceLevel: 'Beginner',
    },
    rewards: {
      points: 100,
      badgeName: 'Pink Warrior',
    },
    coverImage: 'https://images.unsplash.com/photo-1532444458054-01a7dd3e9fca?w=800',
    galleryImages: [],
    status: 'Open',
    isFeatured: true,
    allowCancellation: true,
    stats: {
      registered: 134,
      checkedIn: 0,
      completed: 0,
    },
    createdAt: '2025-12-20',
    updatedAt: '2026-01-28',
  },
  {
    id: '5',
    name: 'UAE National Day Celebration Ride',
    slug: 'uae-national-day-celebration-ride',
    category: 'National Events',
    communityId: '4',
    communityName: 'Sharjah Speed Riders',
    trackId: '3',
    trackName: 'Sharjah Waterfront Track',
    city: 'Sharjah',
    country: 'UAE',
    
    // Purpose-Based Event
    isPurposeBased: true,
    purposeType: 'National',
    
    description: 'Celebrate UAE National Day with a scenic coastal ride. Join fellow cyclists to honor our nation\'s heritage and unity.',
    eventDate: '2026-01-22',
    startTime: '05:00',
    endTime: '07:00',
    distance: 15,
    difficulty: 'Hard',
    maxParticipants: 100,
    currentParticipants: 100,
    registrationFee: 'FREE',
    schedule: [
      { time: '04:30', activity: 'Rider check-in' },
      { time: '04:50', activity: 'Race briefing' },
      { time: '05:00', activity: 'Sprint start' },
      { time: '06:30', activity: 'Award ceremony' },
    ],
    amenities: ['Water', 'Toilets', 'Parking', 'Lighting', 'Medical support'],
    eligibility: {
      ageRequirement: '18+',
      bikeType: 'Road bike',
      experienceLevel: 'Advanced',
    },
    rewards: {
      points: 500,
      badgeName: 'Sprint Master',
    },
    coverImage: 'https://images.unsplash.com/photo-1517649763962-0c623066013b?w=800',
    galleryImages: [],
    status: 'Completed',
    isFeatured: false,
    allowCancellation: false,
    stats: {
      registered: 100,
      checkedIn: 98,
      completed: 95,
    },
    createdAt: '2025-12-01',
    updatedAt: '2026-01-22',
  },
];

let participants: EventParticipant[] = [
  {
    id: '1',
    eventId: '1',
    userId: 'u1',
    userName: 'Ahmed Al Mansouri',
    userCommunity: 'Abu Dhabi Road Racers',
    status: 'registered',
    registeredAt: '2026-01-16',
  },
  {
    id: '2',
    eventId: '1',
    userId: 'u2',
    userName: 'Sara Thompson',
    userCommunity: 'Abu Dhabi Road Racers',
    status: 'registered',
    registeredAt: '2026-01-17',
  },
  {
    id: '3',
    eventId: '5',
    userId: 'u3',
    userName: 'Mohammed Hassan',
    userCommunity: 'Sharjah Speed Riders',
    status: 'completed',
    registeredAt: '2026-01-05',
    checkedInAt: '2026-01-22',
    rank: 1,
    time: '00:23:45',
    points: 500,
  },
  {
    id: '4',
    eventId: '5',
    userId: 'u4',
    userName: 'John Peterson',
    userCommunity: 'Dubai Cycling Club',
    status: 'completed',
    registeredAt: '2026-01-06',
    checkedInAt: '2026-01-22',
    rank: 2,
    time: '00:24:12',
    points: 300,
  },
  {
    id: '5',
    eventId: '5',
    userId: 'u5',
    userName: 'Fatima Al Zaabi',
    userCommunity: 'Sharjah Speed Riders',
    status: 'completed',
    registeredAt: '2026-01-07',
    checkedInAt: '2026-01-22',
    rank: 3,
    time: '00:24:58',
    points: 200,
  },
];

export const availableCategories = [
  'Race',
  'Community Ride',
  'Training & Clinics',
  'Awareness Rides',
  'Family & Kids',
  'Corporate Events',
  'National Events',
];

export const availableCities = [
  'Abu Dhabi',
  'Dubai',
  'Sharjah',
  'Ajman',
  'Umm Al Quwain',
  'Ras Al Khaimah',
  'Fujairah',
  'Al Ain',
];

export function getAllEvents(): Event[] {
  return events;
}

export function getEvent(id: string): Event | undefined {
  return events.find(e => e.id === id);
}

export function addEvent(event: Event): void {
  events.push(event);
}

export function updateEvent(id: string, updates: Partial<Event>): void {
  const index = events.findIndex(e => e.id === id);
  if (index !== -1) {
    events[index] = { ...events[index], ...updates };
  }
}

export function deleteEvent(id: string): void {
  events = events.filter(e => e.id !== id);
}

export function getEventParticipants(eventId: string): EventParticipant[] {
  return participants.filter(p => p.eventId === eventId);
}

export function addParticipant(participant: EventParticipant): void {
  participants.push(participant);
}

export function updateParticipant(id: string, updates: Partial<EventParticipant>): void {
  const index = participants.findIndex(p => p.id === id);
  if (index !== -1) {
    participants[index] = { ...participants[index], ...updates };
  }
}

export function removeParticipant(id: string): void {
  participants = participants.filter(p => p.id !== id);
}