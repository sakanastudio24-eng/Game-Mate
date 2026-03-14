export const SESSION_EXPIRED_MESSAGE = "Session expired. Please sign in again.";

export function isSessionExpiredMessage(value?: string | null) {
  return (value ?? "").toLowerCase().includes("session expired");
}
