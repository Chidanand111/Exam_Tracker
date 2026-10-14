import { ShortlistLifecycleState } from "@/types";

export interface SaveShortlistInput {
  recruitmentId: string;
  lifecycleState: ShortlistLifecycleState;
  priority: "LOW" | "MEDIUM" | "HIGH";
  personalNotes?: string | null;
  targetPrepDays?: number | null;
}

export interface ValidationResult<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export function validateSaveShortlistInput(body: unknown): ValidationResult<SaveShortlistInput> {
  if (!body || typeof body !== "object") {
    return { success: false, error: "Request body must be a valid JSON object" };
  }

  const { recruitmentId, lifecycleState, priority, personalNotes, targetPrepDays } =
    body as Record<string, unknown>;

  if (!recruitmentId || typeof recruitmentId !== "string" || recruitmentId.trim().length === 0) {
    return { success: false, error: "recruitmentId is required and must be a non-empty string" };
  }

  const validStates: ShortlistLifecycleState[] = ["BOOKMARKED", "INTERESTED", "APPLIED", "COMPLETED"];
  if (lifecycleState !== undefined && !validStates.includes(lifecycleState as ShortlistLifecycleState)) {
    return {
      success: false,
      error: `Invalid lifecycleState: "${lifecycleState}". Allowed: ${validStates.join(", ")}`,
    };
  }

  const validPriorities = ["LOW", "MEDIUM", "HIGH"];
  if (priority !== undefined && !validPriorities.includes(priority as string)) {
    return {
      success: false,
      error: `Invalid priority: "${priority}". Allowed: ${validPriorities.join(", ")}`,
    };
  }

  let parsedDays: number | null = null;
  if (targetPrepDays !== undefined && targetPrepDays !== null) {
    const num = Number(targetPrepDays);
    if (isNaN(num) || num < 0 || !Number.isInteger(num)) {
      return { success: false, error: "targetPrepDays must be a non-negative integer" };
    }
    parsedDays = num;
  }

  return {
    success: true,
    data: {
      recruitmentId: recruitmentId.trim(),
      lifecycleState: (lifecycleState as ShortlistLifecycleState) || "BOOKMARKED",
      priority: (priority as "LOW" | "MEDIUM" | "HIGH") || "MEDIUM",
      personalNotes: typeof personalNotes === "string" ? personalNotes.trim() : null,
      targetPrepDays: parsedDays,
    },
  };
}
