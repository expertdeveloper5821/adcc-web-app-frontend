import axios, { AxiosError } from 'axios';
import api from './api';

export type FeedPostStatus = 'pending' | 'approved';

export interface FeedPost {
  _id?: string;
  id?: string;
  title: string;
  description: string;
  status?: FeedPostStatus;
  reported?: boolean;
  image?: string;
  createdBy?: string | { _id?: string; fullName?: string; profileImage?: string };
  createdAt?: string;
  updatedAt?: string;
}

interface ApiErrorResponse {
  message?: string;
  error?: string;
}

function getApiErrorMessage(error: unknown, fallback: string): string {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<ApiErrorResponse>;
    const msg =
      axiosError.response?.data?.message ??
      axiosError.response?.data?.error ??
      (axiosError.response?.status === 401 && 'Unauthorized') ??
      (axiosError.response?.status === 403 && 'Forbidden') ??
      (axiosError.response?.status === 404 && 'Not found') ??
      (axiosError.response?.status && `Request failed (${axiosError.response.status})`) ??
      axiosError.message;

    return typeof msg === 'string' ? msg : fallback;
  }
  if (error instanceof Error) return error.message;
  return fallback;
}

export interface GetFeedPostsParams {
  status?: FeedPostStatus;
  reported?: boolean;
  q?: string;
  page?: number;
  limit?: number;
}

export const getFeedPosts = async (params?: GetFeedPostsParams): Promise<FeedPost[]> => {
  try {
    const { data } = await api.get<any>('/v1/feed-posts', {
      params: {
        status: params?.status,
        // Backend expects "true"/"false" strings (per spec).
        reported: params?.reported === undefined ? undefined : String(params.reported),
        q: params?.q,
        page: params?.page,
        limit: params?.limit,
      },
    });

    const payload = data?.data ?? data;
    const postsCandidate =
      payload?.posts ??
      payload?.feedPosts ??
      data?.posts ??
      data?.feedPosts ??
      [];

    if (!Array.isArray(postsCandidate)) return [];

    return postsCandidate.map((p: any) => ({
      ...p,
      _id: p?._id ?? p?.id,
      id: p?.id ?? p?._id,
      title: p?.title ?? '',
      description: p?.description ?? p?.caption ?? '',
      image: p?.image ?? p?.imageUrl ?? p?.coverImage,
      // Normalize reported/status coming from backend (it may be "true"/"false" or "Pending"/"Approved").
      reported: (() => {
        const raw =
          p?.reported ?? p?.isReported ?? p?.report ?? p?.moderation?.reported ?? p?.moderation?.isReported;

        if (raw === true || raw === 'true' || raw === 'True' || raw === 1 || raw === '1') return true;
        if (raw === false || raw === 'false' || raw === 'False' || raw === 0 || raw === '0') return false;
        return undefined;
      })(),
      status: (() => {
        const raw =
          p?.status ?? p?.moderationStatus ?? p?.postStatus ?? p?.state ?? p?.moderation?.status;

        if (typeof raw === 'string') {
          const v = raw.toLowerCase();
          if (v === 'pending') return 'pending';
          if (v === 'approved') return 'approved';
          return undefined;
        }

        if (raw === 'pending' || raw === 'approved') return raw;
        return undefined;
      })(),
      createdBy: p?.createdBy ?? p?.userId ?? p?.user,
    }));
  } catch (error) {
    throw new Error(getApiErrorMessage(error, 'Failed to load feed posts'));
  }
};

export interface CreateFeedPostData {
  title: string;
  description: string;
  imageFile: File;
  status?: FeedPostStatus;
}

export const createFeedPost = async (data: CreateFeedPostData): Promise<FeedPost> => {
  if (!data.imageFile) throw new Error('Image file is required');

  const formData = new FormData();
  formData.append('title', data.title);
  formData.append('description', data.description);
  if (data.status) formData.append('status', data.status);
  // Backend key must be `image`
  formData.append('image', data.imageFile);

  try {
    const response = await api.post<any>('/v1/feed-posts', formData);
    const payload = response.data?.data ?? response.data;
    return (payload?.post ?? payload) as FeedPost;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, 'Failed to create feed post'));
  }
};

export interface ModerateFeedPostData {
  status?: FeedPostStatus;
  // If provided, backend will update DB `reported` field.
  reported?: boolean;
}

export const moderateFeedPost = async (postId: string, data: ModerateFeedPostData) => {
  if (!postId) throw new Error('Post id is required');
  if (data.status === undefined && data.reported === undefined) {
    throw new Error('Moderation requires at least one field');
  }

  const formData = new FormData();
  if (data.status) formData.append('status', data.status);
  if (data.reported !== undefined) formData.append('reported', String(data.reported));

  try {
    const response = await api.patch<any>(`/v1/feed-posts/${postId}/moderation`, formData);
    return response.data?.data ?? response.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, 'Failed to moderate feed post'));
  }
};

