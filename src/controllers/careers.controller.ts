import Career from "../modules/careers.module";
import asyncHandler from "../util/asyncHandler";
import AppError from "../util/AppError";
import { Request, Response } from "express";
import mongoose from "mongoose";

class CarrerController {
  // Public: only open roles whose deadline hasn't passed
  handleGetOpenCareers = asyncHandler(async (req: Request, res: Response) => {
    // the deadline day itself still counts as open
    const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const openCareers = await Career.find({
      status: "open",
      $or: [
        { applicationDeadline: null },
        { applicationDeadline: { $gte: cutoff } },
      ],
    })
      .select("-createdBy -__v")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: openCareers,
    });
  });

  // Public: a single open role
  handleGetOpenCareerById = asyncHandler(
    async (req: Request, res: Response) => {
      const { id } = req.params as { id: string };

      if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new AppError("Invalid career ID", 400);
      }

      const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000);

      const career = await Career.findOne({
        _id: id,
        status: "open",
        $or: [
          { applicationDeadline: null },
          { applicationDeadline: { $gte: cutoff } },
        ],
      }).select("-createdBy -__v");

      if (!career) {
        throw new AppError("Career not found", 404);
      }

      res.status(200).json({
        success: true,
        data: career,
      });
    },
  );

  // Admin: all careers, newest first
  handleGetCareers = asyncHandler(async (req: Request, res: Response) => {
    const allCareers = await Career.find().sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: allCareers,
    });
  });

  handleCreateCarrer = asyncHandler(async (req: Request, res: Response) => {
    const career = await Career.create({
      ...req.body,
      createdBy: (req as any).user.id,
    });

    res.status(201).json({
      success: true,
      data: career,
    });
  });

  handleGetCareerById = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params as { id: string };

    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new AppError("Invalid career ID", 400);
    }

    const career = await Career.findById(id);

    if (!career) {
      throw new AppError("Career not found", 404);
    }

    res.status(200).json({
      success: true,
      data: career,
    });
  });

  handleUpdateCareer = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params as { id: string };

    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new AppError("Invalid career ID", 400);
    }

    const career = await Career.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!career) {
      throw new AppError("Career not found", 404);
    }

    res.status(200).json({
      success: true,
      data: career,
    });
  });

  handleUpdateCareerStatus = asyncHandler(
    async (req: Request, res: Response) => {
      const { id } = req.params as { id: string };

      if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new AppError("Invalid career ID", 400);
      }

      const updateCareer = await Career.findByIdAndUpdate(
        id,
        { status: req.body.status },
        { new: true, runValidators: true },
      );

      if (!updateCareer) {
        throw new AppError("Career not found", 404);
      }

      res.status(200).json({
        success: true,
        data: updateCareer,
      });
    },
  );

  handleDeleteCareer = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params as { id: string };

    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new AppError("Invalid career ID", 400);
    }

    const deleteCareer = await Career.findOneAndDelete({
      _id: id,
      createdBy: (req as any).user?.id,
    });

    if (!deleteCareer) {
      throw new AppError("Career not found", 404);
    }

    res.status(200).json({
      success: true,
      message: "Career deleted successfully",
      data: deleteCareer,
    });
  });
}

export default new CarrerController();
