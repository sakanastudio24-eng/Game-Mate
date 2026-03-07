import { apiRequest } from "./api";

export type LoginResponse = {
  access: string;
  refresh: string;
};

export type RefreshResponse = {
  access: string;
  refresh?: string;
};

function unwrapData<T>(payload: unknown): T {
  if (payload && typeof payload === "object" && "data" in payload) {
    return (payload as { data: T }).data;
  }
  return payload as T;
}

export async function login(email: string, password: string): Promise<LoginResponse> {
  const payload = await apiRequest("/api/auth/token/", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
  return unwrapData<LoginResponse>(payload);
}

export async function refreshToken(refresh: string): Promise<RefreshResponse> {
  const payload = await apiRequest("/api/auth/token/refresh/", {
    method: "POST",
    body: JSON.stringify({ refresh }),
  });
  return unwrapData<RefreshResponse>(payload);
}

export async function getMe(token: string) {
  const payload = await apiRequest(
    "/api/accounts/me/",
    {
      method: "GET",
    },
    token
  );
  return unwrapData(payload);
}
