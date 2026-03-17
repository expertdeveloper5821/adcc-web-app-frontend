import api from './api';
import { getCached, setCache, invalidateCache } from '../utils/apiCache';

/** Challenge type matching backend and UI */
export interface Challenge {
  id: string;
  title: string;
  title_ar?: string;
  description: string;
  description_ar?: string;
  type: 'Distance' | 'Frequency' | 'Duration' | 'Social' | 'Event';
  target: number;
  unit: string;
  startDate: string;
  endDate: string;
  participants: number;
  completions: number;
  status: 'Active' | 'Upcoming' | 'Completed' | 'Draft';
  rewardBadge: string;
  rewardBadgeName?: string;
  featured: boolean;
  image: string;
  createdBy?: string;
  communities?: string[];
  communityNames?: string[];
}

/** Raw API challenge (may have _id and Date objects) */
interface ChallengeApiRaw {
  _id?: string | { toString(): string };
  id?: string;
  title: string;
  title_ar?: string;
  description: string;
  description_ar?: string;
  type: Challenge['type'];
  target: number;
  unit: string;
  startDate: string | Date;
  endDate: string | Date;
  participants?: number;
  completions?: number;
  status: Challenge['status'];
  rewardBadge?: string | { _id?: string; name?: string; icon?: string; image?: string; category?: string; rarity?: string };
  featured?: boolean;
  image?: string;
  createdBy?: string | { _id?: unknown };
  communities?: (string | { _id?: unknown; name?: string; title?: string })[];
}

interface GetChallengesResponse {
  success: boolean;
  data?: {
    challenges: ChallengeApiRaw[];
    pagination: { page: number; limit: number; total: number; pages: number };
  };
}

interface GetChallengeResponse {
  success: boolean;
  data?: ChallengeApiRaw;
}

function normalizeCommunityIds(val: unknown): string[] {
  if (!Array.isArray(val)) return [];
  return val.map((item) => {
    if (typeof item === 'string') return item;
    if (item && typeof item === 'object' && '_id' in item) return String((item as { _id: unknown })._id);
    return String(item);
  });
}

function normalizeCommunityNames(val: unknown): string[] {
  if (!Array.isArray(val)) return [];
  return val
    .map((item) => {
      if (typeof item === 'string') return '';
      if (item && typeof item === 'object' && 'title' in item) return String((item as { title: string }).title);
      if (item && typeof item === 'object' && 'name' in item) return String((item as { name: string }).name);
      return '';
    })
    .filter(Boolean);
}

function normalizeChallenge(raw: ChallengeApiRaw): Challenge {
  const id = raw.id || (raw._id && typeof raw._id === 'string' ? raw._id : String(raw._id));
  const startDate = typeof raw.startDate === 'string' ? raw.startDate.slice(0, 10) : (raw.startDate as Date)?.toISOString?.()?.slice(0, 10) ?? '';
  const endDate = typeof raw.endDate === 'string' ? raw.endDate.slice(0, 10) : (raw.endDate as Date)?.toISOString?.()?.slice(0, 10) ?? '';
  return {
    id,
    title: raw.title,
    description: raw.description,
    type: raw.type,
    target: raw.target,
    unit: raw.unit,
    startDate,
    endDate,
    participants: raw.participants ?? 0,
    completions: raw.completions ?? 0,
    status: raw.status,
    rewardBadge: typeof raw.rewardBadge === 'object' && raw.rewardBadge !== null
      ? (raw.rewardBadge._id ?? '')
      : (raw.rewardBadge as string ?? ''),
    rewardBadgeName: typeof raw.rewardBadge === 'object' && raw.rewardBadge !== null
      ? (raw.rewardBadge.name ?? '')
      : undefined,
    featured: !!raw.featured,
    image: raw.image ?? 'https://images.unsplash.com/photo-1541625602330-2277a4c46182?w=400',
    createdBy: typeof raw.createdBy === 'object' && raw.createdBy !== null && '_id' in raw.createdBy
      ? String((raw.createdBy as { _id: unknown })._id)
      : raw.createdBy as string | undefined,
    communities: normalizeCommunityIds(raw.communities),
    communityNames: normalizeCommunityNames(raw.communities),
  };
}

export interface GetChallengesParams {
  status?: Challenge['status'];
  type?: Challenge['type'];
  page?: number;
  limit?: number;
}

