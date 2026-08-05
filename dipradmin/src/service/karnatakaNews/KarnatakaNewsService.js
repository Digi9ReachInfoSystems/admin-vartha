const RAW_BASE = import.meta.env.VITE_BASE_URL || "";
const BASE_URL = String(RAW_BASE).replace(/\/+$/, "");

function authHeaders() {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function parseJsonResponse(response, fallbackMessage) {
  let result = null;
  try {
    result = await response.json();
  } catch (_) {
    result = null;
  }
  if (!response.ok) {
    throw new Error(result?.message || fallbackMessage);
  }
  return result;
}

/** GET existing district news only */
export const getDistrictNews = async (page = 1, limit = 50) => {
  if (!BASE_URL) throw new Error("VITE_BASE_URL is not set");
  const safePage = Math.max(1, Number(page) || 1);
  const safeLimit = Math.min(Math.max(Number(limit) || 50, 1), 50);
  const response = await fetch(
    `${BASE_URL}/api/news-new/getNewsByNewsType/districtnews?page=${safePage}&limit=${safeLimit}`,
    {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    }
  );
  return parseJsonResponse(response, "Failed to load district news");
};

export const getKarnatakaDistricts = async () => {
  if (!BASE_URL) throw new Error("VITE_BASE_URL is not set");
  const response = await fetch(`${BASE_URL}/api/karnataka/districts`, {
    method: "GET",
    headers: authHeaders(),
  });
  return parseJsonResponse(response, "Failed to load districts");
};

function isHttpUrl(value) {
  if (typeof value !== "string" || !value.trim()) return false;
  try {
    const parsed = new URL(value.trim());
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch (_) {
    return false;
  }
}

/**
 * Map districtnews article → Public publish body fields (confirm page).
 */
export function mapArticleToPublishPayload(article = {}) {
  const kannada =
    article.kannada && typeof article.kannada === "object" ? article.kannada : {};

  const title =
    (typeof kannada.title === "string" && kannada.title.trim()) ||
    (typeof article.title === "string" && article.title.trim()) ||
    "";

  const district =
    (typeof article.district === "string" && article.district.trim()) ||
    (typeof article.district_slug === "string" && article.district_slug.trim()) ||
    "";

  const images = [];
  if (isHttpUrl(article.newsImage)) {
    images.push(String(article.newsImage).trim());
  }

  const voiceoverRaw =
    (typeof kannada.audio_description === "string" &&
      kannada.audio_description.trim()) ||
    (typeof article.audio_description === "string" &&
      article.audio_description.trim()) ||
    "";
  const voiceover = isHttpUrl(voiceoverRaw) ? voiceoverRaw : "";

  const script =
    (typeof kannada.description === "string" && kannada.description.trim()) ||
    "";

  return {
    articleId: article._id || article.id || null,
    title,
    district,
    images: images.length ? images : [""],
    videos: [],
    voiceover,
    script,
  };
}

/** Create → POST /api/karnataka/publish → pv-api.pix.in */
export const publishKarnatakaNews = async (payload) => {
  if (!BASE_URL) throw new Error("VITE_BASE_URL is not set");
  const response = await fetch(`${BASE_URL}/api/karnataka/publish`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });
  return parseJsonResponse(response, "Failed to create news");
};

/** DB marks from backend — source of truth for hiding Create */
export const getCreatedMarks = async () => {
  if (!BASE_URL) throw new Error("VITE_BASE_URL is not set");
  const response = await fetch(`${BASE_URL}/api/karnataka/created-marks`, {
    method: "GET",
    headers: authHeaders(),
  });
  return parseJsonResponse(response, "Failed to load create marks");
};

/** Optimistic local cache (optional) until list reloads from DB */
const CREATED_MARKS_KEY = "karnataka_public_created_article_ids";

export function getLocalCreatedArticleIds() {
  try {
    const raw = localStorage.getItem(CREATED_MARKS_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return new Set(
      (Array.isArray(parsed) ? parsed : [])
        .map((id) => String(id || "").trim())
        .filter(Boolean)
    );
  } catch (_) {
    return new Set();
  }
}

export function markArticleCreatedLocally(articleId) {
  const id = String(articleId || "").trim();
  if (!id) return;
  const ids = getLocalCreatedArticleIds();
  ids.add(id);
  localStorage.setItem(CREATED_MARKS_KEY, JSON.stringify(Array.from(ids)));
}
