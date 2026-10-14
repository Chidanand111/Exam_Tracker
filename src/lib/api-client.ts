/**
 * Centralized, resilient HTTP Client for BharatExam Tracker.
 * Provides timeout control, request cancellation, error normalization, and domain namespaces.
 */

import { ShortlistLifecycleState, RecruitmentItem, FilterState } from "@/types";

export class ApiClientError extends Error {
  public readonly status: number;
  public readonly code?: string;
  public readonly details?: unknown;

  constructor(message: string, status: number, code?: string, details?: unknown) {
    super(message);
    this.name = "ApiClientError";
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

export interface RequestOptions extends RequestInit {
  timeoutMs?: number;
  retries?: number;
}

async function request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const { timeoutMs = 15000, retries = 0, ...fetchOptions } = options;

  let attempt = 0;
  const maxAttempts = 1 + retries;

  while (attempt < maxAttempts) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    // Chain caller's signal if provided
    if (fetchOptions.signal) {
      fetchOptions.signal.addEventListener("abort", () => controller.abort());
    }

    try {
      const response = await fetch(endpoint, {
        ...fetchOptions,
        signal: controller.signal,
        headers: {
          "Content-Type": "application/json",
          ...fetchOptions.headers,
        },
      });

      clearTimeout(timeoutId);

      const contentType = response.headers.get("content-type");
      const isJson = contentType && contentType.includes("application/json");
      const data = isJson ? await response.json() : null;

      if (!response.ok) {
        const errorMessage =
          data?.error || data?.message || `Request failed with status ${response.status}`;
        throw new ApiClientError(errorMessage, response.status, data?.code, data?.details);
      }

      return data as T;
    } catch (err: any) {
      clearTimeout(timeoutId);

      if (err.name === "AbortError") {
        throw new ApiClientError("Request timed out. Please check your internet connection.", 408, "TIMEOUT");
      }

      attempt++;
      const isIdempotent = !fetchOptions.method || fetchOptions.method === "GET";

      if (attempt < maxAttempts && isIdempotent && !(err instanceof ApiClientError && err.status < 500)) {
        const backoff = 500 * Math.pow(2, attempt - 1);
        await new Promise((r) => setTimeout(r, backoff));
        continue;
      }

      if (err instanceof ApiClientError) {
        throw err;
      }

      throw new ApiClientError(
        err?.message || "A network error occurred. Please try again.",
        0,
        "NETWORK_ERROR"
      );
    }
  }

  throw new ApiClientError("Request failed after retries.", 0, "MAX_RETRIES_EXCEEDED");
}

export const apiClient = {
  get: <T>(endpoint: string, options?: RequestOptions) =>
    request<T>(endpoint, { ...options, method: "GET" }),

  post: <T>(endpoint: string, body?: unknown, options?: RequestOptions) =>
    request<T>(endpoint, {
      ...options,
      method: "POST",
      body: body ? JSON.stringify(body) : undefined,
    }),

  delete: <T>(endpoint: string, options?: RequestOptions) =>
    request<T>(endpoint, { ...options, method: "DELETE" }),

  // Domain Namespaces
  recruitments: {
    getAll: async (filters: Partial<FilterState> = {}, options?: RequestOptions) => {
      const params = new URLSearchParams();
      if (filters.search) params.set("search", filters.search);
      if (filters.qualification && filters.qualification !== "ALL") {
        params.set("qualification", filters.qualification);
      }
      if (filters.fresherOnly) params.set("fresher", "true");
      if (filters.experienceRequired) params.set("experience", "true");
      if (filters.ageMax) params.set("ageMax", String(filters.ageMax));
      if (filters.salaryMin) params.set("salaryMin", String(filters.salaryMin));
      if (filters.category && filters.category !== "ALL") params.set("category", filters.category);
      if (filters.stateLocation && filters.stateLocation !== "ALL") params.set("stateLocation", filters.stateLocation);
      if (filters.status && filters.status !== "ALL") params.set("status", filters.status);
      if (filters.sortBy) params.set("sort", filters.sortBy);

      const qs = params.toString();
      const endpoint = qs ? `/api/recruitments?${qs}` : "/api/recruitments";
      return apiClient.get<{ recruitments: RecruitmentItem[] }>(endpoint, {
        retries: 1,
        ...options,
      });
    },

    getById: async (id: string, options?: RequestOptions) => {
      return apiClient.get<RecruitmentItem>(`/api/recruitments/${id}`, {
        retries: 1,
        ...options,
      });
    },
  },

  shortlist: {
    getAll: async (stateFilter?: string, options?: RequestOptions) => {
      const endpoint = stateFilter && stateFilter !== "ALL"
        ? `/api/shortlist?state=${stateFilter}`
        : "/api/shortlist";
      return apiClient.get<{
        success: boolean;
        items: any[];
        counts: Record<string, number>;
      }>(endpoint, options);
    },

    save: async (
      payload: {
        recruitmentId: string;
        lifecycleState?: ShortlistLifecycleState;
        priority?: string;
        personalNotes?: string | null;
        targetPrepDays?: number | null;
      },
      options?: RequestOptions
    ) => {
      return apiClient.post<{
        success: boolean;
        item: any;
        message: string;
      }>("/api/shortlist", payload, options);
    },

    remove: async (recruitmentId: string, options?: RequestOptions) => {
      return apiClient.delete<{
        success: boolean;
        message: string;
      }>(`/api/shortlist?recruitmentId=${recruitmentId}`, options);
    },
  },
};
