/**
 * Observability & Structured Logging Engine (Requirement 73)
 *
 * Implements structured JSON logging with correlation IDs, latency tracking,
 * and automatic redaction of sensitive credentials, tokens, and PII.
 */

import crypto from "crypto";

export type LogLevel = "DEBUG" | "INFO" | "WARN" | "ERROR" | "METRIC";

export interface LogContext {
  correlationId?: string;
  endpoint?: string;
  method?: string;
  statusCode?: number;
  durationMs?: number;
  userId?: string;
  adminEmail?: string;
  service?: string;
  [key: string]: any;
}

const REDACTED_KEYS = new Set([
  "password",
  "token",
  "secret",
  "authorization",
  "cookie",
  "jwt",
  "key",
  "creditcard",
  "cvv",
]);

/**
 * Recursively redacts sensitive keys from log payloads
 */
function sanitizePayload(obj: any): any {
  if (obj === null || obj === undefined) return obj;
  if (typeof obj !== "object") return obj;

  if (Array.isArray(obj)) {
    return obj.map(sanitizePayload);
  }

  const sanitized: Record<string, any> = {};
  for (const [k, v] of Object.entries(obj)) {
    if (REDACTED_KEYS.has(k.toLowerCase())) {
      sanitized[k] = "[REDACTED]";
    } else if (typeof v === "object") {
      sanitized[k] = sanitizePayload(v);
    } else {
      sanitized[k] = v;
    }
  }
  return sanitized;
}

class ObservabilityLogger {
  private format(level: LogLevel, message: string, context?: LogContext) {
    const entry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      correlationId: context?.correlationId || crypto.randomUUID().substring(0, 8),
      ...sanitizePayload(context),
    };

    if (level === "ERROR") {
      console.error(JSON.stringify(entry));
    } else if (level === "WARN") {
      console.warn(JSON.stringify(entry));
    } else {
      console.log(JSON.stringify(entry));
    }
  }

  info(message: string, context?: LogContext) {
    this.format("INFO", message, context);
  }

  warn(message: string, context?: LogContext) {
    this.format("WARN", message, context);
  }

  error(message: string, error?: any, context?: LogContext) {
    const errContext = {
      ...context,
      errorMessage: error?.message || String(error),
      stack: error?.stack?.split("\n").slice(0, 3).join(" | "),
    };
    this.format("ERROR", message, errContext);
  }

  metric(name: string, value: number, unit = "ms", context?: LogContext) {
    this.format("METRIC", `Metric: ${name}=${value}${unit}`, {
      ...context,
      metricName: name,
      metricValue: value,
      metricUnit: unit,
    });
  }
}

export const logger = new ObservabilityLogger();
