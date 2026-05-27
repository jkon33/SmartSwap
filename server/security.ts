import { Request, Response, NextFunction } from "express";

/**
 * -------------------------------------------------------------
 * 1. REAL-TIME MULTI-LAYER INPUT SANITIZATION
 * -------------------------------------------------------------
 */

/**
 * Strips known dangerous HTML injection characters, system keywords, 
 * script tags, and typical projection characters.
 */
export function sanitizeString(val: string): string {
  if (!val) return "";
  let clean = val;
  // Strip out HTML tags completely
  clean = clean.replace(/<[^>]*>/g, "");
  // Remove script tag variants and handlers
  clean = clean.replace(/javascript:/gi, "");
  clean = clean.replace(/onload|onerror|onclick|onmouseover/gi, "");
  // Defang common template injection/special structures
  clean = clean.replace(/[{}\[\]$]/g, "");
  // Trim excessive whitespace
  return clean.trim();
}

/**
 * Recursively sanitizes request data (body, query, params) to defend the database memory stores.
 */
export function sanitizePayload(data: any): any {
  if (data === null || data === undefined) return data;

  if (typeof data === "string") {
    return sanitizeString(data);
  }

  if (Array.isArray(data)) {
    return data.map(item => sanitizePayload(item));
  }

  if (typeof data === "object") {
    const sanitizedObj: any = {};
    for (const key in data) {
      if (Object.prototype.hasOwnProperty.call(data, key)) {
        // Enforce safe keys (no mongo query operator injection if MongoDB is linked)
        const safeKey = key.replace(/^\$/, "");
        sanitizedObj[safeKey] = sanitizePayload(data[key]);
      }
    }
    return sanitizedObj;
  }

  return data;
}

/**
 * Express Middleware to sanitize input parameter bodies, queries and fields.
 */
export function sanitizeInputMiddleware(req: Request, res: Response, next: NextFunction): void {
  req.body = sanitizePayload(req.body);
  req.query = sanitizePayload(req.query);
  req.params = sanitizePayload(req.params);
  next();
}


/**
 * -------------------------------------------------------------
 * 2. SLIDING-WINDOW PERFORMANCE RATE LIMITER (With Ban-Lists)
 * -------------------------------------------------------------
 */

interface RateLimitRecord {
  timestamps: number[];
  bannedUntil?: number;
}

const rateLimitStore = new Map<string, RateLimitRecord>();

// Clean store periodically to evade memory leaks
setInterval(() => {
  const now = Date.now();
  for (const [key, record] of rateLimitStore.entries()) {
    // Retain only requests in the last hour
    record.timestamps = record.timestamps.filter(t => now - t < 3600000);
    if (record.timestamps.length === 0 && (!record.bannedUntil || record.bannedUntil < now)) {
      rateLimitStore.delete(key);
    }
  }
}, 300000); // clear every 5 mins

export function rateLimiter(options: {
  windowMs: number;
  max: number;
  sensitive?: boolean;
}) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const ip = req.ip || req.headers["x-forwarded-for"] as string || "unknown_client";
    const key = `${ip}:${options.sensitive ? "sensitive" : "generic"}`;
    const now = Date.now();

    let record = rateLimitStore.get(key);
    if (!record) {
      record = { timestamps: [] };
      rateLimitStore.set(key, record);
    }

    // Check if blacklisted due to brute forcing
    if (record.bannedUntil && record.bannedUntil > now) {
      const remainingBan = Math.ceil((record.bannedUntil - now) / 1000);
      res.status(429).json({
        success: false,
        message: `Too many malicious attempts detected from this IP. Temporarily blocked for ${remainingBan} more seconds.`,
      });
      return;
    }

    // Filter logs out of window frame
    record.timestamps = record.timestamps.filter(t => now - t < options.windowMs);

    // If client has flooded past 3x the max threshold, apply standard security ban list
    if (record.timestamps.length >= options.max * 3.5) {
      record.bannedUntil = now + 900000; // block for 15 minutes straight
      res.status(429).json({
        success: false,
        message: "Maximum security threshold exceeded. Dynamic brute-force firewall has banned your IP address for 15 minutes.",
      });
      return;
    }

    if (record.timestamps.length >= options.max) {
      res.status(429).json({
        success: false,
        message: "Too many concurrent requests originating from your network coordinates. Please slow down and try again.",
      });
      return;
    }

    record.timestamps.push(now);
    next();
  };
}


