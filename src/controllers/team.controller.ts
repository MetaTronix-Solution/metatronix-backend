import { Request, Response } from "express";
import mongoose from "mongoose";

import Team from "../modules/team.module";
import asyncHandler from "../util/asyncHandler";
import AppError from "../util/AppError";
import { deleteUpload } from "../util/deleteUpload";

function buildTeamPayload(body: Record<string, any>) {
  const { socialsLinkedin, socialsGithub, socialsEmail, photo, ...rest } = body;

  const socials: Record<string, string> = {};

  if (socialsLinkedin) socials.linkedin = socialsLinkedin;
  if (socialsGithub) socials.github = socialsGithub;
  if (socialsEmail) socials.email = socialsEmail;

  return {
    ...rest,
    ...(Object.keys(socials).length > 0 && { socials }),
  };
}

class TeamController {
  handleGetTeams = asyncHandler(async (_req: Request, res: Response) => {
    const teams = await Team.find().sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: teams,
    });
  });

  handleGetTeamById = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params as { id: string };

    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new AppError("Invalid team member ID", 400);
    }

    const team = await Team.findById(id);

    if (!team) {
      throw new AppError("Team member not found", 404);
    }

    res.status(200).json({
      success: true,
      data: team,
    });
  });

  handleCreateTeam = asyncHandler(async (req: Request, res: Response) => {
    if (!req.file) {
      throw new AppError("Photo is required", 400);
    }

    const payload = buildTeamPayload(req.body);

    const team = await Team.create({
      ...payload,
      photoUrl: `/uploads/team/${req.file.filename}`,
    });

    res.status(201).json({
      success: true,
      message: "Team member created successfully",
      data: team,
    });
  });

  handleUpdateTeam = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params as { id: string };

    if (!mongoose.Types.ObjectId.isValid(id)) {
      if (req.file) {
        await deleteUpload(`/uploads/team/${req.file.filename}`);
      }

      throw new AppError("Invalid team member ID", 400);
    }

    const existing = await Team.findById(id);

    if (!existing) {
      if (req.file) {
        await deleteUpload(`/uploads/team/${req.file.filename}`);
      }

      throw new AppError("Team member not found", 404);
    }

    const payload = buildTeamPayload(req.body);

    const updateData: any = {
      ...payload,
    };

    if (req.file) {
      updateData.photoUrl = `/uploads/team/${req.file.filename}`;
    }

    const updated = await Team.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    if (req.file && existing.photoUrl) {
      await deleteUpload(existing.photoUrl);
    }

    res.status(200).json({
      success: true,
      message: "Team member updated successfully",
      data: updated,
    });
  });

  handleDeleteTeam = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params as { id: string };

    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new AppError("Invalid team member ID", 400);
    }

    const team = await Team.findById(id);

    if (!team) {
      throw new AppError("Team member not found", 404);
    }

    if (team.photoUrl) {
      await deleteUpload(team.photoUrl);
    }

    await team.deleteOne();

    res.status(200).json({
      success: true,
      message: "Team member deleted successfully",
    });
  });
}

export default new TeamController();
