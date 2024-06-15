import { pgTable, serial, text } from 'drizzle-orm/pg-core';

export const profile = pgTable('profile', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  phoneNumber: text('phone_number').notNull(),
});
