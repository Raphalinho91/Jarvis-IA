import { z } from 'zod';

export const profileSchema = z.object({
  id: z.string(),
  name: z.string(),
  wa_id: z.string(),
});

export const conversationSchema = z.object({
  id: z.string(),
  profileId: z.string(),
  phoneNumber: z.string(),
  conversation: z.array(z.object({
    role: z.enum(['system', 'user', 'assistant']),
    content: z.string(),
  })),
});
