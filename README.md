# ReplyDesk AI

**AI-powered customer communication workspace for independent international online product sellers.**

> *Tagline:* **Better replies. Less repetitive work.**

ReplyDesk AI is built specifically for solo e-commerce merchants, Etsy artisans, Shopify store owners, and direct-to-consumer makers selling to international customers across the **United States, United Kingdom, Canada, Australia, and worldwide**.

---

## The Core Concept: "Enter Your Business Information Once"

International sellers waste hours answering repetitive inquiries about shipping delays, customs VAT duties, return labels, and product care in multiple languages.

With ReplyDesk AI, the seller enters their factual business information once:
- Business name and category
- Product materials, dimensions, and safety specs
- Delivery and international transit timelines (US, UK, CA, AU)
- Return and transit damage policies
- Contact details and preferred brand tone

All AI features strictly reference this knowledge base.

---

## The 4 Core Features

### 1. Reply Generator (Feature 1)
- **Inputs:** Business profile, customer question, tone (`friendly`, `professional`, `concise`), and target response language (English, German, French, Spanish, Japanese, Italian, etc.).
- **Strict Factual Grounding:** Uses only facts supplied in the business profile. Never invents product prices, availability, shipping times, or refund guarantees.
- **Missing Information Notice:** If a customer asks about unstated terms (e.g. unknown warranty or wholesale discount), the AI explicitly flags it in the UI and suggests consulting the business owner.
- **Editable Drafts:** Output text is fully editable prior to copying, and includes character counts and English translations for foreign language replies.

### 2. FAQ Builder (Feature 2)
- **Inputs:** Business details from the active profile.
- **Output:** 10 essential store FAQs across Shipping, Returns, Product Care, Ordering, and Contact.
- **Unsupported Fact Flags:** Every question is analyzed; answers that cannot be 100% verified from the business profile are marked with an amber badge explaining what information the merchant needs to provide.
- **Actions:** Edit in place, copy individual Q&As, or copy all 10 as formatted Markdown.

### 3. Product Description Writer (Feature 3)
- **Inputs:** Product name, factual features, materials, optional price, target audience, and writing style (artisanal, minimalist, luxury, technical, playful).
- **Dual Output:**
  - *Concise Description:* 2-3 sentence punchy summary for catalogs and social media.
  - *Longer Description:* Detailed listing paragraphs with extracted factual bullet points.
- **Claim Avoidance:** Never fabricates clinical claims, fake certifications, or unstated guarantees.

### 4. Cross-Border Translator (Feature 4)
- **Inputs:** Text to translate, source language (auto-detected), target language, and domain context.
- **Faithful Translation:** Preserves exact instructions, order codes, tracking numbers, and technical caveats without adding marketing puffery.
- **Cultural Etiquette:** Adapts polite closing phrases and formatting standards for European, Asian, and American markets.

---

## Safety, Privacy & Human-in-the-Loop Architecture

- **No Server Storage:** Customer messages and profile drafts are not stored on any remote database in this prototype. Profile data persists only in the user's local browser storage (`localStorage`).
- **No Automatic Sending:** ReplyDesk AI generates drafts for human review. It does not connect to customer accounts or automatically dispatch messages.
- **No Sensitive Financial Data:** The application does not collect payment details, passwords, or personal identity numbers.
- **AI-Generated Labeling:** All responses are prominently stamped with an `AI-Generated Draft` badge.

---

## Tech Stack & Configuration

- **Frontend:** React 19, TypeScript, Tailwind CSS v4, Lucide Icons.
- **Backend:** Node.js Express server with Vite middleware integration in development and static asset serving in production.
- **AI Engine:** Google Gemini API (`gemini-3.8-flash`) via the modern `@google/genai` TypeScript SDK.
- **Security:** API requests are routed through server-side proxy endpoints (`/api/*`). The `GEMINI_API_KEY` is kept exclusively on the server and is never exposed in browser bundles.

### Environment Variables

Configure the following variables in your `.env` file (see `.env.example`):

```bash
# Server-side Gemini API key (automatically injected in AI Studio)
GEMINI_API_KEY="your-gemini-api-key"

# Port (default 3000)
PORT=3000
```

---

## Local Development & Deployment

### 1. Install Dependencies
```bash
npm install
```

### 2. Run the Development Server
```bash
npm run dev
```
Open `http://localhost:3000` to interact with ReplyDesk AI.

### 3. Build for Production
```bash
npm run build
```

### 4. Start in Production Mode
```bash
npm start
```

---

## Subscription Plans & Pricing

ReplyDesk AI provides transparent, affordable monthly plans tailored to online merchants at every stage:

| Plan | Price | Included Quotas & Perks |
|---|---|---|
| **Starter Free** | **$0 / month** | 20 replies, 5 FAQs, 5 product descriptions, 15 translations / mo. Standard web packing slips. |
| **Solo Seller** *(Most Popular)* | **$2.70 / month** | **200 AI replies**, **30 FAQ generations**, **50 product descriptions**, **100 translations** / mo. Cultural etiquette notes, customs declarations, Markdown/HTML export. |
| **Elite Global Brand** | **$8.90 / month** | **1,000 AI replies**, **150 FAQ generations**, **200 product descriptions**, **500 translations** / mo. Custom 4x6" thermal labels, batch print, priority AI processing. |

---

## Seller Services

### 1. International Printing Services
- **Customs-Ready Packing Slips:** Pre-filled with Harmonized System (HS) tariff codes, declared merchandise values, order dates, destination country flags, and itemized lines.
- **Product Care Cards & Inserts:** Formatted 4x6" inserts with dishwasher, microwave, and cleaning guidelines for international buyers.
- **Return Authorization Labels:** Clear return instructions with return window deadlines and parcel tracking numbers.
- **Dedicated Print Stylesheet:** Clean black-and-white print output (`window.print()`) that hides web navigation and sidebar automatically.

### 2. Feedback Hub & Review Copilot
- **Merchant Feedback System:** In-app feature request and bug report submission with star ratings and category tagging.
- **Customer Review Response Copilot:** Generates gracious, grounded public responses to 5-star praise or sensitive 2-star shipping complaints, maintaining brand voice while honoring actual store policies.

---

## How to Test the Application

1. **Dashboard:** Review profile grounding status, the $2.70/month Solo Seller spotlight, and monthly quota progress meters.
2. **Demo Mode:** Toggle Demo Mode in the sidebar or banner to populate fictional "Komorebi Ceramics Studio" data.
3. **Test Feature 1 (Reply Generator):** Click the "🇩🇪 German Customs" sample question, pick your tone and language, and click "Generate Customer Response". Notice how it checks Frankfurt customs policies and flags any unstated facts without inventing them.
4. **Test Feature 2 (FAQ Builder):** Click "Generate 10 Store FAQs" to see grounded questions with green verification badges and flagged items requiring merchant policy details.
5. **Test Feature 3 (Product Writer):** Load the "Speckled Stoneware Ramen Bowl" sample to generate both concise catalog copy and long-form bulleted product descriptions.
6. **Test Feature 4 (Translator):** Select a sample message and translate into German, French, Spanish, or Japanese with regional cultural etiquette notes.
7. **Test Printing Services:** Choose an international order, customize item lines or customs HS codes, and click "Print Document" to preview the print-optimized slip.
8. **Test Feedback Hub:** Submit merchant app feedback or test the Review Copilot with positive/critical customer feedback.
9. **Test Plans & Pricing:** Switch between Free ($0), Solo Seller ($2.70), and Elite ($8.90) plans to see live quota allowance updates across your workspace.
