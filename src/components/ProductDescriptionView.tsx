import React, { useState } from 'react';
import {
  Sparkles,
  Copy,
  Check,
  AlertTriangle,
  RefreshCw,
  ShieldCheck,
  FileText,
  Tag,
  ListCheck,
} from 'lucide-react';
import { BusinessProfile, ProductDescriptionResponse } from '../types';
import { SAMPLE_PRODUCT_INPUTS } from '../data/defaultData';
import { postApiJson } from '../utils/apiClient';

interface ProductDescriptionViewProps {
  businessProfile: BusinessProfile;
  onUsageIncrement?: () => void;
}

export const ProductDescriptionView: React.FC<ProductDescriptionViewProps> = ({
  businessProfile,
  onUsageIncrement,
}) => {
  const [productName, setProductName] = useState(
    SAMPLE_PRODUCT_INPUTS[0].productName
  );
  const [factualFeatures, setFactualFeatures] = useState(
    SAMPLE_PRODUCT_INPUTS[0].factualFeatures
  );
  const [materials, setMaterials] = useState(SAMPLE_PRODUCT_INPUTS[0].materials);
  const [price, setPrice] = useState(SAMPLE_PRODUCT_INPUTS[0].price);
  const [targetAudience, setTargetAudience] = useState(
    SAMPLE_PRODUCT_INPUTS[0].targetAudience
  );
  const [writingStyle, setWritingStyle] = useState('artisanal');

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ProductDescriptionResponse | null>(null);

  const [editableConcise, setEditableConcise] = useState('');
  const [editableLonger, setEditableLonger] = useState('');
  const [copiedConcise, setCopiedConcise] = useState(false);
  const [copiedLonger, setCopiedLonger] = useState(false);

  const handleGenerate = async () => {
    if (!productName.trim() || !factualFeatures.trim()) return;
    setIsLoading(true);
    setError(null);

    try {
      const data = await postApiJson<ProductDescriptionResponse>(
        '/api/generate-description',
        {
          productName,
          factualFeatures,
          materials,
          price,
          targetAudience,
          writingStyle,
          businessProfile,
        }
      );

      setResult(data);
      setEditableConcise(data.conciseDescription);
      setEditableLonger(data.longerDescription);
      onUsageIncrement?.();
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to generate product descriptions.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = (text: string, isConcise: boolean) => {
    navigator.clipboard.writeText(text);
    if (isConcise) {
      setCopiedConcise(true);
      setTimeout(() => setCopiedConcise(false), 2000);
    } else {
      setCopiedLonger(true);
      setTimeout(() => setCopiedLonger(false), 2000);
    }
  };

  const handleLoadSample = (sample: typeof SAMPLE_PRODUCT_INPUTS[0]) => {
    setProductName(sample.productName);
    setFactualFeatures(sample.factualFeatures);
    setMaterials(sample.materials);
    setPrice(sample.price);
    setTargetAudience(sample.targetAudience);
    setWritingStyle(sample.writingStyle);
    setResult(null);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-bold text-slate-900 dark:text-white">
              Feature 3: Product Description Writer
            </h1>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              · Concise & Long-Form Listing Copy
            </span>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 max-w-2xl leading-relaxed">
            Generate high-converting product descriptions strictly derived from your
            supplied materials and specifications. ReplyDesk AI will never fabricate
            unsupported certifications or exaggerated claims.
          </p>
        </div>

        {/* Quick Sample Selector */}
        <div className="flex flex-wrap items-center gap-1.5 shrink-0">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mr-1">
            Sample Product:
          </span>
          {SAMPLE_PRODUCT_INPUTS.map((s) => (
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
        {/* Left Column: Product Inputs (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <div>
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  Product Name
                </label>
                <span className="text-[11px] font-mono text-slate-400">
                  {productName.length} chars
                </span>
              </div>
              <input
                type="text"
                required
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
                placeholder="e.g. Kinoko Speckled Stoneware Ramen Bowl"
                className="w-full text-xs sm:text-sm p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 mt-1"
              />
            </div>

            <div>
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  Factual Features & Dimensions
                </label>
                <span className="text-[11px] font-mono text-slate-400">
                  {factualFeatures.length} chars
                </span>
              </div>
              <textarea
                rows={3}
                required
                value={factualFeatures}
                onChange={(e) => setFactualFeatures(e.target.value)}
                placeholder="e.g. 18cm diameter, 850ml capacity, microwave and dishwasher safe..."
                className="w-full text-xs sm:text-sm p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 mt-1"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Materials / Build
                </label>
                <input
                  type="text"
                  value={materials}
                  onChange={(e) => setMaterials(e.target.value)}
                  placeholder="e.g. High-fire stoneware, satin glaze"
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Price (Optional)
                </label>
                <input
                  type="text"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="e.g. $38.00 USD (or blank)"
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Target Audience
                </label>
                <input
                  type="text"
                  value={targetAudience}
                  onChange={(e) => setTargetAudience(e.target.value)}
                  placeholder="e.g. Home cooks, ramen lovers"
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Writing Style
                </label>
                <select
                  value={writingStyle}
                  onChange={(e) => setWritingStyle(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 capitalize"
                >
                  <option value="artisanal">Artisanal & Mindful</option>
                  <option value="minimalist">Minimalist & Clean</option>
                  <option value="luxury">Luxury & Editorial</option>
                  <option value="technical">Technical & Detailed</option>
                  <option value="playful">Playful & Warm</option>
                </select>
              </div>
            </div>

            {/* Submit Button */}
            <button
              onClick={handleGenerate}
              disabled={isLoading || !productName.trim() || !factualFeatures.trim()}
              className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 disabled:opacity-50 text-white rounded-lg font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-xs transition-colors"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Generating verified descriptions...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Generate Descriptions</span>
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
              <span>Zero-Hallucination Claim Policy</span>
            </div>
            <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
              If a price is omitted, it will not be invented. Unsupported claims like
              "100% unbreakable" or "organic" are never inserted unless specified in your
              factual features above.
            </p>
          </div>
        </div>

        {/* Right Column: Output Descriptions (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          {!result && !isLoading && (
            <div className="bg-white dark:bg-slate-900 rounded-xl p-12 border border-dashed border-slate-300 dark:border-slate-700 text-center flex flex-col items-center justify-center min-h-[460px]">
              <div className="w-12 h-12 rounded-full bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-3">
                <FileText className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                No Product Description Generated Yet
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mt-1">
                Fill in the product features or click one of the sample products above,
                then click <strong>"Generate Descriptions"</strong>.
              </p>
            </div>
          )}

          {isLoading && (
            <div className="bg-white dark:bg-slate-900 rounded-xl p-8 border border-slate-200 dark:border-slate-800 space-y-4 min-h-[460px] animate-pulse">
              <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/3" />
              <div className="h-24 bg-slate-100 dark:bg-slate-800/60 rounded" />
              <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/3 mt-6" />
              <div className="h-44 bg-slate-100 dark:bg-slate-800/60 rounded" />
            </div>
          )}

          {result && !isLoading && (
            <div className="space-y-4">
              {/* Grounding Confirmation */}
              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/50 rounded-xl text-xs flex items-center justify-between text-emerald-800 dark:text-emerald-300">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{result.unsupportedClaimsAvoided}</span>
                </div>
                <span className="text-[10px] font-mono uppercase bg-emerald-100 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-200 px-2 py-0.5 rounded font-semibold">
                  Verified
                </span>
              </div>

              {/* Version 1: Concise Description */}
              <div className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                      Version 1: Concise Product Summary (Editable)
                    </h3>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      Perfect for quick marketplace listings, Instagram captions, or store catalog cards.
                    </p>
                  </div>
                  <span className="text-[11px] font-mono text-slate-400">
                    {editableConcise.length} chars
                  </span>
                </div>

                <textarea
                  rows={3}
                  value={editableConcise}
                  onChange={(e) => setEditableConcise(e.target.value)}
                  className="w-full text-xs sm:text-sm p-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 font-sans leading-relaxed"
                />

                <div className="flex justify-end">
                  <button
                    onClick={() => handleCopy(editableConcise, true)}
                    className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5"
                  >
                    {copiedConcise ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-500" />
                        <span>Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy Concise Description</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Version 2: Longer Description */}
              <div className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                      Version 2: Long-Form Listing Description (Editable)
                    </h3>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      Detailed paragraphs with narrative, material notes, and structured specifications.
                    </p>
                  </div>
                  <span className="text-[11px] font-mono text-slate-400">
                    {editableLonger.length} chars
                  </span>
                </div>

                <textarea
                  rows={8}
                  value={editableLonger}
                  onChange={(e) => setEditableLonger(e.target.value)}
                  className="w-full text-xs sm:text-sm p-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 font-sans leading-relaxed"
                />

                {/* Key Bullet Features */}
                {result.keyBulletFeatures && result.keyBulletFeatures.length > 0 && (
                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-1.5">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                      <ListCheck className="w-3.5 h-3.5 text-blue-600" />
                      Extracted Factual Bullets:
                    </span>
                    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-xs text-slate-600 dark:text-slate-400">
                      {result.keyBulletFeatures.map((b, i) => (
                        <li key={i} className="flex items-start gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 shrink-0" />
                          <span>{b}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="flex justify-end pt-2">
                  <button
                    onClick={() => handleCopy(editableLonger, false)}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors flex items-center gap-1.5"
                  >
                    {copiedLonger ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-white" />
                        <span>Copied Long Description!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy Full Description</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
