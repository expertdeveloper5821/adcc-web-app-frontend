import axios, { AxiosError } from 'axios';
import api from './api';

/**
 * Extracts a user-friendly error message from an API error (Axios or backend payload).
 */
function getApiErrorMessage(error: unknown, fallback: string): string {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<{ message?: string; error?: string }>;
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

/**
 * Store/Marketplace item as returned by the backend (/v1/ar/store/items).
 * Backend uses _id; we expose id (mapped from _id) for app use.
 */
export interface StoreItem {
  id?: string;
  _id?: string;
  title: string;
  description: string;
  category: string;
  condition: string;
  currency: string;
  price: number;
  contactMethod: string;
  phoneNumber: string;
  city: string;
  status: string;
  coverImage?: string;
  photos?: string[];
  isFeatured?: boolean;
  createdBy?: { _id: string; fullName: string };
  createdAt?: string;
  updatedAt?: string;
}

/** Raw item from API (uses _id) */
interface StoreItemRaw extends Omit<StoreItem, 'id'> {
  _id: string;
}

export interface StoreItemsResponse {
  success: boolean;
  message: string;
  data: {
    items: StoreItemRaw[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  };
}

/**
 * Fetches the list of store/marketplace items from the backend.
 * Response shape: { success, message, data: { items, pagination } }.
 * @throws Error with a clear message when the API request fails.
 */
export async function getStoreItems(): Promise<StoreItem[]> {
  try {
    const { data } = await api.get<StoreItemsResponse>('/v1/ar/store/items');
    if (!data?.success || !Array.isArray(data?.data?.items)) {
      return [];
    }
    return data.data.items.map((item) => ({
      ...item,
      id: item._id,
    }));
  } catch (error) {
    const message = getApiErrorMessage(error, 'Failed to load store items');
    throw new Error(message);
  }
}

/** Generic success response from store actions */
interface StoreActionResponse {
  success: boolean;
  message?: string;
  data?: unknown;
}

/**
 * Approve a store item. Endpoint: Store/ Approve item.
 * @throws Error with a clear message when the API request fails.
 */
export async function approveStoreItem(itemId: string): Promise<StoreActionResponse> {
  try {
    const { data } = await api.post<StoreActionResponse>(
      `/v1/ar/store/items/${itemId}/approve`
    );
    return data;
  } catch (error) {
    const message = getApiErrorMessage(error, 'Failed to approve store item');
    throw new Error(message);
  }
}

/**
 * Reject a store item. Endpoint: Store/ Reject item.
 * @throws Error with a clear message when the API request fails.
 */
export async function rejectStoreItem(itemId: string): Promise<StoreActionResponse> {
  try {
    const { data } = await api.post<StoreActionResponse>(
      `/v1/ar/store/items/${itemId}/reject`
    );
    return data;
  } catch (error) {
    const message = getApiErrorMessage(error, 'Failed to reject store item');
    throw new Error(message);
  }
}

/**
 * Feature a store item. Endpoint: Store/ Feature item.
 * @throws Error with a clear message when the API request fails.
 */
export async function featureStoreItem(itemId: string): Promise<StoreActionResponse> {
  try {
    const { data } = await api.patch<StoreActionResponse>(
      `/v1/ar/store/items/${itemId}/feature`
    );
    return data;
  } catch (error) {
    const message = getApiErrorMessage(error, 'Failed to feature store item');
    throw new Error(message);
  }
}
