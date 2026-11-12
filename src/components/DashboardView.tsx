import React from 'react';
import {
  MessageSquareText,
  HelpCircle,
  Sparkles,
  Languages,
  ShieldCheck,
  Building2,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Globe2,
  Zap,
  Printer,
  MessageSquareHeart,
  CreditCard,
} from 'lucide-react';
import { BusinessProfile, PlanUsage } from '../types';
import { SAMPLE_CUSTOMER_QUESTIONS, PLAN_CONFIGS } from '../data/defaultData';

interface DashboardViewProps {
  businessProfile: BusinessProfile;
  setActiveTab: (tab: string) => void;
  isDemoMode: boolean;
  setIsDemoMode: (val: boolean) => void;
  onSelectSampleQuestion: (question: string, name: string) => void;
  planUsage: PlanUsage;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  businessProfile,
  setActiveTab,
  isDemoMode,
  setIsDemoMode,
  onSelectSampleQuestion,
  planUsage,
}) => {
  const currentPlan = PLAN_CONFIGS[planUsage.currentTier];

  // Check required profile fields
  const checks = [
    { name: 'Business Name', filled: !!businessProfile.businessName.trim() },
    { name: 'Category & Niche', filled: !!businessProfile.businessCategory.trim() },
    { name: 'Product Details', filled: !!businessProfile.productInformation.trim() },
    { name: 'Delivery Policy (US, UK, CA, AU)', filled: !!businessProfile.deliveryPolicy.trim() },
    { name: 'Return & Damage Policy', filled: !!businessProfile.returnPolicy.trim() },
    { name: 'Contact Details', filled: !!businessProfile.contactDetails.trim() },
  ];
  const filledCount = checks.filter((c) => c.filled).length;

  const coreFeatures = [
    {
      id: 'reply-generator',
      title: 'Reply Generator',
      tag: 'Feature 1',
      description:
        'Generate grounded customer responses in English, German, French, Spanish, or Japanese. Never invents facts or policies.',
      icon: MessageSquareText,
      badgeText: 'Strictly Fact-Grounded',
      actionText: 'Open Reply Generator',
    },
    {
      id: 'faq-builder',
      title: 'FAQ Builder',
      tag: 'Feature 2',
      description:
        'Automatically generate 10 essential store FAQs based on your supplied details. Unsupported answers are clearly flagged.',
      icon: HelpCircle,
      badgeText: 'Flags Missing Facts',
      actionText: 'Build 10 FAQs',
    },
    {
      id: 'product-writer',
      title: 'Product Description Writer',
      tag: 'Feature 3',
      description:
        'Create concise and long-form product descriptions using only verified features, materials, and price.',
      icon: Sparkles,
      badgeText: 'Zero Hallucinated Claims',
      actionText: 'Write Descriptions',
    },
    {
      id: 'translator',
      title: 'Cross-Border Translator',
      tag: 'Feature 4',
      description:
        'Translate customer messages or policies into 8+ international languages while preserving exact nuance and meaning.',
      icon: Languages,
      badgeText: 'Cultural Etiquette',
      actionText: 'Translate Text',
    },
  ];

  const sellerServices = [
    {
      id: 'printing-services',
      title: 'International Printing Services',
      tag: 'Packaging & Labels',
      description:
        'Print-ready international packing slips with customs declarations, product care insert cards, and return authorization labels.',
      icon: Printer,
      badgeText: 'Print & PDF Ready',
      actionText: 'Open Printing Studio',
    },
    {
      id: 'feedback-hub',
      title: 'Feedback Services',
      tag: 'Reviews & App Feedback',
      description:
        'Submit platform feedback directly to the ReplyDesk AI team, or draft high-converting responses to customer reviews.',
      icon: MessageSquareHeart,
      badgeText: 'Two-Way Feedback',
      actionText: 'Open Feedback Hub',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Hero Welcome Banner */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-xs relative overflow-hidden">
        <div className="max-w-2xl space-y-3 relative z-10">
          <div className="inline-flex items-center gap-2 text-xs font-semibold text-blue-700 dark:text-blue-300">
            <Globe2 className="w-4 h-4 text-blue-600" />
            <span>ReplyDesk AI · Customer Communication Assistant</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Spend less time writing customer replies.
          </h1>

          <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed text-balance">
            Create professional customer responses, FAQs, and product descriptions in seconds
            for independent sellers in the United States, United Kingdom, Canada, Australia, and worldwide.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-3">
            <button
              onClick={() => setActiveTab('reply-generator')}
              className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors flex items-center gap-2"
            >
              <span>Draft a Customer Reply</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => setActiveTab('printing-services')}
              className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-lg text-xs font-semibold transition-colors flex items-center gap-2"
            >
              <Printer className="w-4 h-4 text-blue-600" />
              <span>Print Packing Slips</span>
            </button>

            <button
              onClick={() => setActiveTab('pricing')}
              className="px-3.5 py-2.5 text-xs font-semibold text-blue-700 dark:text-blue-300 hover:underline flex items-center gap-1.5"
            >
              <CreditCard className="w-4 h-4" />
              <span>Plans from $2.70/mo</span>
            </button>
          </div>
        </div>

        {/* Subtle decorative background gradient */}
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-gradient-to-l from-blue-50/60 dark:from-blue-950/20 to-transparent pointer-events-none" />
      </div>

      {/* Subscription Spotlight Card ($2.70 / month) */}
      <div className="bg-gradient-to-r from-blue-50 via-indigo-50 to-white dark:from-blue-950/40 dark:via-slate-900 dark:to-slate-900 rounded-2xl p-5 border border-blue-200 dark:border-blue-900/60 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-blue-600 text-white text-[10px] font-bold uppercase tracking-wider">
              {currentPlan.name}
            </span>
            <span className="text-sm font-extrabold text-slate-900 dark:text-white">
              {currentPlan.price}{currentPlan.period}
            </span>
            <span className="text-xs text-slate-500">· {currentPlan.targetAudience}</span>
          </div>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-700 dark:text-slate-300">
            <span className="font-medium">
              ✓ <strong className="font-mono">{currentPlan.limits.replies}</strong> AI replies
            </span>
            <span className="font-medium">
              ✓ <strong className="font-mono">{currentPlan.limits.faqs}</strong> FAQ generations
            </span>
            <span className="font-medium">
              ✓ <strong className="font-mono">{currentPlan.limits.products}</strong> product descriptions
            </span>
            <span className="font-medium">
              ✓ <strong className="font-mono">{currentPlan.limits.translations}</strong> translations
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={() => setActiveTab('pricing')}
            className="px-3.5 py-2 text-xs font-semibold rounded-lg bg-blue-600 hover:bg-blue-700 text-white shadow-xs transition-colors flex items-center gap-1.5"
          >
            <Zap className="w-3.5 h-3.5" />
            <span>View Free, Paid & Elite Plans</span>
          </button>
        </div>
      </div>

      {/* Safety & Grounding Pledge Strip */}
      <div className="bg-slate-50 dark:bg-slate-900/60 rounded-xl p-4 border border-slate-200 dark:border-slate-800 text-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 text-slate-800 dark:text-slate-200 font-medium">
          <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Strict Factual Integrity & Privacy Architecture</span>
        </div>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-slate-500 dark:text-slate-400">
          <span>· No customer data or messages stored on servers</span>
          <span>· Never invents prices or guarantees</span>
          <span>· Human-in-the-loop review before sending</span>
        </div>
      </div>

      {/* Profile Grounding Status Grid */}
      <div className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">
              Business Profile Grounding Status
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Active Store:{' '}
              <span className="font-semibold text-slate-800 dark:text-slate-200">
                {businessProfile.businessName || 'No store name set'}
              </span>
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs font-mono font-semibold text-slate-700 dark:text-slate-300">
              {filledCount} of {checks.length} facts supplied
            </span>
            <button
              onClick={() => setActiveTab('business-profile')}
              className="text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400 font-medium underline"
            >
              Edit Details
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
          {checks.map((check) => (
            <div
              key={check.name}
              className={`p-2.5 rounded-lg border text-left text-xs space-y-1 ${
                check.filled
                  ? 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700/80 text-slate-800 dark:text-slate-200'
                  : 'bg-amber-50/50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900/40 text-amber-900 dark:text-amber-200'
              }`}
            >
              <div className="flex items-center gap-1.5 font-medium text-[11px]">
                {check.filled ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                ) : (
                  <AlertCircle className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                )}
                <span className="truncate">{check.name}</span>
              </div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400">
                {check.filled ? 'Supplied' : 'Missing'}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 4 Core Features Grid */}
      <div>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Core Communication Features
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {coreFeatures.map((feat) => {
            const Icon = feat.icon;
            return (
              <div
                key={feat.id}
                className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between space-y-4 hover:border-blue-300 dark:hover:border-blue-700 transition-colors group"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="w-9 h-9 rounded-lg bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-[11px] font-mono text-slate-400 dark:text-slate-500">
                      {feat.tag}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {feat.title}
                    </h3>
                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                      {feat.description}
                    </p>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                    {feat.badgeText}
                  </span>
                  <button
                    onClick={() => setActiveTab(feat.id)}
                    className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 flex items-center gap-1"
                  >
                    <span>{feat.actionText}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Seller Services Grid: Printing & Feedback */}
      <div>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Fulfillment & Feedback Services
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {sellerServices.map((feat) => {
            const Icon = feat.icon;
            return (
              <div
                key={feat.id}
                className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between space-y-4 hover:border-blue-300 dark:hover:border-blue-700 transition-colors group"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="w-9 h-9 rounded-lg bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-[11px] font-mono text-slate-400 dark:text-slate-500">
                      {feat.tag}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {feat.title}
                    </h3>
                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                      {feat.description}
                    </p>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                    {feat.badgeText}
                  </span>
                  <button
                    onClick={() => setActiveTab(feat.id)}
                    className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 flex items-center gap-1"
                  >
                    <span>{feat.actionText}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Quick Test Simulator Bar */}
      <div className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-blue-600" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
              Quick Test Inquiries (1-Click Sample Testing)
            </h2>
          </div>
          <span className="text-xs text-slate-400">Click to test in Reply Generator</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
          {SAMPLE_CUSTOMER_QUESTIONS.slice(0, 3).map((sample) => (
            <button
              key={sample.id}
              onClick={() => {
                onSelectSampleQuestion(sample.question, sample.name);
                setActiveTab('reply-generator');
              }}
              className="p-3 text-left bg-slate-50 dark:bg-slate-800/40 hover:bg-blue-50/60 dark:hover:bg-blue-950/40 rounded-lg border border-slate-200 dark:border-slate-800 hover:border-blue-300 dark:hover:border-blue-700 transition-colors group space-y-1"
            >
              <div className="text-xs font-semibold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 flex items-center justify-between">
                <span>{sample.label}</span>
                <span className="text-[10px] font-mono text-slate-400">{sample.language}</span>
              </div>
              <p className="text-[11px] text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">
                "{sample.question}"
              </p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
