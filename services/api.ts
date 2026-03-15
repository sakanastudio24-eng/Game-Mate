import Constants from "expo-constants";
import { Platform } from "react-native";

const API_PORT = "8000";

function normalizeBaseUrl(url: string) {
  return url.replace(/\/+$/, "");
}

function getExpoDevHost() {
  const possibleHostUri =
    (Constants.expoConfig as any)?.hostUri ??
    (Constants as any)?.manifest2?.extra?.expoClient?.hostUri ??
    (Constants as any)?.manifest?.debuggerHost;

  if (typeof possibleHostUri !== "string" || possibleHostUri.length === 0) return null;

  const host = possibleHostUri.split(":")[0];
  return host || null;
}

function inferExpoDevBaseUrl() {
  const host = getExpoDevHost();
  if (host) {
    return `http://${host}:${API_PORT}`;
  }

  // Android emulator localhost bridge.
  if (Platform.OS === "android") {
    return "http://10.0.2.2:8000";
  }

  return "http://127.0.0.1:8000";
}

function resolveBaseUrl() {
  const configured = process.env.EXPO_PUBLIC_API_URL?.trim();
  if (!configured) return inferExpoDevBaseUrl();

  try {
    const parsed = new URL(configured);
    const host = parsed.hostname;
    const expoHost = getExpoDevHost();

    // When running on a physical device, localhost points at the phone, not the dev machine.
    if (expoHost && (host === "127.0.0.1" || host === "localhost")) {
      return `${parsed.protocol}//${expoHost}${parsed.port ? `:${parsed.port}` : ""}`;
    }
  } catch {
    return configured;
  }

  return configured;
}

const BASE_URL = normalizeBaseUrl(resolveBaseUrl());

export async function apiRequest(
  endpoint: string,
  options: RequestInit = {},
  token?: string,
) {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  let response: Response;
  try {
    response = await fetch(`${BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });
  } catch (error) {
    const detail = error instanceof Error ? error.message : "Request failed";
    throw new Error(`Network request failed (${BASE_URL}). ${detail}`);
  }

  const contentType = response.headers.get("content-type");
  const data = contentType?.includes("application/json")
    ? await response.json()
    : await response.text();

  if (!response.ok) {
    const resolvedErrorMessage =
      typeof data === "string"
        ? data
        : data?.message || data?.detail || "Request failed";

    if (response.status === 401) {
      // Login requests should surface credential errors, token-authenticated requests should
      // show a session-expired message.
      if (token) {
        throw new Error("Session expired. Please sign in again.");
      }
      throw new Error(resolvedErrorMessage || "Invalid email or password.");
    }
    throw new Error(resolvedErrorMessage);
  }

  return data;
}
