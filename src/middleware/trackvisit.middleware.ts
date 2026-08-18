import { Request, Response, NextFunction } from "express";
import geoip from "geoip-lite";
import Visit from "../modules/visit.module";

// Paths that shouldn't count as "visits" — tweak to taste
const IGNORED_PATH_PREFIXES = ["/api/v1/analytics", "/health", "/favicon.ico"];

const getClientIp = (req: Request): string => {
  const forwarded = req.headers["x-forwarded-for"];

  const raw = Array.isArray(forwarded)
    ? forwarded[0]
    : forwarded?.split(",")[0].trim();

  const ip = raw || req.socket.remoteAddress || "";

  // normalize IPv4-mapped IPv6 addresses like ::ffff:127.0.0.1
  return ip.replace(/^::ffff:/, "");
};

export const trackVisit = (
  req: Request,
  _res: Response,
  next: NextFunction,
) => {
  next(); // don't make the visitor wait on logging

  const shouldSkip = IGNORED_PATH_PREFIXES.some((prefix) =>
    req.originalUrl.startsWith(prefix),
  );

  if (shouldSkip) return;

  const ip = getClientIp(req);
  if (!ip || ip === "127.0.0.1" || ip === "::1") return;

  const geo = geoip.lookup(ip);

  Visit.create({
    ip,
    country: geo?.country,
    city: geo?.city,
    latitude: geo?.ll?.[0],
    longitude: geo?.ll?.[1],
    path: req.originalUrl,
  }).catch((err) => {
    // never let logging failures affect the app
    console.error("Failed to log visit:", err);
  });
};
