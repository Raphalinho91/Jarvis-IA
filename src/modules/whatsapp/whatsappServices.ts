import { eq } from "drizzle-orm";
import { db } from "../../db";
import { conversations, profiles } from "../../db/schema";
import { logger } from "../../utils/logger";

interface ConversationMessage {
  role: string;
  content: string;
}

export async function saveProfileToDatabase(
  name: string,
  phoneNumber: string,
  addressIp: string
) {
  try {
    const existingProfiles = await db
      .select()
      .from(profiles)
      .where(eq(profiles.phoneNumber, phoneNumber))
      .execute();

    if (existingProfiles.length === 0) {
      await db
        .insert(profiles)
        .values({ name, phoneNumber, addressIp })
        .execute();
      // logger.info(`Profile saved to database: ${name}, ${phoneNumber}`);
    } else {
      // logger.info(`Profile already exists in the database: ${phoneNumber}`);
    }
  } catch (error) {
    if (error instanceof Error) {
      logger.error("Error saving profile to database:", error);
      throw new Error(`Failed to save profile: ${error.message}`);
    } else {
      logger.error("Unknown error saving profile to database:", error);
      throw new Error("Failed to save profile due to an unknown error.");
    }
  }
}

export async function saveUserConversationToDatabase(
  profileId: string,
  phoneNumber: string,
  conversation: ConversationMessage[],
  name: string
) {
  try {
    const existingConversations = await db
      .select()
      .from(conversations)
      .where(eq(conversations.phoneNumber, phoneNumber))
      .execute();

    if (existingConversations.length > 0) {
      const existingConversation = existingConversations[0];
      if (existingConversation.conversation) {
        const updatedConversation = {
          conversation: JSON.stringify([
            ...JSON.parse(existingConversation.conversation),
            ...conversation,
          ]),
        };
        await db
          .update(conversations)
          .set(updatedConversation)
          .where(eq(conversations.id, existingConversation.id))
          .execute();
        // logger.info(`Conversation updated for phone number: ${phoneNumber}`);
      } else {
        logger.error("Existing conversation has null messages.");
        throw new Error("Existing conversation has null messages.");
      }
    } else {
      const conversationData = {
        profileId,
        phoneNumber,
        conversation: JSON.stringify(conversation),
        name,
      };
      await db.insert(conversations).values(conversationData).execute();
      // logger.info(`New conversation saved for phone number: ${phoneNumber}`);
    }
  } catch (error) {
    if (error instanceof Error) {
      logger.error("Error saving conversation:", error);
      throw new Error(`Failed to save conversation: ${error.message}`);
    } else {
      logger.error("Unknown error saving conversation:", error);
      throw new Error("Failed to save conversation due to an unknown error.");
    }
  }
}

export async function getProfileIdByPhoneNumber(
  phoneNumber: string
): Promise<string | null> {
  try {
    const result = await db
      .select({ id: profiles.id })
      .from(profiles)
      .where(eq(profiles.phoneNumber, phoneNumber))
      .execute();

    if (result.length > 0) {
      return result[0].id;
    } else {
      logger.warn(`No profile found for phone number: ${phoneNumber}`);
      return null;
    }
  } catch (error) {
    if (error instanceof Error) {
      logger.error("Error retrieving profile ID:", error);
      throw new Error(`Failed to retrieve profile ID: ${error.message}`);
    } else {
      logger.error("Unknown error retrieving profile ID:", error);
      throw new Error("Failed to retrieve profile ID due to an unknown error.");
    }
  }
}

export async function deleteUserConversationFromDatabase(phoneNumber: string) {
  try {
    await db
      .delete(conversations)
      .where(eq(conversations.phoneNumber, phoneNumber))
      .execute();
  } catch (error) {
    if (error instanceof Error) {
      logger.error("Error deleting conversation:", error.message);
      throw new Error(`Failed to delete conversation: ${error.message}`);
    } else {
      logger.error("Unknown error deleting conversation:", error);
      throw new Error("Failed to delete conversation due to an unknown error.");
    }
  }
}
