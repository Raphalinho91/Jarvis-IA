import { db } from "../../db";
import { profile } from "../../db/schema";
import { logger } from "../../utils/logger";

async function saveProfileToDatabase(name: string, phoneNumber: string) {
  try {
    await db.insert(profile).values({
      name,
      phoneNumber,
    });
  } catch (error) {
    logger.error("Error saving profile to database:", error);
  }
}

export default saveProfileToDatabase;
