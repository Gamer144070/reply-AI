import { relations } from 'drizzle-orm';
import { integer, pgTable, serial, text, timestamp } from 'drizzle-orm/pg-core';

// Users table linked with Firebase Auth UID
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  uid: text('uid').notNull().unique(), // Firebase Auth UID
  email: text('email').notNull(),
  displayName: text('display_name'),
  photoUrl: text('photo_url'),
  planTier: text('plan_tier').notNull().default('paid'), // free | paid | elite
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Business profile table for persisted merchant knowledge base
export const businessProfiles = pgTable('business_profiles', {
  id: serial('id').primaryKey(),
  userId: text('user_id')
    .references(() => users.uid, { onDelete: 'cascade' })
    .notNull(),
  businessName: text('business_name').notNull(),
  businessCategory: text('business_category').default(''),
  productInformation: text('product_information').default(''),
  deliveryPolicy: text('delivery_policy').default(''),
  returnPolicy: text('return_policy').default(''),
  contactDetails: text('contact_details').default(''),
  preferredTone: text('preferred_tone').default('friendly'),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Saved generated replies & customer histories
export const savedReplies = pgTable('saved_replies', {
  id: serial('id').primaryKey(),
  userId: text('user_id')
    .references(() => users.uid, { onDelete: 'cascade' })
    .notNull(),
  customerQuestion: text('customer_question').notNull(),
  customerName: text('customer_name').default(''),
  suggestedResponse: text('suggested_response').notNull(),
  tone: text('tone').default('friendly'),
  language: text('language').default('English'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// In-app feedback & seller reviews
export const feedbackEntries = pgTable('feedback_entries', {
  id: serial('id').primaryKey(),
  userId: text('user_id'),
  senderEmail: text('sender_email').notNull(),
  category: text('category').notNull().default('feature_request'),
  rating: integer('rating').notNull().default(5),
  message: text('message').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Chat history for Gemini Chatbot multi-turn conversations
export const chatMessages = pgTable('chat_messages', {
  id: serial('id').primaryKey(),
  userId: text('user_id')
    .references(() => users.uid, { onDelete: 'cascade' })
    .notNull(),
  role: text('role').notNull(), // 'user' | 'model'
  content: text('content').notNull(),
  model: text('model').notNull().default('gemini-3.8-flash'),
  groundingSource: text('grounding_source'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Relations
export const usersRelations = relations(users, ({ one, many }) => ({
  businessProfile: one(businessProfiles),
  savedReplies: many(savedReplies),
  chatMessages: many(chatMessages),
}));

export const businessProfilesRelations = relations(businessProfiles, ({ one }) => ({
  user: one(users, {
    fields: [businessProfiles.userId],
    references: [users.uid],
  }),
}));

export const savedRepliesRelations = relations(savedReplies, ({ one }) => ({
  user: one(users, {
    fields: [savedReplies.userId],
    references: [users.uid],
  }),
}));

export const chatMessagesRelations = relations(chatMessages, ({ one }) => ({
  user: one(users, {
    fields: [chatMessages.userId],
    references: [users.uid],
  }),
}));
