import { db } from './index.ts';
import { users, businessProfiles, savedReplies, feedbackEntries, chatMessages } from './schema.ts';
import { eq, desc } from 'drizzle-orm';

export async function getOrCreateUser(uid: string, email: string, displayName?: string, photoUrl?: string) {
  try {
    const result = await db
      .insert(users)
      .values({
        uid,
        email,
        displayName: displayName || null,
        photoUrl: photoUrl || null,
      })
      .onConflictDoUpdate({
        target: users.uid,
        set: {
          email,
          displayName: displayName || null,
          photoUrl: photoUrl || null,
        },
      })
      .returning();

    return result[0];
  } catch (error) {
    console.error('Failed to getOrCreateUser in database:', error);
    throw new Error('Database operation failed', { cause: error });
  }
}

export async function getUserProfile(uid: string) {
  try {
    const rows = await db
      .select()
      .from(businessProfiles)
      .where(eq(businessProfiles.userId, uid))
      .limit(1);

    return rows[0] || null;
  } catch (error) {
    console.error('Failed to fetch user business profile:', error);
    throw new Error('Database operation failed', { cause: error });
  }
}

export async function saveUserProfile(uid: string, profile: {
  businessName: string;
  businessCategory?: string;
  productInformation?: string;
  deliveryPolicy?: string;
  returnPolicy?: string;
  contactDetails?: string;
  preferredTone?: string;
}) {
  try {
    const existing = await getUserProfile(uid);
    if (existing) {
      const updated = await db
        .update(businessProfiles)
        .set({
          businessName: profile.businessName,
          businessCategory: profile.businessCategory || '',
          productInformation: profile.productInformation || '',
          deliveryPolicy: profile.deliveryPolicy || '',
          returnPolicy: profile.returnPolicy || '',
          contactDetails: profile.contactDetails || '',
          preferredTone: profile.preferredTone || 'friendly',
          updatedAt: new Date(),
        })
        .where(eq(businessProfiles.userId, uid))
        .returning();
      return updated[0];
    } else {
      const inserted = await db
        .insert(businessProfiles)
        .values({
          userId: uid,
          businessName: profile.businessName,
          businessCategory: profile.businessCategory || '',
          productInformation: profile.productInformation || '',
          deliveryPolicy: profile.deliveryPolicy || '',
          returnPolicy: profile.returnPolicy || '',
          contactDetails: profile.contactDetails || '',
          preferredTone: profile.preferredTone || 'friendly',
        })
        .returning();
      return inserted[0];
    }
  } catch (error) {
    console.error('Failed to save user business profile:', error);
    throw new Error('Database operation failed', { cause: error });
  }
}

export async function saveGeneratedReply(userId: string, data: {
  customerQuestion: string;
  customerName?: string;
  suggestedResponse: string;
  tone?: string;
  language?: string;
}) {
  try {
    const result = await db
      .insert(savedReplies)
      .values({
        userId,
        customerQuestion: data.customerQuestion,
        customerName: data.customerName || '',
        suggestedResponse: data.suggestedResponse,
        tone: data.tone || 'friendly',
        language: data.language || 'English',
      })
      .returning();
    return result[0];
  } catch (error) {
    console.error('Failed to save generated reply:', error);
    throw new Error('Database operation failed', { cause: error });
  }
}

export async function getSavedReplies(userId: string) {
  try {
    return await db
      .select()
      .from(savedReplies)
      .where(eq(savedReplies.userId, userId))
      .orderBy(desc(savedReplies.createdAt))
      .limit(50);
  } catch (error) {
    console.error('Failed to fetch saved replies:', error);
    throw new Error('Database operation failed', { cause: error });
  }
}

export async function saveFeedback(entry: {
  userId?: string;
  senderEmail: string;
  category: string;
  rating: number;
  message: string;
}) {
  try {
    const result = await db
      .insert(feedbackEntries)
      .values({
        userId: entry.userId || null,
        senderEmail: entry.senderEmail,
        category: entry.category,
        rating: entry.rating,
        message: entry.message,
      })
      .returning();
    return result[0];
  } catch (error) {
    console.error('Failed to save feedback:', error);
    throw new Error('Database operation failed', { cause: error });
  }
}

export async function getChatMessages(userId: string) {
  try {
    return await db
      .select()
      .from(chatMessages)
      .where(eq(chatMessages.userId, userId))
      .orderBy(chatMessages.createdAt)
      .limit(100);
  } catch (error) {
    console.error('Failed to get chat messages:', error);
    throw new Error('Database operation failed', { cause: error });
  }
}

export async function saveChatMessage(data: {
  userId: string;
  role: string;
  content: string;
  model: string;
  groundingSource?: string;
}) {
  try {
    const result = await db
      .insert(chatMessages)
      .values({
        userId: data.userId,
        role: data.role,
        content: data.content,
        model: data.model,
        groundingSource: data.groundingSource || null,
      })
      .returning();
    return result[0];
  } catch (error) {
    console.error('Failed to save chat message:', error);
    throw new Error('Database operation failed', { cause: error });
  }
}
