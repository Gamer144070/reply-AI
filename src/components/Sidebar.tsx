import React from 'react';
import {
  LayoutDashboard,
  Building2,
  MessageSquareText,
  HelpCircle,
  Sparkles,
  Languages,
  Printer,
  MessageSquareHeart,
  CreditCard,
  ShieldCheck,
  CheckCircle2,
  X,
  Zap,
  Bot,
  Wand2,
  Gamepad2,
  Database,
} from 'lucide-react';
import { BusinessProfile, PlanUsage } from '../types';
import { PLAN_CONFIGS } from '../data/defaultData';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isMobileOpen: boolean;
  setIsMobileOpen: (open: boolean) => void;
  businessProfile: BusinessProfile;
  isDemoMode: boolean;
  setIsDemoMode: (val: boolean) => void;
  planUsage: PlanUsage;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  isMobileOpen,
  setIsMobileOpen,
  businessProfile,
  isDemoMode,
  setIsDemoMode,
  planUsage,
}) => {
  const currentPlan = PLAN_CONFIGS[planUsage.currentTier];

  const mainFeatures = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      description: 'Overview & metrics',
    },
    {
      id: 'business-profile',
      label: 'Business Profile',
      icon: Building2,
      description: 'Your grounded knowledge base',
    },
    {
      id: 'reply-generator',
      label: 'Reply Generator',
      icon: MessageSquareText,
      tag: 'Feature 1',
      description: 'Multilingual customer replies',
    },
    {
      id: 'faq-builder',
      label: 'FAQ Builder',
      icon: HelpCircle,
      tag: 'Feature 2',
      description: '10 grounded store FAQs',
    },
    {
      id: 'product-writer',
      label: 'Product Writer',
      icon: Sparkles,
      tag: 'Feature 3',
      description: 'Concise & long descriptions',
    },
    {
      id: 'translator',
      label: 'Translator',
      icon: Languages,
      tag: 'Feature 4',
      description: 'Faithful cross-border translation',
    },
  ];

  const businessServices = [
    {
      id: 'printing-services',
      label: 'Printing Services',
      icon: Printer,
      tag: 'New',
      description: 'Packing slips & care labels',
    },
    {
      id: 'feedback-hub',
      label: 'Feedback Hub',
      icon: MessageSquareHeart,
      description: 'App feedback & review copilot',
    },
    {
      id: 'pricing',
      label: 'Plans & Pricing',
      icon: CreditCard,
      badge: currentPlan.price + currentPlan.period,
      description: 'Free, Paid ($2.70), & Elite',
    },
  ];

  const aiCreativeFeatures = [
    {
      id: 'chatbot',
      label: 'Gemini Copilot',
      icon: Bot,
      tag: 'Carbon · Maps',
      description: 'Multi-turn chat & live grounding',
    },
    {
      id: 'multimodal-studio',
      label: 'Multimodal AI Studio',
      icon: Wand2,
      tag: 'Omni · Lyria',
      description: 'Voice transcribe, audio, video & image',
    },
    {
      id: 'flight-game',
      label: 'Parcel Express 3D',
      icon: Gamepad2,
      tag: '60fps',
      description: 'Interactive Three.js flight runner',
    },
  ];

  const handleNavClick = (id: string) => {
    setActiveTab(id);
    setIsMobileOpen(false);
  };

  // Calculate profile completeness percentage
  const fields = [
    businessProfile.businessName,
    businessProfile.businessCategory,
    businessProfile.productInformation,
    businessProfile.deliveryPolicy,
    businessProfile.returnPolicy,
    businessProfile.contactDetails,
  ];
  const filledCount = fields.filter((f) => f && f.trim().length > 0).length;
  const completenessPercent = Math.round((filledCount / fields.length) * 100);

  return (
    <>
      {/* Mobile backdrop */}
      {isMobileOpen && (
        <div
          onClick={() => setIsMobileOpen(false)}
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-40 lg:hidden"
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-72 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="h-16 px-6 flex items-center justify-between border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600 dark:bg-blue-500 text-white flex items-center justify-center font-bold text-base shadow-xs">
              R
            </div>
            <div>
              <div className="text-base font-bold text-slate-900 dark:text-white tracking-tight">
                ReplyDesk AI Studio
              </div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400 font-medium tracking-tight">
                Customer AI & Creative Suite
              </div>
            </div>
          </div>
          <button
            onClick={() => setIsMobileOpen(false)}
            className="lg:hidden p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            aria-label="Close sidebar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation list */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-4">
          <div className="space-y-1">
            <div className="px-3 pb-1 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Core Assistant
            </div>

            {mainFeatures.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium text-left transition-colors relative ${
                    isActive
                      ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-semibold'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                  }`}
                >
                  <Icon
                    className={`w-4 h-4 shrink-0 ${
                      isActive ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400 dark:text-slate-500'
                    }`}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="truncate">{item.label}</span>
                      {item.tag && (
                        <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono">
                          {item.tag}
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          <div className="space-y-1 pt-2 border-t border-slate-100 dark:border-slate-800">
            <div className="px-3 pb-1 text-[11px] font-semibold text-purple-600 dark:text-purple-400 uppercase tracking-wider flex items-center justify-between">
              <span>AI Labs & 3D Flight</span>
              <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-purple-100 dark:bg-purple-950 font-bold">New</span>
            </div>

            {aiCreativeFeatures.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium text-left transition-colors relative ${
                    isActive
                      ? 'bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 font-semibold'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                  }`}
                >
                  <Icon
                    className={`w-4 h-4 shrink-0 ${
                      isActive ? 'text-purple-600 dark:text-purple-400' : 'text-slate-400 dark:text-slate-500'
                    }`}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="truncate">{item.label}</span>
                      {item.tag && (
                        <span className="text-[10px] text-purple-600 dark:text-purple-400 font-mono font-semibold">
                          {item.tag}
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          <div className="space-y-1 pt-2 border-t border-slate-100 dark:border-slate-800">
            <div className="px-3 pb-1 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Seller Services
            </div>

            {businessServices.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium text-left transition-colors relative ${
                    isActive
                      ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-semibold'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                  }`}
                >
                  <Icon
                    className={`w-4 h-4 shrink-0 ${
                      isActive ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400 dark:text-slate-500'
                    }`}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="truncate">{item.label}</span>
                      {item.badge ? (
                        <span className="text-[10px] font-mono font-bold text-blue-600 dark:text-blue-400">
                          {item.badge}
                        </span>
                      ) : item.tag ? (
                        <span className="text-[10px] text-blue-600 dark:text-blue-400 font-semibold">
                          {item.tag}
                        </span>
                      ) : null}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Profile Health Indicator Card */}
          <div className="pt-2 px-1">
            <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-lg border border-slate-200 dark:border-slate-700/80 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  Profile Grounding
                </span>
                <span className="font-mono text-blue-600 dark:text-blue-400 font-semibold">
                  {completenessPercent}%
                </span>
              </div>
              <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-blue-600 dark:bg-blue-500 h-1.5 rounded-full transition-all duration-300"
                  style={{ width: `${completenessPercent}%` }}
                />
              </div>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-tight">
                {completenessPercent === 100
                  ? 'All policies set. Answers strictly grounded.'
                  : `${fields.length - filledCount} fields needed to prevent AI asking for details.`}
              </p>
            </div>
          </div>
        </div>

        {/* Plan & Demo Mode Footer */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 space-y-3 bg-slate-50/50 dark:bg-slate-900/50">
          {/* Active Plan Card with Quick Switch */}
          <button
            onClick={() => handleNavClick('pricing')}
            className="w-full p-2.5 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 flex items-center justify-between text-left hover:border-blue-400 transition-colors"
          >
            <div>
              <div className="text-[10px] uppercase font-bold text-slate-400">
                Current Subscription
              </div>
              <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5 mt-0.5">
                <Zap className="w-3.5 h-3.5 text-blue-600" />
                <span>{currentPlan.name}</span>
              </div>
            </div>
            <div className="text-right">
              <div className="text-xs font-bold font-mono text-blue-600 dark:text-blue-400">
                {currentPlan.price}{currentPlan.period}
              </div>
              <div className="text-[10px] text-slate-400">Change</div>
            </div>
          </button>

          {/* Demo Mode Toggle */}
          <div className="flex items-center justify-between text-xs">
            <span className="font-medium text-slate-700 dark:text-slate-300">
              Demo Mode
            </span>
            <button
              onClick={() => setIsDemoMode(!isDemoMode)}
              className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                isDemoMode ? 'bg-blue-600' : 'bg-slate-300 dark:bg-slate-700'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-xs ring-0 transition duration-200 ease-in-out ${
                  isDemoMode ? 'translate-x-4' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          <div className="text-[10px] text-slate-500 dark:text-slate-400 flex items-start gap-1.5 leading-snug">
            <ShieldCheck className="w-3.5 h-3.5 text-blue-500 shrink-0 mt-0.5" />
            <span>Server-side Gemini · 0 data stored · Drafts only</span>
          </div>
        </div>
      </aside>
    </>
  );
};
