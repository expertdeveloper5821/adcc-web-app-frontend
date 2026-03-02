export interface Community {
  id: string;
  name: string;
  slug: string;
  
  // Classification
  communityType: 'city' | 'type' | 'purpose-based';
  category: string[]; // Multi-select categories
  purposeType?: 'Awareness' | 'Charity' | 'Corporate' | 'Education' | 'Health' | 'National' | null;
  
  // Location
  city: string;
  country: string;
  area?: string;
  
  description: string;
  
  // Tracks Mapping
  primaryTracks: string[]; // Track IDs
  
  // Stats
  foundedYear?: number;
  stats: {
    members: number;
    upcomingEvents: number;
    ridesThisMonth?: number; // For Type communities
    weeklyRides?: number; // For City communities
    fundsRaised?: number; // For Special communities (AED)
  };
  
  // Visibility & Status
  isFeatured: boolean;
  status: 'active' | 'inactive';
  visibility: 'public' | 'private';
  allowPosts: boolean;
  allowGallery: boolean;
  
  // Media
  logo: string;
  coverImage: string;
  
  // Admin
  managerId?: string;
  managerName?: string;
  moderators?: string[];
  
  // Legacy fields for backward compatibility
  type?: 'Club' | 'Shop' | 'Women' | 'Youth' | 'Family' | 'Corporate';
  isPublic?: boolean;
  membersCount?: number;
  eventsCount?: number;
  teams?: string[];
  createdAt: string;
  postsCount?: number;
  tracksCount?: number;
  galleryCount?: number;
}

export interface CommunityFeedPost {
  id: string;
  communityId: string;
  title: string;
  caption: string;
  type: 'announcement' | 'highlight' | 'awareness';
  media: {
    type: 'image' | 'video';
    url: string;
  }[];
  isPinned: boolean;
  createdAt: string;
  createdBy: string;
}

export const availableCategories = [
  'Racing & Performance',
  'Family & Leisure',
  'Women (SheRides)',
  'Youth',
  'Social / Weekend',
  'Night Riders',
  'MTB / Trail',
  'Training & Clinics',
  'Awareness & Charity',
  'Corporate',
  'Education',
  'Health',
];

export const availableCities = [
  'Abu Dhabi',
  'Al Ain',
  'Dubai',
  'Al Dhafra',
  'Sharjah',
];

export const availableTeams = [
  'ADCycling Team',
  'Al Dhafra CT',
  'Rabdan CT',
  'Al Ain CT',
  'Al Raha CT',
  'Fullgas CT',
  'Yasi CT',
  'Saraab CT',
  'Al Wathba CT',
  '971 Athletes',
  'Al Fursan CT',
  'Cycle Zone CT',
  'Yas Cycle CT',
  'Salam Bike Shop CT',
  'Modon CT',
  'Go Cycling Dubai',
  'Al Hudayriyat CT',
  'Saikal Cafe CT',
  'Women Moving Forward',
  'Not in any team',
];

