/**
 * Natural Language Search Query Parser (Requirement 69)
 *
 * Interprets natural language search queries like:
 * - "B.Tech jobs in Karnataka"
 * - "Graduate jobs closing this month"
 * - "Government jobs for freshers"
 * - "Bank jobs with no experience"
 * - "Central government jobs above ₹50,000"
 *
 * Converts them into transparent, modifiable filters shown to the user.
 */

export interface InterpretedFilter {
  key: string;
  label: string;
  value: string;
  displayValue: string;
}

export interface ParsedSearchQuery {
  rawQuery: string;
  cleanQuery: string;
  filters: InterpretedFilter[];
  params: {
    qualification?: string;
    location?: string;
    fresher?: boolean;
    category?: string;
    closingSoon?: boolean;
    minSalary?: number;
    search?: string;
  };
}

const INDIAN_STATES = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
  "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka",
  "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram",
  "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu",
  "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal",
  "Delhi", "Jammu and Kashmir", "All India",
];

const QUALIFICATIONS_MAP: Record<string, { code: string; label: string }> = {
  "b.tech": { code: "BTECH", label: "B.Tech" },
  "btech": { code: "BTECH", label: "B.Tech" },
  "b.e.": { code: "BE", label: "B.E." },
  "b.e": { code: "BE", label: "B.E." },
  "be": { code: "BE", label: "B.E." },
  "graduate": { code: "ANY_GRADUATE", label: "Any Graduate" },
  "graduates": { code: "ANY_GRADUATE", label: "Any Graduate" },
  "any graduate": { code: "ANY_GRADUATE", label: "Any Graduate" },
  "bca": { code: "BCA", label: "BCA" },
  "mca": { code: "MCA", label: "MCA" },
  "mba": { code: "MBA", label: "MBA" },
  "b.sc": { code: "BSC", label: "B.Sc" },
  "bsc": { code: "BSC", label: "B.Sc" },
  "b.com": { code: "BCOM", label: "B.Com" },
  "bcom": { code: "BCOM", label: "B.Com" },
  "b.a": { code: "BA", label: "B.A." },
  "ba": { code: "BA", label: "B.A." },
};

