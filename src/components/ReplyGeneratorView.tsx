import React, { useState, useEffect } from 'react';
import {
  MessageSquareText,
  Send,
  Copy,
  Check,
  AlertTriangle,
  ShieldAlert,
  Sparkles,
  RefreshCw,
  FileEdit,
  Languages,
  Info,
  CornerDownRight,
  ShieldCheck,
} from 'lucide-react';
import { BusinessProfile, ReplyTone, ReplyResponse } from '../types';
import { SAMPLE_CUSTOMER_QUESTIONS } from '../data/defaultData';
import { postApiJson } from '../utils/apiClient';

interface ReplyGeneratorViewProps {
  businessProfile: BusinessProfile;
  initialQuestion?: string;
  initialCustomerName?: string;
  onUsageIncrement?: () => void;
}

export const ReplyGeneratorView: React.FC<ReplyGeneratorViewProps> = ({
  businessProfile,
  initialQuestion = '',
  initialCustomerName = '',
  onUsageIncrement,
}) => {
  const [customerQuestion, setCustomerQuestion] = useState(
    initialQuestion || SAMPLE_CUSTOMER_QUESTIONS[0].question
  );
  const [customerName, setCustomerName] = useState(
    initialCustomerName || SAMPLE_CUSTOMER_QUESTIONS[0].name
  );
  const [tone, setTone] = useState<ReplyTone>('friendly');
  const [responseLanguage, setResponseLanguage] = useState<string>('German');

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ReplyResponse | null>(null);
  const [editableResponse, setEditableResponse] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const [copiedEn, setCopiedEn] = useState(false);

  // Sync initialQuestion if provided via dashboard
  useEffect(() => {
    if (initialQuestion) {
      setCustomerQuestion(initialQuestion);
    }
    if (initialCustomerName) {
      setCustomerName(initialCustomerName);
    }
  }, [initialQuestion, initialCustomerName]);

  const languageOptions = [
    'English',
    'German',
    'French',
    'Spanish',
    'Japanese',
    'Italian',
    'Dutch',
    'Portuguese',
    'Chinese',
  ];

  const handleGenerate = async () => {
    if (!customerQuestion.trim()) return;
    setIsLoading(true);
    setError(null);

    try {
      const data = await postApiJson<ReplyResponse>('/api/generate-reply', {
        customerQuestion,
        customerName,
        businessProfile,
        tone,
        responseLanguage,
      });

      setResult(data);
      setEditableResponse(data.suggestedResponse);
      onUsageIncrement?.();
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to generate response. Please verify server connection.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = (text: string, isEnglish = false) => {
    navigator.clipboard.writeText(text);
    if (isEnglish) {
      setCopiedEn(true);
      setTimeout(() => setCopiedEn(false), 2000);
    } else {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleLoadSample = (sample: typeof SAMPLE_CUSTOMER_QUESTIONS[0]) => {
    setCustomerQuestion(sample.question);
    setCustomerName(sample.name);
    setResponseLanguage(sample.language);
    setResult(null);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-bold text-slate-900 dark:text-white">
              Feature 1: Reply Generator
            </h1>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              · Grounded in {businessProfile.businessName || 'Business Profile'}
            </span>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 max-w-2xl leading-relaxed">
            Generate culturally polite, policy-grounded replies in seconds. If a customer
            inquires about unstated policies or prices, the AI will refuse to invent them
            and will explicitly flag missing facts.
          </p>
        </div>

        {/* Quick Sample Selector */}
        <div className="flex flex-wrap items-center gap-1.5 shrink-0">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mr-1">
            Test Sample:
          </span>
          {SAMPLE_CUSTOMER_QUESTIONS.map((s) => (
            <button
              key={s.id}
              onClick={() => handleLoadSample(s)}
              className="px-2.5 py-1 text-xs rounded-md bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors"
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main 2-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Inquiry Inputs (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Customer Question / Message
              </label>
              <span className="text-[11px] font-mono text-slate-400">
                {customerQuestion.length} / 4000
              </span>
            </div>

            <textarea
              rows={7}
              maxLength={4000}
              value={customerQuestion}
              onChange={(e) => setCustomerQuestion(e.target.value)}
              placeholder="Paste customer email, marketplace inquiry, or message here..."
              className="w-full text-xs sm:text-sm p-3 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 font-sans leading-relaxed"
            />

            {/* Customer Name & Response Language */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Customer Name (Optional)
                </label>
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="e.g. Lukas Schneider"
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Response Language
                </label>
                <select
                  value={responseLanguage}
                  onChange={(e) => setResponseLanguage(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {languageOptions.map((lang) => (
                    <option key={lang} value={lang}>
                      {lang}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Tone Selector */}
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Reply Tone
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['friendly', 'professional', 'concise'] as ReplyTone[]).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setTone(t)}
                    className={`py-2 px-3 text-xs font-medium rounded-lg border text-center capitalize transition-colors ${
                      tone === t
                        ? 'bg-blue-50 dark:bg-blue-950/70 border-blue-500 dark:border-blue-400 text-blue-700 dark:text-blue-300 font-semibold'
                        : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {/* Primary Action Button */}
            <button
              onClick={handleGenerate}
              disabled={isLoading || !customerQuestion.trim()}
              className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 disabled:opacity-50 text-white rounded-lg font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-xs transition-colors"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Checking policies & generating...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Generate Customer Response</span>
                </>
              )}
            </button>

            {error && (
              <div className="p-3 bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900 rounded-lg text-xs text-red-700 dark:text-red-300 flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}
          </div>

          {/* Policy Guardrails Card */}
          <div className="bg-slate-50 dark:bg-slate-900/60 rounded-xl p-4 border border-slate-200 dark:border-slate-800 text-xs space-y-2">
            <div className="flex items-center gap-2 font-semibold text-slate-800 dark:text-slate-200">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Grounding Guarantee</span>
            </div>
            <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
              ReplyDesk AI strictly prohibits hallucinating shipping speeds, prices, or
              warranties. When customer questions exceed your supplied business info, it
              advises consulting you directly.
            </p>
          </div>
        </div>

        {/* Right Column: Output & Editable Response (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          {!result && !isLoading && (
            <div className="bg-white dark:bg-slate-900 rounded-xl p-12 border border-dashed border-slate-300 dark:border-slate-700 text-center flex flex-col items-center justify-center min-h-[460px]">
              <div className="w-12 h-12 rounded-full bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-3">
                <MessageSquareText className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                No Response Generated Yet
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mt-1">
                Enter a question on the left or select one of the international sample
                inquiries above to test the generator.
              </p>
            </div>
          )}

          {isLoading && (
            <div className="bg-white dark:bg-slate-900 rounded-xl p-8 border border-slate-200 dark:border-slate-800 space-y-4 min-h-[460px] animate-pulse">
              <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/4" />
              <div className="h-12 bg-slate-100 dark:bg-slate-800/60 rounded" />
              <div className="h-48 bg-slate-100 dark:bg-slate-800/60 rounded mt-4" />
              <div className="h-8 bg-slate-200 dark:bg-slate-800 rounded w-32" />
            </div>
          )}

          {result && !isLoading && (
            <div className="space-y-4">
              {/* Grounding & Fact Check Status */}
              <div className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs border-b border-slate-100 dark:border-slate-800 pb-2.5">
                  <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                    <span className="font-semibold text-slate-900 dark:text-white">
                      Detected Language: {result.detectedLanguage}
                    </span>
                    <span aria-hidden="true">·</span>
                    <span>Output Language: {responseLanguage}</span>
                  </div>
                  <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300 font-semibold">
                    AI-Generated Draft
                  </span>
                </div>

                {/* Missing Information Notice (Crucial requirement) */}
                {result.missingInformationNotice &&
                result.missingInformationNotice.toLowerCase() !== 'none' &&
                !result.missingInformationNotice.toLowerCase().includes('no missing') ? (
                  <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 rounded-lg text-xs space-y-1">
                    <div className="font-semibold text-amber-900 dark:text-amber-200 flex items-center gap-1.5">
                      <ShieldAlert className="w-4 h-4 text-amber-600" />
                      <span>Missing Information Flagged</span>
                    </div>
                    <p className="text-amber-800 dark:text-amber-300 text-[11px] leading-relaxed">
                      {result.missingInformationNotice}
                    </p>
                  </div>
                ) : (
                  <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/50 rounded-lg text-xs flex items-center gap-2 text-emerald-800 dark:text-emerald-300">
                    <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>All facts answered directly from your business profile.</span>
                  </div>
                )}

                <div className="text-[11px] text-slate-500 dark:text-slate-400">
                  <span className="font-semibold text-slate-700 dark:text-slate-300">
                    Fact Check:
                  </span>{' '}
                  {result.factCheckSummary}
                </div>
              </div>

              {/* Main Editable Suggested Customer Response */}
              <div className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                    <FileEdit className="w-4 h-4 text-blue-600" />
                    <span>Suggested Customer Response (Editable)</span>
                  </div>
                  <span className="text-[11px] font-mono text-slate-400">
                    {editableResponse.length} chars
                  </span>
                </div>

                <textarea
                  rows={8}
                  value={editableResponse}
                  onChange={(e) => setEditableResponse(e.target.value)}
                  className="w-full text-xs sm:text-sm p-3.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 font-sans leading-relaxed"
                />

                <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">
                    Editable draft · Review before copying and sending to customer.
                  </span>

                  <button
                    onClick={() => handleCopy(editableResponse)}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors flex items-center gap-1.5"
                  >
                    {copied ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-white" />
                        <span>Copied to Clipboard!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy Suggested Response</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* English Translation View (if output was non-English) */}
              {responseLanguage !== 'English' && result.englishTranslation && (
                <div className="bg-slate-50 dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-800 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                      <Languages className="w-3.5 h-3.5 text-blue-600" />
                      <span>English Translation (For Merchant Review):</span>
                    </span>
                    <button
                      onClick={() => handleCopy(result.englishTranslation, true)}
                      className="text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 text-[11px] font-medium flex items-center gap-1"
                    >
                      {copiedEn ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedEn ? 'Copied' : 'Copy English'}</span>
                    </button>
                  </div>
                  <p className="text-slate-700 dark:text-slate-300 text-xs leading-relaxed whitespace-pre-wrap">
                    {result.englishTranslation}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
