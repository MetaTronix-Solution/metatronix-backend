import Product from "../modules/product.module";
import asyncHandler from "../util/asyncHandler";
import AppError from "../util/AppError";
import slugify from "slugify";
import { Request, Response } from "express";
import { deleteUpload } from "../util/deleteUpload";
import mongoose from "mongoose";
import { IProduct } from "../modules/product.module";

class ProductController {
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
    if (!req.file) {
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
      await deleteUpload(`/uploads/products/${req.file.filename}`);

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
        previewUrl: `/uploads/products/${req.file.filename}`,
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
      await deleteUpload(`/uploads/products/${req.file.filename}`);
      throw error;
    }
  });

  handleUpdateProduct = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params as { id: string };

    if (!mongoose.Types.ObjectId.isValid(id)) {
      if (req.file) {
        await deleteUpload(`/uploads/products/${req.file.filename}`);
      }

      throw new AppError("Invalid product ID.", 400);
    }

    const existingProduct = await Product.findById(id);

    if (!existingProduct) {
      if (req.file) {
        await deleteUpload(`/uploads/products/${req.file.filename}`);
      }

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
        if (req.file) {
          await deleteUpload(`/uploads/products/${req.file.filename}`);
        }

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

    if (req.file) {
      updateData.previewUrl = `/uploads/products/${req.file.filename}`;
    }

    try {
      const updatedProduct = await Product.findByIdAndUpdate(id, updateData, {
        new: true,
        runValidators: true,
      });

      if (req.file && existingProduct.previewUrl) {
        await deleteUpload(existingProduct.previewUrl);
      }

      return res.status(200).json({
        success: true,
        message: "Product updated successfully.",
        data: updatedProduct,
      });
    } catch (error) {
      if (req.file) {
        await deleteUpload(`/uploads/products/${req.file.filename}`);
      }

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

    await product.deleteOne();

    return res.status(200).json({
      success: true,
      message: "Product deleted successfully.",
    });
  });
}

export default new ProductController();
