import { apiRequest } from "./api";

export type ProfileVisibility = "public" | "friends_only";

export type ProfileData = {
  bio: string;
  avatar_url: string;
  favorite_games: string[];
  visibility?: ProfileVisibility;
  stats?: {
    posts?: number;
    friends?: number;
    groups?: number;
  };
};

type Envelope<T> = { success?: boolean; data?: T };

export type ProfilePayload = {
  bio?: string;
  avatar_url?: string;
  favorite_games?: string[];
  visibility?: ProfileVisibility;
};

function unwrapData<T>(payload: unknown): T {
  if (payload && typeof payload === "object" && "data" in payload) {
    return (payload as Envelope<T>).data as T;
  }
  return payload as T;
}

export async function getMyProfile(token: string) {
  const payload = await apiRequest("/api/profile/me/", { method: "GET" }, token);
  return unwrapData<ProfileData>(payload);
}

export async function updateMyProfile(token: string, payload: ProfilePayload) {
  const response = await apiRequest(
    "/api/profile/me/",
    {
      method: "PATCH",
      body: JSON.stringify(payload),
    },
    token,
  );
  return unwrapData<ProfileData>(response);
}

export async function getProfileByUsername(token: string, username: string) {
  const payload = await apiRequest(
    `/api/profile/${encodeURIComponent(username)}/`,
    { method: "GET" },
    token,
  );
  return unwrapData(payload);
}

export async function getProfilePostsByUsername(token: string, username: string) {
  return apiRequest(`/api/profile/${encodeURIComponent(username)}/posts/`, { method: "GET" }, token);
}
