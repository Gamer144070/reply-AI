import React, { useState } from 'react';
import {
  Building2,
  Save,
  RotateCcw,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Info,
} from 'lucide-react';
import { BusinessProfile } from '../types';
import { FICTIONAL_DEMO_PROFILE, EMPTY_PROFILE } from '../data/defaultData';

interface BusinessProfileViewProps {
  businessProfile: BusinessProfile;
  onSaveProfile: (profile: BusinessProfile) => void;
  onNavigateToStudio: () => void;
  isDemoMode: boolean;
  setIsDemoMode: (val: boolean) => void;
}

export const BusinessProfileView: React.FC<BusinessProfileViewProps> = ({
  businessProfile,
  onSaveProfile,
  onNavigateToStudio,
  isDemoMode,
  setIsDemoMode,
}) => {
  const [formData, setFormData] = useState<BusinessProfile>(businessProfile);
  const [savedNotice, setSavedNotice] = useState(false);

  const handleInputChange = (field: keyof BusinessProfile, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveProfile(formData);
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 2500);
  };

  const handleLoadDemo = () => {
    setFormData(FICTIONAL_DEMO_PROFILE);
    onSaveProfile(FICTIONAL_DEMO_PROFILE);
    setIsDemoMode(true);
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 2500);
  };

  const handleClear = () => {
    setFormData(EMPTY_PROFILE);
    onSaveProfile(EMPTY_PROFILE);
    setIsDemoMode(false);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-bold text-slate-900 dark:text-white">
              Business Profile
            </h1>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              · Entered Once to Power All 4 Features
            </span>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 max-w-2xl leading-relaxed">
            The AI uses ONLY the facts you provide here. It will never invent
            product prices, unstated delivery times, or refund guarantees. If a
            customer asks about something missing, ReplyDesk AI flags it clearly.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={handleLoadDemo}
            className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300 hover:bg-blue-100 transition-colors flex items-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Load Fictional Demo Profile</span>
          </button>
          <button
            type="button"
            onClick={handleClear}
            className="px-3 py-1.5 text-xs font-medium rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            Clear Form
          </button>
        </div>
      </div>

      {/* Main Profile Form */}
      <form onSubmit={handleSave} className="space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* 1. Business Name */}
          <div className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                1. Business Name
              </label>
              <span className="text-[11px] font-mono text-slate-400">
                {formData.businessName.length} chars
              </span>
            </div>
            <input
              type="text"
              required
              value={formData.businessName}
              onChange={(e) => handleInputChange('businessName', e.target.value)}
              placeholder="e.g. Komorebi Ceramics Studio"
              className="w-full text-xs sm:text-sm p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Your official brand name used in customer greetings and sign-offs.
            </p>
          </div>

          {/* 2. Business Category */}
          <div className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                2. Business Category
              </label>
              <span className="text-[11px] font-mono text-slate-400">
                {formData.businessCategory.length} chars
              </span>
            </div>
            <input
              type="text"
              required
              value={formData.businessCategory}
              onChange={(e) => handleInputChange('businessCategory', e.target.value)}
              placeholder="e.g. Handcrafted Pottery & Tableware"
              className="w-full text-xs sm:text-sm p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Helps the AI adapt domain vocabulary (e.g. ceramics vs apparel vs roasted coffee).
            </p>
          </div>
        </div>

        {/* 3. Product Information */}
        <div className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <div>
              <label className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                3. Product Information (Materials, Specs, Care, Safety)
              </label>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                List factual features, materials, size standards, and safety ratings. The AI will never claim unlisted specs.
              </p>
            </div>
            <span className="text-[11px] font-mono text-slate-400">
              {formData.productInformation.length} chars
            </span>
          </div>
          <textarea
            rows={3}
            required
            value={formData.productInformation}
            onChange={(e) => handleInputChange('productInformation', e.target.value)}
            placeholder="e.g. Stoneware mugs (350ml), ramen bowls (18cm). Lead-free iron clay, dishwasher and microwave safe..."
            className="w-full text-xs sm:text-sm p-3 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 leading-relaxed font-sans"
          />
        </div>

        {/* 4. Delivery Policy */}
        <div className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <div>
              <label className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                4. Delivery & Shipping Policy (US, UK, Canada, Australia & Global)
              </label>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Specify dispatch handling days, carriers (USPS, DHL, Royal Mail), and realistic international transit times.
              </p>
            </div>
            <span className="text-[11px] font-mono text-slate-400">
              {formData.deliveryPolicy.length} chars
            </span>
          </div>
          <textarea
            rows={3}
            required
            value={formData.deliveryPolicy}
            onChange={(e) => handleInputChange('deliveryPolicy', e.target.value)}
            placeholder="e.g. Dispatches in 2-3 business days. US: 3-5 days via USPS ($6). UK, Canada, Australia: 7-12 days via DHL ($18)..."
            className="w-full text-xs sm:text-sm p-3 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 leading-relaxed font-sans"
          />
        </div>

        {/* 5. Return Policy */}
        <div className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <div>
              <label className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                5. Return & Refund Policy (Window, Postage, Damage Resolution)
              </label>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Define the return timeframe, who pays postage, and your procedure for items damaged during transit.
              </p>
            </div>
            <span className="text-[11px] font-mono text-slate-400">
              {formData.returnPolicy.length} chars
            </span>
          </div>
          <textarea
            rows={3}
            required
            value={formData.returnPolicy}
            onChange={(e) => handleInputChange('returnPolicy', e.target.value)}
            placeholder="e.g. 30-day returns for unused items. Buyer pays return shipping. Free replacement for damaged items with 2 photos within 7 days..."
            className="w-full text-xs sm:text-sm p-3 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 leading-relaxed font-sans"
          />
        </div>

        {/* 6. Contact Details & Preferred Tone */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                6. Contact Details & Support Hours
              </label>
              <span className="text-[11px] font-mono text-slate-400">
                {formData.contactDetails.length} chars
              </span>
            </div>
            <input
              type="text"
              required
              value={formData.contactDetails}
              onChange={(e) => handleInputChange('contactDetails', e.target.value)}
              placeholder="e.g. hello@komorebiceramics.com, Mon-Fri 9am-5pm EST"
              className="w-full text-xs sm:text-sm p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Support email address and hours shown to customers when human escalation is required.
            </p>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                7. Preferred Brand Tone
              </label>
            </div>
            <select
              value={formData.preferredTone}
              onChange={(e) =>
                handleInputChange('preferredTone', e.target.value as any)
              }
              className="w-full text-xs sm:text-sm p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="Friendly">Friendly (Warm, approachable, community-oriented)</option>
              <option value="Professional">Professional (Crisp, polite, corporate)</option>
              <option value="Concise">Concise (Fast, brief, directly to the point)</option>
              <option value="Empathetic">Empathetic (Deeply caring, apologetic when needed)</option>
            </select>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Sets the default tone baseline across all AI-generated drafts.
            </p>
          </div>
        </div>

        {/* Save Bar */}
        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center gap-2">
            {savedNotice && (
              <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5 animate-in fade-in duration-200">
                <CheckCircle2 className="w-4 h-4" />
                <span>Profile updated & saved locally!</span>
              </span>
            )}
          </div>

          <button
            type="submit"
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold text-xs sm:text-sm shadow-xs transition-colors flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            <span>Save Business Profile</span>
          </button>
        </div>
      </form>
    </div>
  );
};
