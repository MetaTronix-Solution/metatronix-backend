import mongoose from "mongoose";

export interface ITeam {
  name: string;
  role: string;
  bio: string;
  photoUrl: string;
  socials?: {
    linkedin?: string;
    github?: string;
    email?: string;
  };

  createdAt: Date;
  updatedAt: Date;
}

const teamSchema = new mongoose.Schema<ITeam>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 50,
    },

    role: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },

    bio: {
      type: String,
      required: true,
      trim: true,
      maxlength: 500,
    },

    photoUrl: {
      type: String,
      required: true,
      trim: true,
    },

    socials: {
      linkedin: {
        type: String,
        trim: true,
      },

      github: {
        type: String,
        trim: true,
      },

      email: {
        type: String,
        trim: true,
        lowercase: true,
      },
    },
  },
  {
    timestamps: true,
  },
);

const Team = mongoose.model<ITeam>("Team", teamSchema);

export default Team;
