import { apiRequest } from "./api";

type Envelope<T> = { data?: T; results?: T[] };
type Paginated<T> = { count: number; next: string | null; previous: string | null; results: T[] };

export type FeedMeta = {
  source?: string;
  reasons?: string[];
  signals?: Record<string, number>;
};

export type PostItem = {
  id: number;
  creator?: string | { id: number; username: string };
  game: string;
  title: string;
  description?: string;
  video_url?: string;
  created_at: string;
  feed_meta?: FeedMeta;
};

export type InteractionType = "like" | "comment" | "share" | "skip" | "view";

function unwrapList<T>(payload: unknown): T[] {
  if (Array.isArray(payload)) return payload as T[];
  if (payload && typeof payload === "object") {
    if ("results" in payload && Array.isArray((payload as Paginated<T>).results)) {
      return (payload as Paginated<T>).results;
    }
    if ("results" in payload && Array.isArray((payload as Envelope<T>).results)) {
      return (payload as Envelope<T>).results ?? [];
    }
  }
  return [];
}

function unwrapData<T>(payload: unknown): T {
  if (payload && typeof payload === "object" && "data" in payload) {
    return (payload as Envelope<T>).data as T;
  }
  return payload as T;
}

export async function listPosts(token: string) {
  const payload = await apiRequest("/api/posts/", { method: "GET" }, token);
  return unwrapList<PostItem>(payload);
}

export async function createPost(
  token: string,
  payload: { game: string; title: string; description?: string; video_url?: string },
) {
  const data = await apiRequest(
    "/api/posts/",
    {
      method: "POST",
      body: JSON.stringify(payload),
    },
    token,
  );
  return unwrapData<PostItem>(data);
}

export async function deletePost(token: string, postId: number) {
  return apiRequest(`/api/posts/${postId}/`, { method: "DELETE" }, token);
}

export async function restorePost(token: string, postId: number) {
  return apiRequest(`/api/posts/restore/${postId}/`, { method: "POST" }, token);
}

export async function likePost(token: string, postId: number) {
  return apiRequest(`/api/posts/${postId}/like/`, { method: "POST" }, token);
}

export async function sharePost(token: string, postId: number) {
  return apiRequest(`/api/posts/${postId}/share/`, { method: "POST" }, token);
}

export async function skipPost(token: string, postId: number) {
  return apiRequest(`/api/posts/${postId}/skip/`, { method: "POST" }, token);
}

export async function trackInteraction(
  token: string,
  payload: { post: number; interaction_type: InteractionType },
) {
  return apiRequest(
    "/api/interactions/",
    {
      method: "POST",
      body: JSON.stringify(payload),
    },
    token,
  );
}

export async function listFeed(token: string) {
  const payload = await apiRequest("/api/feed/", { method: "GET" }, token);
  return unwrapList<PostItem>(payload);
}

export async function explainFeedPost(token: string, postId: number) {
  return apiRequest(`/api/feed/explain/${postId}/`, { method: "GET" }, token);
}

export async function sharePostToUser(token: string, postId: number, userId: number) {
  return apiRequest(`/api/share/${postId}/${userId}/`, { method: "POST" }, token);
}
