import { apiRequest } from "./api";

export async function listGroups(token: string) {
  return apiRequest("/api/groups/", { method: "GET" }, token);
}

export async function createGroup(
  token: string,
  payload: { name: string; description: string; is_private: boolean }
) {
  return apiRequest(
    "/api/groups/",
    {
      method: "POST",
      body: JSON.stringify(payload),
    },
    token
  );
}

export async function joinGroup(token: string, groupId: number) {
  return apiRequest(`/api/groups/${groupId}/join/`, { method: "POST" }, token);
}

export async function leaveGroup(token: string, groupId: number) {
  return apiRequest(`/api/groups/${groupId}/leave/`, { method: "POST" }, token);
}

export async function getGroupMembers(token: string, groupId: number) {
  return apiRequest(`/api/groups/${groupId}/members/`, { method: "GET" }, token);
}
