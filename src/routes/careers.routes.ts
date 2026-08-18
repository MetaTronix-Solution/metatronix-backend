import express from "express";
import CareersController from "../controllers/careers.controller";
import { protect, authorizeRoles } from "../middleware/auth.middleware";
import { validate } from "../middleware/validate.middleware";
import {
  createCareerSchema,
  updateCareerSchema,
  updateCareerStatusSchema,
} from "../validators/careers.validator";

const router = express.Router();

/**
 * @openapi
 * components:
 *   schemas:
 *     Salary:
 *       type: object
 *       properties:
 *         min:
 *           type: number
 *         max:
 *           type: number
 *         currency:
 *           type: string
 *           default: NPR
 *     Career:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           example: 66d0f1c2a4b5c6d7e8f9a0b1
 *         title:
 *           type: string
 *           maxLength: 100
 *         department:
 *           type: string
 *         location:
 *           type: string
 *         employmentType:
 *           type: string
 *           enum: [full-time, part-time, contract, internship, remote]
 *         workplace:
 *           type: string
 *           enum: [onsite, remote, hybrid]
 *         description:
 *           type: string
 *         responsibilities:
 *           type: array
 *           items:
 *             type: string
 *         requirements:
 *           type: array
 *           items:
 *             type: string
 *         preferredQualifications:
 *           type: array
 *           items:
 *             type: string
 *         salary:
 *           $ref: '#/components/schemas/Salary'
 *         experience:
 *           type: string
 *         vacancies:
 *           type: integer
 *           default: 1
 *           minimum: 1
 *         applicationDeadline:
 *           type: string
 *           format: date-time
 *           nullable: true
 *         status:
 *           type: string
 *           enum: [draft, open, closed]
 *           default: draft
 *         createdBy:
 *           type: string
 *           description: ObjectId of the User who created this posting
 *           example: 66d0f1c2a4b5c6d7e8f9a0b1
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */

/**
 * @openapi
 * /api/v1/careers:
 *   get:
 *     summary: Get all career postings
 *     tags: [Careers]
 *     responses:
 *       200:
 *         description: List of career postings
 */
router.get("/", CareersController.handleGetCareers);

/**
 * @openapi
 * /api/v1/careers/{id}:
 *   get:
 *     summary: Get a career posting by ID
 *     tags: [Careers]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Career found
 *       400:
 *         description: Invalid career ID
 *       404:
 *         description: Career not found
 */
router.get("/:id", CareersController.handleGetCareerById);

/**
 * @openapi
 * /api/v1/careers:
 *   post:
 *     summary: Create a career posting (admin only)
 *     tags: [Careers]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [title, department, location, employmentType, workplace, description, experience]
 *             properties:
 *               title:
 *                 type: string
 *                 maxLength: 100
 *               department:
 *                 type: string
 *               location:
 *                 type: string
 *               employmentType:
 *                 type: string
 *                 enum: [full-time, part-time, contract, internship, remote]
 *               workplace:
 *                 type: string
 *                 enum: [onsite, remote, hybrid]
 *               description:
 *                 type: string
 *               responsibilities:
 *                 type: array
 *                 items:
 *                   type: string
 *               requirements:
 *                 type: array
 *                 items:
 *                   type: string
 *               preferredQualifications:
 *                 type: array
 *                 items:
 *                   type: string
 *               salary:
 *                 $ref: '#/components/schemas/Salary'
 *               experience:
 *                 type: string
 *               vacancies:
 *                 type: integer
 *                 minimum: 1
 *               applicationDeadline:
 *                 type: string
 *                 format: date-time
 *               status:
 *                 type: string
 *                 enum: [draft, open, closed]
 *     responses:
 *       201:
 *         description: Career created
 *       400:
 *         description: Validation error
 *       401:
 *         description: Access token missing/invalid
 *       403:
 *         description: Forbidden — admin role required
 */
router.post(
  "/",
  protect,
  authorizeRoles("ADMIN"),
  validate(createCareerSchema),
  CareersController.handleCreateCarrer,
);

/**
 * @openapi
 * /api/v1/careers/{id}:
 *   put:
 *     summary: Update a career posting (admin only)
 *     tags: [Careers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 maxLength: 100
 *               department:
 *                 type: string
 *               location:
 *                 type: string
 *               employmentType:
 *                 type: string
 *                 enum: [full-time, part-time, contract, internship, remote]
 *               workplace:
 *                 type: string
 *                 enum: [onsite, remote, hybrid]
 *               description:
 *                 type: string
 *               responsibilities:
 *                 type: array
 *                 items:
 *                   type: string
 *               requirements:
 *                 type: array
 *                 items:
 *                   type: string
 *               preferredQualifications:
 *                 type: array
 *                 items:
 *                   type: string
 *               salary:
 *                 $ref: '#/components/schemas/Salary'
 *               experience:
 *                 type: string
 *               vacancies:
 *                 type: integer
 *                 minimum: 1
 *               applicationDeadline:
 *                 type: string
 *                 format: date-time
 *               status:
 *                 type: string
 *                 enum: [draft, open, closed]
 *     responses:
 *       200:
 *         description: Career updated
 *       400:
 *         description: Invalid ID or validation error
 *       401:
 *         description: Access token missing/invalid
 *       403:
 *         description: Forbidden — admin role required
 *       404:
 *         description: Career not found
 */
router.put(
  "/:id",
  protect,
  authorizeRoles("ADMIN"),
  validate(updateCareerSchema),
  CareersController.handleUpdateCareer,
);

/**
 * @openapi
 * /api/v1/careers/{id}/status:
 *   patch:
 *     summary: Update only the status of a career posting (admin only)
 *     tags: [Careers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [status]
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [draft, open, closed]
 *     responses:
 *       200:
 *         description: Status updated
 *       400:
 *         description: Invalid ID or invalid status value
 *       401:
 *         description: Access token missing/invalid
 *       403:
 *         description: Forbidden — admin role required
 *       404:
 *         description: Career not found
 */
router.patch(
  "/:id/status",
  protect,
  authorizeRoles("ADMIN"),
  validate(updateCareerStatusSchema),
  CareersController.handleUpdateCareerStatus,
);

/**
 * @openapi
 * /api/v1/careers/{id}:
 *   delete:
 *     summary: Delete a career posting (admin only)
 *     tags: [Careers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Career deleted successfully
 *       400:
 *         description: Invalid career ID
 *       401:
 *         description: Access token missing/invalid
 *       403:
 *         description: Forbidden — admin role required
 *       404:
 *         description: Career not found
 */
router.delete(
  "/:id",
  protect,
  authorizeRoles("ADMIN"),
  CareersController.handleDeleteCareer,
);

export default router;