export const communitiesData: Community[] = [
  {
    id: '1',
    name: 'Abu Dhabi Road Racers',
    slug: 'abu-dhabi-road-racers',
    communityType: 'city',
    category: ['Racing & Performance', 'Training & Clinics'],
    city: 'Abu Dhabi',
    country: 'UAE',
    area: 'Yas Island',
    description: 'The main Abu Dhabi cycling community bringing together riders of all levels. We focus on racing, performance training, and competitive cycling.',
    primaryTracks: ['1', '2', '4'],
    foundedYear: 2019,
    stats: {
      members: 2800,
      upcomingEvents: 8,
      weeklyRides: 6,
    },
    isFeatured: true,
    status: 'active',
    visibility: 'public',
    allowPosts: true,
    allowGallery: true,
    logo: 'https://images.unsplash.com/photo-1584981401957-03158e43750d?w=200',
    coverImage: 'https://images.unsplash.com/photo-1707297391684-e07bd2368432?w=800',
    managerName: 'Ahmed Al Mansoori',
    teams: ['ADCycling Team', 'Al Wathba CT', 'Al Fursan CT'],
    createdAt: '2025-01-15',
    postsCount: 24,
    tracksCount: 3,
    galleryCount: 156,
  },
  {
    id: '2',
    name: 'Hudayriyat Weekend Riders',
    slug: 'hudayriyat-weekend-riders',
    communityType: 'type',
    category: ['Social / Weekend', 'Family & Leisure'],
    city: 'Abu Dhabi',
    country: 'UAE',
    area: 'Al Hudayriyat Island',
    description: 'Casual weekend rides for families and social cyclists. Perfect for beginners and those looking for a relaxed cycling experience.',
    primaryTracks: ['1', '3'],
    foundedYear: 2020,
    stats: {
      members: 1540,
      upcomingEvents: 12,
      ridesThisMonth: 18,
    },
    isFeatured: true,
    status: 'active',
    visibility: 'public',
    allowPosts: true,
    allowGallery: true,
    logo: 'https://images.unsplash.com/photo-1521078803125-7efd09b65b8f?w=200',
    coverImage: 'https://images.unsplash.com/photo-1716738634956-1494117b349b?w=800',
    managerName: 'Sara Hassan',
    teams: ['Al Hudayriyat CT'],
    createdAt: '2025-02-01',
    postsCount: 32,
    tracksCount: 2,
    galleryCount: 98,
  },
  {
    id: '3',
    name: 'SheRides Abu Dhabi',
    slug: 'sherides-abu-dhabi',
    communityType: 'purpose-based',
    category: ['Women (SheRides)', 'Social / Weekend'],
    purposeType: 'Education',
    city: 'Abu Dhabi',
    country: 'UAE',
    description: 'Empowering women cyclists across the UAE. A safe, supportive community for women of all cycling levels.',
    primaryTracks: ['1', '2'],
    foundedYear: 2021,
    stats: {
      members: 890,
      upcomingEvents: 6,
      fundsRaised: 125000,
    },
    isFeatured: true,
    status: 'active',
    visibility: 'public',
    allowPosts: true,
    allowGallery: true,
    logo: 'https://images.unsplash.com/photo-1584981401957-03158e43750d?w=200',
    coverImage: 'https://images.unsplash.com/photo-1662855414519-2b1b44ef3a08?w=800',
    managerName: 'Fatima Al Zaabi',
    teams: ['Women Moving Forward'],
    createdAt: '2025-03-01',
    postsCount: 16,
    tracksCount: 2,
    galleryCount: 67,
  },
  {
    id: '4',
    name: 'Al Ain Mountain Riders',
    slug: 'al-ain-mountain-riders',
    communityType: 'city',
    category: ['MTB / Trail', 'Racing & Performance'],
    city: 'Al Ain',
    country: 'UAE',
    area: 'Jebel Hafeet',
    description: 'Mountain and desert cycling specialists. We explore the challenging trails and mountains around Al Ain.',
    primaryTracks: ['5', '6'],
    foundedYear: 2018,
    stats: {
      members: 1240,
      upcomingEvents: 9,
      weeklyRides: 4,
    },
    isFeatured: false,
    status: 'active',
    visibility: 'public',
    allowPosts: true,
    allowGallery: true,
    logo: 'https://images.unsplash.com/photo-1584981401957-03158e43750d?w=200',
    coverImage: 'https://images.unsplash.com/photo-1718527192815-bb68dd23ce74?w=800',
    managerName: 'Mohammed Ali',
    teams: ['Al Ain CT'],
    createdAt: '2025-02-15',
    postsCount: 12,
    tracksCount: 2,
    galleryCount: 45,
  },
  {
    id: '5',
    name: 'Cycle Zone Community',
    slug: 'cycle-zone-community',
    communityType: 'type',
    category: ['Social / Weekend', 'Training & Clinics'],
    city: 'Abu Dhabi',
    country: 'UAE',
    area: 'Marina Mall',
    description: 'Community rides and events hosted by Cycle Zone bike shop. Training clinics and group rides for all levels.',
    primaryTracks: ['2', '3'],
    foundedYear: 2022,
    stats: {
      members: 450,
      upcomingEvents: 6,
      ridesThisMonth: 14,
    },
    isFeatured: false,
    status: 'active',
    visibility: 'public',
    allowPosts: true,
    allowGallery: true,
    logo: 'https://images.unsplash.com/photo-1584981401957-03158e43750d?w=200',
    coverImage: 'https://images.unsplash.com/photo-1707297391684-e07bd2368432?w=800',
    managerName: 'Omar Khalid',
    teams: ['Cycle Zone CT'],
    createdAt: '2025-03-20',
    postsCount: 8,
    tracksCount: 2,
    galleryCount: 34,
  },
  {
    id: '6',
    name: 'Dubai Charity Riders',
    slug: 'dubai-charity-riders',
    communityType: 'purpose-based',
    category: ['Awareness & Charity', 'Social / Weekend'],
    purposeType: 'Charity',
    city: 'Dubai',
    country: 'UAE',
    description: 'Cycling for a cause. We organize charity rides and awareness campaigns across Dubai.',
    primaryTracks: ['7', '8'],
    foundedYear: 2020,
    stats: {
      members: 680,
      upcomingEvents: 4,
      fundsRaised: 340000,
    },
    isFeatured: true,
    status: 'active',
    visibility: 'public',
    allowPosts: true,
    allowGallery: true,
    logo: 'https://images.unsplash.com/photo-1584981401957-03158e43750d?w=200',
    coverImage: 'https://images.unsplash.com/photo-1716738634956-1494117b349b?w=800',
    managerName: 'Khalid Rahman',
    createdAt: '2025-01-10',
    postsCount: 19,
    tracksCount: 2,
    galleryCount: 72,
  },
  {
    id: '7',
    name: 'Night Riders UAE',
    slug: 'night-riders-uae',
    communityType: 'type',
    category: ['Night Riders', 'Social / Weekend'],
    city: 'Abu Dhabi',
    country: 'UAE',
    description: 'Experience cycling under the stars. We organize safe night rides with proper lighting and support.',
    primaryTracks: ['1', '2'],
    foundedYear: 2021,
    stats: {
      members: 320,
      upcomingEvents: 8,
      ridesThisMonth: 12,
    },
    isFeatured: false,
    status: 'active',
    visibility: 'public',
    allowPosts: true,
    allowGallery: true,
    logo: 'https://images.unsplash.com/photo-1584981401957-03158e43750d?w=200',
    coverImage: 'https://images.unsplash.com/photo-1519181245277-cffeb31da2e3?w=800',
    managerName: 'Yousef Al Hamadi',
    createdAt: '2025-02-20',
    postsCount: 15,
    tracksCount: 2,
    galleryCount: 43,
  },
  {
    id: '8',
    name: 'Youth Cycling Academy',
    slug: 'youth-cycling-academy',
    communityType: 'purpose-based',
    category: ['Youth', 'Training & Clinics', 'Education'],
    purposeType: 'Education',
    city: 'Abu Dhabi',
    country: 'UAE',
    description: 'Developing the next generation of cyclists. Professional coaching and training for youth aged 8-18.',
    primaryTracks: ['3', '4'],
    foundedYear: 2019,
    stats: {
      members: 210,
      upcomingEvents: 15,
      fundsRaised: 85000,
    },
    isFeatured: true,
    status: 'active',
    visibility: 'public',
    allowPosts: true,
    allowGallery: true,
    logo: 'https://images.unsplash.com/photo-1584981401957-03158e43750d?w=200',
    coverImage: 'https://images.unsplash.com/photo-1541625602330-2277a4c46182?w=800',
    managerName: 'Ahmed Rashid',
    createdAt: '2025-01-05',
    postsCount: 22,
    tracksCount: 2,
    galleryCount: 128,
  },
];

