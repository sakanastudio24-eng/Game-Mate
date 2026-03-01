export interface AIUserProfile {
  games: string[];
  rank?: string;
  mic?: boolean;
  tags?: string[];
}

export interface AIGroupCandidate {
  id: string;
  game: string;
  rankMin?: string;
  rankMax?: string;
  tags?: string[];
  slots?: number;
  micRequired?: boolean;
}

export interface AIRecommendationsRequest {
  userProfile: AIUserProfile;
  groups: AIGroupCandidate[];
}

export interface AIRecommendationResult {
  groupId: string;
  score: number;
  reasons: string[];
}

export interface AIRecommendationsResponse {
  results: AIRecommendationResult[];
}

export interface AISuggestedTagsResponse {
  tags: string[];
}

export interface AIApiError {
  error: {
    code: string;
    message: string;
    details?: string;
  };
}

interface RequestOptions {
  signal?: AbortSignal;
  forceRefresh?: boolean;
}

const MAX_GROUPS = 50;
const MAX_TEXT_CHARS = 500;
const RECOMMENDATIONS_TTL_MS = 30_000;
const TAGS_TTL_MS = 60_000;

const rankOrder: Record<string, number> = {
  iron: 1,
  bronze: 2,
  silver: 3,
  gold: 4,
  platinum: 5,
  diamond: 6,
  ascendant: 7,
  immortal: 8,
  radiant: 9,
};

const recommendationsCache = new Map<
  string,
  { expiresAt: number; value: AIRecommendationsResponse }
>();
const recommendationsInFlight = new Map<string, Promise<AIRecommendationsResponse>>();

const tagsCache = new Map<string, { expiresAt: number; value: AISuggestedTagsResponse }>();
const tagsInFlight = new Map<string, Promise<AISuggestedTagsResponse>>();

function createAbortError(): Error {
  const error = new Error("The request was aborted");
  (error as Error & { name?: string }).name = "AbortError";
  return error;
}

export function isAbortError(error: unknown): boolean {
  return (
    error instanceof Error &&
    (error.name === "AbortError" || /aborted/i.test(error.message))
  );
}

function withAbort<T>(promise: Promise<T>, signal?: AbortSignal): Promise<T> {
  if (!signal) return promise;
  if (signal.aborted) return Promise.reject(createAbortError());

  return new Promise<T>((resolve, reject) => {
    const abort = () => {
      reject(createAbortError());
    };

    signal.addEventListener("abort", abort, { once: true });

    promise
      .then((value) => {
        signal.removeEventListener("abort", abort);
        resolve(value);
      })
      .catch((error) => {
        signal.removeEventListener("abort", abort);
        reject(error);
      });
  });
}

function normalizeTag(tag: string): string {
  return tag.trim().toLowerCase();
}

function normalizeTags(tags?: string[]): string[] {
  if (!tags) return [];
  const set = new Set<string>();
  for (const tag of tags) {
    const normalized = normalizeTag(tag);
    if (normalized) set.add(normalized);
  }
  return [...set];
}

function normalizeRank(rank?: string): string | undefined {
  if (!rank) return undefined;
  return rank.trim().toLowerCase();
}

function clampText(input: string, max = MAX_TEXT_CHARS): string {
  return input.slice(0, max).trim();
}

function ensureProfile(profile: AIUserProfile): AIUserProfile {
  const games = (profile.games || [])
    .map((game) => game.trim().toLowerCase())
    .filter(Boolean)
    .slice(0, 20);

  return {
    games,
    rank: normalizeRank(profile.rank),
    mic: Boolean(profile.mic),
    tags: normalizeTags(profile.tags),
  };
}

function ensureGroups(groups: AIGroupCandidate[]): AIGroupCandidate[] {
  return groups
    .slice(0, MAX_GROUPS)
    .filter((group) => Boolean(group.id && group.game))
    .map((group) => ({
      id: String(group.id),
      game: String(group.game).trim().toLowerCase(),
      rankMin: normalizeRank(group.rankMin),
      rankMax: normalizeRank(group.rankMax),
      tags: normalizeTags(group.tags),
      slots: typeof group.slots === "number" ? Math.max(0, Math.min(999, group.slots)) : undefined,
      micRequired: Boolean(group.micRequired),
    }));
}

