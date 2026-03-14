import { apiRequest } from "./api";

type Paginated<T> = { count: number; next: string | null; previous: string | null; results: T[] };

export type ConnectionStatus = "pending" | "accepted";

export type ConnectionItem = {
  id: number;
  sender: string;
  receiver: string;
  sender_id?: number;
  receiver_id?: number;
  status: ConnectionStatus;
  created_at: string;
};

export type PendingConnectionDirection = "incoming" | "outgoing";
export type PendingConnectionItem = ConnectionItem & {
  direction: PendingConnectionDirection;
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

export async function listPendingConnectionRequests(token: string) {
  try {
    const payload = await apiRequest("/api/connections/requests/", { method: "GET" }, token);
    return unwrapList<PendingConnectionItem>(payload);
  } catch (error) {
    // Keep UI functional against older backend builds without pending-requests endpoint.
    const message = error instanceof Error ? error.message : "";
    if (message.includes("404") || message.toLowerCase().includes("not found")) {
      return [];
    }
    throw error;
  }
}
