import { createSwaggerSpec } from "next-swagger-doc";

import path from "path";

export const getApiDocs = async () => {
  const spec = createSwaggerSpec({
    apiFolder: path.join(process.cwd(), "src/app/api"),
    definition: {
      openapi: "3.0.0",
      info: {
        title: "Inflow API",
        version: "1.0.0",
        description: "Official API documentation for Inflow Analytics",
      },
      components: {
        securitySchemes: {
          BearerAuth: {
            type: "http",
            scheme: "bearer",
            bearerFormat: "JWT",
          },
        },
      },
      security: [],
    },
  });
  return spec;
};
