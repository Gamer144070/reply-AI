export interface BusinessProfile {
  businessName: string;
  businessCategory: string;
  productInformation: string;
  deliveryPolicy: string;
  returnPolicy: string;
  contactDetails: string;
  preferredTone: 'Friendly' | 'Professional' | 'Concise' | 'Empathetic';
}

export type ReplyTone = 'friendly' | 'professional' | 'concise';

export interface ReplyResponse {
  suggestedResponse: string;
  englishTranslation: string;
  detectedLanguage: string;
  missingInformationNotice: string;
  factCheckSummary: string;
}

export interface FaqItem {
  id: number;
  category: string;
  question: string;
  answer: string;
  isFactSupported: boolean;
  missingFactNotice: string;
}

export interface FaqBuilderResponse {
  faqs: FaqItem[];
  overallCompletenessRating: string;
}

export interface ProductDescriptionResponse {
  conciseDescription: string;
  longerDescription: string;
  keyBulletFeatures: string[];
  unsupportedClaimsAvoided: string;
}

export interface TranslationResponse {
  translatedText: string;
  detectedSourceLanguage: string;
  culturalEtiquetteNotes: string;
}

export interface DraftHistoryItem {
  id: string;
  featureType: 'reply' | 'faq' | 'product' | 'translate';
  title: string;
  preview: string;
  createdAt: string;
  language?: string;
}

export type PlanTier = 'free' | 'paid' | 'elite';

export interface PlanConfig {
  id: PlanTier;
  name: string;
  badge: string;
  targetAudience: string;
  price: string;
  period: string;
  limits: {
    replies: number;
    faqs: number;
    products: number;
    translations: number;
  };
  features: string[];
  isPopular?: boolean;
}

export interface PlanUsage {
  currentTier: PlanTier;
  repliesUsed: number;
  faqsUsed: number;
  productsUsed: number;
  translationsUsed: number;
}

export interface FeedbackSubmission {
  id: string;
  senderEmail: string;
  category: 'feature_request' | 'translation_quality' | 'prompt_grounding' | 'general';
  rating: number; // 1-5
  message: string;
  createdAt: string;
}

export interface PackingSlipItem {
  sku: string;
  name: string;
  quantity: number;
  unitPrice: string;
}

export interface PrintableDocument {
  type: 'packing_slip' | 'care_card' | 'return_label';
  orderNumber: string;
  orderDate: string;
  customerName: string;
  customerAddress: string;
  destinationCountry: string;
  items: PackingSlipItem[];
  customsNote?: string;
  specialInstructions?: string;
}
