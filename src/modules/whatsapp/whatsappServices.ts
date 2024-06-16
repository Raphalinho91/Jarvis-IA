import { eq } from "drizzle-orm";
import { db } from "../../db";
import { conversations, profiles } from "../../db/schema";
import { logger } from "../../utils/logger";

interface ConversationMessage {
  role: string;
  content: string;
}

export async function saveProfileToDatabase(name: string, phoneNumber: string) {
  try {
    const existingProfiles = await db
      .select()
      .from(profiles)
      .where(eq(profiles.phoneNumber, phoneNumber))
      .execute();

    if (existingProfiles.length === 0) {
      await db
        .insert(profiles)
        .values({
          name,
          phoneNumber,
        })
        .execute();
      logger.info("Profile saved to database.");
    } else {
      logger.info("Profile already exists in the database.");
    }
  } catch (error) {
    logger.error("Error saving profile to database:", error);
  }
}

export async function saveUserConversationToDatabase(
  profileId: number,
  phoneNumber: string,
  conversation: ConversationMessage[],
  name: string
) {
  try {
    // Recherche d'une conversation existante avec le même numéro de téléphone
    const existingConversations = await db
      .select()
      .from(conversations)
      .where(eq(conversations.phoneNumber, phoneNumber))
      .execute();

    if (existingConversations.length > 0) {
      // Si une conversation existe, mettez à jour les messages
      const existingConversation = existingConversations[0];
      if (existingConversation.conversation) {
        const updatedConversation = {
          ...existingConversation,
          conversation: JSON.stringify([
            ...JSON.parse(existingConversation.conversation),
            ...conversation,
          ]),
        };
        await db
          .update(conversations)
          .set({ conversation: updatedConversation.conversation })
          .where(eq(conversations.id, existingConversation.id))
          .execute();
      } else {
        logger.error("Existing conversation has null messages.");
      }
    } else {
      // Si aucune conversation n'existe, insérez une nouvelle entrée
      const conversationData = {
        profileId,
        phoneNumber,
        conversation: JSON.stringify(conversation),
        name,
      };
      await db.insert(conversations).values(conversationData).execute();
    }
  } catch (error) {
    logger.error("Error save conversation:", error);
    throw error;
  }
}

export async function getProfileIdByPhoneNumber(
  phoneNumber: string
): Promise<number | null> {
  const result = await db
    .select({ id: profiles.id })
    .from(profiles)
    .where(eq(profiles.phoneNumber, phoneNumber))
    .execute();

  if (result.length > 0) {
    return result[0].id;
  } else {
    return null;
  }
}