export function parseNaturalLanguageQuery(query: string): ParsedSearchQuery {
  if (!query || !query.trim()) {
    return {
      rawQuery: "",
      cleanQuery: "",
      filters: [],
      params: {},
    };
  }

  const rawLower = query.toLowerCase();
  const filters: InterpretedFilter[] = [];
  const params: ParsedSearchQuery["params"] = {};
  let workingQuery = query;

  // 1. Detect Fresher / No Experience
  if (
    rawLower.includes("fresher") ||
    rawLower.includes("freshers") ||
    rawLower.includes("no experience") ||
    rawLower.includes("without experience") ||
    rawLower.includes("entry level") ||
    rawLower.includes("0 experience")
  ) {
    filters.push({
      key: "fresher",
      label: "Experience",
      value: "true",
      displayValue: "Fresher Eligible",
    });
    params.fresher = true;
    workingQuery = workingQuery.replace(/\b(for\s+)?(freshers?|no\s+experience|without\s+experience|entry\s+level|0\s+experience)\b/gi, "");
  }

  // 2. Detect Qualification / Degree
  for (const [key, qual] of Object.entries(QUALIFICATIONS_MAP)) {
    const regex = new RegExp(`\\b${key.replace(".", "\\.")}\\b`, "i");
    if (regex.test(workingQuery)) {
      filters.push({
        key: "qualification",
        label: "Qualification",
        value: qual.code,
        displayValue: qual.label,
      });
      params.qualification = qual.code;
      workingQuery = workingQuery.replace(regex, "");
      break;
    }
  }

  // 3. Detect Location / State
  for (const state of INDIAN_STATES) {
    const regex = new RegExp(`\\b(in\\s+)?${state}\\b`, "i");
    if (regex.test(workingQuery)) {
      filters.push({
        key: "location",
        label: "Location",
        value: state,
        displayValue: state,
      });
      params.location = state;
      workingQuery = workingQuery.replace(regex, "");
      break;
    }
  }

  // 3b. Detect KEA / KPSC and Karnataka State Exam keywords
  if (/\b(kea|karnataka\s+examination\s+authority|kpsc|vao|grama\s+prashasaka|fda|sda)\b/i.test(workingQuery)) {
    if (!params.location) {
      filters.push({
        key: "location",
        label: "Location",
        value: "Karnataka",
        displayValue: "Karnataka (KEA / KPSC)",
      });
      params.location = "Karnataka";
    }
  }

  // 4. Detect Category (Banking, Central, Railway, Defense, State PSC / Boards)
  if (/\b(bank|banking|ibps|sbi|rbi)\b/i.test(workingQuery)) {
    filters.push({
      key: "category",
      label: "Sector",
      value: "BANKING",
      displayValue: "Banking & Financial",
    });
    params.category = "BANKING";
    workingQuery = workingQuery.replace(/\b(bank|banking|ibps|sbi|rbi)\b/gi, "");
  } else if (/\b(central\s+govt|central\s+government|ssc|upsc)\b/i.test(workingQuery)) {
    filters.push({
      key: "category",
      label: "Sector",
      value: "CENTRAL",
      displayValue: "Central Government",
    });
    params.category = "CENTRAL";
    workingQuery = workingQuery.replace(/\b(central\s+govt|central\s+government|ssc|upsc)\b/gi, "");
  } else if (/\b(railway|railways|rrb)\b/i.test(workingQuery)) {
    filters.push({
      key: "category",
      label: "Sector",
      value: "RAILWAY",
      displayValue: "Railways (RRB)",
    });
    params.category = "RAILWAY";
    workingQuery = workingQuery.replace(/\b(railway|railways|rrb)\b/gi, "");
  } else if (/\b(kea|kpsc|state\s+psc|state\s+commission|state\s+boards?)\b/i.test(workingQuery)) {
    filters.push({
      key: "category",
      label: "Sector",
      value: "STATE_PSC",
      displayValue: "State PSC & Boards (KEA / KPSC)",
    });
    params.category = "STATE_PSC";
    workingQuery = workingQuery.replace(/\b(state\s+psc|state\s+commission|state\s+boards?|karnataka\s+examination\s+authority)\b/gi, "");
  }

  // 5. Detect Closing Soon / Deadlines
  if (/\b(closing\s+this\s+month|closing\s+soon|closing\s+this\s+week|closing\s+today)\b/i.test(workingQuery)) {
    filters.push({
      key: "closingSoon",
      label: "Deadline",
      value: "true",
      displayValue: "Closing Soon",
    });
    params.closingSoon = true;
    workingQuery = workingQuery.replace(/\b(closing\s+this\s+month|closing\s+soon|closing\s+this\s+week|closing\s+today)\b/gi, "");
  }

  // 6. Detect Salary Filter (e.g., above 50,000, 50k, 60k)
  const salaryMatch = workingQuery.match(/(?:above|>|min|minimum)?\s*(?:₹|rs\.?)?\s*(\d{2,3})(?:k|,000|000)\b/i);
  if (salaryMatch) {
    const amount = parseInt(salaryMatch[1], 10) * 1000;
    if (amount >= 20000 && amount <= 300000) {
      filters.push({
        key: "minSalary",
        label: "Salary",
        value: String(amount),
        displayValue: `₹${(amount / 1000).toFixed(0)}k+ /month`,
      });
      params.minSalary = amount;
      workingQuery = workingQuery.replace(salaryMatch[0], "");
    }
  }

  // Clean remaining keywords (remove words like 'jobs', 'recruitment', 'exam', 'vacancies', 'post')
  let cleaned = workingQuery
    .replace(/\b(jobs?|recruitment|exams?|vacancies|posts?|government|govt|with|for|in|under|above)\b/gi, "")
    .replace(/\s+/g, " ")
    .trim();

  params.search = cleaned || undefined;

  return {
    rawQuery: query,
    cleanQuery: cleaned,
    filters,
    params,
  };
}
