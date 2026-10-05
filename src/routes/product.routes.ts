import express from "express";
import ProductController from "../controllers/product.controller";
import { uploadProductImage } from "../middleware/upload.middleware";
import { validate } from "../middleware/validate.middleware";
import {
  createProductSchema,
  updateProductSchema,
  productIdParamSchema,
} from "../validators/product.validator";
import { protect, authorizeRoles } from "../middleware/auth.middleware";

const router = express.Router();

// Two optional uploads per request: the large preview and the small icon
const productUploads = uploadProductImage.fields([
  { name: "image", maxCount: 1 },
  { name: "icon", maxCount: 1 },
]);

/**
 * @openapi
 * components:
 *   schemas:
 *     Product:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           example: 66d0f1c2a4b5c6d7e8f9a0b1
 *         name:
 *           type: string
 *           minLength: 2
 *           maxLength: 100
 *         slug:
 *           type: string
 *         tagline:
 *           type: string
 *           maxLength: 200
 *         description:
 *           type: string
 *           maxLength: 3000
 *           nullable: true
 *         problem:
 *           type: string
 *           maxLength: 2000
 *         features:
 *           type: array
 *           items:
 *             type: string
 *           minItems: 1
 *         technologies:
 *           type: array
 *           items:
 *             type: string
 *           minItems: 1
 *         iconUrl:
 *           type: string
 *           description: Small square logo shown next to the product name
 *         previewUrl:
 *           type: string
 *         productUrl:
 *           type: string
 *           format: uri
 *         featured:
 *           type: boolean
 *           default: false
 *         status:
 *           type: string
 *           enum: [active, inactive]
 *           default: active
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */

/**
 * @openapi
 * /api/v1/products:
 *   get:
 *     summary: Get all active products (public)
 *     description: Returns only products with status "active", featured first.
 *     tags: [Products]
 *     responses:
 *       200:
 *         description: List of active products
 */
router.get("/", ProductController.handleGetActiveProducts);

/**
 * @openapi
 * /api/v1/products/all:
 *   get:
 *     summary: Get all products including inactive (admin)
 *     tags: [Products - Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all products
 *       401:
 *         description: Access token missing/invalid
 *       403:
 *         description: Forbidden — admin role required
 *       404:
 *         description: No products found
 */
router.get(
  "/all",
  protect,
  authorizeRoles("ADMIN"),
  ProductController.handleGetProducts,
);

/**
 * @openapi
 * /api/v1/products/{id}:
 *   get:
 *     summary: Get a single product by ID (admin)
 *     tags: [Products - Admin]
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
 *         description: Product found
 *       400:
 *         description: Invalid product ID
 *       401:
 *         description: Access token missing/invalid
 *       403:
 *         description: Forbidden — admin role required
 *       404:
 *         description: Product not found
 */
router.get(
  "/:id",
  protect,
  authorizeRoles("ADMIN"),
  validate(productIdParamSchema),
  ProductController.handleGetProductById,
);

/**
 * @openapi
 * /api/v1/products:
 *   post:
 *     summary: Create a product (admin)
 *     tags: [Products - Admin]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required: [name, tagline, problem, features, technologies, productUrl, image]
 *             properties:
 *               name:
 *                 type: string
 *                 minLength: 2
 *                 maxLength: 100
 *               tagline:
 *                 type: string
 *                 maxLength: 200
 *               description:
 *                 type: string
 *                 maxLength: 3000
 *               problem:
 *                 type: string
 *                 maxLength: 2000
 *               features:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Sent as repeated fields, a JSON-stringified array, or a comma-separated string
 *               technologies:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Sent as repeated fields, a JSON-stringified array, or a comma-separated string
 *               productUrl:
 *                 type: string
 *                 format: uri
 *               featured:
 *                 type: string
 *                 enum: ["true", "false"]
 *               status:
 *                 type: string
 *                 enum: [active, inactive]
 *               image:
 *                 type: string
 *                 format: binary
 *                 description: Large preview image (required)
 *               icon:
 *                 type: string
 *                 format: binary
 *                 description: Small square logo (optional)
 *     responses:
 *       201:
 *         description: Product created
 *       400:
 *         description: Validation error or missing image
 *       409:
 *         description: A product with this name already exists
 */
router.post(
  "/",
  protect,
  authorizeRoles("ADMIN"),
  productUploads,
  validate(createProductSchema),
  ProductController.handleCreateProduct,
);

/**
 * @openapi
 * /api/v1/products/{id}:
 *   put:
 *     summary: Update a product (admin)
 *     description: Partial update — only send the fields you want to change. Send `image` or `icon` only if replacing that image.
 *     tags: [Products - Admin]
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
 *               name:
 *                 type: string
 *                 minLength: 2
 *                 maxLength: 100
 *               tagline:
 *                 type: string
 *                 maxLength: 200
 *               description:
 *                 type: string
 *                 maxLength: 3000
 *               problem:
 *                 type: string
 *                 maxLength: 2000
 *               features:
 *                 type: array
 *                 items:
 *                   type: string
 *               technologies:
 *                 type: array
 *                 items:
 *                   type: string
 *               productUrl:
 *                 type: string
 *                 format: uri
 *               featured:
 *                 type: string
 *                 enum: ["true", "false"]
 *               status:
 *                 type: string
 *                 enum: [active, inactive]
 *               image:
 *                 type: string
 *                 format: binary
 *               icon:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Product updated
 *       400:
 *         description: Invalid product ID or validation error
 *       404:
 *         description: Product not found
 *       409:
 *         description: Another product with this name already exists
 */
router.put(
  "/:id",
  protect,
  authorizeRoles("ADMIN"),
  productUploads,
  validate(updateProductSchema),
  ProductController.handleUpdateProduct,
);

/**
 * @openapi
 * /api/v1/products/{id}:
 *   delete:
 *     summary: Delete a product (admin)
 *     tags: [Products - Admin]
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
 *         description: Product deleted successfully
 *       400:
 *         description: Invalid product ID
 *       404:
 *         description: Product not found
 */
router.delete(
  "/:id",
  protect,
  authorizeRoles("ADMIN"),
  validate(productIdParamSchema),
  ProductController.handleDeleteProduct,
);

export default router;
