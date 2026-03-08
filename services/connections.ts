import { apiRequest } from "./api";

type Paginated<T> = { count: number; next: string | null; previous: string | null; results: T[] };

export type ConnectionStatus = "pending" | "accepted";

export type ConnectionItem = {
  id: number;
  sender: string;
  receiver: string;
  status: ConnectionStatus;
  created_at: string;
};

function unwrapList<T>(payload: unknown): T[] {
  if (Array.isArray(payload)) return payload as T[];
  if (payload && typeof payload === "object" && "results" in payload) {
    return (payload as Paginated<T>).results ?? [];
  }
  return [];
}

export async function sendConnectionRequest(token: string, userId: number) {
  return apiRequest(`/api/connections/add/${userId}/`, { method: "POST" }, token);
}

export async function acceptConnectionRequest(token: string, connectionId: number) {
  return apiRequest(`/api/connections/accept/${connectionId}/`, { method: "POST" }, token);
}

export async function listConnections(token: string) {
  const payload = await apiRequest("/api/connections/friends/", { method: "GET" }, token);
  return unwrapList<ConnectionItem>(payload);
}
