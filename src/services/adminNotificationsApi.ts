import axios, { AxiosError } from 'axios';
import api from './api';

export interface AdminNotification {
  id: string;
  title: string;
  description: string;
  read: boolean;
  createdAt: string;
  /** Backend hint for icon styling (e.g. event, challenge, community, system). */
  type: string;
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
      axiosError.message;
    return typeof msg === 'string' ? msg : fallback;
  }
  if (error instanceof Error) return error.message;
  return fallback;
}

function pickArray(payload: unknown): unknown[] {
  if (!payload || typeof payload !== 'object') return [];
  const p = payload as Record<string, unknown>;
  const nested =
    p.data && typeof p.data === 'object'
      ? (p.data as Record<string, unknown>)
      : undefined;
  const raw =
    nested?.notifications ??
    nested?.items ??
    nested?.data ??
    p.notifications ??
    p.items ??
    p.data;
  if (Array.isArray(raw)) return raw;
  if (Array.isArray(p.data)) return p.data as unknown[];
  return [];
}

function normalizeNotification(raw: Record<string, unknown>): AdminNotification | null {
  const id = String(raw._id ?? raw.id ?? '').trim();
  if (!id) return null;
  const title = String(raw.title ?? raw.subject ?? '').trim() || '—';
  const description = String(
    raw.description ?? raw.message ?? raw.body ?? raw.summary ?? '',
  ).trim();
  const read =
    raw.read === true ||
    raw.isRead === true ||
    raw.read === 'true' ||
    raw.isRead === 'true' ||
    (raw.read !== false &&
      raw.isRead !== false &&
      raw.readAt != null &&
      String(raw.readAt).length > 0);
  const createdAt = String(raw.createdAt ?? raw.created_at ?? raw.updatedAt ?? '');
  const type = String(raw.type ?? raw.category ?? raw.kind ?? '').toLowerCase();
  return { id, title, description, read, createdAt, type };
}

function extractUnreadCount(payload: unknown): number {
  if (payload === null || payload === undefined) return 0;
  const p =
    typeof payload === 'object' && payload !== null && 'data' in (payload as object)
      ? ((payload as { data?: unknown }).data ?? payload)
      : payload;
  if (typeof p !== 'object' || p === null) return 0;
  const o = p as Record<string, unknown>;
  const n = o.count ?? o.unreadCount ?? o.unread ?? o.totalUnread;
  if (typeof n === 'number' && Number.isFinite(n)) return Math.max(0, n);
  const parsed = parseInt(String(n), 10);
  return Number.isFinite(parsed) ? Math.max(0, parsed) : 0;
}

export async function getAdminNotifications(limit = 10): Promise<AdminNotification[]> {
  try {
    const { data } = await api.get<unknown>('/v1/admin-notifications', {
      params: { limit },
    });
    const arr = pickArray(data);
    const out: AdminNotification[] = [];
    for (const item of arr) {
      if (item && typeof item === 'object') {
        const n = normalizeNotification(item as Record<string, unknown>);
        if (n) out.push(n);
      }
    }
    return out;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, 'Failed to load notifications'));
  }
}

export async function getAdminUnreadNotificationCount(): Promise<number> {
  try {
    const { data } = await api.get<unknown>('/v1/admin-notifications/unread-count');
    return extractUnreadCount(data);
  } catch (error) {
    throw new Error(getApiErrorMessage(error, 'Failed to load unread count'));
  }
}

export async function markAllAdminNotificationsRead(): Promise<void> {
  try {
    await api.post('/v1/admin-notifications/mark-all-read');
  } catch (error) {
    throw new Error(getApiErrorMessage(error, 'Failed to mark all as read'));
  }
}

export async function markAdminNotificationRead(notificationId: string): Promise<void> {
  const path = `/v1/admin-notifications/${encodeURIComponent(notificationId)}/read`;
  try {
    await api.patch(path);
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 405) {
      await api.post(path);
      return;
    }
    throw new Error(getApiErrorMessage(error, 'Failed to mark notification as read'));
  }
}
