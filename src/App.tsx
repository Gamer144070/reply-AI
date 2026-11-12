import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { Navbar } from './components/Navbar';
import { DashboardView } from './components/DashboardView';
import { BusinessProfileView } from './components/BusinessProfileView';
import { ReplyGeneratorView } from './components/ReplyGeneratorView';
import { FaqBuilderView } from './components/FaqBuilderView';
import { ProductDescriptionView } from './components/ProductDescriptionView';
import { TranslatorView } from './components/TranslatorView';
import { PrintingStudioView } from './components/PrintingStudioView';
import { FeedbackHubView } from './components/FeedbackHubView';
import { PricingView } from './components/PricingView';
import { BusinessProfile, PlanTier, PlanUsage } from './types';
import { FICTIONAL_DEMO_PROFILE, EMPTY_PROFILE, DEFAULT_PLAN_USAGE } from './data/defaultData';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState<boolean>(false);
  const [isDemoMode, setIsDemoMode] = useState<boolean>(true);

  // Initialize theme from system or localStorage
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('replydesk_dark_mode');
    if (saved !== null) return saved === 'true';
    return false; // Default clean white background as requested
  });

  // Business profile persistent state
  const [businessProfile, setBusinessProfile] = useState<BusinessProfile>(() => {
    const saved = localStorage.getItem('replydesk_business_profile');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse saved business profile');
      }
    }
    return FICTIONAL_DEMO_PROFILE;
  });

  // Plan usage and subscription state
  const [planUsage, setPlanUsage] = useState<PlanUsage>(() => {
    const saved = localStorage.getItem('replydesk_plan_usage');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse saved plan usage');
      }
    }
    return DEFAULT_PLAN_USAGE;
  });

  // Pre-filled question when jumping from dashboard
  const [selectedSampleQuestion, setSelectedSampleQuestion] = useState<string>('');
  const [selectedCustomerName, setSelectedCustomerName] = useState<string>('');

  // Sync dark mode class on document element
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('replydesk_dark_mode', darkMode.toString());
  }, [darkMode]);

  const toggleDarkMode = () => {
    setDarkMode((prev) => !prev);
  };

  const handleSaveProfile = (updated: BusinessProfile) => {
    setBusinessProfile(updated);
    localStorage.setItem('replydesk_business_profile', JSON.stringify(updated));
  };

  const handleToggleDemoMode = (val: boolean) => {
    setIsDemoMode(val);
    if (val) {
      handleSaveProfile(FICTIONAL_DEMO_PROFILE);
    } else {
      handleSaveProfile(EMPTY_PROFILE);
    }
  };

  const handleSelectPlanTier = (tier: PlanTier) => {
    setPlanUsage((prev) => {
      const updated: PlanUsage = { ...prev, currentTier: tier };
      localStorage.setItem('replydesk_plan_usage', JSON.stringify(updated));
      return updated;
    });
  };

  const handleUsageIncrement = (
    key: 'repliesUsed' | 'faqsUsed' | 'productsUsed' | 'translationsUsed'
  ) => {
    setPlanUsage((prev) => {
      const updated: PlanUsage = { ...prev, [key]: prev[key] + 1 };
      localStorage.setItem('replydesk_plan_usage', JSON.stringify(updated));
      return updated;
    });
  };

  const handleSelectSampleQuestion = (question: string, name: string) => {
    setSelectedSampleQuestion(question);
    setSelectedCustomerName(name);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex font-sans antialiased selection:bg-blue-100 selection:text-blue-900">
      {/* Sidebar Navigation */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isMobileOpen={isMobileSidebarOpen}
        setIsMobileOpen={setIsMobileSidebarOpen}
        businessProfile={businessProfile}
        isDemoMode={isDemoMode}
        setIsDemoMode={handleToggleDemoMode}
        planUsage={planUsage}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-72">
        {/* Top Navbar */}
        <Navbar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onOpenMobileSidebar={() => setIsMobileSidebarOpen(true)}
          businessProfile={businessProfile}
          darkMode={darkMode}
          toggleDarkMode={toggleDarkMode}
          isDemoMode={isDemoMode}
          planUsage={planUsage}
        />

        {/* Viewport Content */}
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          {activeTab === 'dashboard' && (
            <DashboardView
              businessProfile={businessProfile}
              setActiveTab={setActiveTab}
              isDemoMode={isDemoMode}
              setIsDemoMode={handleToggleDemoMode}
              onSelectSampleQuestion={handleSelectSampleQuestion}
              planUsage={planUsage}
            />
          )}

          {activeTab === 'business-profile' && (
            <BusinessProfileView
              businessProfile={businessProfile}
              onSaveProfile={handleSaveProfile}
              onNavigateToStudio={() => setActiveTab('reply-generator')}
              isDemoMode={isDemoMode}
              setIsDemoMode={handleToggleDemoMode}
            />
          )}

          {activeTab === 'reply-generator' && (
            <ReplyGeneratorView
              businessProfile={businessProfile}
              initialQuestion={selectedSampleQuestion}
              initialCustomerName={selectedCustomerName}
              onUsageIncrement={() => handleUsageIncrement('repliesUsed')}
            />
          )}

          {activeTab === 'faq-builder' && (
            <FaqBuilderView
              businessProfile={businessProfile}
              isDemoMode={isDemoMode}
              onUsageIncrement={() => handleUsageIncrement('faqsUsed')}
            />
          )}

          {activeTab === 'product-writer' && (
            <ProductDescriptionView
              businessProfile={businessProfile}
              onUsageIncrement={() => handleUsageIncrement('productsUsed')}
            />
          )}

          {activeTab === 'translator' && (
            <TranslatorView
              onUsageIncrement={() => handleUsageIncrement('translationsUsed')}
            />
          )}

          {activeTab === 'printing-services' && (
            <PrintingStudioView businessProfile={businessProfile} />
          )}

          {activeTab === 'feedback-hub' && (
            <FeedbackHubView businessProfile={businessProfile} />
          )}

          {activeTab === 'pricing' && (
            <PricingView
              planUsage={planUsage}
              onSelectTier={handleSelectPlanTier}
              onNavigateToStudio={() => setActiveTab('reply-generator')}
            />
          )}
        </main>
      </div>
    </div>
  );
}
