export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'Distance' | 'Event' | 'Social' | 'Achievement' | 'Special';
  timesAwarded: number;
  rarity: 'Common' | 'Rare' | 'Epic' | 'Legendary';
  requirements: string;
  image: string;
  active: boolean;
}

let badges: Badge[] = [
  {
    id: '1',
    name: 'Century Crusher',
    description: 'Complete the 500km Monthly Challenge',
    icon: '🚴',
    category: 'Distance',
    timesAwarded: 234,
    rarity: 'Rare',
    requirements: 'Ride 500km in one month',
    image: 'https://images.unsplash.com/photo-1541625602330-2277a4c46182?w=200',
    active: true,
  },
  {
    id: '2',
    name: 'Early Bird',
    description: 'Complete 10 sunrise rides before 7:00 AM',
    icon: '🌅',
    category: 'Achievement',
    timesAwarded: 156,
    rarity: 'Common',
    requirements: 'Complete 10 rides before 7:00 AM',
    image: 'https://images.unsplash.com/photo-1475666675596-cca2035b3d79?w=200',
    active: true,
  },
  {
    id: '3',
    name: 'Gran Fondo Ready',
    description: 'Complete the Gran Fondo preparation challenge',
    icon: '🏆',
    category: 'Event',
    timesAwarded: 89,
    rarity: 'Epic',
    requirements: 'Complete 4 training rides of 50km+',
    image: 'https://images.unsplash.com/photo-1517649763962-0c623066013b?w=200',
    active: true,
  },
  {
    id: '4',
    name: 'Community Star',
    description: 'Active participant in community events',
    icon: '⭐',
    category: 'Social',
    timesAwarded: 312,
    rarity: 'Common',
    requirements: 'Join 5 different community rides',
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=200',
    active: true,
  },
  {
    id: '5',
    name: 'Summer Warrior',
    description: 'Conquer the summer heat with 1000km',
    icon: '☀️',
    category: 'Distance',
    timesAwarded: 67,
    rarity: 'Legendary',
    requirements: 'Ride 1000km during summer months',
    image: 'https://images.unsplash.com/photo-1534787238916-9ba6764efd4f?w=200',
    active: true,
  },
  {
    id: '6',
    name: 'Track Explorer',
    description: 'Completed rides on all official ADCC tracks',
    icon: '🗺️',
    category: 'Achievement',
    timesAwarded: 45,
    rarity: 'Epic',
    requirements: 'Complete rides on all 8 ADCC tracks',
    image: 'https://images.unsplash.com/photo-1571068316344-75bc76f77890?w=200',
    active: true,
  },
  {
    id: '7',
    name: 'First Timer',
    description: 'Completed first official ADCC event',
    icon: '🎉',
    category: 'Event',
    timesAwarded: 1247,
    rarity: 'Common',
    requirements: 'Complete your first ADCC event',
    image: 'https://images.unsplash.com/photo-1532444458054-01a7dd3e9fca?w=200',
    active: true,
  },
  {
    id: '8',
    name: 'Podium Finisher',
    description: 'Finished in top 3 of any ADCC race',
    icon: '🥇',
    category: 'Achievement',
    timesAwarded: 134,
    rarity: 'Legendary',
    requirements: 'Finish in top 3 positions',
    image: 'https://images.unsplash.com/photo-1552674605-db6ffd4facb5?w=200',
    active: true,
  },
  {
    id: '9',
    name: 'Night Owl',
    description: 'Complete 5 night rides after sunset',
    icon: '🌙',
    category: 'Achievement',
    timesAwarded: 89,
    rarity: 'Rare',
    requirements: 'Complete 5 rides after 8:00 PM',
    image: 'https://images.unsplash.com/photo-1519181245277-cffeb31da2e3?w=200',
    active: true,
  },
  {
    id: '10',
    name: 'Team Player',
    description: 'Joined and actively participated in a cycling team',
    icon: '👥',
    category: 'Social',
    timesAwarded: 567,
    rarity: 'Common',
    requirements: 'Join a team and complete 3 team rides',
    image: 'https://images.unsplash.com/photo-1517649763962-0c623066013b?w=200',
    active: true,
  },
];

export function getBadges(): Badge[] {
  return [...badges];
}

export function getBadge(id: string): Badge | undefined {
  return badges.find(b => b.id === id);
}

export function addBadge(badge: Badge): void {
  badges.push(badge);
}

export function updateBadge(id: string, updates: Partial<Badge>): void {
  const index = badges.findIndex(b => b.id === id);
  if (index !== -1) {
    badges[index] = { ...badges[index], ...updates };
  }
}

export function deleteBadge(id: string): void {
  badges = badges.filter(b => b.id !== id);
}
