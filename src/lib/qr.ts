const PRIMARY_USER_QR_PREFIX = "gm:user:";
const LEGACY_USER_QR_PREFIX = "gamemate:user:";
const USERNAME_PATTERN = /^[a-zA-Z0-9_-]{3,30}$/;

export function buildUserQrValue(username?: string | null) {
  const normalized = String(username || "").trim();
  if (!USERNAME_PATTERN.test(normalized)) {
    return "";
  }
  return `${PRIMARY_USER_QR_PREFIX}${normalized}`;
}

export function parseUserQrValue(rawValue?: string | null) {
  const normalized = String(rawValue || "").trim();
  const lowerValue = normalized.toLowerCase();
  const matchingPrefix = [PRIMARY_USER_QR_PREFIX, LEGACY_USER_QR_PREFIX].find((prefix) =>
    lowerValue.startsWith(prefix),
  );
  if (!matchingPrefix) return null;

  const username = normalized.slice(matchingPrefix.length).trim();
  return USERNAME_PATTERN.test(username) ? username : null;
}
