import { BusinessProfile, FaqItem, PlanUsage, PlanConfig, PrintableDocument, FeedbackSubmission } from '../types';

export const PLAN_CONFIGS: Record<'free' | 'paid' | 'elite', PlanConfig> = {
  free: {
    id: 'free',
    name: 'Starter Free',
    badge: 'Free Forever',
    targetAudience: 'For new sellers launching their shop',
    price: '$0',
    period: '/ month',
    limits: {
      replies: 20,
      faqs: 5,
      products: 5,
      translations: 15,
    },
    features: [
      '20 AI grounded replies / mo',
      '5 FAQ generations / mo',
      '5 product descriptions / mo',
      '15 translations / mo',
      'Standard business profile grounding',
      'Standard web printable packing slips',
    ],
  },
  paid: {
    id: 'paid',
    name: 'Solo Seller Plan',
    badge: 'Most Popular',
    targetAudience: 'For independent international online product sellers',
    price: '$2.70',
    period: '/ month',
    limits: {
      replies: 200,
      faqs: 30,
      products: 50,
      translations: 100,
    },
    isPopular: true,
    features: [
      '200 AI grounded replies / mo',
      '30 FAQ generations / mo',
      '50 product descriptions / mo',
      '100 translations / mo',
      'Cultural etiquette notes for 8+ languages',
      'Printable international packing slips & care cards',
      'Export FAQs as Markdown & HTML',
      'Email customer feedback service',
    ],
  },
  elite: {
    id: 'elite',
    name: 'Elite Global Brand',
    badge: 'High Volume',
    targetAudience: 'For high-volume merchants and multi-market artisans',
    price: '$8.90',
    period: '/ month',
    limits: {
      replies: 1000,
      faqs: 150,
      products: 200,
      translations: 500,
    },
    features: [
      '1,000 AI grounded replies / mo',
      '150 FAQ generations / mo',
      '200 product descriptions / mo',
      '500 translations / mo',
      'Custom branded thermal 4x6" packing slips',
      'Batch print return labels & care inserts',
      'Priority AI generation processing queue',
      'Direct feedback concierge review',
    ],
  },
};

export const DEFAULT_PLAN_USAGE: PlanUsage = {
  currentTier: 'paid',
  repliesUsed: 14,
  faqsUsed: 4,
  productsUsed: 8,
  translationsUsed: 12,
};

export const SAMPLE_PRINTABLE_DOCUMENTS: PrintableDocument[] = [
  {
    type: 'packing_slip',
    orderNumber: 'ORD-8841-DE',
    orderDate: 'November 10, 2026',
    customerName: 'Lukas Schneider',
    customerAddress: 'Maximilianstraße 14, 80539 München, Germany',
    destinationCountry: 'Germany',
    items: [
      { sku: 'POT-MUG-OAT', name: 'Handcrafted Oatmeal Speckled Stoneware Mug', quantity: 2, unitPrice: '$28.00' },
      { sku: 'POT-BOWL-RAMEN', name: 'Kinoko Speckled Stoneware Ramen Bowl (18cm)', quantity: 1, unitPrice: '$38.00' },
    ],
    customsNote: 'Commercial Merchandise - Ceramic Tableware (HS Code: 6912.00). Declared value: $94.00 USD.',
    specialInstructions: 'Fragile ceramic shipment. Handle with care. Dishwasher & microwave safe.',
  },
  {
    type: 'care_card',
    orderNumber: 'ORD-9915-GB',
    orderDate: 'November 11, 2026',
    customerName: 'Charlotte Davies',
    customerAddress: '42 Regent Park Terrace, London NW1 4SX, United Kingdom',
    destinationCountry: 'United Kingdom',
    items: [
      { sku: 'POT-MUG-OAT', name: 'Handcrafted Stoneware Coffee Mug (350ml)', quantity: 1, unitPrice: '$28.00' },
    ],
    specialInstructions: 'Safe for microwave and dishwasher. Avoid open flame or rapid thermal shock.',
  },
  {
    type: 'return_label',
    orderNumber: 'RET-AUTH-7721',
    orderDate: 'November 11, 2026',
    customerName: 'Oliver Wright',
    customerAddress: '18 Flinders Lane, Melbourne VIC 3000, Australia',
    destinationCountry: 'Australia',
    items: [
      { sku: 'POT-BOWL-RAMEN', name: 'Ramen Bowl (Transit Replacement Authorization)', quantity: 1, unitPrice: '$38.00' },
    ],
    customsNote: 'Authorized Return Depot Reference. Merchant Paid Warranty Exchange.',
  },
];

