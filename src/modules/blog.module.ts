import mongoose, { Document, Schema } from "mongoose";

export interface IBlog extends Document {
  title: string;
  slug: string;
  imageUrl: string;
  content: string;
  author: string;
  published: boolean;
  publishedAt?: Date;
  category: "Tech" | "Startup" | "AI" | "Design" | "IOT";
  readMinutes: number;
  createdAt: Date;
  updatedAt: Date;
}

const blogSchema = new Schema<IBlog>(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
      minlength: [5, "Title must be at least 5 characters"],
      maxlength: [150, "Title cannot exceed 150 characters"],
      index: true,
    },

    slug: {
      type: String,
      required: [true, "Slug is required"],
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },

    imageUrl: {
      type: String,
      required: [true, "Image URL is required"],
      trim: true,
    },

    content: {
      type: String,
      required: [true, "Content is required"],
      minlength: [20, "Content must be at least 20 characters"],
    },

    author: {
      type: String,
      required: [true, "Author is required"],
      trim: true,
      minlength: [2, "Author name must be at least 2 characters"],
      maxlength: [50, "Author name cannot exceed 50 characters"],
    },

    category: {
      type: String,
      enum: ["Tech", "Startup", "AI", "Design", "IOT"],
      required: [true, "Category is required"],
      index: true,
    },

    published: {
      type: Boolean,
      default: false,
      index: true,
    },

    publishedAt: {
      type: Date,
      default: null,
    },

    readMinutes: {
      type: Number,
      default: 1,
      min: [1, "Read time must be at least 1 minute"],
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

// Auto-calculate reading time (~200 words/minute)
blogSchema.pre("save", async function () {
  if (this.isModified("content")) {
    const words = this.content.trim().split(/\s+/).length;
    this.readMinutes = Math.max(1, Math.ceil(words / 200));
  }

  if (this.published && !this.publishedAt) {
    this.publishedAt = new Date();
  }
});

const Blog = mongoose.model<IBlog>("Blog", blogSchema);

export default Blog;
