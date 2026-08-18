import Blog from "../modules/blog.module";
import asyncHandler from "../util/asyncHandler";
import AppError from "../util/AppError";
import { Request, Response } from "express";
import mongoose from "mongoose";
import { deleteUpload } from "../util/deleteUpload";
import slugify from "slugify";
import { IBlog } from "../modules/blog.module";

class BlogController {
  handleGetBlogs = asyncHandler(async (req: Request, res: Response) => {
    const blogs = await Blog.find().sort({
      createdAt: -1,
    });

    res.status(200).json({
      success: true,
      data: blogs,
    });
  });

  handleGetBlogById = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params as { id: string };

    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new AppError("Invalid career ID", 400);
    }

    const blog = await Blog.findById(id);

    if (!blog) {
      throw new AppError("Blog not found", 404);
    }

    res.status(200).json({
      success: true,
      data: blog,
    });
  });

  handleCreateBlog = asyncHandler(async (req: Request, res: Response) => {
    if (!req.file) {
      throw new AppError("Blog image is required.", 400);
    }

    const { title, content, author, category, published } = req.body;

    const slug = slugify(title, {
      lower: true,
      strict: true,
      trim: true,
    });

    const existingBlog = await Blog.findOne({ slug });

    if (existingBlog) {
      await deleteUpload(`/uploads/blogs/${req.file.filename}`);

      throw new AppError("A blog with this title already exists.", 409);
    }

    try {
      const blog = await Blog.create({
        title,
        slug,
        imageUrl: `/uploads/blogs/${req.file.filename}`,
        content,
        author,
        category,
        published,
      });

      return res.status(201).json({
        success: true,
        message: "Blog created successfully.",
        data: blog,
      });
    } catch (error) {
      await deleteUpload(`/uploads/blogs/${req.file.filename}`);
      throw error;
    }
  });

  handleUpdateBlog = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params as { id: string };

    if (!mongoose.Types.ObjectId.isValid(id)) {
      if (req.file) {
        await deleteUpload(`/uploads/blogs/${req.file.filename}`);
      }

      throw new AppError("Invalid blog ID.", 400);
    }

    const existingBlog = await Blog.findById(id);

    if (!existingBlog) {
      if (req.file) {
        await deleteUpload(`/uploads/blogs/${req.file.filename}`);
      }

      throw new AppError("Blog not found.", 404);
    }

    const { title, content, author, category, published } = req.body;

    const updateData: Partial<IBlog> & {
      slug?: string;
      imageUrl?: string;
    } = {};

    if (title && title !== existingBlog.title) {
      const slug = slugify(title, {
        lower: true,
        strict: true,
        trim: true,
      });

      const duplicate = await Blog.findOne({
        slug,
        _id: { $ne: id },
      });

      if (duplicate) {
        if (req.file) {
          await deleteUpload(`/uploads/blogs/${req.file.filename}`);
        }

        throw new AppError("Another blog with this title already exists.", 409);
      }

      updateData.title = title;
      updateData.slug = slug;
    }

    if (content !== undefined) {
      updateData.content = content;
    }

    if (author !== undefined) {
      updateData.author = author;
    }

    if (category !== undefined) {
      updateData.category = category;
    }

    if (published !== undefined) {
      updateData.published = published;
    }

    if (req.file) {
      updateData.imageUrl = `/uploads/blogs/${req.file.filename}`;
    }

    try {
      const updatedBlog = await Blog.findByIdAndUpdate(id, updateData, {
        new: true,
        runValidators: true,
      });

      if (req.file && existingBlog.imageUrl) {
        await deleteUpload(existingBlog.imageUrl);
      }

      return res.status(200).json({
        success: true,
        message: "Blog updated successfully.",
        data: updatedBlog,
      });
    } catch (error) {
      if (req.file) {
        await deleteUpload(`/uploads/blogs/${req.file.filename}`);
      }

      throw error;
    }
  });

  handleDeleteBlog = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params as { id: string };

    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new AppError("Invalid blog ID.", 400);
    }

    const blog = await Blog.findById(id);

    if (!blog) {
      throw new AppError("Blog not found.", 404);
    }

    if (blog.imageUrl) {
      await deleteUpload(blog.imageUrl);
    }

    await blog.deleteOne();

    return res.status(200).json({
      success: true,
      message: "Blog deleted successfully.",
    });
  });

  handleGetPublishedBlogs = asyncHandler(
    async (req: Request, res: Response) => {
      const page = Math.max(1, Number(req.query.page) || 1);
      const limit = Math.max(1, Number(req.query.limit) || 10);

      const skip = (page - 1) * limit;

      const filter = {
        published: true,
      };

      const [blogs, total] = await Promise.all([
        Blog.find(filter)
          .sort({ publishedAt: -1 })
          .skip(skip)
          .limit(limit)
          .select("-__v"),

        Blog.countDocuments(filter),
      ]);

      return res.status(200).json({
        success: true,
        data: blogs,

        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
          hasNextPage: page < Math.ceil(total / limit),
          hasPreviousPage: page > 1,
        },
      });
    },
  );

  handleGetPublishedBlogBySlug = asyncHandler(
    async (req: Request, res: Response) => {
      const { slug } = req.params;

      const blog = await Blog.findOne({
        slug,
        published: true,
      });

      if (!blog) {
        throw new AppError("Blog not found.", 404);
      }

      return res.status(200).json({
        success: true,
        data: blog,
      });
    },
  );
}

export default new BlogController();