export const INITIAL_FEEDBACK_SUBMISSIONS: FeedbackSubmission[] = [
  {
    id: 'fb-1',
    senderEmail: 'lukas.ceramics@gmail.com',
    category: 'translation_quality',
    rating: 5,
    message: 'The German response about Frankfurt airport customs clearance was exceptionally polite and addressed my German customer with the proper formal "Sie". Saved me 20 minutes!',
    createdAt: '2 days ago',
  },
  {
    id: 'fb-2',
    senderEmail: 'sophie.apparel@boutique.co.uk',
    category: 'feature_request',
    rating: 5,
    message: 'Love the packing slips! Could you make sure the return authorization slips fit standard 4x6 thermal label printers?',
    createdAt: 'Yesterday',
  },
];

export const FICTIONAL_DEMO_PROFILE: BusinessProfile = {
  businessName: 'Komorebi Ceramics Studio',
  businessCategory: 'Handcrafted Pottery & Tableware',
  productInformation:
    'Handmade stoneware mugs (350ml), ramen bowls (18cm diameter), and matte speckled vases. All items are crafted with non-toxic, lead-free iron-rich clay and high-fire food-safe glazes. Safe for microwave and dishwasher use. Not recommended for open flame or direct stovetop cooking.',
  deliveryPolicy:
    'Dispatches from our workshop within 2-3 business days. Domestic shipping (US) takes 3-5 business days via USPS Priority ($6 flat rate, free over $75). International shipping to UK, Canada, Australia, and EU takes 7-12 business days via DHL Express Tracked ($18 flat rate). Tracking number provided via email upon dispatch.',
  returnPolicy:
    '30-day return policy from the delivery date for unused items in original packaging. Buyers are responsible for return shipping costs unless the item arrived damaged or defective. In the rare event of transit breakage, we ship an immediate free replacement upon receiving 2 clear photos of the damaged piece within 7 days of delivery.',
  contactDetails:
    'Customer Care: hello@komorebiceramics.com. Workshop hours: Monday-Friday 9:00 AM - 5:00 PM EST. Response time is typically within 1 business day.',
  preferredTone: 'Friendly',
};

export const EMPTY_PROFILE: BusinessProfile = {
  businessName: '',
  businessCategory: '',
  productInformation: '',
  deliveryPolicy: '',
  returnPolicy: '',
  contactDetails: '',
  preferredTone: 'Professional',
};

export const SAMPLE_CUSTOMER_QUESTIONS = [
  {
    id: 'sample-1',
    label: '🇩🇪 German Customs & Tracking Delay',
    language: 'German',
    name: 'Lukas Schneider',
    question:
      'Guten Tag, mein Paket nach München (Bestellnummer #KC-8841) befindet sich laut DHL seit 5 Tagen in der Zollabfertigung in Frankfurt. Muss ich Einfuhrabgaben zahlen und wann wird das Paket voraussichtlich zugestellt? Vielen Dank!',
  },
  {
    id: 'sample-2',
    label: '🇬🇧 UK Microwave & Dishwasher Care',
    language: 'English',
    name: 'Charlotte Davies',
    question:
      'Hi Komorebi team! I adore the speckled stoneware mug I ordered to London. Could you confirm if the glaze is completely safe for both my microwave and dishwasher? Also, does it get extremely hot to touch after heating coffee?',
  },
  {
    id: 'sample-3',
    label: '🇦🇺 Australia Breakage in Transit',
    language: 'English',
    name: 'Oliver Wright',
    question:
      'G’day, my order #KC-8920 just arrived here in Melbourne, but sadly one of the ramen bowls was cracked right down the rim during shipping. What do I need to send you to get this sorted out before the weekend?',
  },
  {
    id: 'sample-4',
    label: '🇫🇷 French Return & International Shipping',
    language: 'French',
    name: 'Amélie Laurent',
    question:
      'Bonjour, j’ai reçu le vase hier à Paris mais la couleur est un peu plus sombre que prévu. Est-il possible de le retourner, et qui prend en charge les frais de retour depuis la France ? Merci pour votre aide.',
  },
  {
    id: 'sample-5',
    label: '🇺🇸 US Missing Information Test (Stove use & Discount)',
    language: 'English',
    name: 'Marcus Miller',
    question:
      'Hello, can I use this ceramic bowl directly on my gas burner stove to simmer soup? Also, do you offer wholesale pricing for orders over 50 units?',
  },
];

export const SAMPLE_PRODUCT_INPUTS = [
  {
    label: 'Speckled Stoneware Ramen Bowl',
    productName: 'Kinoko Speckled Stoneware Ramen Bowl',
    factualFeatures:
      '18cm diameter, 850ml capacity, deep ergonomic rim, lead-free iron clay, microwave and dishwasher safe.',
    materials: 'High-fire stoneware clay, satin matte iron-flecked glaze',
    price: '$38.00 USD',
    targetAudience: 'Home cooks, noodle lovers, mindful dining enthusiasts',
    writingStyle: 'artisanal',
  },
  {
    label: 'Minimalist Studio Coffee Mug',
    productName: 'Komorebi Morning Ceramic Mug',
    factualFeatures:
      '350ml capacity, wide comfort handle, heat-retentive ceramic wall, dishwasher safe, non-toxic glaze.',
    materials: 'Hand-thrown local clay, oatmeal matte glaze',
    price: '$28.00 USD',
    targetAudience: 'Specialty coffee drinkers, home office workers',
    writingStyle: 'minimalist',
  },
];

