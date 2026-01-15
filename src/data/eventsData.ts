export interface Event {
  id: string;
  name: string;
  shortDescription: string;
  fullDescription: string;
  city: string;
  track: string;
  date: string;
  startTime: string;
  endTime: string;
  capacity: number;
  registrations: number;
  rating: number;
  status: 'Draft' | 'Published' | 'Cancelled';
  featured: boolean;
  allowRating: boolean;
  allowSharing: boolean;
  registrationOpen: boolean;
  image: string;
  views: number;
  shares: number;
  createdAt: string;
}

export const eventsData: Event[] = [
  {
    id: '1',
    name: 'Al Wathba Morning Ride',
    shortDescription: 'Join us for a scenic morning ride around the Al Wathba Circuit',
    fullDescription: 'Experience the thrill of cycling on one of Abu Dhabi\'s premier tracks. This morning ride is perfect for intermediate cyclists looking to improve their skills while enjoying the beautiful desert landscape. We\'ll cover approximately 25km at a comfortable pace with scheduled water breaks.',
    city: 'Abu Dhabi',
    track: 'Al Wathba Circuit',
    date: '2026-01-15',
    startTime: '06:00',
    endTime: '08:00',
    capacity: 150,
    registrations: 124,
    rating: 4.8,
    status: 'Published',
    featured: true,
    allowRating: true,
    allowSharing: true,
    registrationOpen: true,
    image: 'https://images.unsplash.com/photo-1707297391684-e07bd2368432?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjeWNsaW5nJTIwZ3JvdXAlMjByb2FkfGVufDF8fHx8MTc2ODEzNjQzNXww&ixlib=rb-4.1.0&q=80&w=1080',
    views: 3420,
    shares: 89,
    createdAt: '2026-01-05',
  },
  {
    id: '2',
    name: 'Yas Island Sprint Challenge',
    shortDescription: 'High-intensity sprint event at Yas Marina Circuit',
    fullDescription: 'Test your speed and endurance at the world-famous Yas Marina Circuit. This competitive event features timed sprints and is ideal for experienced cyclists. Professional timing equipment and safety marshals will be present throughout the event.',
    city: 'Abu Dhabi',
    track: 'Yas Marina Circuit',
    date: '2026-01-18',
    startTime: '07:00',
    endTime: '10:00',
    capacity: 100,
    registrations: 89,
    rating: 4.9,
    status: 'Published',
    featured: true,
    allowRating: true,
    allowSharing: true,
    registrationOpen: true,
    image: 'https://images.unsplash.com/photo-1716738634956-1494117b349b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxiaWtlJTIwcmFjZSUyMHRyYWNrfGVufDF8fHx8MTc2ODEzNjQzNXww&ixlib=rb-4.1.0&q=80&w=1080',
    views: 2890,
    shares: 67,
    createdAt: '2026-01-03',
  },
  {
    id: '3',
    name: 'Desert Adventure Ride',
    shortDescription: 'Explore the stunning desert landscape on two wheels',
    fullDescription: 'Join us for an unforgettable journey through the desert. This leisurely ride is suitable for all skill levels and offers breathtaking views of the dunes and native wildlife. We provide support vehicles, refreshments, and professional guides.',
    city: 'Al Ain',
    track: 'Desert Route 1',
    date: '2026-01-22',
    startTime: '06:30',
    endTime: '09:30',
    capacity: 80,
    registrations: 67,
    rating: 4.7,
    status: 'Published',
    featured: false,
    allowRating: true,
    allowSharing: true,
    registrationOpen: true,
    image: 'https://images.unsplash.com/photo-1718527192815-bb68dd23ce74?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkZXNlcnQlMjBjeWNsaW5nJTIwdWFlfGVufDF8fHx8MTc2ODEzNjQzNnww&ixlib=rb-4.1.0&q=80&w=1080',
    views: 2340,
    shares: 45,
    createdAt: '2026-01-02',
  },
  {
    id: '4',
    name: 'Corniche Sunset Ride',
    shortDescription: 'Enjoy the Abu Dhabi Corniche at sunset',
    fullDescription: 'Ride along the beautiful Abu Dhabi Corniche as the sun sets over the Arabian Gulf. This social ride is perfect for beginners and families, with a relaxed pace and plenty of photo opportunities.',
    city: 'Abu Dhabi',
    track: 'Corniche Road',
    date: '2026-01-25',
    startTime: '17:00',
    endTime: '19:00',
    capacity: 120,
    registrations: 45,
    rating: 4.6,
    status: 'Published',
    featured: false,
    allowRating: true,
    allowSharing: true,
    registrationOpen: true,
    image: 'https://images.unsplash.com/photo-1758608906924-57a6ca140153?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjeWNsaW5nJTIwY29tbXVuaXR5JTIwZXZlbnR8ZW58MXx8fHwxNzY4MTM2NDM1fDA&ixlib=rb-4.1.0&q=80&w=1080',
    views: 1890,
    shares: 34,
    createdAt: '2026-01-01',
  },
];

// In-memory store for new events
export let events = [...eventsData];

export function addEvent(event: Event) {
  events.push(event);
}

export function updateEvent(id: string, updates: Partial<Event>) {
  const index = events.findIndex(e => e.id === id);
  if (index !== -1) {
    events[index] = { ...events[index], ...updates };
  }
}

export function deleteEvent(id: string) {
  events = events.filter(e => e.id !== id);
}

export function getEvent(id: string): Event | undefined {
  return events.find(e => e.id === id);
}

export function getAllEvents(): Event[] {
  return events;
}
