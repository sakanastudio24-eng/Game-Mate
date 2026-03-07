import { apiRequest } from "./api";

function unwrapData<T>(payload: unknown): T {
  if (payload && typeof payload === "object" && "data" in payload) {
    return (payload as { data: T }).data;
  }
  return payload as T;
}

export async function login(email: string, password: string) {
  return apiRequest("/api/auth/token/", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export async function refreshToken(refresh: string) {
  return apiRequest("/api/auth/token/refresh/", {
    method: "POST",
    body: JSON.stringify({ refresh }),
  });
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