function sanitizeRequest(input: AIRecommendationsRequest): AIRecommendationsRequest {
  return {
    userProfile: ensureProfile(input.userProfile),
    groups: ensureGroups(input.groups),
  };
}

function getApiBase(): string | undefined {
  const base = process.env.EXPO_PUBLIC_API_BASE_URL;
  if (!base) return undefined;
  return base.replace(/\/$/, "");
}

function scoreRecommendation(
  profile: AIUserProfile,
  group: AIGroupCandidate,
): AIRecommendationResult {
  let score = 30;
  const reasons: string[] = [];

  if (profile.games.includes(group.game)) {
    score += 35;
    reasons.push("Game preference match");
  }

  const profileTags = normalizeTags(profile.tags);
  const groupTags = normalizeTags(group.tags);
  const sharedTags = groupTags.filter((tag) => profileTags.includes(tag));
  if (sharedTags.length > 0) {
    score += Math.min(20, sharedTags.length * 7);
    reasons.push(`${sharedTags[0]} vibe match`);
  }

  if (group.micRequired && profile.mic) {
    score += 8;
    reasons.push("Mic requirement matched");
  }

  if (typeof group.slots === "number") {
    if (group.slots > 0) {
      score += 6;
      reasons.push("Open slots available");
    } else {
      score -= 12;
      reasons.push("Limited slots");
    }
  }

  const profileRank = normalizeRank(profile.rank);
  if (profileRank && (group.rankMin || group.rankMax)) {
    const p = rankOrder[profileRank];
    const min = group.rankMin ? rankOrder[group.rankMin] : undefined;
    const max = group.rankMax ? rankOrder[group.rankMax] : undefined;

    if (p && ((min === undefined || p >= min) && (max === undefined || p <= max))) {
      score += 14;
      reasons.push("Rank range match");
    } else {
      score -= 8;
      reasons.push("Rank range mismatch");
    }
  }

  const boundedScore = Math.max(0, Math.min(100, Math.round(score)));
  return {
    groupId: group.id,
    score: boundedScore,
    reasons: reasons.slice(0, 3),
  };
}

function fallbackRecommendations(input: AIRecommendationsRequest): AIRecommendationsResponse {
  const sanitized = sanitizeRequest(input);
  const results = sanitized.groups
    .map((group) => scoreRecommendation(sanitized.userProfile, group))
    .sort((a, b) => b.score - a.score);

  return { results };
}

export async function getRecommendations(
  input: AIRecommendationsRequest,
  options: RequestOptions = {},
): Promise<AIRecommendationsResponse> {
  const { signal, forceRefresh } = options;
  const sanitized = sanitizeRequest(input);
  const apiBase = getApiBase();
  const cacheKey = JSON.stringify(sanitized);
  const now = Date.now();

  if (!forceRefresh) {
    const cached = recommendationsCache.get(cacheKey);
    if (cached && cached.expiresAt > now) {
      return cached.value;
    }
  }

  const inFlight = recommendationsInFlight.get(cacheKey);
  if (inFlight) {
    return withAbort(inFlight, signal);
  }

  const requestPromise = (async () => {
    if (!apiBase) {
      const local = fallbackRecommendations(sanitized);
      recommendationsCache.set(cacheKey, {
        expiresAt: Date.now() + RECOMMENDATIONS_TTL_MS,
        value: local,
      });
      return local;
    }

    try {
      const response = await fetch(`${apiBase}/api/ai/recommendations`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(sanitized),
        signal,
      });

      if (!response.ok) {
        const errBody = (await response.json().catch(() => null)) as AIApiError | null;
        throw new Error(errBody?.error?.message || `AI recommendations failed (${response.status})`);
      }

      const data = (await response.json()) as AIRecommendationsResponse;
      if (!Array.isArray(data.results)) {
        throw new Error("Invalid recommendations response shape");
      }

      const value = {
        results: data.results
          .filter((item) => item.groupId && typeof item.score === "number")
          .map((item) => ({
            groupId: String(item.groupId),
            score: Math.max(0, Math.min(100, Math.round(item.score))),
            reasons: Array.isArray(item.reasons) ? item.reasons.slice(0, 3) : [],
          }))
          .sort((a, b) => b.score - a.score),
      };

      recommendationsCache.set(cacheKey, {
        expiresAt: Date.now() + RECOMMENDATIONS_TTL_MS,
        value,
      });
      return value;
    } catch (error) {
      if (isAbortError(error)) {
        throw error;
      }
      const fallback = fallbackRecommendations(sanitized);
      recommendationsCache.set(cacheKey, {
        expiresAt: Date.now() + RECOMMENDATIONS_TTL_MS,
        value: fallback,
      });
      return fallback;
    }
  })();

  recommendationsInFlight.set(cacheKey, requestPromise);

  try {
    return await withAbort(requestPromise, signal);
  } finally {
    if (recommendationsInFlight.get(cacheKey) === requestPromise) {
      recommendationsInFlight.delete(cacheKey);
    }
  }
}

