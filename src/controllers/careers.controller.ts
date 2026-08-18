import Career from "../modules/careers.module";
import asyncHandler from "../util/asyncHandler";
import AppError from "../util/AppError";
import { Request, Response } from "express";
import mongoose from "mongoose";

class CarrerController {
  handleGetCareers = asyncHandler(async (req: Request, res: Response) => {
    const allCareers = await Career.find();

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
