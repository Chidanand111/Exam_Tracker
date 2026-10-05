/**
 * Network resilience and offline caching utilities for BharatExam Tracker
 * Supports poor 2G/3G connectivity, exponential backoff retries, and timestamped local cache.
 */

const RECRUITMENTS_CACHE_KEY = "bharat_exam_cached_recruitments_v1";

export interface CachedData<T> {
  data: T;
  timestamp: number;
  formattedTime: string;
}

/**
 * Fetch wrapper with exponential backoff for poor network resilience
 */
export async function fetchWithRetry(
  url: string,
  options?: RequestInit,
  maxRetries = 3,
  delayMs = 1000
): Promise<Response> {
  let attempt = 0;
  while (attempt < maxRetries) {
    try {
      const response = await fetch(url, options);
      if (response.ok || response.status === 401 || response.status === 404) {
        return response;
      }
      throw new Error(`HTTP ${response.status}`);
    } catch (err) {
      attempt++;
      if (attempt >= maxRetries) {
        throw err;
      }
      // Exponential backoff: 1s, 2s, 4s...
      const backoff = delayMs * Math.pow(2, attempt - 1);
      await new Promise((resolve) => setTimeout(resolve, backoff));
    }
  }
  throw new Error("Network request failed after maximum retries");
}

/**
 * Save recruitments feed to localStorage with an explicit cache timestamp
 */
export function saveCachedRecruitments<T>(data: T): void {
  if (typeof window === "undefined") return;
  try {
    const payload: CachedData<T> = {
      data,
      timestamp: Date.now(),
      formattedTime: new Date().toLocaleString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }),
    };
    localStorage.setItem(RECRUITMENTS_CACHE_KEY, JSON.stringify(payload));
  } catch (e) {
    console.warn("Failed to write to local storage cache:", e);
  }
}

/**
 * Retrieve cached recruitments with timestamp metadata
 */
export function getCachedRecruitments<T>(): CachedData<T> | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(RECRUITMENTS_CACHE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as CachedData<T>;
  } catch (e) {
    console.warn("Failed to read from local storage cache:", e);
    return null;
  }
}
