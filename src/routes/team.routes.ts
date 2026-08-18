import express from "express";
import TeamController from "../controllers/team.controller";
import { protect, authorizeRoles } from "../middleware/auth.middleware";
import { validate } from "../middleware/validate.middleware";
import { uploadTeamPhoto } from "../middleware/upload.middleware";
import {
  createTeamSchema,
  updateTeamSchema,
} from "../validators/team.validator";

const router = express.Router();

/**
 * @openapi
 * components:
 *   schemas:
 *     TeamSocials:
 *       type: object
 *       properties:
 *         linkedin:
 *           type: string
 *           nullable: true
 *         github:
 *           type: string
 *           nullable: true
 *         email:
 *           type: string
 *           format: email
 *           nullable: true
 *     TeamMember:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           example: 66d0f1c2a4b5c6d7e8f9a0b1
 *         name:
 *           type: string
 *           minLength: 2
 *           maxLength: 50
 *         role:
 *           type: string
 *           maxLength: 100
 *         bio:
 *           type: string
 *           maxLength: 500
 *         photoUrl:
 *           type: string
 *         socials:
 *           $ref: '#/components/schemas/TeamSocials'
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */

/**
 * @openapi
 * /api/v1/team:
 *   get:
 *     summary: Get all team members
 *     tags: [Team]
 *     responses:
 *       200:
 *         description: List of team members
 */
router.get("/", TeamController.handleGetTeams);

/**
 * @openapi
 * /api/v1/team/{id}:
 *   get:
 *     summary: Get a team member by ID
 *     tags: [Team]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Team member found
 *       400:
 *         description: Invalid ID
 *       404:
 *         description: Not found
 */
router.get("/:id", TeamController.handleGetTeamById);

/**
 * @openapi
 * /api/v1/team:
 *   post:
 *     summary: Add a team member (admin only)
 *     tags: [Team]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required: [name, role, bio, photo]
 *             properties:
 *               name:
 *                 type: string
 *               role:
 *                 type: string
 *               bio:
 *                 type: string
 *               socials[linkedin]:
 *                 type: string
 *                 description: Sent as a bracketed form field since the model stores socials as a nested object
 *               socials[github]:
 *                 type: string
 *               socials[email]:
 *                 type: string
 *               photo:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Team member created
 *       400:
 *         description: Validation error or missing/invalid photo
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden — admin role required
 */
router.post(
  "/",
  protect,
  authorizeRoles("ADMIN"),
  uploadTeamPhoto.single("photo"),
  validate(createTeamSchema),
  TeamController.handleCreateTeam,
);

/**
 * @openapi
 * /api/v1/team/{id}:
 *   put:
 *     summary: Update a team member (admin only)
 *     tags: [Team]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               role:
 *                 type: string
 *               bio:
 *                 type: string
 *               socials[linkedin]:
 *                 type: string
 *               socials[github]:
 *                 type: string
 *               socials[email]:
 *                 type: string
 *               photo:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Team member updated
 *       400:
 *         description: Invalid ID or validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden — admin role required
 *       404:
 *         description: Not found
 */
router.put(
  "/:id",
  protect,
  authorizeRoles("ADMIN"),
  uploadTeamPhoto.single("photo"),
  validate(updateTeamSchema),
  TeamController.handleUpdateTeam,
);

/**
 * @openapi
 * /api/v1/team/{id}:
 *   delete:
 *     summary: Delete a team member (admin only)
 *     tags: [Team]
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
 *         description: Team member deleted
 *       400:
 *         description: Invalid ID
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden — admin role required
 *       404:
 *         description: Not found
 */
router.delete(
  "/:id",
  protect,
  authorizeRoles("ADMIN"),
  TeamController.handleDeleteTeam,
);

export default router;
