import mongoose, { Document, Schema } from "mongoose";

export interface IProduct extends Document {
  name: string;
  slug: string;
  tagline: string;
  description?: string;
  problem: string;
  features: string[];
  technologies: string[];
  previewUrl: string;
  productUrl: string;
  featured: boolean;
  status: "active" | "inactive";
  createdAt: Date;
  updatedAt: Date;
}

const productSchema = new Schema<IProduct>(
  {
    name: {
      type: String,
      required: [true, "Product name is required"],
      trim: true,
      minlength: 2,
      maxlength: 100,
      index: true,
    },

    slug: {
      type: String,
      required: [true, "Slug is required"],
      unique: true,
      trim: true,
      lowercase: true,
      index: true,
    },

    tagline: {
      type: String,
      required: [true, "Tagline is required"],
      trim: true,
      maxlength: 200,
    },

    description: {
      type: String,
      trim: true,
      maxlength: 3000,
    },

    problem: {
      type: String,
      required: [true, "Problem statement is required"],
      trim: true,
      maxlength: 2000,
    },

    features: {
      type: [
        {
          type: String,
          trim: true,
        },
      ],
      required: [true, "Features are required"],
      validate: {
        validator: (features: string[]) => features.length > 0,
        message: "At least one feature is required",
      },
    },

    technologies: {
      type: [
        {
          type: String,
          trim: true,
        },
      ],
      required: [true, "Technologies are required"],
      validate: {
        validator: (tech: string[]) => tech.length > 0,
        message: "At least one technology is required",
      },
    },

    previewUrl: {
      type: String,
      required: [true, "Preview image is required"],
      trim: true,
    },

    productUrl: {
      type: String,
      required: [true, "Product URL is required"],
      trim: true,
      match: [/^https?:\/\/.+/, "Please provide a valid URL"],
    },

    featured: {
      type: Boolean,
      default: false,
      index: true,
    },

    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
      index: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

const Product = mongoose.model<IProduct>("Product", productSchema);

export default Product;
