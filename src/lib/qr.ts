const USER_QR_PREFIX = "gamemate:user:";

export function buildUserQrValue(username?: string | null) {
  const normalized = String(username || "").trim();
  return normalized ? `${USER_QR_PREFIX}${normalized}` : "";
}

export function parseUserQrValue(rawValue?: string | null) {
  const normalized = String(rawValue || "").trim();
  if (!normalized.toLowerCase().startsWith(USER_QR_PREFIX)) {
    return null;
  }

  const username = normalized.slice(USER_QR_PREFIX.length).trim();
  return username || null;
}
