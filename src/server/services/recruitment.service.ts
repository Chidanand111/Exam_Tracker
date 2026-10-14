import { RecruitmentRepository, RecruitmentFilterParams } from "../repositories/recruitment.repository";

export class RecruitmentService {
  /**
   * Parse query parameters from URL SearchParams and fetch matching recruitments
   */
  static async getRecruitmentsFromParams(searchParams: URLSearchParams) {
    const filters: RecruitmentFilterParams = {
      search: searchParams.get("search")?.trim() || undefined,
      qualification: searchParams.get("qualification") || undefined,
      fresherOnly: searchParams.get("fresher") === "true",
      experienceRequired: searchParams.get("experience") === "true",
      ageMax: searchParams.get("ageMax") ? parseInt(searchParams.get("ageMax")!) : null,
      salaryMin: searchParams.get("salaryMin") ? parseInt(searchParams.get("salaryMin")!) : null,
      category: searchParams.get("category") || undefined,
      stateLocation: searchParams.get("stateLocation") || undefined,
      status: searchParams.get("status") || undefined,
      sortBy: (searchParams.get("sort") as any) || "newest",
      includeArchived: searchParams.get("includeArchived") === "true",
      lifecycleStage: searchParams.get("lifecycle") || undefined,
    };

    const recruitments = await RecruitmentRepository.findFilteredRecruitments(filters);
    return { recruitments };
  }

  static async getRecruitmentById(id: string) {
    if (!id) {
      throw new Error("Recruitment ID is required");
    }
    const recruitment = await RecruitmentRepository.findById(id);
    if (!recruitment) {
      throw new Error("Recruitment not found");
    }
    return recruitment;
  }
}
