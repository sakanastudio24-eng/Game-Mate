import { apiRequest } from "./api";

type Paginated<T> = { count: number; next: string | null; previous: string | null; results: T[] };

export type NotificationItem = {
  actor: string;
  type: string;
  post_id?: number | null;
  is_read: boolean;
  created_at: string;
};

function unwrapList<T>(payload: unknown): T[] {
  if (Array.isArray(payload)) return payload as T[];
  if (payload && typeof payload === "object" && "results" in payload) {
    return (payload as Paginated<T>).results ?? [];
  }
  return [];
}

export async function listNotifications(token: string) {
  const payload = await apiRequest("/api/notifications/", { method: "GET" }, token);
  return unwrapList<NotificationItem>(payload);
}
