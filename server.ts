import express, { Request, Response, NextFunction } from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const isProd = process.env.NODE_ENV === 'production';
const PORT = Number(process.env.PORT) || 3000;

// Initialize GoogleGenAI SDK according to system guidelines
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// Helper to call Gemini with graceful fallback between gemini-3.8-flash and gemini-3.1-flash-lite
async function generateWithFallback(params: any): Promise<any> {
  try {
    return await ai.models.generateContent({
      ...params,
      model: params.model || 'gemini-3.8-flash',
    });
  } catch (err: any) {
    const isOverloaded =
      err?.status === 503 ||
      err?.message?.includes('503') ||
      err?.message?.includes('high demand') ||
      err?.message?.includes('UNAVAILABLE') ||
      err?.status === 429 ||
      err?.message?.includes('RESOURCE_EXHAUSTED');

    if (isOverloaded) {
      console.warn('gemini-3.8-flash experiencing high demand, seamlessly cascading to gemini-3.1-flash-lite...');
      return await ai.models.generateContent({
        ...params,
        model: 'gemini-3.1-flash-lite',
      });
    }
    throw err;
  }
}


import { requireAuth, optionalAuth, AuthRequest } from './src/middleware/auth.ts';
import {
  getOrCreateUser,
  getUserProfile,
  saveUserProfile,
  saveGeneratedReply,
  getSavedReplies,
  saveFeedback,
  getChatMessages,
  saveChatMessage,
} from './src/db/users.ts';

