import React, { useState } from 'react';
import {
  HelpCircle,
  Sparkles,
  Copy,
  Check,
  AlertTriangle,
  RefreshCw,
  ShieldAlert,
  ShieldCheck,
  Edit3,
  Search,
  Filter,
} from 'lucide-react';
import { BusinessProfile, FaqItem, FaqBuilderResponse } from '../types';
import { DEMO_FAQS } from '../data/defaultData';
import { postApiJson } from '../utils/apiClient';

interface FaqBuilderViewProps {
  businessProfile: BusinessProfile;
  isDemoMode: boolean;
  onUsageIncrement?: () => void;
}

export const FaqBuilderView: React.FC<FaqBuilderViewProps> = ({
  businessProfile,
  isDemoMode,
  onUsageIncrement,
}) => {
  const [faqs, setFaqs] = useState<FaqItem[]>(isDemoMode ? DEMO_FAQS : []);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [completenessRating, setCompletenessRating] = useState<string>(
    isDemoMode ? 'Store policies cover primary shipping and return workflows.' : ''
  );

  const [copiedId, setCopiedId] = useState<number | null>(null);
  const [copiedAll, setCopiedAll] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const handleGenerateFaqs = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await postApiJson<FaqBuilderResponse>('/api/build-faq', {
        businessProfile,
      });

      setFaqs(data.faqs || []);
      setCompletenessRating(data.overallCompletenessRating || '');
      onUsageIncrement?.();
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to generate FAQs.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateFaq = (id: number, field: 'question' | 'answer', val: string) => {
    setFaqs((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [field]: val } : item))
    );
  };

  const handleCopySingle = (faq: FaqItem) => {
    const text = `Q: ${faq.question}\nA: ${faq.answer}`;
    navigator.clipboard.writeText(text);
    setCopiedId(faq.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleCopyAll = () => {
    const markdown = faqs
      .map(
        (f) =>
          `### ${f.question}\n**Category:** ${f.category}\n\n${f.answer}\n\n*Status:* ${
            f.isFactSupported ? 'Supported' : 'Requires merchant verification: ' + f.missingFactNotice
          }\n`
      )
      .join('\n---\n\n');

    navigator.clipboard.writeText(markdown);
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 2000);
  };

  const categories = ['All', ...Array.from(new Set(faqs.map((f) => f.category)))];

  const filteredFaqs = faqs.filter((faq) => {
    const matchesSearch =
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategory === 'All' || faq.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const supportedCount = faqs.filter((f) => f.isFactSupported).length;
  const unsupportedCount = faqs.length - supportedCount;

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-bold text-slate-900 dark:text-white">
              Feature 2: FAQ Builder
            </h1>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              · 10 Store Frequently Asked Questions
            </span>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 max-w-2xl leading-relaxed">
            Generate 10 essential customer questions based strictly on your supplied
            business details. If an answer cannot be verified from your profile, it is
            explicitly flagged rather than invented.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleGenerateFaqs}
            disabled={isLoading}
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors flex items-center gap-2 disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Building 10 FAQs...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>{faqs.length > 0 ? 'Regenerate 10 FAQs' : 'Generate 10 Store FAQs'}</span>
              </>
            )}
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900 rounded-xl text-xs text-red-700 dark:text-red-300 flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Summary Stats & Grounding Bar */}
      {faqs.length > 0 && (
        <div className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3 text-xs">
            <span className="font-semibold text-slate-800 dark:text-slate-200">
              10 Generated Questions:
            </span>
            <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
              <ShieldCheck className="w-4 h-4" />
              <span>{supportedCount} fully grounded</span>
            </span>
            {unsupportedCount > 0 && (
              <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400 font-medium">
                <ShieldAlert className="w-4 h-4" />
                <span>{unsupportedCount} flagged (missing profile facts)</span>
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyAll}
              className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 transition-colors flex items-center gap-1.5"
            >
              {copiedAll ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedAll ? 'Copied All as Markdown!' : 'Copy All 10 FAQs'}</span>
            </button>
          </div>
        </div>
      )}

      {/* Search & Category Filter */}
      {faqs.length > 0 && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search FAQs by keyword..."
              className="w-full text-xs pl-9 pr-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
            <span className="text-xs text-slate-400 font-medium whitespace-nowrap mr-1">
              Category:
            </span>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-2.5 py-1 text-xs rounded-md whitespace-nowrap transition-colors ${
                  selectedCategory === cat
                    ? 'bg-blue-600 text-white font-medium'
                    : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 border border-slate-200 dark:border-slate-700'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {faqs.length === 0 && !isLoading && (
        <div className="bg-white dark:bg-slate-900 rounded-xl p-12 border border-dashed border-slate-300 dark:border-slate-700 text-center flex flex-col items-center justify-center min-h-[360px]">
          <div className="w-12 h-12 rounded-full bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-3">
            <HelpCircle className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
            No FAQs Generated Yet
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mt-1">
            Click <strong>"Generate 10 Store FAQs"</strong> above. ReplyDesk AI will review your
            business profile and generate 10 questions covering shipping, returns, product care, and ordering.
          </p>
        </div>
      )}

      {/* FAQ Items Grid */}
      <div className="space-y-4">
        {filteredFaqs.map((faq) => (
          <div
            key={faq.id}
            className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3"
          >
            {/* Header: Category & Grounding Badge */}
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                  {faq.category}
                </span>

                {faq.isFactSupported ? (
                  <span className="text-[11px] font-medium text-emerald-700 dark:text-emerald-400 flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Fact-Grounded</span>
                  </span>
                ) : (
                  <span className="text-[11px] font-medium text-amber-700 dark:text-amber-400 flex items-center gap-1">
                    <ShieldAlert className="w-3.5 h-3.5" />
                    <span>Flagged: {faq.missingFactNotice}</span>
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleCopySingle(faq)}
                  className="px-2.5 py-1 text-xs rounded-md bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors flex items-center gap-1"
                >
                  {copiedId === faq.id ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-500" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      <span>Copy Q&A</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Editable Question */}
            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Question
              </label>
              <input
                type="text"
                value={faq.question}
                onChange={(e) => handleUpdateFaq(faq.id, 'question', e.target.value)}
                className="w-full text-xs sm:text-sm font-semibold p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 mt-1"
              />
            </div>

            {/* Editable Answer */}
            <div>
              <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                <span>Answer (Editable)</span>
                <span className="font-mono">{faq.answer.length} chars</span>
              </div>
              <textarea
                rows={3}
                value={faq.answer}
                onChange={(e) => handleUpdateFaq(faq.id, 'answer', e.target.value)}
                className="w-full text-xs sm:text-sm p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 font-sans leading-relaxed"
              />
            </div>

            {/* If missing facts, show clarification tip */}
            {!faq.isFactSupported && (
              <div className="p-2.5 bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/40 rounded-lg text-[11px] text-amber-800 dark:text-amber-300">
                <strong>Merchant Note:</strong> {faq.missingFactNotice}. You can edit the answer above
                to supply the exact details before publishing to your store.
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
