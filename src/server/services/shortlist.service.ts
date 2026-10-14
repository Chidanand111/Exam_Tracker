import { ShortlistRepository } from "../repositories/shortlist.repository";
import { ShortlistLifecycleState } from "@/types";
import { ValidationError } from "../utils/api-handler";
import { validateSaveShortlistInput } from "@/validators/shortlist.validator";

export class ShortlistService {
  static readonly VALID_LIFECYCLE_STATES: ShortlistLifecycleState[] = [
    "BOOKMARKED",
    "INTERESTED",
    "APPLIED",
    "COMPLETED",
  ];

  static async getShortlistForUser(userId: string, stateFilter?: string | null) {
    const items = await ShortlistRepository.getUserShortlist(userId, stateFilter);
    const counts = await ShortlistRepository.getShortlistCounts(userId);

    const countsMap: Record<string, number> = {
      ALL: items.length,
      BOOKMARKED: 0,
      INTERESTED: 0,
      APPLIED: 0,
      COMPLETED: 0,
    };

    let total = 0;
    for (const c of counts) {
      countsMap[c.lifecycleState] = c._count.id;
      total += c._count.id;
    }
    countsMap.ALL = total;

    return {
      success: true,
      items,
      counts: countsMap,
    };
  }

  static async saveShortlistItem(userId: string, rawInput: unknown) {
    const validation = validateSaveShortlistInput(rawInput);
    if (!validation.success || !validation.data) {
      throw new ValidationError(validation.error || "Invalid shortlist payload");
    }

    const { recruitmentId, lifecycleState, priority, personalNotes, targetPrepDays } =
      validation.data;

    const item = await ShortlistRepository.upsertShortlistItem({
      userId,
      recruitmentId,
      lifecycleState,
      priority,
      personalNotes,
      targetPrepDays: targetPrepDays ? Number(targetPrepDays) : null,
    });

    return {
      success: true,
      item,
      message: `Recruitment marked as ${lifecycleState}`,
    };
  }

  static async removeShortlistItem(userId: string, recruitmentId: string) {
    if (!recruitmentId) {
      throw new ValidationError("recruitmentId is required");
    }
    await ShortlistRepository.deleteShortlistItem(userId, recruitmentId);
    return {
      success: true,
      message: "Recruitment removed from shortlist",
    };
  }
}