function localSuggestedTags(text: string): AISuggestedTagsResponse {
  const cleaned = clampText(text).toLowerCase();
  const tokens = cleaned
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((token) => token.length > 2);

  const whitelist = [
    "casual",
    "ranked",
    "tournament",
    "mic",
    "competitive",
    "learning",
    "chill",
    "strategy",
    "scrim",
    "coaching",
  ];

  const tagSet = new Set<string>();
  for (const token of tokens) {
    const normalized = normalizeTag(token);
    if (whitelist.includes(normalized)) tagSet.add(normalized);
    if (tagSet.size >= 6) break;
  }

  if (tagSet.size === 0) {
    tagSet.add("casual");
    tagSet.add("teamplay");
  }

  return { tags: [...tagSet] };
}

export async function getSuggestedTags(
  text: string,
  options: RequestOptions = {},
): Promise<AISuggestedTagsResponse> {
  const { signal, forceRefresh } = options;
  const cleaned = clampText(text).toLowerCase();
  const apiBase = getApiBase();
  const cacheKey = cleaned;
  const now = Date.now();

  if (!forceRefresh) {
    const cached = tagsCache.get(cacheKey);
    if (cached && cached.expiresAt > now) {
      return cached.value;
    }
  }

  const inFlight = tagsInFlight.get(cacheKey);
  if (inFlight) {
    return withAbort(inFlight, signal);
  }

  const requestPromise = (async () => {
    if (!apiBase) {
      const local = localSuggestedTags(cleaned);
      tagsCache.set(cacheKey, { expiresAt: Date.now() + TAGS_TTL_MS, value: local });
      return local;
    }

    try {
      const response = await fetch(`${apiBase}/api/ai/suggested-tags`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: cleaned }),
        signal,
      });

      if (!response.ok) {
        throw new Error(`Suggested tags failed (${response.status})`);
      }

      const data = (await response.json()) as AISuggestedTagsResponse;
      const tags = Array.isArray(data.tags)
        ? data.tags
            .map((tag) => normalizeTag(String(tag)))
            .filter(Boolean)
            .slice(0, 6)
        : [];
      const value = tags.length > 0 ? { tags } : localSuggestedTags(cleaned);
      tagsCache.set(cacheKey, { expiresAt: Date.now() + TAGS_TTL_MS, value });
      return value;
    } catch (error) {
      if (isAbortError(error)) throw error;
      const local = localSuggestedTags(cleaned);
      tagsCache.set(cacheKey, { expiresAt: Date.now() + TAGS_TTL_MS, value: local });
      return local;
    }
  })();

  tagsInFlight.set(cacheKey, requestPromise);
  try {
    return await withAbort(requestPromise, signal);
  } finally {
    if (tagsInFlight.get(cacheKey) === requestPromise) {
      tagsInFlight.delete(cacheKey);
    }
  }
}

export async function draftIntroMessage(
  profile: AIUserProfile,
  group: AIGroupCandidate,
): Promise<string> {
  const safeProfile = ensureProfile(profile);
  const safeGroup = ensureGroups([group])[0];
  const headline = safeProfile.games.includes(safeGroup.game)
    ? `Hey team, I'm looking to join your ${safeGroup.game} group.`
    : `Hey team, I'm interested in joining your group.`;

  const parts = [headline];
  if (safeProfile.rank) parts.push(`Current rank: ${safeProfile.rank}.`);
  if (safeProfile.mic) parts.push("Mic is on and ready.");
  if (safeProfile.tags && safeProfile.tags.length > 0) {
    parts.push(`Play style: ${safeProfile.tags.slice(0, 2).join(", ")}.`);
  }

  return clampText(parts.join(" "));
}
