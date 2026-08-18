import express from "express";
import BlogController from "../controllers/blog.controller";
import { uploadBlogImage } from "../middleware/upload.middleware";
import { protect, authorizeRoles } from "../middleware/auth.middleware";
import { validate } from "../middleware/validate.middleware";
import {
  createBlogSchema,
  updateBlogSchema,
  blogIdParamSchema,
  getPublishedBlogsSchema,
  blogSlugParamSchema,
} from "../validators/blog.validator";

const router = express.Router();

/**
 * @openapi
 * components:
 *   schemas:
 *     Blog:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           example: 66d0f1c2a4b5c6d7e8f9a0b1
 *         title:
 *           type: string
 *         slug:
 *           type: string
 *         imageUrl:
 *           type: string
 *         content:
 *           type: string
 *         author:
 *           type: string
 *         category:
 *           type: string
 *           enum: [Tech, Startup, AI, Design, IOT]
 *         published:
 *           type: boolean
 *         publishedAt:
 *           type: string
 *           format: date-time
 *           nullable: true
 *         readMinutes:
 *           type: number
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */

/**
 * @openapi
 * /api/v1/blogs/admin/all:
 *   get:
 *     summary: Get all blogs (admin)
 *     tags: [Blogs - Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all blogs
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Not authorized (admin only)
 */
router.get(
  "/admin/all",
  protect,
  authorizeRoles("ADMIN"),
  BlogController.handleGetBlogs,
);

/**
 * @openapi
 * /api/v1/blogs/admin/{id}:
 *   get:
 *     summary: Get a single blog by ID (admin)
 *     tags: [Blogs - Admin]
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
 *         description: Blog found
 *       400:
 *         description: Invalid blog ID
 *       404:
 *         description: Blog not found
 */
router.get(
  "/admin/:id",
  protect,
  authorizeRoles("ADMIN"),
  validate(blogIdParamSchema),
  BlogController.handleGetBlogById,
);

/**
 * @openapi
 * /api/v1/blogs/admin:
 *   post:
 *     summary: Create a blog (admin)
 *     tags: [Blogs - Admin]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required: [title, content, author, category, image]
 *             properties:
 *               title:
 *                 type: string
 *                 minLength: 5
 *                 maxLength: 150
 *               content:
 *                 type: string
 *                 minLength: 20
 *               author:
 *                 type: string
 *                 minLength: 2
 *                 maxLength: 50
 *               category:
 *                 type: string
 *                 enum: [Tech, Startup, AI, Design, IOT]
 *               published:
 *                 type: string
 *                 enum: ["true", "false"]
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Blog created
 *       400:
 *         description: Validation error or missing image
 *       409:
 *         description: A blog with this title already exists
 */
router.post(
  "/admin",
  protect,
  authorizeRoles("ADMIN"),
  uploadBlogImage.single("image"),
  validate(createBlogSchema),
  BlogController.handleCreateBlog,
);

/**
 * @openapi
 * /api/v1/blogs/admin/{id}:
 *   put:
 *     summary: Update a blog (admin)
 *     description: Partial update — only send the fields you want to change. Send `image` only if replacing the cover image.
 *     tags: [Blogs - Admin]
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
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 minLength: 5
 *                 maxLength: 150
 *               content:
 *                 type: string
 *                 minLength: 20
 *               author:
 *                 type: string
 *                 minLength: 2
 *                 maxLength: 50
 *               category:
 *                 type: string
 *                 enum: [Tech, Startup, AI, Design, IOT]
 *               published:
 *                 type: string
 *                 enum: ["true", "false"]
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Blog updated
 *       400:
 *         description: Invalid blog ID or validation error
 *       404:
 *         description: Blog not found
 *       409:
 *         description: Another blog with this title already exists
 */
router.put(
  "/admin/:id",
  protect,
  authorizeRoles("ADMIN"),
  uploadBlogImage.single("image"),
  validate(updateBlogSchema),
  BlogController.handleUpdateBlog,
);

/**
 * @openapi
 * /api/v1/blogs/admin/{id}:
 *   delete:
 *     summary: Delete a blog (admin)
 *     tags: [Blogs - Admin]
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
 *         description: Blog deleted successfully
 *       400:
 *         description: Invalid blog ID
 *       404:
 *         description: Blog not found
 */
router.delete(
  "/admin/:id",
  protect,
  authorizeRoles("ADMIN"),
  validate(blogIdParamSchema),
  BlogController.handleDeleteBlog,
);

/**
 * @openapi
 * /api/v1/blogs:
 *   get:
 *     summary: Get published blogs (public)
 *     description: Paginated list of published blogs, newest first.
 *     tags: [Blogs - Public]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *     responses:
 *       200:
 *         description: Paginated list of published blogs
 */
router.get(
  "/",
  validate(getPublishedBlogsSchema),
  BlogController.handleGetPublishedBlogs,
);

/**
 * @openapi
 * /api/v1/blogs/{slug}:
 *   get:
 *     summary: Get a published blog by slug (public)
 *     tags: [Blogs - Public]
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Blog found
 *       404:
 *         description: Blog not found
 */
router.get(
  "/:slug",
  validate(blogSlugParamSchema),
  BlogController.handleGetPublishedBlogBySlug,
);

export default router;