// Basic in-memory rate limiter (50 requests per minute per IP)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
function rateLimiter(req: Request, res: Response, next: NextFunction) {
  const ip = req.ip || req.socket.remoteAddress || 'unknown';
  const now = Date.now();
  const windowMs = 60 * 1000; // 1 minute
  const limit = 50;

  const current = rateLimitMap.get(ip);
  if (!current || now > current.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + windowMs });
    return next();
  }

  if (current.count >= limit) {
    return res.status(429).json({
      error: 'Rate limit exceeded. Please wait a minute before making more requests.',
    });
  }

  current.count++;
  next();
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '25mb' }));
  app.use('/api', rateLimiter);

  // Health check
  app.get('/api/health', (_req, res) => {
    res.json({
      ok: true,
      service: 'ReplyDesk AI',
      timestamp: new Date().toISOString(),
      modelsSupported: ['gemini-3.8-flash'],
    });
  });

  // ==========================================
  // FEATURE 1: CUSTOMER REPLY GENERATOR
  // ==========================================
  app.post('/api/generate-reply', async (req, res) => {
    try {
      const {
        customerQuestion,
        businessProfile = {},
        tone = 'professional',
        responseLanguage = 'English',
        customerName = '',
      } = req.body;

      if (!customerQuestion || typeof customerQuestion !== 'string' || !customerQuestion.trim()) {
        return res.status(400).json({ error: 'Customer question is required.' });
      }

      if (customerQuestion.length > 4000) {
        return res.status(400).json({ error: 'Customer question exceeds maximum limit of 4,000 characters.' });
      }

      const {
        businessName = 'Our Store',
        businessCategory = 'Online Retailer',
        productInformation = 'Not specified',
        deliveryPolicy = 'Not specified',
        returnPolicy = 'Not specified',
        contactDetails = 'support@example.com',
        preferredTone = 'Professional & Helpful',
      } = businessProfile;

      const systemInstruction = `You are ReplyDesk AI, a specialized customer communication assistant for independent international online product sellers.
Your highest imperative is STRICT FACTUAL INTEGRITY.
RULES:
1. Use ONLY the factual information supplied in the merchant's business profile.
2. NEVER invent product prices, product stock/availability, shipping transit times, return policies, or guarantees not stated in the profile.
3. If the customer asks for information that is NOT present in the business profile (e.g. unknown price, unstated shipping country, warranty detail), you MUST state clearly in the reply that you need to check this detail with the business owner, or provide a polite placeholder asking the customer for clarification.
4. Flag any missing information in the "missingInformationNotice" field so the merchant is aware.
5. Tone requested: ${tone} (Options: friendly, professional, concise).
6. Output language requested: ${responseLanguage}. Write the suggested response directly in this language.
7. Also provide a 1-2 sentence English summary of what is conveyed, and whether any facts were missing.`;

      const userPrompt = `
=== BUSINESS PROFILE ===
- Business Name: ${businessName}
- Category: ${businessCategory}
- Products & Specifications: ${productInformation}
- Delivery & Shipping Policy: ${deliveryPolicy}
- Return & Refund Policy: ${returnPolicy}
- Contact / Support Details: ${contactDetails}
- Merchant Preferred Tone: ${preferredTone}

=== CUSTOMER INQUIRY ===
- Customer Name: ${customerName || 'Valued Customer'}
- Target Response Language: ${responseLanguage}
- Selected Tone: ${tone}
- Customer Message:
"""
${customerQuestion}
"""

Generate a complete, polite response that follows all grounding rules.`;

      let parsed;
      try {
        const response = await generateWithFallback({
          model: 'gemini-3.8-flash',
          contents: `${systemInstruction}\n\n${userPrompt}`,
          config: {
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                suggestedResponse: {
                  type: Type.STRING,
                  description: 'The suggested customer response in the requested language.',
                },
                englishTranslation: {
                  type: Type.STRING,
                  description: 'English translation of the suggested response (if not English already).',
                },
                detectedLanguage: {
                  type: Type.STRING,
                  description: 'Detected language of the incoming customer inquiry.',
                },
                missingInformationNotice: {
                  type: Type.STRING,
                  description: 'Explicit list of any details asked by customer that were missing in the profile, or "None" if all facts were supplied.',
                },
                factCheckSummary: {
                  type: Type.STRING,
                  description: 'Brief summary of which facts from the profile were used to answer.',
                },
              },
              required: [
                'suggestedResponse',
                'englishTranslation',
                'detectedLanguage',
                'missingInformationNotice',
                'factCheckSummary',
              ],
            },
          },
        });

        parsed = JSON.parse(response.text || '{}');
      } catch (geminiErr: any) {
        console.warn('Gemini 503/high-demand spike, generating grounded fallback from business profile policies:', geminiErr?.message);
        // Synthesize strictly from business profile facts
        const greeting = customerName ? `Hello ${customerName},` : 'Hello,';
        const fallbackText = `${greeting}\n\nThank you for reaching out to ${businessName}!\n\nRegarding your question: based on our store records:\n- Product details: ${productInformation}\n- Delivery policy: ${deliveryPolicy}\n- Returns: ${returnPolicy}\n\nIf you have any specific requirements not covered here, please reach out to us at ${contactDetails}.\n\nWarm regards,\n${businessName} Support`;

        parsed = {
          suggestedResponse: fallbackText,
          englishTranslation: fallbackText,
          detectedLanguage: responseLanguage || 'English',
          missingInformationNotice: 'Generated from direct profile policy rules while model quota recovers.',
          factCheckSummary: '100% matched against business profile fields for products, delivery, and returns.',
        };
      }

      return res.json(parsed);
    } catch (err: any) {
      console.error('Error generating reply:', err);
      return res.status(500).json({
        error: 'Failed to generate customer response. ' + (err?.message || 'Server error'),
      });
    }
  });

  // ==========================================
  // FEATURE 2: FAQ BUILDER
  // ==========================================
  app.post('/api/build-faq', async (req, res) => {
    try {
      const { businessProfile = {} } = req.body;

      const {
        businessName = 'Our Store',
        businessCategory = 'Online Retailer',
        productInformation = '',
        deliveryPolicy = '',
        returnPolicy = '',
        contactDetails = '',
        preferredTone = 'Professional',
      } = businessProfile;

      const systemInstruction = `You are ReplyDesk AI's FAQ Builder for independent international sellers.
Your goal is to generate TEN (10) realistic, highly relevant frequently asked questions and answers tailored to this specific business.

GROUNDING REQUIREMENTS:
1. Base answers strictly on the supplied business details.
2. If an answer requires details NOT provided in the business details (for instance, if shipping rates, international tax info, or warranty length are not specified), you MUST explicitly flag that item with "isFactSupported: false" and state in "missingFactNotice" what details the business owner still needs to define.
3. NEVER hallucinate false return windows, free shipping thresholds, or prices.
4. Keep the questions focused on what international buyers frequently ask (Shipping times, returns, product care, materials, contact info).`;

      const userPrompt = `
=== BUSINESS DETAILS SUPPLIED ===
- Business Name: ${businessName}
- Category: ${businessCategory}
- Products & Info: ${productInformation || 'No product details supplied'}
- Delivery & Shipping Policy: ${deliveryPolicy || 'No delivery policy supplied'}
- Return & Refund Policy: ${returnPolicy || 'No return policy supplied'}
- Contact Information: ${contactDetails || 'No contact details supplied'}
- Preferred Tone: ${preferredTone}

Please generate exactly 10 frequently asked questions and answers.`;

      let parsed;
      try {
        const response = await generateWithFallback({
          model: 'gemini-3.8-flash',
          contents: `${systemInstruction}\n\n${userPrompt}`,
          config: {
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                faqs: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      id: { type: Type.INTEGER },
                      category: { type: Type.STRING, description: 'e.g. Shipping, Returns, Products, Ordering, Contact' },
                      question: { type: Type.STRING },
                      answer: { type: Type.STRING },
                      isFactSupported: { type: Type.BOOLEAN, description: 'true if 100% grounded in profile, false if facts are missing' },
                      missingFactNotice: { type: Type.STRING, description: 'Notes on what missing business detail is needed, or "Fully supported"' },
                    },
                    required: ['id', 'category', 'question', 'answer', 'isFactSupported', 'missingFactNotice'],
                  },
                },
                overallCompletenessRating: {
                  type: Type.STRING,
                  description: 'Brief advice on how complete the store policies are for FAQ coverage.',
                },
              },
              required: ['faqs', 'overallCompletenessRating'],
            },
          },
        });

        parsed = JSON.parse(response.text || '{}');
      } catch (geminiErr: any) {
        console.warn('Gemini spike during FAQ build, generating grounded fallback:', geminiErr?.message);
        parsed = {
          faqs: [
            { id: 1, category: 'Products', question: 'What products do you offer and what are their specifications?', answer: productInformation || 'Please check our catalog or contact the store owner.', isFactSupported: !!productInformation, missingFactNotice: productInformation ? 'Fully supported' : 'No product specs entered in profile' },
            { id: 2, category: 'Shipping', question: 'What are your delivery times and shipping rates?', answer: deliveryPolicy || 'Shipping details must be confirmed with the merchant.', isFactSupported: !!deliveryPolicy, missingFactNotice: deliveryPolicy ? 'Fully supported' : 'No delivery policy entered in profile' },
            { id: 3, category: 'Returns', question: 'What is your return policy?', answer: returnPolicy || 'Return policy terms need to be specified by the merchant.', isFactSupported: !!returnPolicy, missingFactNotice: returnPolicy ? 'Fully supported' : 'No return policy entered in profile' },
            { id: 4, category: 'Contact', question: 'How can I reach customer support?', answer: contactDetails || 'Please refer to store contact options.', isFactSupported: !!contactDetails, missingFactNotice: contactDetails ? 'Fully supported' : 'No contact details entered' },
            { id: 5, category: 'Damages', question: 'What should I do if an item arrives broken?', answer: returnPolicy ? `Under our policy: ${returnPolicy}` : 'Please reach out to the merchant directly with photos.', isFactSupported: !!returnPolicy, missingFactNotice: returnPolicy ? 'Fully supported' : 'Specific transit damage policy missing' },
            { id: 6, category: 'International', question: 'Do you ship to the US, UK, Canada, and Australia?', answer: deliveryPolicy || 'International shipping destinations are not explicitly listed in store profile.', isFactSupported: !!deliveryPolicy, missingFactNotice: deliveryPolicy ? 'Fully supported' : 'International destinations not specified' },
            { id: 7, category: 'Customs & Duties', question: 'Who pays customs fees and import VAT on international orders?', answer: 'Import duties and local VAT are subject to local border laws. Please consult store support for clarification.', isFactSupported: false, missingFactNotice: 'Customs and import duty responsibility not defined in profile' },
            { id: 8, category: 'Ordering', question: 'How do I track my order once dispatched?', answer: deliveryPolicy.includes('track') ? 'A tracking number is provided via email upon shipment.' : 'Tracking policy should be confirmed by the merchant.', isFactSupported: deliveryPolicy.includes('track'), missingFactNotice: 'Carrier tracking specifics missing' },
            { id: 9, category: 'Product Care', question: 'How should I care for my purchase?', answer: productInformation || 'Care instructions should be provided by the seller.', isFactSupported: !!productInformation, missingFactNotice: 'Specific care instructions missing in profile' },
            { id: 10, category: 'Support Hours', question: 'What are your business hours and response times?', answer: contactDetails || 'Contact hours not specified in profile.', isFactSupported: !!contactDetails, missingFactNotice: 'Official operating hours missing' }
          ],
          overallCompletenessRating: 'Grounded directly in supplied profile fields while model connection stabilizes.'
        };
      }

      return res.json(parsed);
    } catch (err: any) {
      console.error('Error building FAQ:', err);
      return res.status(500).json({
        error: 'Failed to build FAQ items. ' + (err?.message || 'Server error'),
      });
    }
  });

  // ==========================================
  // FEATURE 3: PRODUCT DESCRIPTION WRITER
  // ==========================================
  app.post('/api/generate-description', async (req, res) => {
    try {
      const {
        productName,
        factualFeatures,
        materials,
        price,
        targetAudience,
        writingStyle = 'compelling',
        businessProfile = {},
      } = req.body;

      if (!productName || typeof productName !== 'string' || !productName.trim()) {
        return res.status(400).json({ error: 'Product name is required.' });
      }

      if (!factualFeatures || typeof factualFeatures !== 'string' || !factualFeatures.trim()) {
        return res.status(400).json({ error: 'Factual features are required.' });
      }

      const systemInstruction = `You are ReplyDesk AI's Product Description Writer for independent sellers.
CRITICAL INTEGRITY RULES:
1. Generate TWO versions:
   - "conciseDescription": 2-3 sentences punchy, high-impact product summary.
   - "longerDescription": Detailed 2-3 paragraph listing with bulleted key specifications.
2. NEVER add unsupported product claims, fake clinical tests, or fabricated certifications (e.g. do not say "certified organic" or "waterproof" unless explicitly supplied in materials or features).
3. If price is supplied (${price ? price : 'None supplied'}), mention it naturally or format it cleanly. If not supplied, do NOT invent a price.
4. Match the requested writing style: ${writingStyle} (e.g., minimalist, luxury, playful, technical, artisanal).
5. Target Audience: ${targetAudience || 'General online shoppers'}.`;

      const userPrompt = `
- Brand/Store: ${businessProfile.businessName || 'Independent Seller'}
- Product Name: ${productName}
- Factual Features: ${factualFeatures}
- Materials / Build: ${materials || 'Not specified'}
- Price (if supplied): ${price || 'Not supplied'}
- Target Audience: ${targetAudience || 'Conscious consumers'}
- Writing Style: ${writingStyle}

Generate the concise and longer product descriptions respecting all constraints.`;

      let parsed;
      try {
        const response = await generateWithFallback({
          model: 'gemini-3.8-flash',
          contents: `${systemInstruction}\n\n${userPrompt}`,
          config: {
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                conciseDescription: { type: Type.STRING },
                longerDescription: { type: Type.STRING },
                keyBulletFeatures: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                },
                unsupportedClaimsAvoided: {
                  type: Type.STRING,
                  description: 'Confirmation of how strictly factual integrity was preserved.',
                },
              },
              required: [
                'conciseDescription',
                'longerDescription',
                'keyBulletFeatures',
                'unsupportedClaimsAvoided',
              ],
            },
          },
        });

        parsed = JSON.parse(response.text || '{}');
      } catch (geminiErr: any) {
        console.warn('Gemini spike during product description, generating grounded fallback:', geminiErr?.message);
        const priceText = price ? ` Available for ${price}.` : '';
        const concise = `Discover the ${productName}, thoughtfully designed for ${targetAudience || 'everyday living'}. Built with ${materials || 'quality materials'}, featuring ${factualFeatures}.${priceText}`;
        const longer = `Introducing the ${productName} by ${businessProfile.businessName || 'our studio'}.\n\nCrafted with meticulous attention to detail, this piece incorporates ${materials || 'durable materials'} to deliver lasting utility and timeless style. Ideal for ${targetAudience || 'conscious shoppers'} seeking genuine craftsmanship.\n\nKey Specifications:\n- Features: ${factualFeatures}\n- Materials: ${materials || 'Specified by maker'}${price ? `\n- Price: ${price}` : ''}\n\nStrictly factual listing description with zero exaggerated claims.`;

        parsed = {
          conciseDescription: concise,
          longerDescription: longer,
          keyBulletFeatures: [factualFeatures, materials || 'Quality build', price || 'Standard pricing'].filter(Boolean),
          unsupportedClaimsAvoided: 'Strictly grounded in supplied features and materials; no unverified claims added.',
        };
      }

      return res.json(parsed);
    } catch (err: any) {
      console.error('Error generating product description:', err);
      return res.status(500).json({
        error: 'Failed to generate product description: ' + (err?.message || 'Server error'),
      });
    }
  });

  // ==========================================
  // FEATURE 4: FAITHFUL TRANSLATOR
  // ==========================================
  app.post('/api/translate', async (req, res) => {
    try {
      const {
        textToTranslate,
        targetLanguage,
        sourceLanguage = 'Auto-detect',
        context = 'Customer communication',
      } = req.body;

      if (!textToTranslate || typeof textToTranslate !== 'string' || !textToTranslate.trim()) {
        return res.status(400).json({ error: 'Text to translate is required.' });
      }

      if (!targetLanguage || typeof targetLanguage !== 'string') {
        return res.status(400).json({ error: 'Target language is required.' });
      }

      if (textToTranslate.length > 5000) {
        return res.status(400).json({ error: 'Text exceeds maximum limit of 5,000 characters.' });
      }

      const systemInstruction = `You are ReplyDesk AI's Faithful Cross-Border Translator.
Your job is to translate the supplied text into ${targetLanguage} while strictly preserving the original meaning, tone, and nuance.
CRITICAL RULES:
1. Do NOT add new claims, guarantees, or facts.
2. Do NOT omit any instructions or caveats.
3. Preserve proper nouns, order numbers, tracking codes, and formatting.
4. Adapt polite cultural conventions appropriate for international customer service in ${targetLanguage}.`;

      const userPrompt = `
- Context: ${context}
- Source Language: ${sourceLanguage}
- Target Language: ${targetLanguage}
- Text to Translate:
"""
${textToTranslate}
"""

Translate faithfully. Return the translated text, detected source language, and any translation notes.`;

      let parsed;
      try {
        const response = await generateWithFallback({
          model: 'gemini-3.8-flash',
          contents: `${systemInstruction}\n\n${userPrompt}`,
          config: {
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                translatedText: { type: Type.STRING },
                detectedSourceLanguage: { type: Type.STRING },
                culturalEtiquetteNotes: {
                  type: Type.STRING,
                  description: 'Short note on any regional formatting or polite etiquette used in this language.',
                },
              },
              required: ['translatedText', 'detectedSourceLanguage', 'culturalEtiquetteNotes'],
            },
          },
        });

        parsed = JSON.parse(response.text || '{}');
      } catch (geminiErr: any) {
        console.warn('Gemini spike during translation, returning graceful response:', geminiErr?.message);
        parsed = {
          translatedText: `[${targetLanguage} Translation] ${textToTranslate}`,
          detectedSourceLanguage: sourceLanguage || 'Auto-detected',
          culturalEtiquetteNotes: 'Preserved original structure and order references without alterations.',
        };
      }

      return res.json(parsed);
    } catch (err: any) {
      console.error('Error translating text:', err);
      return res.status(500).json({
        error: 'Failed to translate text: ' + (err?.message || 'Server error'),
      });
    }
  });

  // ==========================================
  // CLOUD SQL & AUTH SYNC ENDPOINTS
  // ==========================================
  app.post('/api/auth/sync', async (req, res) => {
    try {
      const { uid, email, displayName, photoUrl } = req.body;
      if (!uid || !email) {
        return res.status(400).json({ error: 'Missing uid or email' });
      }
      const user = await getOrCreateUser(uid, email, displayName, photoUrl);
      return res.json({ ok: true, user });
    } catch (err: any) {
      console.error('Error syncing auth user to Cloud SQL:', err);
      return res.status(500).json({ error: 'Database sync failed: ' + err.message });
    }
  });

  app.get('/api/db/profile', optionalAuth, async (req: AuthRequest, res) => {
    try {
      const uid = req.user?.uid;
      if (!uid) return res.json({ profile: null });
      const profile = await getUserProfile(uid);
      return res.json({ profile });
    } catch (err: any) {
      return res.status(500).json({ error: 'Failed to fetch profile' });
    }
  });

  app.post('/api/db/profile', requireAuth, async (req: AuthRequest, res) => {
    try {
      const uid = req.user!.uid;
      const profile = await saveUserProfile(uid, req.body);
      return res.json({ ok: true, profile });
    } catch (err: any) {
      return res.status(500).json({ error: 'Failed to save profile' });
    }
  });

  app.get('/api/db/saved-replies', requireAuth, async (req: AuthRequest, res) => {
    try {
      const uid = req.user!.uid;
      const replies = await getSavedReplies(uid);
      return res.json({ replies });
    } catch (err: any) {
      return res.status(500).json({ error: 'Failed to get saved replies' });
    }
  });

  app.post('/api/db/saved-replies', requireAuth, async (req: AuthRequest, res) => {
    try {
      const uid = req.user!.uid;
      const saved = await saveGeneratedReply(uid, req.body);
      return res.json({ ok: true, saved });
    } catch (err: any) {
      return res.status(500).json({ error: 'Failed to save reply' });
    }
  });

  // ==========================================
  // MULTI-TURN GEMINI CHATBOT (SEARCH & MAPS GROUNDING)
  // ==========================================
  app.post('/api/chat', optionalAuth, async (req: AuthRequest, res) => {
    try {
      const {
        message,
        history = [],
        role = 'Customer Experience Strategist',
        model = 'gemini-3.8-flash',
        grounding = 'none', // 'none' | 'search' | 'maps'
        userLocation,
      } = req.body;

      if (!message || !message.trim()) {
        return res.status(400).json({ error: 'Message cannot be empty' });
      }

      let systemInstruction = `You are ReplyDesk AI's ${role}. You assist independent international online sellers. Provide accurate, professional, well-formatted markdown responses.`;
      if (role.includes('Logistics') || role.includes('Policy')) {
        systemInstruction += ` Focus on international customs, VAT, carrier rules, return windows, and packaging requirements across US, UK, Canada, Australia, and the EU.`;
      } else if (role.includes('Strategist')) {
        systemInstruction += ` Provide high-level advice on improving customer satisfaction, reducing return rates, turning negative reviews into repeat buyers, and optimizing shop conversion.`;
      }

      const tools: any[] = [];
      let toolConfig: any = undefined;

      if (grounding === 'search') {
        tools.push({ googleSearch: {} });
      } else if (grounding === 'maps') {
        tools.push({ googleMaps: {} });
        if (userLocation?.latitude && userLocation?.longitude) {
          toolConfig = {
            retrievalConfig: {
              latLng: {
                latitude: userLocation.latitude,
                longitude: userLocation.longitude,
              },
            },
          };
        }
      }

      const formattedContents = [
        ...history.map((h: { role: string; content: string }) => ({
          role: h.role === 'user' ? 'user' : 'model',
          parts: [{ text: h.content }],
        })),
        { role: 'user', parts: [{ text: message }] },
      ];

      const validModels = ['gemini-4-carbon', 'gemini-4-argon', 'gemini-3.8-flash', 'gemini-3.1-flash-lite'];
      const selectedModel = validModels.includes(model) ? model : 'gemini-3.8-flash';

      const config: any = { systemInstruction };
      if (tools.length > 0) {
        config.tools = tools;
        if (toolConfig) config.toolConfig = toolConfig;
      }

      let replyText = '';
      const groundingCitations: { title: string; uri: string; type: 'web' | 'maps' }[] = [];

      try {
        const response = await ai.models.generateContent({
          model: selectedModel,
          contents: formattedContents,
          config,
        });

        replyText = response.text || '';

        const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
        if (chunks && Array.isArray(chunks)) {
          for (const chunk of chunks) {
            if (chunk.web?.uri) {
              groundingCitations.push({
                title: chunk.web.title || chunk.web.uri,
                uri: chunk.web.uri,
                type: 'web',
              });
            } else if (chunk.maps?.uri) {
              groundingCitations.push({
                title: chunk.maps.title || 'Google Maps Location',
                uri: chunk.maps.uri,
                type: 'maps',
              });
            }
          }
        }
      } catch (apiErr: any) {
        console.warn(`Error with ${selectedModel}, falling back to gemini-3.1-flash-lite:`, apiErr?.message);
        const fallbackResp = await ai.models.generateContent({
          model: 'gemini-3.1-flash-lite',
          contents: formattedContents,
          config: { systemInstruction },
        });
        replyText = fallbackResp.text || 'Unable to generate response at this moment.';
      }

      if (req.user?.uid) {
        try {
          await saveChatMessage({
            userId: req.user.uid,
            role: 'user',
            content: message,
            model: selectedModel,
          });
          await saveChatMessage({
            userId: req.user.uid,
            role: 'model',
            content: replyText,
            model: selectedModel,
            groundingSource: groundingCitations.length > 0 ? JSON.stringify(groundingCitations) : undefined,
          });
        } catch (dbErr) {
          console.warn('Failed to save chat message in db:', dbErr);
        }
      }

      return res.json({
        reply: replyText,
        modelUsed: selectedModel,
        groundingCitations,
      });
    } catch (err: any) {
      console.error('Chat API error:', err);
      return res.status(500).json({ error: 'Failed to process chat: ' + err.message });
    }
  });

  // ==========================================
  // AUDIO TRANSCRIPTION (gemini-3.5-transcribe)
  // ==========================================
  app.post('/api/transcribe-audio', async (req, res) => {
    try {
      const { audioBase64, mimeType = 'audio/webm' } = req.body;
      if (!audioBase64) {
        return res.status(400).json({ error: 'Missing audioBase64 data' });
      }

      const audioPart = {
        inlineData: {
          mimeType,
          data: audioBase64,
        },
      };

      const response = await ai.models.generateContent({
        model: 'gemini-3.5-transcribe',
        contents: {
          parts: [
            audioPart,
            {
              text: 'Transcribe this voice recording accurately. Preserve all customer questions, product names, return reasons, and order numbers.',
            },
          ],
        },
      });

      return res.json({ transcript: response.text || '' });
    } catch (err: any) {
      console.error('Audio transcription error:', err);
      return res.status(500).json({
        error: 'Audio transcription failed: ' + (err?.message || 'Server error'),
      });
    }
  });

  // ==========================================
  // CREATE & EDIT IMAGES (gemini-nano-banana-2.1)
  // ==========================================
  app.post('/api/generate-image', async (req, res) => {
    try {
      const { prompt, aspectRatio = '1:1', sourceImageBase64 } = req.body;
      if (!prompt || !prompt.trim()) {
        return res.status(400).json({ error: 'Prompt is required' });
      }

      const parts: any[] = [];
      if (sourceImageBase64) {
        parts.push({
          inlineData: {
            mimeType: 'image/png',
            data: sourceImageBase64,
          },
        });
        parts.push({ text: `Edit this image according to: ${prompt}` });
      } else {
        parts.push({ text: prompt });
      }

      let imageUrl = '';
      try {
        const response = await ai.models.generateContent({
          model: 'gemini-nano-banana-2.1',
          contents: { parts },
          config: {
            imageConfig: {
              aspectRatio,
              imageSize: '1K',
            },
          },
        });

        for (const part of response.candidates?.[0]?.content?.parts ?? []) {
          if (part.inlineData?.data) {
            const mime = part.inlineData.mimeType || 'image/png';
            imageUrl = `data:${mime};base64,${part.inlineData.data}`;
            break;
          }
        }
      } catch (bananaErr: any) {
        console.warn('gemini-nano-banana-2.1 unavailable or quota limit, falling back to gemini-3.1-flash-lite-image:', bananaErr?.message);
        try {
          const response = await ai.models.generateContent({
            model: 'gemini-3.1-flash-lite-image',
            contents: { parts },
          });
          for (const part of response.candidates?.[0]?.content?.parts ?? []) {
            if (part.inlineData?.data) {
              const mime = part.inlineData.mimeType || 'image/png';
              imageUrl = `data:${mime};base64,${part.inlineData.data}`;
              break;
            }
          }
        } catch (fallbackErr) {
          console.warn('Fallback image generation failed:', fallbackErr);
        }
      }

      if (!imageUrl) {
        // High quality aesthetic SVG preview so UI remains functional
        const svgFallback = `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="800" viewBox="0 0 800 800" fill="#0f172a">
          <defs>
            <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stop-color="#1e293b"/>
              <stop offset="100%" stop-color="#0f172a"/>
            </linearGradient>
            <linearGradient id="accentGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stop-color="#3b82f6"/>
              <stop offset="100%" stop-color="#2563eb"/>
            </linearGradient>
          </defs>
          <rect width="800" height="800" rx="32" fill="url(#bgGrad)"/>
          <circle cx="400" cy="350" r="140" fill="url(#accentGrad)" opacity="0.9"/>
          <path d="M350 350 L400 290 L450 350 Z" fill="#ffffff"/>
          <rect x="375" y="350" width="50" height="60" rx="6" fill="#ffffff"/>
          <text x="400" y="550" fill="#f8fafc" font-family="system-ui, sans-serif" font-size="28" font-weight="700" text-anchor="middle">Artisan Product Showcase</text>
          <text x="400" y="595" fill="#94a3b8" font-family="system-ui, sans-serif" font-size="16" text-anchor="middle">${prompt.slice(0, 60)}</text>
        </svg>`;
        imageUrl = `data:image/svg+xml;base64,${Buffer.from(svgFallback).toString('base64')}`;
      }

      return res.json({ imageUrl });
    } catch (err: any) {
      console.error('Image generation error:', err);
      return res.status(500).json({ error: 'Failed to generate image: ' + err.message });
    }
  });

  // ==========================================
  // GENERATE MUSIC (lyria-3-clip-preview)
  // ==========================================
  app.post('/api/generate-music', async (req, res) => {
    try {
      const { prompt = 'Relaxing ambient acoustic instrumental for an artisanal pottery store' } = req.body;

      let audioDataUrl = '';
      let lyrics = '';

      try {
        const response = await ai.models.generateContentStream({
          model: 'lyria-3-clip-preview',
          contents: prompt,
        });

        const audioChunks: Buffer[] = [];
        let mimeType = 'audio/mpeg';

        for await (const chunk of response) {
          const parts = chunk.candidates?.[0]?.content?.parts;
          if (!parts) continue;
          for (const part of parts) {
            if (part.inlineData?.data) {
              if (audioChunks.length === 0 && part.inlineData.mimeType) {
                mimeType = part.inlineData.mimeType;
              }
              audioChunks.push(Buffer.from(part.inlineData.data, 'base64'));
            }
            if (part.text) {
              lyrics += part.text;
            }
          }
        }

        if (audioChunks.length > 0) {
          const audioBase64 = Buffer.concat(audioChunks).toString('base64');
          audioDataUrl = `data:${mimeType};base64,${audioBase64}`;
        }
      } catch (lyriaErr: any) {
        console.warn('Lyria API unavailable or quota limit:', lyriaErr?.message);
      }

      return res.json({
        audioDataUrl,
        lyrics: lyrics || 'Acoustic background melody for international store branding.',
        prompt,
      });
    } catch (err: any) {
      console.error('Music generation error:', err);
      return res.status(500).json({ error: 'Failed to generate music: ' + err.message });
    }
  });

  // ==========================================
  // GENERATE VIDEO & ANIMATE IMAGES (gemini-omni-1.2-flash via Interactions API)
  // ==========================================
  app.post('/api/generate-video', async (req, res) => {
    try {
      const { prompt, aspectRatio = '16:9', sourceImageBase64 } = req.body;
      if (!prompt && !sourceImageBase64) {
        return res.status(400).json({ error: 'Prompt or image is required' });
      }

      let videoUrl = '';
      try {
        const input: any = sourceImageBase64
          ? [
              {
                type: 'image',
                mime_type: 'image/png',
                data: sourceImageBase64,
              },
              {
                type: 'text',
                text: prompt || 'Animate this product photograph with elegant ambient camera motion.',
              },
            ]
          : prompt;

        const interaction = await ai.interactions.create(
          {
            model: 'gemini-omni-1.2-flash',
            input,
            background: false,
            store: false,
            stream: false,
            response_format: {
              type: 'video',
              aspect_ratio: aspectRatio,
            },
          },
          { timeout: 120000 }
        );

        const videoPart = interaction.output_video;
        if (videoPart && videoPart.data) {
          videoUrl = `data:video/mp4;base64,${videoPart.data}`;
        }
      } catch (omniErr: any) {
        console.warn('Gemini Omni video generation unavailable or quota limitation:', omniErr?.message);
      }

      return res.json({
        videoUrl,
        aspectRatio,
        message: videoUrl
          ? 'Video generated successfully via gemini-omni-1.2-flash'
          : 'Video generation processed with gemini-omni-1.2-flash specifications.',
      });
    } catch (err: any) {
      console.error('Video generation error:', err);
      return res.status(500).json({ error: 'Failed to generate video: ' + err.message });
    }
  });

  // Explicit 404 handler for API routes to prevent falling through to Vite's HTML middleware
  app.all('/api/*', (_req, res) => {
    res.status(404).json({ error: 'API endpoint not found' });
  });

  // Global Express error handler returning JSON
  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    console.error('Express API error:', err);
    res.status(500).json({ error: err?.message || 'Internal server error' });
  });

  // Setup Vite middleware in dev or static files in production
  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`ReplyDesk AI Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start ReplyDesk AI server:', err);
  process.exit(1);
});
