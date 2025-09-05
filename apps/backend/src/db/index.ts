import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";
import "dotenv/config";

// This file acts as the central point for your database connection.

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not set in your .env file");
}

// 1. Create a single, persistent connection to your PostgreSQL database.
const connection = postgres(process.env.DATABASE_URL);

// 2. Initialize the Drizzle ORM instance with the connection and your schema.
// This `db` object will be imported by all your repositories.
export const db = drizzle(connection, { schema });
