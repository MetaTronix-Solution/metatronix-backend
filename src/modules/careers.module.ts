import mongoose from "mongoose";

export interface ICareer {
  title: string;
  department: string;
  location: string;
  employmentType:
    | "full-time"
    | "part-time"
    | "contract"
    | "internship"
    | "remote";
  workplace: "onsite" | "remote" | "hybrid";
  description: string;
  responsibilities: string[];
  requirements: string[];
  preferredQualifications: string[];
  salary?: {
    min: number;
    max: number;
    currency: string;
  };
  experience: string;
  vacancies: number;
  applicationDeadline?: Date;
  status: "draft" | "open" | "closed";
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const careerSchema = new mongoose.Schema<ICareer>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },

    department: {
      type: String,
      required: true,
      trim: true,
    },

    location: {
      type: String,
      required: true,
      trim: true,
    },

    employmentType: {
      type: String,
      enum: ["full-time", "part-time", "contract", "internship", "remote"],
      required: true,
    },

    workplace: {
      type: String,
      enum: ["onsite", "remote", "hybrid"],
      required: true,
    },

    description: {
      type: String,
      required: true,
      trim: true,
    },

    responsibilities: [
      {
        type: String,
        trim: true,
      },
    ],

    requirements: [
      {
        type: String,
        trim: true,
      },
    ],

    preferredQualifications: [
      {
        type: String,
        trim: true,
      },
    ],

    salary: {
      min: Number,
      max: Number,
      currency: {
        type: String,
        default: "NPR",
      },
    },

    experience: {
      type: String,
      required: true,
    },

    vacancies: {
      type: Number,
      default: 1,
      min: 1,
    },

    applicationDeadline: {
      type: Date,
    },

    status: {
      type: String,
      enum: ["draft", "open", "closed"],
      default: "draft",
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

const Career = mongoose.model<ICareer>("Career", careerSchema);

export default Career;
