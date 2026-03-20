import api from './api';

export interface User {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  profileImage: string;
  gender: string;
  age: number | null;
  dob: string | null;
  country: string;
  role: 'Admin' | 'Vendor' | 'Member';
  isVerified: boolean;
  stats: {
    totalDistanceKm: number;
    totalRides: number;
    totalEventsParticipated: number;
    totalPoints: number;
    completedCount: number;
  };
  createdAt: string;
}

interface UserApiRaw {
  _id?: string | { toString(): string };
  id?: string;
  fullName?: string;
  email?: string;
  phone?: string;
  profileImage?: string;
  gender?: string;
  age?: number;
  dob?: string;
  country?: string;
  role?: string;
  isVerified?: boolean;
  stats?: {
    totalDistanceKm?: number;
    totalRides?: number;
    totalEventsParticipated?: number;
    totalPoints?: number;
    completedCount?: number;
  };
  createdAt?: string;
}

function normalizeUser(raw: UserApiRaw): User {
  const id = raw.id || (typeof raw._id === 'string' ? raw._id : raw._id?.toString() || '');

  return {
    id,
    fullName: raw.fullName || '',
    email: raw.email || '',
    phone: raw.phone || '',
    profileImage: raw.profileImage || '',
    gender: raw.gender || '',
    age: raw.age ?? null,
    dob: raw.dob || null,
    country: raw.country || '',
    role: (raw.role as User['role']) || 'Member',
    isVerified: raw.isVerified ?? false,
    stats: {
      totalDistanceKm: raw.stats?.totalDistanceKm ?? 0,
      totalRides: raw.stats?.totalRides ?? 0,
      totalEventsParticipated: raw.stats?.totalEventsParticipated ?? 0,
      totalPoints: raw.stats?.totalPoints ?? 0,
      completedCount: raw.stats?.completedCount ?? 0,
    },
    createdAt: raw.createdAt || '',
  };
}

export async function getAllUsers(page = 1, limit = 10, role?: string): Promise<{ users: User[]; pagination: { page: number; limit: number; total: number; totalPages: number } }> {
  const params: Record<string, string | number> = { page, limit };
  if (role) params.role = role;

  const response = await api.get('/v1/user', { params });
  const data = response.data;

  // Backend returns { success, data: { users: [...], pagination: {...} } }
  const rawUsers: UserApiRaw[] = data?.data?.users || [];
  const pagination = data?.data?.pagination || { page, limit, total: 0, totalPages: 0 };

  return { users: rawUsers.map(normalizeUser), pagination };
}
