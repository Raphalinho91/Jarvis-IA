import { Pool } from "pg";

const poolForDatabase2 = new Pool({
  connectionString: process.env.DATABASE_CONNECTION_2,
  ssl: {
    rejectUnauthorized: false,
  },
});

export const db2 = poolForDatabase2;
