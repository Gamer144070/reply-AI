import React from 'react';
import {
  Check,
  Zap,
  Sparkles,
  Shield,
  CreditCard,
  Crown,
  HelpCircle,
  ArrowRight,
} from 'lucide-react';
import { PlanTier, PlanUsage } from '../types';
import { PLAN_CONFIGS } from '../data/defaultData';

interface PricingViewProps {
  planUsage: PlanUsage;
  onSelectTier: (tier: PlanTier) => void;
  onNavigateToStudio: () => void;
}

export const PricingView: React.FC<PricingViewProps> = ({
  planUsage,
  onSelectTier,
  onNavigateToStudio,
}) => {
  const currentPlan = PLAN_CONFIGS[planUsage.currentTier];

  return (
    <div className="space-y-8">
      {/* Hero Pricing Header */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 text-xs font-semibold border border-blue-200 dark:border-blue-800">
          <Zap className="w-3.5 h-3.5" />
          <span>Simple, Honest Pricing For Independent Sellers</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
          Spend less time writing customer replies.
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed text-balance">
          Create professional customer responses, FAQs, and product descriptions in seconds.
          Upgrade or downgrade at any time with zero long-term commitments.
        </p>
      </div>

      {/* 3 Plans Tier Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
        {(['free', 'paid', 'elite'] as PlanTier[]).map((tierKey) => {
          const plan = PLAN_CONFIGS[tierKey];
          const isCurrent = planUsage.currentTier === tierKey;

          return (
            <div
              key={plan.id}
              className={`rounded-2xl p-6 sm:p-7 flex flex-col justify-between transition-all duration-200 relative ${
                plan.isPopular
                  ? 'bg-white dark:bg-slate-900 border-2 border-blue-600 dark:border-blue-500 shadow-md ring-4 ring-blue-50 dark:ring-blue-950/40'
                  : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs'
              }`}
            >
              {plan.isPopular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-blue-600 text-white text-[10px] font-bold uppercase tracking-wider shadow-xs">
                  Most Popular · Highly Recommended
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between">
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">
                      {plan.name}
                    </h3>
                    <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                      {plan.badge}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 min-h-[32px]">
                    {plan.targetAudience}
                  </p>
                </div>

                {/* Price Display */}
                <div className="flex items-baseline gap-1 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <span className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                    {plan.price}
                  </span>
                  <span className="text-xs text-slate-500 font-medium">
                    {plan.period}
                  </span>
                </div>

                {/* Monthly Quota Summary Matrix */}
                <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-100 dark:border-slate-800 space-y-2 text-xs">
                  <span className="font-semibold text-slate-800 dark:text-slate-200 text-[11px] uppercase tracking-wider block">
                    Monthly Quota Limits:
                  </span>
                  <div className="space-y-1 text-slate-600 dark:text-slate-300 text-xs">
                    <div className="flex items-center justify-between">
                      <span>AI Customer Replies:</span>
                      <span className="font-bold font-mono text-slate-900 dark:text-white">
                        {plan.limits.replies} / mo
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>FAQ Generations:</span>
                      <span className="font-bold font-mono text-slate-900 dark:text-white">
                        {plan.limits.faqs} / mo
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Product Descriptions:</span>
                      <span className="font-bold font-mono text-slate-900 dark:text-white">
                        {plan.limits.products} / mo
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Translations:</span>
                      <span className="font-bold font-mono text-slate-900 dark:text-white">
                        {plan.limits.translations} / mo
                      </span>
                    </div>
                  </div>
                </div>

                {/* Features list */}
                <ul className="space-y-2.5 text-xs text-slate-600 dark:text-slate-400 pt-1">
                  {plan.features.map((feat, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Action Button */}
              <div className="pt-6">
                <button
                  type="button"
                  onClick={() => onSelectTier(plan.id)}
                  disabled={isCurrent}
                  className={`w-full py-2.5 px-4 rounded-xl text-xs font-semibold shadow-xs transition-colors flex items-center justify-center gap-2 ${
                    isCurrent
                      ? 'bg-slate-100 dark:bg-slate-800 text-slate-500 cursor-default'
                      : plan.isPopular
                      ? 'bg-blue-600 hover:bg-blue-700 text-white'
                      : 'bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900'
                  }`}
                >
                  {isCurrent ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-500" />
                      <span>Active Current Plan</span>
                    </>
                  ) : (
                    <>
                      <span>Select {plan.name}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Current Real-Time Usage Meters */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 sm:p-7 border border-slate-200 dark:border-slate-800 shadow-xs max-w-4xl mx-auto space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">
              Your Current Monthly Plan Usage ({currentPlan.name} · {currentPlan.price}{currentPlan.period})
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Credits refresh at the start of each monthly billing cycle.
            </p>
          </div>
          <button
            onClick={onNavigateToStudio}
            className="px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300 hover:bg-blue-100 transition-colors shrink-0"
          >
            Draft a Customer Reply
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              label: 'AI Customer Replies',
              used: planUsage.repliesUsed,
              limit: currentPlan.limits.replies,
            },
            {
              label: 'FAQ Generations',
              used: planUsage.faqsUsed,
              limit: currentPlan.limits.faqs,
            },
            {
              label: 'Product Descriptions',
              used: planUsage.productsUsed,
              limit: currentPlan.limits.products,
            },
            {
              label: 'Translations',
              used: planUsage.translationsUsed,
              limit: currentPlan.limits.translations,
            },
          ].map((item) => {
            const percent = Math.min(100, Math.round((item.used / item.limit) * 100));
            return (
              <div
                key={item.label}
                className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2 text-xs"
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium text-slate-700 dark:text-slate-300">
                    {item.label}
                  </span>
                  <span className="font-mono text-slate-900 dark:text-white font-bold">
                    {item.used} / {item.limit}
                  </span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-blue-600 h-1.5 rounded-full transition-all duration-300"
                    style={{ width: `${percent}%` }}
                  />
                </div>
                <div className="text-[10px] text-slate-500 flex justify-between">
                  <span>{percent}% used</span>
                  <span>{item.limit - item.used} remaining</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
