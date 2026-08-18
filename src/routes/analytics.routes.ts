import express from "express";
import AnalyticsController from "../controllers/analytics.controller";
import { protect, authorizeRoles } from "../middleware/auth.middleware";
import { validate } from "../middleware/validate.middleware";
import {
  getVisitsSchema,
  getSummarySchema,
} from "../validators/analytics.validator";

const router = express.Router();

/**
 * @openapi
 * components:
 *   schemas:
 *     Visit:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           example: 66d0f1c2a4b5c6d7e8f9a0b1
 *         ip:
 *           type: string
 *           example: 103.9.128.14
 *         country:
 *           type: string
 *           example: NP
 *           nullable: true
 *         city:
 *           type: string
 *           example: Kathmandu
 *           nullable: true
 *         latitude:
 *           type: number
 *           nullable: true
 *         longitude:
 *           type: number
 *           nullable: true
 *         path:
 *           type: string
 *           example: /api/v1/blogs
 *         createdAt:
 *           type: string
 *           format: date-time
 *     CountryCount:
 *       type: object
 *       properties:
 *         country:
 *           type: string
 *         count:
 *           type: integer
 *     PageCount:
 *       type: object
 *       properties:
 *         path:
 *           type: string
 *         count:
 *           type: integer
 *     TrendPoint:
 *       type: object
 *       properties:
 *         date:
 *           type: string
 *           description: Hourly (day), daily (week/month), or monthly (year) bucket label depending on the selected period
 *         count:
 *           type: integer
 */

/**
 * @openapi
 * /api/v1/analytics/admin/visits:
 *   get:
 *     summary: Get raw visit records for a period (admin)
 *     description: Returns every visit in the selected rolling window, unpaginated — intended for dashboard use (e.g. plotting locations on a map).
 *     tags: [Analytics - Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: period
 *         schema:
 *           type: string
 *           enum: [day, week, month, year]
 *           default: month
 *     responses:
 *       200:
 *         description: List of visits for the selected period
 *       400:
 *         description: Invalid period value
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Not authorized (admin only)
 */
router.get(
  "/admin/visits",
  protect,
  authorizeRoles("ADMIN"),
  validate(getVisitsSchema),
  AnalyticsController.handleGetVisits,
);

/**
 * @openapi
 * /api/v1/analytics/admin/summary:
 *   get:
 *     summary: Get aggregated visit stats for a period (admin)
 *     description: Total visits, unique visitor count, top countries, top pages, and a trend series for a chart — all scoped to the selected rolling window.
 *     tags: [Analytics - Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: period
 *         schema:
 *           type: string
 *           enum: [day, week, month, year]
 *           default: month
 *     responses:
 *       200:
 *         description: Aggregated analytics summary
 *       400:
 *         description: Invalid period value
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Not authorized (admin only)
 */
router.get(
  "/admin/summary",
  protect,
  authorizeRoles("ADMIN"),
  validate(getSummarySchema),
  AnalyticsController.handleGetSummary,
);

export default router;