export const SAMPLE_TRANSLATION_SNIPPETS = [
  {
    label: 'Shipping Delay Apology Note',
    text: 'Thank you so much for your patience. Your international package has cleared customs and is scheduled for final delivery by your local carrier within the next 48 hours. Please let us know as soon as it arrives!',
    targetLanguage: 'German',
  },
  {
    label: 'Broken Item Replacement Confirmation',
    text: 'We are so sorry to hear your bowl arrived damaged! We take great care in packaging, but international transit can be unpredictable. We have processed a free replacement order today under tracking number TRK-9821.',
    targetLanguage: 'French',
  },
  {
    label: 'Care Instructions Note',
    text: 'Your handcrafted stoneware is completely safe for dishwasher and microwave use. For longevity, avoid sudden extreme temperature shocks like placing a cold bowl straight into a hot oven.',
    targetLanguage: 'Japanese',
  },
];

export const DEMO_FAQS: FaqItem[] = [
  {
    id: 1,
    category: 'Products & Safety',
    question: 'Are your ceramics microwave and dishwasher safe?',
    answer:
      'Yes, all our stoneware items are crafted with non-toxic, lead-free high-fire glazes and are completely safe for daily use in both the microwave and dishwasher.',
    isFactSupported: true,
    missingFactNotice: 'Fully supported by profile product information.',
  },
  {
    id: 2,
    category: 'Products & Safety',
    question: 'Can I use these ceramic bowls on an open flame or stovetop?',
    answer:
      'No, our ceramics are not rated for open flame, direct stovetop burners, or extreme thermal shocks.',
    isFactSupported: true,
    missingFactNotice: 'Fully supported by profile product information.',
  },
  {
    id: 3,
    category: 'Shipping',
    question: 'How long does shipping take to the United States?',
    answer:
      'Orders dispatch within 2-3 business days. US domestic delivery takes 3-5 business days via USPS Priority ($6 flat rate, free on orders over $75).',
    isFactSupported: true,
    missingFactNotice: 'Fully supported by profile delivery policy.',
  },
  {
    id: 4,
    category: 'Shipping',
    question: 'Do you ship internationally to the UK, Canada, and Australia?',
    answer:
      'Yes! We ship to the UK, Canada, Australia, and the EU via DHL Express Tracked for an $18 flat rate, typically arriving within 7-12 business days.',
    isFactSupported: true,
    missingFactNotice: 'Fully supported by profile delivery policy.',
  },
  {
    id: 5,
    category: 'Returns & Damages',
    question: 'What is your return window?',
    answer:
      'We offer a 30-day return policy from the delivery date for unused items in original packaging. Buyers cover return shipping costs.',
    isFactSupported: true,
    missingFactNotice: 'Fully supported by profile return policy.',
  },
  {
    id: 6,
    category: 'Returns & Damages',
    question: 'What happens if my ceramics arrive broken in transit?',
    answer:
      'In the rare event of transit breakage, simply email us 2 clear photos of the damaged piece within 7 days of delivery and we will dispatch a free replacement immediately.',
    isFactSupported: true,
    missingFactNotice: 'Fully supported by profile return policy.',
  },
  {
    id: 7,
    category: 'Customs & Import Duties',
    question: 'Are international customs duties or VAT included in the price?',
    answer:
      'We recommend checking with the business owner as import duty collection details are not explicitly defined in our current store policy.',
    isFactSupported: false,
    missingFactNotice:
      'Customs and VAT handling rules are not specified in the current business profile.',
  },
  {
    id: 8,
    category: 'Ordering',
    question: 'Do you offer custom engraved pottery or wholesale orders?',
    answer:
      'Please contact our studio directly at hello@komorebiceramics.com to discuss custom pottery or volume orders.',
    isFactSupported: false,
    missingFactNotice:
      'Wholesale terms and custom commissions are not listed in the profile.',
  },
  {
    id: 9,
    category: 'Ordering',
    question: 'Can I track my order once it ships?',
    answer:
      'Yes, a tracking number is automatically generated and sent to your email as soon as your parcel is dispatched from our workshop.',
    isFactSupported: true,
    missingFactNotice: 'Fully supported by profile delivery policy.',
  },
  {
    id: 10,
    category: 'Contact',
    question: 'How can I contact customer support and what are your hours?',
    answer:
      'You can reach us at hello@komorebiceramics.com. Our workshop is open Monday through Friday, 9:00 AM - 5:00 PM EST, and we respond within 1 business day.',
    isFactSupported: true,
    missingFactNotice: 'Fully supported by profile contact details.',
  },
];
