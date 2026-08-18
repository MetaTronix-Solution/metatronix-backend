import multer from "multer";
import path from "node:path";
import crypto from "crypto";
import fs from "node:fs";
import { Request } from "express";
import AppError from "../util/AppError";

const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"];

const ALLOWED_EXTENSIONS = [".jpg", ".jpeg", ".png", ".webp"];

function fileFilter(
  _req: Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback,
) {
  const ext = path.extname(file.originalname).toLowerCase();

  if (
    !ALLOWED_MIME_TYPES.includes(file.mimetype) ||
    !ALLOWED_EXTENSIONS.includes(ext)
  ) {
    return cb(new AppError("Only JPEG, PNG and WEBP images are allowed.", 400));
  }

  cb(null, true);
}

export const createUploader = (
  folder: string,
  maxFileSize = 5 * 1024 * 1024, // 5 MB
) => {
  const uploadDir = path.join(process.cwd(), "uploads", folder);

  // Create folder if it doesn't exist
  fs.mkdirSync(uploadDir, { recursive: true });

  const storage = multer.diskStorage({
    destination: (_req, _file, cb) => {
      cb(null, uploadDir);
    },

    filename: (_req, file, cb) => {
      const ext = path.extname(file.originalname).toLowerCase();

      cb(null, `${crypto.randomUUID()}${ext}`);
    },
  });

  return multer({
    storage,
    fileFilter,
    limits: {
      fileSize: maxFileSize,
      files: 1,
    },
  });
};

export const uploadBlogImage = createUploader("blogs");
export const uploadTeamPhoto = createUploader("team");
export const uploadProductImage = createUploader("product");
