export interface Community {
  id: string;
  name: string;
  city: string;
  type: 'Club' | 'Shop' | 'Women' | 'Youth' | 'Family' | 'Corporate';
  description: string;
  isPublic: boolean;
  isFeatured: boolean;
  membersCount: number;
  eventsCount: number;
  status: 'Active' | 'Draft' | 'Disabled';
  logo: string;
  coverImage: string;
  adminId?: string;
  adminName?: string;
  teams: string[];
  createdAt: string;
}

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
    name: 'Abu Dhabi Chapter',
    city: 'Abu Dhabi',
    type: 'Club',
    description: 'The main Abu Dhabi cycling community bringing together riders of all levels',
    isPublic: true,
    isFeatured: true,
    membersCount: 3420,
    eventsCount: 18,
    status: 'Active',
    logo: 'https://images.unsplash.com/photo-1584981401957-03158e43750d?w=200',
    coverImage: 'https://images.unsplash.com/photo-1707297391684-e07bd2368432?w=800',
    adminName: 'Ahmed Al Mansoori',
    teams: ['ADCycling Team', 'Al Wathba CT', 'Al Fursan CT'],
    createdAt: '2025-01-15',
  },
  {
    id: '2',
    name: 'Dubai Chapter',
    city: 'Dubai',
    type: 'Club',
    description: 'Dubai\'s premier cycling community for road and track enthusiasts',
    isPublic: true,
    isFeatured: true,
    membersCount: 2890,
    eventsCount: 15,
    status: 'Active',
    logo: 'https://images.unsplash.com/photo-1521078803125-7efd09b65b8f?w=200',
    coverImage: 'https://images.unsplash.com/photo-1716738634956-1494117b349b?w=800',
    adminName: 'Sara Hassan',
    teams: ['Go Cycling Dubai', 'Fullgas CT'],
    createdAt: '2025-02-01',
  },
  {
    id: '3',
    name: 'Al Ain Chapter',
    city: 'Al Ain',
    type: 'Club',
    description: 'Mountain and desert cycling specialists',
    isPublic: true,
    isFeatured: false,
    membersCount: 1240,
    eventsCount: 9,
    status: 'Active',
    logo: 'https://images.unsplash.com/photo-1584981401957-03158e43750d?w=200',
    coverImage: 'https://images.unsplash.com/photo-1718527192815-bb68dd23ce74?w=800',
    adminName: 'Mohammed Ali',
    teams: ['Al Ain CT'],
    createdAt: '2025-02-15',
  },
  {
    id: '4',
    name: 'Women Moving Forward',
    city: 'Abu Dhabi',
    type: 'Women',
    description: 'Empowering women cyclists across the UAE',
    isPublic: true,
    isFeatured: true,
    membersCount: 890,
    eventsCount: 12,
    status: 'Active',
    logo: 'https://images.unsplash.com/photo-1584981401957-03158e43750d?w=200',
    coverImage: 'https://images.unsplash.com/photo-1662855414519-2b1b44ef3a08?w=800',
    adminName: 'Fatima Al Zaabi',
    teams: ['Women Moving Forward'],
    createdAt: '2025-03-01',
  },
  {
    id: '5',
    name: 'Cycle Zone Shop',
    city: 'Abu Dhabi',
    type: 'Shop',
    description: 'Community rides and events hosted by Cycle Zone bike shop',
    isPublic: true,
    isFeatured: false,
    membersCount: 450,
    eventsCount: 6,
    status: 'Active',
    logo: 'https://images.unsplash.com/photo-1584981401957-03158e43750d?w=200',
    coverImage: 'https://images.unsplash.com/photo-1707297391684-e07bd2368432?w=800',
    adminName: 'Omar Khalid',
    teams: ['Cycle Zone CT'],
    createdAt: '2025-03-20',
  },
];

export let communities = [...communitiesData];

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
