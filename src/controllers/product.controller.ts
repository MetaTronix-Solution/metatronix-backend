import Product from "../modules/product.module";
import asyncHandler from "../util/asyncHandler";
import AppError from "../util/AppError";
import slugify from "slugify";
import { Request, Response } from "express";
import { deleteUpload } from "../util/deleteUpload";
import mongoose from "mongoose";
import { IProduct } from "../modules/product.module";

type UploadedFiles = { [field: string]: Express.Multer.File[] } | undefined;

class ProductController {
  // Public: only active products, featured first
  handleGetActiveProducts = asyncHandler(
    async (req: Request, res: Response) => {
      const products = await Product.find({ status: "active" }).sort({
        featured: -1,
        createdAt: -1,
      });

      return res.status(200).json({
        success: true,
        data: products,
      });
    },
  );

  handleGetProducts = asyncHandler(async (req: Request, res: Response) => {
    const products = await Product.find().sort({
      createdAt: -1,
    });

    if (!products) {
      throw new AppError("Product not found", 404);
    }

    return res.status(200).json({
      success: true,
      data: products,
    });
  });

  handleGetProductById = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params as { id: string };

    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new AppError("Invalid product ID.", 400);
    }

    const product = await Product.findById(id);

    if (!product) {
      throw new AppError("Product not found.", 404);
    }

    return res.status(200).json({
      success: true,
      data: product,
    });
  });

  handleCreateProduct = asyncHandler(async (req: Request, res: Response) => {
    const files = req.files as UploadedFiles;
    const image = files?.image?.[0];
    const icon = files?.icon?.[0];

    // removes anything uploaded in this request if we have to bail out
    const cleanup = async () => {
      if (image) await deleteUpload(`/uploads/products/${image.filename}`);
      if (icon) await deleteUpload(`/uploads/products/${icon.filename}`);
    };

    if (!image) {
      await cleanup();
      throw new AppError("Product preview image is required.", 400);
    }

    const {
      name,
      tagline,
      description,
      problem,
      features,
      technologies,
      productUrl,
      featured,
      status,
    } = req.body;

    const slug = slugify(name, {
      lower: true,
      strict: true,
      trim: true,
    });

    const exists = await Product.findOne({ slug });

    if (exists) {
      await cleanup();
      throw new AppError("A product with this name already exists.", 409);
    }

    try {
      const product = await Product.create({
        name,
        slug,
        tagline,
        description,
        problem,
        features,
        technologies,
        iconUrl: icon ? `/uploads/products/${icon.filename}` : "",
        previewUrl: `/uploads/products/${image.filename}`,
        productUrl,
        featured,
        status,
      });

      return res.status(201).json({
        success: true,
        message: "Product created successfully.",
        data: product,
      });
    } catch (error) {
      await cleanup();
      throw error;
    }
  });

  handleUpdateProduct = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params as { id: string };

    const files = req.files as UploadedFiles;
    const image = files?.image?.[0];
    const icon = files?.icon?.[0];

    const cleanup = async () => {
      if (image) await deleteUpload(`/uploads/products/${image.filename}`);
      if (icon) await deleteUpload(`/uploads/products/${icon.filename}`);
    };

    if (!mongoose.Types.ObjectId.isValid(id)) {
      await cleanup();
      throw new AppError("Invalid product ID.", 400);
    }

    const existingProduct = await Product.findById(id);

    if (!existingProduct) {
      await cleanup();
      throw new AppError("Product not found.", 404);
    }

    const {
      name,
      tagline,
      description,
      problem,
      features,
      technologies,
      productUrl,
      featured,
      status,
    } = req.body;

    const updateData: Partial<IProduct> & {
      slug?: string;
      previewUrl?: string;
      iconUrl?: string;
    } = {};

    if (name && name !== existingProduct.name) {
      const slug = slugify(name, {
        lower: true,
        strict: true,
        trim: true,
      });

      const duplicate = await Product.findOne({
        slug,
        _id: { $ne: id },
      });

      if (duplicate) {
        await cleanup();
        throw new AppError(
          "Another product with this name already exists.",
          409,
        );
      }

      updateData.name = name;
      updateData.slug = slug;
    }

    if (tagline !== undefined) {
      updateData.tagline = tagline;
    }

    if (description !== undefined) {
      updateData.description = description;
    }

    if (problem !== undefined) {
      updateData.problem = problem;
    }

    if (features !== undefined) {
      updateData.features = features;
    }

    if (technologies !== undefined) {
      updateData.technologies = technologies;
    }

    if (productUrl !== undefined) {
      updateData.productUrl = productUrl;
    }

    if (featured !== undefined) {
      updateData.featured = featured;
    }

    if (status !== undefined) {
      updateData.status = status;
    }

    if (image) {
      updateData.previewUrl = `/uploads/products/${image.filename}`;
    }

    if (icon) {
      updateData.iconUrl = `/uploads/products/${icon.filename}`;
    }

    try {
      const updatedProduct = await Product.findByIdAndUpdate(id, updateData, {
        new: true,
        runValidators: true,
      });

      // remove the old files only after the update succeeded
      if (image && existingProduct.previewUrl) {
        await deleteUpload(existingProduct.previewUrl);
      }

      if (icon && existingProduct.iconUrl) {
        await deleteUpload(existingProduct.iconUrl);
      }

      return res.status(200).json({
        success: true,
        message: "Product updated successfully.",
        data: updatedProduct,
      });
    } catch (error) {
      await cleanup();
      throw error;
    }
  });

  handleDeleteProduct = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params as { id: string };

    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new AppError("Invalid product ID.", 400);
    }

    const product = await Product.findById(id);

    if (!product) {
      throw new AppError("Product not found.", 404);
    }

    if (product.previewUrl) {
      await deleteUpload(product.previewUrl);
    }

    if (product.iconUrl) {
      await deleteUpload(product.iconUrl);
    }

    await product.deleteOne();

    return res.status(200).json({
      success: true,
      message: "Product deleted successfully.",
    });
  });
}

export default new ProductController();
