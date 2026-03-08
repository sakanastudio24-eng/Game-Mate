import { apiRequest } from "./api";

export type ProfilePayload = {
  bio?: string;
  avatar_url?: string;
  favorite_games?: string[];
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
