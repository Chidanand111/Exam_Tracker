/**
 * Centralized Application & Environment Configuration
 * Validates and exposes strongly typed environment variables.
 * Private credentials are strictly kept server-side.
 */

function getEnv(key: string, defaultValue?: string): string {
  const value = process.env[key] || defaultValue;
  if (!value && typeof window === "undefined" && process.env.NODE_ENV === "production") {
    console.warn(`[Config Warning] Missing environment variable: ${key}`);
  }
  return value || "";
}

export const serverConfig = {
  databaseUrl: getEnv("DATABASE_URL"),
  directUrl: getEnv("DIRECT_URL"),
  jwtSecret: getEnv("JWT_SECRET", "bharat-exam-tracker-dev-fallback-key"),
  cronSecret: getEnv("CRON_SECRET"),
  nodeEnv: getEnv("NODE_ENV", "development"),
  isProduction: getEnv("NODE_ENV") === "production",
  isDevelopment: getEnv("NODE_ENV") !== "production",
};

export const clientConfig = {
  appUrl: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
};

/**
 * Validate that mandatory database and authentication configurations are present.
 * Throws early on server startup if critical configuration is missing.
 */
export function validateServerConfig(): void {
  if (typeof window !== "undefined") return;

  const missing: string[] = [];
  if (!serverConfig.databaseUrl) missing.push("DATABASE_URL");
  if (!serverConfig.jwtSecret && serverConfig.isProduction) missing.push("JWT_SECRET");

  if (missing.length > 0) {
    throw new Error(
      `[FATAL CONFIG ERROR] Missing required environment variables: ${missing.join(", ")}. Please configure them in your environment or .env file.`
    );
  }
}