// Feed posts data
export const feedPostsData: CommunityFeedPost[] = [
  {
    id: 'p1',
    communityId: '1',
    title: 'Weekend Group Ride',
    caption: 'Join us this Saturday for our weekly 80km group ride! Meeting at 6:00 AM at Corniche.',
    type: 'announcement',
    media: [
      { type: 'image', url: 'https://images.unsplash.com/photo-1517649763962-0c623066013b?w=600' }
    ],
    isPinned: true,
    createdAt: '2025-01-18',
    createdBy: 'Ahmed Al Mansoori',
  },
  {
    id: 'p2',
    communityId: '1',
    title: 'Race Results',
    caption: 'Congratulations to our members who competed in the UAE National Championships! Outstanding performance!',
    type: 'highlight',
    media: [
      { type: 'image', url: 'https://images.unsplash.com/photo-1541625602330-2277a4c46182?w=600' }
    ],
    isPinned: false,
    createdAt: '2025-01-17',
    createdBy: 'Ahmed Al Mansoori',
  },
  {
    id: 'p3',
    communityId: '1',
    title: 'Safety Reminder',
    caption: 'Please remember to always wear your helmet and follow traffic rules. Your safety is our priority.',
    type: 'awareness',
    media: [],
    isPinned: false,
    createdAt: '2025-01-16',
    createdBy: 'Community Admin',
  },
];

export let communities = [...communitiesData];
export let feedPosts = [...feedPostsData];

export function addCommunity(community: Community) {
  communities.push(community);
}

export function updateCommunity(id: string, updates: Partial<Community>) {
  const index = communities.findIndex(c => c.id === id);
  if (index !== -1) {
    communities[index] = { ...communities[index], ...updates };
  }
}

export function deleteCommunity(id: string) {
  communities = communities.filter(c => c.id !== id);
}

export function getCommunity(id: string): Community | undefined {
  return communities.find(c => c.id === id);
}

export function getAllCommunities(): Community[] {
  return communities;
}

export function addFeedPost(post: CommunityFeedPost) {
  feedPosts.push(post);
}

export function updateFeedPost(id: string, updates: Partial<CommunityFeedPost>) {
  const index = feedPosts.findIndex(p => p.id === id);
  if (index !== -1) {
    feedPosts[index] = { ...feedPosts[index], ...updates };
  }
}

export function deleteFeedPost(id: string) {
  feedPosts = feedPosts.filter(p => p.id !== id);
}

export function getFeedPostsByCommunity(communityId: string): CommunityFeedPost[] {
  return feedPosts.filter(p => p.communityId === communityId);
}