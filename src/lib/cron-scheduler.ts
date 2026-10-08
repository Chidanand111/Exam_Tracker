import { executeAutoFetch } from "./auto-fetcher";

const TWELVE_HOURS_MS = 12 * 60 * 60 * 1000;
let isWorkerInitialized = false;

/**
 * Initializes an in-process fallback scheduler for environments
 * (such as local development or standalone containers) where external
 * Vercel Cron triggers are not active.
 */
export function initCronWorkerFallback() {
  if (isWorkerInitialized) return;
  isWorkerInitialized = true;

  console.log("[CronWorkerFallback] Initialized twice-daily crawler schedule (every 12 hours).");

  // Check periodically (every 12 hours)
  setInterval(async () => {
    try {
      console.log("[CronWorkerFallback] Triggering twice-daily automatic crawl...");
      await executeAutoFetch({ triggerType: "SYSTEM_WORKER" });
    } catch (err: any) {
      console.error("[CronWorkerFallback] Error during background crawl:", err?.message);
    }
  }, TWELVE_HOURS_MS);
}
