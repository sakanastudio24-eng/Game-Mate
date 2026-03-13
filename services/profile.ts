import { apiRequest } from "./api";

export type ProfilePayload = {
  bio?: string;
  avatar_url?: string;
  favorite_games?: string[];
  visibility?: "public" | "friends_only";
};

export async function getMyProfile(token: string) {
  return apiRequest("/api/profile/me/", { method: "GET" }, token);
}

export async function updateMyProfile(token: string, payload: ProfilePayload) {
  return apiRequest(
    "/api/profile/me/",
    {
      method: "PATCH",
      body: JSON.stringify(payload),
    },
    token,
  );
}

export async function getProfileByUsername(token: string, username: string) {
  return apiRequest(`/api/profile/${encodeURIComponent(username)}/`, { method: "GET" }, token);
}

export async function getProfilePostsByUsername(token: string, username: string) {
  return apiRequest(`/api/profile/${encodeURIComponent(username)}/posts/`, { method: "GET" }, token);
}
