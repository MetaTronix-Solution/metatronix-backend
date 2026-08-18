import swaggerJsdoc from "swagger-jsdoc";

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: "3.0.0",
    info: { title: "Meta-tronix API", version: "1.0.0" },
    components: {
      securitySchemes: {
        bearerAuth: { type: "http", scheme: "bearer", bearerFormat: "JWT" },
      },
    },
    servers: [{ url: "http://localhost:4000/" }],
  },
  apis: ["./src/routes/*.ts"],
};
export const swaggerSpec = swaggerJsdoc(options);
