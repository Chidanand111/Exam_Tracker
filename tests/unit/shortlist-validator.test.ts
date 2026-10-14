import { describe, it, expect } from "vitest";
import { validateSaveShortlistInput } from "@/validators/shortlist.validator";

describe("validateSaveShortlistInput", () => {
  it("should successfully validate valid shortlist payload", () => {
    const input = {
      recruitmentId: "rec_12345",
      lifecycleState: "INTERESTED",
      priority: "HIGH",
      personalNotes: "Review syllabus by Monday",
      targetPrepDays: 45,
    };

    const result = validateSaveShortlistInput(input);
    expect(result.success).toBe(true);
    expect(result.data).toEqual({
      recruitmentId: "rec_12345",
      lifecycleState: "INTERESTED",
      priority: "HIGH",
      personalNotes: "Review syllabus by Monday",
      targetPrepDays: 45,
    });
  });

  it("should apply default lifecycleState and priority when omitted", () => {
    const input = {
      recruitmentId: "rec_67890",
    };

    const result = validateSaveShortlistInput(input);
    expect(result.success).toBe(true);
    expect(result.data?.lifecycleState).toBe("BOOKMARKED");
    expect(result.data?.priority).toBe("MEDIUM");
  });

  it("should fail validation when recruitmentId is empty or missing", () => {
    const result1 = validateSaveShortlistInput({});
    expect(result1.success).toBe(false);
    expect(result1.error).toContain("recruitmentId is required");

    const result2 = validateSaveShortlistInput({ recruitmentId: "   " });
    expect(result2.success).toBe(false);
    expect(result2.error).toContain("recruitmentId is required");
  });

  it("should fail validation when lifecycleState is invalid", () => {
    const result = validateSaveShortlistInput({
      recruitmentId: "rec_123",
      lifecycleState: "INVALID_STATE",
    });
    expect(result.success).toBe(false);
    expect(result.error).toContain("Invalid lifecycleState");
  });

  it("should fail validation when targetPrepDays is negative or non-integer", () => {
    const result = validateSaveShortlistInput({
      recruitmentId: "rec_123",
      targetPrepDays: -5,
    });
    expect(result.success).toBe(false);
    expect(result.error).toContain("targetPrepDays must be a non-negative integer");
  });
});
