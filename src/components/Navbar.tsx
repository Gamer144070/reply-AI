import React from 'react';
import { Menu, Sun, Moon, Store, ArrowRight, Shield } from 'lucide-react';
import { BusinessProfile, PlanUsage } from '../types';
import { PLAN_CONFIGS } from '../data/defaultData';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenMobileSidebar: () => void;
  businessProfile: BusinessProfile;
  darkMode: boolean;
  toggleDarkMode: () => void;
  isDemoMode: boolean;
  planUsage: PlanUsage;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  onOpenMobileSidebar,
  businessProfile,
  darkMode,
  toggleDarkMode,
  isDemoMode,
  planUsage,
}) => {
  const currentPlan = PLAN_CONFIGS[planUsage.currentTier];

  const getTabLabel = (tab: string) => {
    switch (tab) {
      case 'dashboard':
        return 'Dashboard';
      case 'business-profile':
        return 'Business Profile';
      case 'reply-generator':
        return 'Feature 1: Reply Generator';
      case 'faq-builder':
        return 'Feature 2: FAQ Builder';
      case 'product-writer':
        return 'Feature 3: Product Description Writer';
      case 'translator':
        return 'Feature 4: Cross-Border Translator';
      case 'printing-services':
        return 'Printing Services (Packing Slips & Care Cards)';
      case 'feedback-hub':
        return 'Feedback Hub & Review Copilot';
      case 'pricing':
        return 'Plans & Pricing ($2.70 / mo)';
      default:
        return 'Dashboard';
    }
  };

  return (
    <header className="sticky top-0 z-30 h-16 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="h-full px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
        {/* Left: Mobile hamburger + Breadcrumb */}
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenMobileSidebar}
            className="lg:hidden p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
            aria-label="Open sidebar"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            <span className="hidden sm:inline font-medium">ReplyDesk AI</span>
            <span className="hidden sm:inline" aria-hidden="true">
              /
            </span>
            <span className="font-semibold text-slate-900 dark:text-white">
              {getTabLabel(activeTab)}
            </span>
          </div>
        </div>

        {/* Right: Store badge, demo pill, theme toggle, quick action */}
        <div className="flex items-center gap-2.5">
          {isDemoMode && (
            <span className="px-2 py-0.5 text-[11px] font-semibold bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300 border border-amber-300 dark:border-amber-800 rounded-md">
              Demo Mode Active
            </span>
          )}

          {/* Active Store Indicator */}
          <button
            onClick={() => setActiveTab('business-profile')}
            className="hidden md:flex items-center gap-1.5 px-2.5 py-1 text-xs text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors max-w-[180px] truncate"
            title="Click to view/edit Business Profile"
          >
            <Store className="w-3.5 h-3.5 text-blue-600 shrink-0" />
            <span className="truncate font-medium">
              {businessProfile.businessName || 'Configure Store'}
            </span>
          </button>

          {/* Active Plan Indicator */}
          <button
            onClick={() => setActiveTab('pricing')}
            className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-lg bg-blue-50 text-blue-700 dark:bg-blue-950/70 dark:text-blue-300 border border-blue-200 dark:border-blue-800 hover:border-blue-400 transition-colors"
            title="View subscription quotas and plans"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
            <span>{currentPlan.name} · {currentPlan.price}{currentPlan.period}</span>
          </button>

          {/* Dark / Light Toggle */}
          <button
            onClick={toggleDarkMode}
            aria-label="Toggle theme"
            className="p-2 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* Quick CTA to jump to generator */}
          {activeTab !== 'reply-generator' && (
            <button
              onClick={() => setActiveTab('reply-generator')}
              className="px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 rounded-lg shadow-xs transition-colors flex items-center gap-1.5"
            >
              <span>Draft Reply</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
