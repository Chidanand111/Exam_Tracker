import { describe, it, expect } from "vitest";
import { parseNaturalLanguageQuery } from "@/lib/search-query-parser";

describe("parseNaturalLanguageQuery", () => {
  it("should extract fresher filter from query", () => {
    const result = parseNaturalLanguageQuery("government jobs for freshers");
    expect(result.params.fresher).toBe(true);
    expect(result.filters.some((f) => f.key === "fresher")).toBe(true);
  });

  it("should extract qualification and state location from query", () => {
    const result = parseNaturalLanguageQuery("B.Tech jobs in Karnataka");
    expect(result.params.qualification).toBe("BTECH");
    expect(result.params.location).toBe("Karnataka");
  });

  it("should extract banking category filter from query", () => {
    const result = parseNaturalLanguageQuery("bank clerk recruitment");
    expect(result.params.category).toBe("BANKING");
    expect(result.filters.some((f) => f.key === "category")).toBe(true);
  });

  it("should extract salary minimum filter from query", () => {
    const result = parseNaturalLanguageQuery("jobs above 50000");
    expect(result.params.minSalary).toBe(50000);
  });

  it("should handle empty or whitespace query gracefully", () => {
    const result = parseNaturalLanguageQuery("   ");
    expect(result.filters).toHaveLength(0);
    expect(result.cleanQuery).toBe("");
  });
});
