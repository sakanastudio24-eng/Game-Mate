import { apiRequest } from "./api";

type Paginated<T> = { count: number; next: string | null; previous: string | null; results: T[] };

export type ThreadItem = {
  thread_id: number;
  participants: string[];
  last_message: string;
  unread: number;
};

export type MessageItem = {
  sender: string;
  content: string;
  created_at: string;
};

function unwrapList<T>(payload: unknown): T[] {
  if (Array.isArray(payload)) return payload as T[];
  if (payload && typeof payload === "object" && "results" in payload) {
    return (payload as Paginated<T>).results ?? [];
  }
  return [];
}

export async function listThreads(token: string) {
  const payload = await apiRequest("/api/messages/threads/", { method: "GET" }, token);
  return unwrapList<ThreadItem>(payload);
}

export async function createThread(token: string, userId: number) {
  return apiRequest(`/api/messages/thread/${userId}/`, { method: "POST" }, token);
}

export async function sendMessage(token: string, threadId: number, content: string) {
  return apiRequest(
    `/api/messages/send/${threadId}/`,
    {
      method: "POST",
      body: JSON.stringify({ content }),
    },
    token,
  );
}

export async function getMessages(token: string, threadId: number) {
  const payload = await apiRequest(`/api/messages/messages/${threadId}/`, { method: "GET" }, token);
  return unwrapList<MessageItem>(payload);
}