/** Get all challenges with optional filters and pagination */
export const getAllChallenges = async (params?: GetChallengesParams): Promise<Challenge[]> => {
  const cacheKey = `challenges:${params?.status ?? 'all'}:${params?.type ?? 'all'}:${params?.page ?? 1}:${params?.limit ?? 100}`;
  const cached = getCached<Challenge[]>(cacheKey);
  if (cached) return cached;

  const response = await api.get<GetChallengesResponse>('/v1/challenges', {
    params: {
      status: params?.status,
      type: params?.type,
      page: params?.page ?? 1,
      limit: params?.limit ?? 100,
    },
  });

  const body = response.data as GetChallengesResponse & { challenges?: ChallengeApiRaw[] };
  const data = body.data ?? body;
  const list = data?.challenges ?? (Array.isArray(body.challenges) ? body.challenges : []);
  const normalized = list.map((c) => normalizeChallenge(c));
  setCache(cacheKey, normalized);
  return normalized;
};

/** Get a single challenge by ID */
export const getChallengeById = async (id: string): Promise<Challenge> => {
  const cacheKey = `challenge:${id}`;
  const cached = getCached<Challenge>(cacheKey);
  if (cached) return cached;

  const response = await api.get<GetChallengeResponse>(`/v1/challenges/${id}`);
  const body = response.data as GetChallengeResponse & ChallengeApiRaw;
  const raw = body.data ?? (body.id || body._id ? body : null);
  if (!raw) throw new Error('Challenge not found');
  const challenge = normalizeChallenge(raw);
  setCache(cacheKey, challenge);
  return challenge;
};

function buildChallengeFormData(payload: Partial<Challenge>, imageFile?: File): FormData {
  const fd = new FormData();
  if (payload.title) fd.append('title', payload.title);
  if (payload.description) fd.append('description', payload.description);
  if (payload.type) fd.append('type', payload.type);
  if (payload.target !== undefined) fd.append('target', String(payload.target));
  if (payload.unit) fd.append('unit', payload.unit);
  if (payload.startDate) fd.append('startDate', payload.startDate);
  if (payload.endDate) fd.append('endDate', payload.endDate);
  if (payload.status) fd.append('status', payload.status);
  if (payload.rewardBadge !== undefined) fd.append('rewardBadge', payload.rewardBadge);
  if (payload.featured !== undefined) fd.append('featured', String(payload.featured));
  if (payload.communities && payload.communities.length > 0) {
    fd.append('communities', JSON.stringify(payload.communities));
  }
  if (imageFile) {
    fd.append('image', imageFile);
  }
  return fd;
}

/** Create a new challenge */
export const createChallenge = async (payload: Partial<Challenge>, imageFile?: File): Promise<Challenge> => {
  invalidateCache('challenges');
  const fd = buildChallengeFormData(payload, imageFile);
  const response = await api.post<GetChallengeResponse & { data?: ChallengeApiRaw }>('/v1/challenges', fd);
  const body = response.data as unknown as Record<string, unknown> & { data?: ChallengeApiRaw };
  const raw = body.data ?? ((body as unknown as ChallengeApiRaw).id || (body as unknown as ChallengeApiRaw)._id ? (body as unknown as ChallengeApiRaw) : null);
  if (!raw) throw new Error('Invalid create response');
  return normalizeChallenge(raw);
};

/** Update an existing challenge */
export const updateChallenge = async (id: string, payload: Partial<Challenge>, imageFile?: File): Promise<Challenge> => {
  invalidateCache('challenges');
  invalidateCache(`challenge:${id}`);
  const fd = buildChallengeFormData(payload, imageFile);
  const response = await api.patch<GetChallengeResponse & { data?: ChallengeApiRaw }>(`/v1/challenges/${id}`, fd);
  const body = response.data as unknown as Record<string, unknown> & { data?: ChallengeApiRaw };
  const raw = body.data ?? ((body as unknown as ChallengeApiRaw).id || (body as unknown as ChallengeApiRaw)._id ? (body as unknown as ChallengeApiRaw) : null);
  if (!raw) throw new Error('Invalid update response');
  return normalizeChallenge(raw);
};

/** Delete a challenge */
export const deleteChallengeById = async (id: string): Promise<void> => {
  invalidateCache('challenges');
  invalidateCache(`challenge:${id}`);
  await api.delete(`/v1/challenges/${id}`);
};
