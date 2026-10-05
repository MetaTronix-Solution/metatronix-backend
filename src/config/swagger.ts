import swaggerJsdoc from "swagger-jsdoc";
import path from "path";

// glob patterns need forward slashes, even on Windows
const routesGlob = (ext: string) =>
  path.join(__dirname, `../routes/**/*.${ext}`).replace(/\\/g, "/");

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: "3.0.0",
    info: { title: "Meta-tronix API", version: "1.0.0" },
    components: {
      securitySchemes: {
        bearerAuth: { type: "http", scheme: "bearer", bearerFormat: "JWT" },
      },
    },
    servers: [{ url: "http://localhost:5000" }],
  },
  apis: [routesGlob("ts"), routesGlob("js")],
};

export const swaggerSpec = swaggerJsdoc(options);
