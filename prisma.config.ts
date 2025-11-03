import { defineConfig, env } from "prisma/config";
import * as dotenv from "dotenv";

// Load environment variables from .env file
dotenv.config();

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  engine: "classic",
  datasource: {
    url: env("DATABASE_URL") || process.env.DATABASE_URL || "postgresql://USER:PASSWORD@localhost:5432/lmsdb?schema=public",
  },
});
