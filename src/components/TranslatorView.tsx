import React, { useState } from 'react';
import {
  Languages,
  ArrowRightLeft,
  Copy,
  Check,
  AlertTriangle,
  RefreshCw,
  Sparkles,
  ShieldCheck,
  Info,
} from 'lucide-react';
import { TranslationResponse } from '../types';
import { SAMPLE_TRANSLATION_SNIPPETS } from '../data/defaultData';
import { postApiJson } from '../utils/apiClient';

interface TranslatorViewProps {
  onUsageIncrement?: () => void;
}

export const TranslatorView: React.FC<TranslatorViewProps> = ({ onUsageIncrement }) => {
  const [textToTranslate, setTextToTranslate] = useState(
    SAMPLE_TRANSLATION_SNIPPETS[0].text
  );
  const [targetLanguage, setTargetLanguage] = useState(
    SAMPLE_TRANSLATION_SNIPPETS[0].targetLanguage
  );
  const [context, setContext] = useState('Customer support communication');

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<TranslationResponse | null>(null);
  const [editableTranslatedText, setEditableTranslatedText] = useState('');
  const [copied, setCopied] = useState(false);

  const supportedLanguages = [
    'German',
    'French',
    'Spanish',
    'Japanese',
    'Italian',
    'Dutch',
    'Portuguese',
    'Chinese',
    'English',
  ];

  const handleTranslate = async () => {
    if (!textToTranslate.trim()) return;
    setIsLoading(true);
    setError(null);

    try {
      const data = await postApiJson<TranslationResponse>('/api/translate', {
        textToTranslate,
        targetLanguage,
        context,
      });

      setResult(data);
      setEditableTranslatedText(data.translatedText);
      onUsageIncrement?.();
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to translate text.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(editableTranslatedText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleLoadSample = (sample: typeof SAMPLE_TRANSLATION_SNIPPETS[0]) => {
    setTextToTranslate(sample.text);
    setTargetLanguage(sample.targetLanguage);
    setResult(null);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-bold text-slate-900 dark:text-white">
              Feature 4: Cross-Border Translator
            </h1>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              · Meaning-Preserving Translation
            </span>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 max-w-2xl leading-relaxed">
            Translate customer responses, return instructions, or product announcements into
            international languages without altering guarantees or adding ungrounded claims.
          </p>
        </div>

        {/* Quick Sample Selector */}
        <div className="flex flex-wrap items-center gap-1.5 shrink-0">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mr-1">
            Sample:
          </span>
          {SAMPLE_TRANSLATION_SNIPPETS.map((s) => (
            <button
              key={s.label}
              onClick={() => handleLoadSample(s)}
              className="px-2.5 py-1 text-xs rounded-md bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors"
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* 2-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Source Text Input (6 cols) */}
        <div className="lg:col-span-6 space-y-4">
          <div className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Source Text to Translate
              </label>
              <span className="text-[11px] font-mono text-slate-400">
                {textToTranslate.length} / 5000 chars
              </span>
            </div>

            <textarea
              rows={8}
              maxLength={5000}
              value={textToTranslate}
              onChange={(e) => setTextToTranslate(e.target.value)}
              placeholder="Paste English or foreign text to translate..."
              className="w-full text-xs sm:text-sm p-3 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 font-sans leading-relaxed"
            />

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Target Language
                </label>
                <select
                  value={targetLanguage}
                  onChange={(e) => setTargetLanguage(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {supportedLanguages.map((l) => (
                    <option key={l} value={l}>
                      {l}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Context / Tone
                </label>
                <select
                  value={context}
                  onChange={(e) => setContext(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Customer support communication">Customer Support</option>
                  <option value="Store policy explanation">Store Policy</option>
                  <option value="Product care instructions">Product Care</option>
                  <option value="Shipping delay advisory">Shipping Advisory</option>
                </select>
              </div>
            </div>

            <button
              onClick={handleTranslate}
              disabled={isLoading || !textToTranslate.trim()}
              className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 disabled:opacity-50 text-white rounded-lg font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-xs transition-colors"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Translating faithfully...</span>
                </>
              ) : (
                <>
                  <Languages className="w-4 h-4" />
                  <span>Translate into {targetLanguage}</span>
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

          <div className="bg-slate-50 dark:bg-slate-900/60 rounded-xl p-4 border border-slate-200 dark:border-slate-800 text-xs space-y-2">
            <div className="flex items-center gap-2 font-semibold text-slate-800 dark:text-slate-200">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Translation Integrity Rule</span>
            </div>
            <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
              Order numbers, tracking IDs, and specific instructions are preserved verbatim.
              The model never inserts flattering marketing claims that did not exist in the source text.
            </p>
          </div>
        </div>

        {/* Right Column: Output Translation (6 cols) */}
        <div className="lg:col-span-6 space-y-4">
          {!result && !isLoading && (
            <div className="bg-white dark:bg-slate-900 rounded-xl p-12 border border-dashed border-slate-300 dark:border-slate-700 text-center flex flex-col items-center justify-center min-h-[460px]">
              <div className="w-12 h-12 rounded-full bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-3">
                <ArrowRightLeft className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                No Translation Generated Yet
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mt-1">
                Enter your text on the left and click <strong>"Translate into {targetLanguage}"</strong>.
              </p>
            </div>
          )}

          {isLoading && (
            <div className="bg-white dark:bg-slate-900 rounded-xl p-8 border border-slate-200 dark:border-slate-800 space-y-4 min-h-[460px] animate-pulse">
              <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/3" />
              <div className="h-48 bg-slate-100 dark:bg-slate-800/60 rounded" />
              <div className="h-10 bg-slate-200 dark:bg-slate-800 rounded w-32" />
            </div>
          )}

          {result && !isLoading && (
            <div className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3 text-xs">
                <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                  <span className="font-semibold text-slate-900 dark:text-white">
                    {result.detectedSourceLanguage} → {targetLanguage}
                  </span>
                </div>
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300 font-semibold">
                  AI-Generated Draft
                </span>
              </div>

              {/* Cultural Etiquette Notice */}
              {result.culturalEtiquetteNotes && (
                <div className="p-3 bg-blue-50/60 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900/40 rounded-lg text-xs space-y-1">
                  <div className="font-semibold text-blue-900 dark:text-blue-200 flex items-center gap-1.5">
                    <Info className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                    <span>Cultural Etiquette Applied:</span>
                  </div>
                  <p className="text-[11px] text-blue-800 dark:text-blue-300 leading-relaxed">
                    {result.culturalEtiquetteNotes}
                  </p>
                </div>
              )}

              {/* Editable Translation Text Area */}
              <div>
                <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                  <span>Translated Text ({targetLanguage} - Editable)</span>
                  <span className="text-[11px] font-mono text-slate-400">
                    {editableTranslatedText.length} chars
                  </span>
                </div>

                <textarea
                  rows={8}
                  value={editableTranslatedText}
                  onChange={(e) => setEditableTranslatedText(e.target.value)}
                  className="w-full text-xs sm:text-sm p-3.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 font-sans leading-relaxed"
                />
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
                <span className="text-[11px] text-slate-500 dark:text-slate-400">
                  Editable draft · Review before sending.
                </span>

                <button
                  onClick={handleCopy}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors flex items-center gap-1.5"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-white" />
                      <span>Copied Translation!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy Translation</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
