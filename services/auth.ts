import { apiRequest } from "./api";

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
  return apiRequest(
    "/api/accounts/me/",
    {
      method: "GET",
    },
    token
  );
}
