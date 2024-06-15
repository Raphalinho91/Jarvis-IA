import { eq } from "drizzle-orm";
import { db } from "../../db";
import { profile } from "../../db/schema";
import { logger } from "../../utils/logger";

async function saveProfileToDatabase(name: string, phoneNumber: string) {
  try {
    const existingProfiles = await db
      .select()
      .from(profile)
      .where(eq(profile.phoneNumber, phoneNumber));

    if (existingProfiles.length === 0) {
      await db.insert(profile).values({
        name,
        phoneNumber,
      });
      logger.info("Profile saved to database.");
    } else {
      logger.info("Profile already exists in the database.");
    }
  } catch (error) {
    logger.error("Error saving profile to database:", error);
  }
}

export default saveProfileToDatabase;
