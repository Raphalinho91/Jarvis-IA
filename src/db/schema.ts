import { pgTable, serial, text, integer } from 'drizzle-orm/pg-core';

export const profiles = pgTable('profiles', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  phoneNumber: text('phone_number').notNull(),
});

export const conversations = pgTable('conversations', {
  id: serial('id').primaryKey(),
  profileId: integer('profile_id').references(() => profiles.id),
  phoneNumber: text('phone_number'),
  conversation: text('conversation'),
  name: text('name'), 
});