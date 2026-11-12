import React, { useState } from 'react';
import {
  MessageSquareHeart,
  Star,
  Send,
  Check,
  Sparkles,
  Copy,
  ThumbsUp,
  ThumbsDown,
  Inbox,
  UserCheck,
  RefreshCw,
} from 'lucide-react';
import { BusinessProfile, FeedbackSubmission } from '../types';
import { INITIAL_FEEDBACK_SUBMISSIONS } from '../data/defaultData';
import { postApiJson } from '../utils/apiClient';

interface FeedbackHubViewProps {
  businessProfile: BusinessProfile;
}

export const FeedbackHubView: React.FC<FeedbackHubViewProps> = ({
  businessProfile,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'app_feedback' | 'review_responder'>('app_feedback');

  // Merchant Feedback Form state
  const [feedbacks, setFeedbacks] = useState<FeedbackSubmission[]>(INITIAL_FEEDBACK_SUBMISSIONS);
  const [senderEmail, setSenderEmail] = useState('');
  const [category, setCategory] = useState<FeedbackSubmission['category']>('feature_request');
  const [rating, setRating] = useState(5);
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [submittedNotice, setSubmittedNotice] = useState(false);

  // Review Response Copilot state
  const [customerReview, setCustomerReview] = useState(
    'Love the speckled ceramic mug! Arrived in London in 9 days with zero cracks. Beautiful handmade quality.'
  );
  const [reviewRating, setReviewRating] = useState<'positive' | 'critical'>('positive');
  const [isGeneratingResponse, setIsGeneratingResponse] = useState(false);
  const [generatedReviewReply, setGeneratedReviewReply] = useState('');
  const [copiedReply, setCopiedReply] = useState(false);

  const handleSubmitAppFeedback = (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedbackMessage.trim()) return;

    const newFeedback: FeedbackSubmission = {
      id: `fb-${Date.now()}`,
      senderEmail: senderEmail || 'anonymous.seller@replydesk.ai',
      category,
      rating,
      message: feedbackMessage,
      createdAt: 'Just now',
    };

    setFeedbacks([newFeedback, ...feedbacks]);
    setFeedbackMessage('');
    setSenderEmail('');
    setSubmittedNotice(true);
    setTimeout(() => setSubmittedNotice(false), 3000);
  };

  const handleGenerateReviewReply = async () => {
    setIsGeneratingResponse(true);

    try {
      const response = await postApiJson<{ suggestedResponse: string }>('/api/generate-reply', {
        customerQuestion: `Customer left this public ${reviewRating} store review:\n"${customerReview}"\nPlease draft a polite, public reply to thank or de-escalate this review as the business owner.`,
        customerName: 'Customer',
        businessProfile,
        tone: reviewRating === 'positive' ? 'friendly' : 'professional',
        responseLanguage: 'English',
      });

      setGeneratedReviewReply(response.suggestedResponse);
    } catch (err: any) {
      console.error(err);
      // Factual fallback
      setGeneratedReviewReply(
        reviewRating === 'positive'
          ? `Thank you so much for your wonderful review! We are so glad to hear your order arrived safely and that you love the craftsmanship. Thank you for supporting ${businessProfile.businessName}!`
          : `Thank you for sharing your feedback with ${businessProfile.businessName}. We take our product standards very seriously. Please contact us directly at ${businessProfile.contactDetails} so we can make this right for you immediately under our store policy.`
      );
    } finally {
      setIsGeneratingResponse(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-bold text-slate-900 dark:text-white">
              Feedback Services
            </h1>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              · App Feedback & Customer Review Copilot
            </span>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 max-w-2xl leading-relaxed">
            Submit platform suggestions directly to the ReplyDesk AI team, or craft
            compassionate, high-reputation replies to international customer reviews.
          </p>
        </div>

        {/* Tab switch */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg">
          <button
            onClick={() => setActiveSubTab('app_feedback')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              activeSubTab === 'app_feedback'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs font-semibold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            Submit App Feedback
          </button>
          <button
            onClick={() => setActiveSubTab('review_responder')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              activeSubTab === 'review_responder'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs font-semibold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            Review & Feedback Copilot
          </button>
        </div>
      </div>

      {/* Subtab 1: Submit App Feedback */}
      {activeSubTab === 'app_feedback' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Feedback Form (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            <form
              onSubmit={handleSubmitAppFeedback}
              className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4"
            >
              <div>
                <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Send Feedback to ReplyDesk AI
                </h2>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  Help us build the best international communication assistant for solo sellers.
                </p>
              </div>

              {/* Star Rating */}
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Overall Experience Rating
                </label>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className="p-1 focus:outline-none"
                    >
                      <Star
                        className={`w-5 h-5 ${
                          star <= rating
                            ? 'text-amber-400 fill-amber-400'
                            : 'text-slate-300 dark:text-slate-700'
                        }`}
                      />
                    </button>
                  ))}
                  <span className="text-xs font-mono text-slate-500 dark:text-slate-400 ml-2">
                    {rating} / 5 stars
                  </span>
                </div>
              </div>

              {/* Category */}
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Feedback Topic
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as any)}
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100"
                >
                  <option value="feature_request">Feature Request</option>
                  <option value="translation_quality">Translation & Language Quality</option>
                  <option value="prompt_grounding">Prompt Grounding & Policy Adherence</option>
                  <option value="general">General Feedback / Praise</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Your Store Email (Optional)
                </label>
                <input
                  type="email"
                  value={senderEmail}
                  onChange={(e) => setSenderEmail(e.target.value)}
                  placeholder="e.g. founder@yourstore.com"
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  What can we improve?
                </label>
                <textarea
                  rows={4}
                  required
                  value={feedbackMessage}
                  onChange={(e) => setFeedbackMessage(e.target.value)}
                  placeholder="Tell us what features would save you the most time each week..."
                  className="w-full text-xs sm:text-sm p-3 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 font-sans leading-relaxed"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors flex items-center justify-center gap-2"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Submit Seller Feedback</span>
              </button>

              {submittedNotice && (
                <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 rounded-lg text-xs text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span>Thank you! Your feedback has been recorded.</span>
                </div>
              )}
            </form>
          </div>

          {/* Feedback Feed / Community Submissions (7 cols) */}
          <div className="lg:col-span-7 space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Recent Seller Community Feedback ({feedbacks.length})
              </h2>
            </div>

            <div className="space-y-3">
              {feedbacks.map((fb) => (
                <div
                  key={fb.id}
                  className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-800 shadow-xs space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-3.5 h-3.5 ${
                              i < fb.rating
                                ? 'text-amber-400 fill-amber-400'
                                : 'text-slate-200 dark:text-slate-700'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 capitalize">
                        {fb.category.replace('_', ' ')}
                      </span>
                    </div>
                    <span className="text-[11px] text-slate-400">{fb.createdAt}</span>
                  </div>

                  <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                    "{fb.message}"
                  </p>

                  <div className="text-[10px] text-slate-400 font-mono">
                    From: {fb.senderEmail}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Subtab 2: Review & Feedback Copilot */}
      {activeSubTab === 'review_responder' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Review input (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Customer Marketplace Review / Feedback
              </h2>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setReviewRating('positive');
                    setCustomerReview(
                      'Love the stoneware ramen bowl! Arrived in Sydney in 10 days with zero breakage. Beautiful finish.'
                    );
                  }}
                  className={`px-3 py-1.5 text-xs rounded-lg font-medium transition-colors flex items-center gap-1.5 border ${
                    reviewRating === 'positive'
                      ? 'bg-emerald-50 border-emerald-500 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 font-semibold'
                      : 'border-slate-200 dark:border-slate-700 text-slate-600'
                  }`}
                >
                  <ThumbsUp className="w-3.5 h-3.5" />
                  <span>5-Star Review</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setReviewRating('critical');
                    setCustomerReview(
                      'Took 14 days to arrive in Toronto and the box was slightly crushed. Item is fine but delivery was slower than expected.'
                    );
                  }}
                  className={`px-3 py-1.5 text-xs rounded-lg font-medium transition-colors flex items-center gap-1.5 border ${
                    reviewRating === 'critical'
                      ? 'bg-amber-50 border-amber-500 text-amber-700 dark:bg-amber-950 dark:text-amber-300 font-semibold'
                      : 'border-slate-200 dark:border-slate-700 text-slate-600'
                  }`}
                >
                  <ThumbsDown className="w-3.5 h-3.5" />
                  <span>Critical / Neutral Review</span>
                </button>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Customer Review Text
                </label>
                <textarea
                  rows={4}
                  value={customerReview}
                  onChange={(e) => setCustomerReview(e.target.value)}
                  className="w-full text-xs sm:text-sm p-3 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 font-sans leading-relaxed"
                />
              </div>

              <button
                type="button"
                onClick={handleGenerateReviewReply}
                disabled={isGeneratingResponse || !customerReview.trim()}
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isGeneratingResponse ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Drafting public owner response...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Generate Review Response</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Generated Response (7 cols) */}
          <div className="lg:col-span-7 space-y-4">
            <div className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4 min-h-[360px] flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                  <div className="flex items-center gap-2">
                    <UserCheck className="w-4 h-4 text-blue-600" />
                    <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                      Public Merchant Response (Editable)
                    </span>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300 font-semibold">
                    AI-Draft
                  </span>
                </div>

                {generatedReviewReply ? (
                  <textarea
                    rows={8}
                    value={generatedReviewReply}
                    onChange={(e) => setGeneratedReviewReply(e.target.value)}
                    className="w-full text-xs sm:text-sm p-3.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 font-sans leading-relaxed"
                  />
                ) : (
                  <div className="p-8 text-center text-slate-400 text-xs">
                    Click <strong>"Generate Review Response"</strong> to draft a public response for Etsy, Shopify, or Google reviews.
                  </div>
                )}
              </div>

              {generatedReviewReply && (
                <div className="flex justify-end pt-3 border-t border-slate-100 dark:border-slate-800">
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(generatedReviewReply);
                      setCopiedReply(true);
                      setTimeout(() => setCopiedReply(false), 2000);
                    }}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors flex items-center gap-1.5"
                  >
                    {copiedReply ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedReply ? 'Copied to Clipboard!' : 'Copy Public Response'}</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
