import express from "express";
import { Request, Response } from "express";
import helmet from "helmet";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
dotenv.config();

import { connectDb } from "./config/connectdb";
import authRouter from "./routes/auth.routes";
import careersRouter from "./routes/careers.routes";
import teamRouter from "./routes/team.routes";
import blogRouter from "./routes/blog.routes";
import productRouter from "./routes/product.routes";
import analyticRouter from "./routes/analytics.routes";
import { seedAdmin } from "./seed/admin.seed";
import swaggerUi from "swagger-ui-express";
import { swaggerSpec } from "./config/swagger";
import { errorHandler, notFoundHandler } from "./middleware/error.middleware";

const app = express();

app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false,
  }),
);

app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  }),
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/careers", careersRouter);
app.use("/api/v1/team", teamRouter);
app.use("/api/v1/blogs", blogRouter);
app.use("/api/v1/products", productRouter);
app.use("/api/v1/analytics", analyticRouter);

const port = process.env.PORT || 5000;

app.use("/health", (req: Request, res: Response) => {
  res.json({
    success: true,
    message: "working properly",
    data: "working from vps",
  });
});

app.use(notFoundHandler);
app.use(errorHandler);

async function startServer() {
  try {
    await connectDb(process.env.MONGO_DB_URL!);

    await seedAdmin();

    app.listen(port, () => {
      console.log(`Server is running in the port ${port}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
  }
}

startServer();
