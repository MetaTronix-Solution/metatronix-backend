import mongoose, { Document, Schema } from "mongoose";

export interface IVisit extends Document {
  ip: string;
  country?: string;
  city?: string;
  latitude?: number;
  longitude?: number;
  path: string;
  createdAt: Date;
}

const visitSchema = new Schema<IVisit>(
  {
    ip: {
      type: String,
      required: true,
      trim: true,
    },

    country: {
      type: String,
      trim: true,
      index: true,
    },

    city: {
      type: String,
      trim: true,
    },

    latitude: {
      type: Number,
    },

    longitude: {
      type: Number,
    },

    path: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
    versionKey: false,
  },
);

// speeds up period-based filtering (day/week/month/year) and chart aggregations
visitSchema.index({ createdAt: -1 });

const Visit = mongoose.model<IVisit>("Visit", visitSchema);

export default Visit;