/**
 * -------------------------------------------------------------
 * 3. DYNAMIC CORS ORIGIN AND WEBSOCKET ORIGIN AUDITOR
 * -------------------------------------------------------------
 */

/**
 * Determines whether a given Origin header is trusted.
 * Authorizes loopbacks, Cloud Run custom domains, and local instances, denying arbitrary connections.
 */
export function isAllowedOrigin(origin: string | undefined): boolean {
  if (!origin) return true; // Accept postman, curl, or standard server-side requests with missing origins safely

  // Allow localhosts / loopback coordinates
  if (
    origin.startsWith("http://localhost:") ||
    origin.startsWith("https://localhost:") ||
    origin.includes("127.0.0.1")
  ) {
    return true;
  }

  // Allow pre-configured environment variable
  const allowed = process.env.ALLOWED_ORIGIN;
  if (allowed && (origin === allowed || origin.startsWith(allowed))) {
    return true;
  }

  // Allow AI Studio preview/development containers sandbox URLs dynamically
  if (
    origin.includes(".europe-west2.run.app") ||
    origin.includes(".run.app") ||
    origin.endsWith(".google.app") ||
    origin.includes("ai.studio/build")
  ) {
    return true;
  }

  // Reject all other unverified cross-origins
  return false;
}

/**
 * Custom CORS handler utilizing the dynamic origin audit filter
 */
export function secureCorsMiddleware(req: Request, res: Response, next: NextFunction): void {
  const origin = req.headers.origin;

  if (origin && isAllowedOrigin(origin)) {
    res.header("Access-Control-Allow-Origin", origin);
    res.header("Access-Control-Allow-Credentials", "true");
  } else if (!origin) {
    // Server-to-server fallback
    res.header("Access-Control-Allow-Origin", "*");
  } else {
    // Treat as untrusted cross-origin
    res.header("Access-Control-Allow-Origin", "null");
  }

  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization, X-Client-Secure-Token");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");

  if (req.method === "OPTIONS") {
    res.sendStatus(200);
    return;
  }
  next();
}


/**
 * -------------------------------------------------------------
 * 4. STRICT PAYLOAD SCHEMAS & UTILITY VALIDATORS
 * -------------------------------------------------------------
 */

/**
 * Validates complex password requirements
 */
export function validatePasswordStrength(password: string): { valid: boolean; reason?: string } {
  if (password.length < 8) {
    return { valid: false, reason: "Password is too weak. Must be at least 8 characters long." };
  }
  if (!/[A-Z]/.test(password) && !/[a-z]/.test(password)) {
    return { valid: false, reason: "Password must contain at least one alpha character." };
  }
  if (!/[0-9]/.test(password)) {
    return { valid: false, reason: "Password must contain at least one numeric digit." };
  }
  return { valid: true };
}

/**
 * Validates standard structural email format
 */
export function validateEmailString(email: string): boolean {
  if (!email || typeof email !== "string") return false;
  // Standard RFC-2822 compliant search
  const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return re.test(email);
}

/**
 * Sanitizes and parses dynamic transactional amounts to safeguard against NaN/Infinity arithmetic exploits
 */
export function parseAndValidateAmount(raw: any, currencyName = "Asset"): { valid: boolean; parsed: number; error?: string } {
  const amountStr = String(raw).trim();
  const parsed = parseFloat(amountStr);

  if (isNaN(parsed)) {
    return { valid: false, parsed: 0, error: `Invalid ${currencyName} allocation: input is not a number.` };
  }

  // Protect against Negative overflow or zero manipulation
  if (parsed <= 0) {
    return { valid: false, parsed: 0, error: `Transaction abort: ${currencyName} allocation must be greater than zero.` };
  }

  // Prevent Arithmetic Infinity exploits or scientific notation overflow
  if (!isFinite(parsed) || parsed > 100000000000) {
    return { valid: false, parsed: 0, error: `Transaction abort: excessive ${currencyName} allocation exceeding safety protocol parameters.` };
  }

  return { valid: true, parsed };
}
