import { apiRequest } from "./api";

type WrappedResults<T> = { success: boolean; results: T[] };
type WrappedData<T> = { success: boolean; data: T };
type GroupMessage = { message?: string };

export type GroupOwner = {
  id: number;
  username: string;
};

export type GroupItem = {
  id: number;
  name: string;
  description: string;
  is_private: boolean;
  owner: GroupOwner;
  member_count: number;
  created_at: string;
};

export type GroupMember = {
  user_id: number;
  email: string;
  username: string;
  role: string;
  joined_at: string;
};

function unwrapResults<T>(payload: unknown): T[] {
  if (payload && typeof payload === "object" && "results" in payload) {
    return (payload as WrappedResults<T>).results ?? [];
  }
  return Array.isArray(payload) ? (payload as T[]) : [];
}

function unwrapData<T>(payload: unknown): T {
  if (payload && typeof payload === "object" && "data" in payload) {
    return (payload as WrappedData<T>).data;
  }
  return payload as T;
}

export async function listGroups(token: string) {
  const payload = await apiRequest("/api/groups/", { method: "GET" }, token);
  return unwrapResults<GroupItem>(payload);
}

export async function createGroup(
  token: string,
  payload: { name: string; description: string; is_private: boolean }
) {
  const response = await apiRequest(
    "/api/groups/",
    {
      method: "POST",
      body: JSON.stringify(payload),
    },
    token
  );
  return unwrapData<GroupItem>(response);
}

export async function getGroupDetail(token: string, groupId: number) {
  const payload = await apiRequest(`/api/groups/${groupId}/`, { method: "GET" }, token);
  return unwrapData<GroupItem>(payload);
}

export async function joinGroup(token: string, groupId: number) {
  const payload = await apiRequest(`/api/groups/${groupId}/join/`, { method: "POST" }, token);
  return payload as GroupMessage;
}

export async function leaveGroup(token: string, groupId: number) {
  const payload = await apiRequest(`/api/groups/${groupId}/leave/`, { method: "POST" }, token);
  return payload as GroupMessage;
}

export async function getGroupMembers(token: string, groupId: number) {
  const payload = await apiRequest(`/api/groups/${groupId}/members/`, { method: "GET" }, token);
  return unwrapResults<GroupMember>(payload);
}
