import Visit from "../modules/visit.module";
import asyncHandler from "../util/asyncHandler";
import AppError from "../util/AppError";
import { Request, Response } from "express";

type Period = "day" | "week" | "month" | "year";

// Rolling windows, not calendar-aligned (e.g. "week" = last 7 days, not
// "since Monday"). Swap the day counts here if you want calendar boundaries
// instead.
const PERIOD_DAYS: Record<Period, number> = {
  day: 1,
  week: 7,
  month: 30,
  year: 365,
};

// Bucket size used when grouping the trend chart — finer for shorter ranges
const PERIOD_DATE_FORMAT: Record<Period, string> = {
  day: "%Y-%m-%dT%H:00", // hourly buckets
  week: "%Y-%m-%d", // daily buckets
  month: "%Y-%m-%d", // daily buckets
  year: "%Y-%m", // monthly buckets
};

const getSince = (period: Period): Date => {
  const since = new Date();
  since.setDate(since.getDate() - PERIOD_DAYS[period]);
  return since;
};

const getPeriod = (req: Request): Period => {
  const period = req.query.period as string;
  return (["day", "week", "month", "year"] as const).includes(period as Period)
    ? (period as Period)
    : "month";
};

class AnalyticsController {
  // Raw visits for the selected period — e.g. to plot pins on a map.
  // No pagination: the dashboard needs the full set for the period.
  handleGetVisits = asyncHandler(async (req: Request, res: Response) => {
    const period = getPeriod(req);
    const since = getSince(period);

    let visits;
    try {
      visits = await Visit.find({ createdAt: { $gte: since } }).sort({
        createdAt: -1,
      });
    } catch (error) {
      throw new AppError("Failed to fetch visits.", 500);
    }

    return res.status(200).json({
      success: true,
      period,
      data: visits,
    });
  });

  // Aggregated stats for dashboard widgets/charts
  handleGetSummary = asyncHandler(async (req: Request, res: Response) => {
    const period = getPeriod(req);
    const since = getSince(period);
    const dateFormat = PERIOD_DATE_FORMAT[period];

    let totalVisits, uniqueVisitors, topCountries, topPages, trend;

    try {
      [totalVisits, uniqueVisitors, topCountries, topPages, trend] =
        await Promise.all([
          Visit.countDocuments({ createdAt: { $gte: since } }),

          Visit.distinct("ip", { createdAt: { $gte: since } }).then(
            (ips) => ips.length,
          ),

          Visit.aggregate([
            { $match: { createdAt: { $gte: since }, country: { $ne: null } } },
            { $group: { _id: "$country", count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 10 },
            { $project: { _id: 0, country: "$_id", count: 1 } },
          ]),

          Visit.aggregate([
            { $match: { createdAt: { $gte: since } } },
            { $group: { _id: "$path", count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 10 },
            { $project: { _id: 0, path: "$_id", count: 1 } },
          ]),

          Visit.aggregate([
            { $match: { createdAt: { $gte: since } } },
            {
              $group: {
                _id: {
                  $dateToString: { format: dateFormat, date: "$createdAt" },
                },
                count: { $sum: 1 },
              },
            },
            { $sort: { _id: 1 } },
            { $project: { _id: 0, date: "$_id", count: 1 } },
          ]),
        ]);
    } catch (error) {
      throw new AppError("Failed to fetch analytics summary.", 500);
    }

    return res.status(200).json({
      success: true,
      period,
      data: {
        totalVisits,
        uniqueVisitors,
        topCountries,
        topPages,
        trend,
      },
    });
  });
}

export default new AnalyticsController();
