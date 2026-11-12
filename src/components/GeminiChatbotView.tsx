import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  Bot,
  User,
  Sparkles,
  Globe,
  MapPin,
  ExternalLink,
  Cpu,
  RefreshCw,
  Search,
  Check,
  ShieldCheck,
  Trash2,
} from 'lucide-react';
import { postApiJson } from '../utils/apiClient';

interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  content: string;
  modelUsed?: string;
  groundingCitations?: { title: string; uri: string; type: 'web' | 'maps' }[];
  timestamp: string;
}

export const GeminiChatbotView: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'model',
      content:
        '👋 Welcome to the **ReplyDesk Gemini Copilot**! I can assist you with cross-border policies, deep reasoning on international disputes, live search grounding for courier updates, or Google Maps location lookups. How can I assist your online shop today?',
      modelUsed: 'gemini-3.8-flash',
      timestamp: 'Just now',
    },
  ]);

  const [inputMessage, setInputMessage] = useState('');
  const [selectedRole, setSelectedRole] = useState('Customer Experience Strategist');
  const [selectedModel, setSelectedModel] = useState<'gemini-4-carbon' | 'gemini-4-argon' | 'gemini-3.8-flash' | 'gemini-3.1-flash-lite'>('gemini-3.8-flash');
  const [groundingMode, setGroundingMode] = useState<'none' | 'search' | 'maps'>('none');
  const [isLoading, setIsLoading] = useState(false);
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Request location for Google Maps grounding if enabled
  useEffect(() => {
    if (groundingMode === 'maps' && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setUserLocation({
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
          });
        },
        (err) => {
          console.warn('Geolocation lookup omitted:', err);
        }
      );
    }
  }, [groundingMode]);

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputMessage.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: inputMessage,
      timestamp: 'Just now',
    };

    const updatedHistory = [...messages, userMsg];
    setMessages(updatedHistory);
    setInputMessage('');
    setIsLoading(true);

    try {
      const payload = {
        message: userMsg.content,
        history: messages
          .filter((m) => m.id !== 'welcome')
          .map((m) => ({ role: m.role, content: m.content })),
        role: selectedRole,
        model: selectedModel,
        grounding: groundingMode,
        userLocation: groundingMode === 'maps' ? userLocation : undefined,
      };

      const data = await postApiJson<{
        reply: string;
        modelUsed: string;
        groundingCitations?: { title: string; uri: string; type: 'web' | 'maps' }[];
      }>('/api/chat', payload);

      const modelMsg: ChatMessage = {
        id: `model-${Date.now()}`,
        role: 'model',
        content: data.reply,
        modelUsed: data.modelUsed,
        groundingCitations: data.groundingCitations || [],
        timestamp: 'Just now',
      };

      setMessages((prev) => [...prev, modelMsg]);
    } catch (err: any) {
      console.error(err);
      const errorMsg: ChatMessage = {
        id: `err-${Date.now()}`,
        role: 'model',
        content: `⚠️ Failed to get a response: ${err.message || 'Server error'}. Please try again.`,
        modelUsed: selectedModel,
        timestamp: 'Just now',
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearChat = () => {
    setMessages([
      {
        id: 'welcome',
        role: 'model',
        content: 'Conversation thread refreshed. Ask any question to get started!',
        modelUsed: selectedModel,
        timestamp: 'Just now',
      },
    ]);
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col h-[750px] overflow-hidden">
      {/* Top Chat Bar */}
      <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 bg-slate-50/70 dark:bg-slate-900/70">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                Gemini Multi-Turn Copilot
              </h2>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 font-semibold border border-blue-200 dark:border-blue-800">
                {selectedModel}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Role: {selectedRole} · Persistent Multi-Turn Context
            </p>
          </div>
        </div>

        {/* Model, Role & Grounding Selectors */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Model Selection */}
          <select
            value={selectedModel}
            onChange={(e: any) => setSelectedModel(e.target.value)}
            className="text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 font-medium text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
          >
            <option value="gemini-3.8-flash">gemini-3.8-flash (General Tasks)</option>
            <option value="gemini-4-carbon">gemini-4-carbon (Deep Reasoning)</option>
            <option value="gemini-4-argon">gemini-4-argon (Complex Interactive)</option>
            <option value="gemini-3.1-flash-lite">gemini-3.1-flash-lite (Fast Speed)</option>
          </select>

          {/* Grounding Toggle */}
          <div className="flex items-center bg-slate-200/80 dark:bg-slate-800 p-0.5 rounded-lg text-xs font-semibold">
            <button
              onClick={() => setGroundingMode('none')}
              className={`px-2.5 py-1 rounded-md transition-colors ${
                groundingMode === 'none'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              Direct
            </button>
            <button
              onClick={() => setGroundingMode('search')}
              className={`px-2.5 py-1 rounded-md flex items-center gap-1 transition-colors ${
                groundingMode === 'search'
                  ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
              title="Ground response with live Google Search results"
            >
              <Search className="w-3 h-3" />
              <span>Search</span>
            </button>
            <button
              onClick={() => setGroundingMode('maps')}
              className={`px-2.5 py-1 rounded-md flex items-center gap-1 transition-colors ${
                groundingMode === 'maps'
                  ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
              title="Ground response with Google Maps locations"
            >
              <MapPin className="w-3 h-3" />
              <span>Maps</span>
            </button>
          </div>

          <button
            onClick={handleClearChat}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
            title="Clear Chat History"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Message Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
        {messages.map((m) => (
          <div
            key={m.id}
            className={`flex items-start gap-3 ${
              m.role === 'user' ? 'flex-row-reverse' : 'flex-row'
            }`}
          >
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-white ${
                m.role === 'user' ? 'bg-blue-600' : 'bg-slate-800 dark:bg-slate-700'
              }`}
            >
              {m.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
            </div>

            <div
              className={`max-w-[82%] sm:max-w-[72%] rounded-2xl p-4 shadow-xs text-xs sm:text-sm leading-relaxed ${
                m.role === 'user'
                  ? 'bg-blue-600 text-white rounded-tr-none'
                  : 'bg-slate-50 dark:bg-slate-800/80 text-slate-800 dark:text-slate-100 border border-slate-200/80 dark:border-slate-700/80 rounded-tl-none'
              }`}
            >
              <div className="whitespace-pre-wrap font-sans">{m.content}</div>

              {/* Grounding Citation Links (Mandatory extraction as web links) */}
              {m.groundingCitations && m.groundingCitations.length > 0 && (
                <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-700 space-y-1.5">
                  <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1">
                    <Globe className="w-3.5 h-3.5 text-blue-500" />
                    <span>Grounded Sources & Citations:</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {m.groundingCitations.map((cite, i) => (
                      <a
                        key={i}
                        href={cite.uri}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-medium bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-blue-600 dark:text-blue-400 rounded-lg hover:underline transition-colors"
                      >
                        {cite.type === 'maps' ? <MapPin className="w-3 h-3 text-emerald-500" /> : <Search className="w-3 h-3 text-blue-500" />}
                        <span className="truncate max-w-[200px]">{cite.title}</span>
                        <ExternalLink className="w-2.5 h-2.5 opacity-60" />
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {m.modelUsed && m.role === 'model' && (
                <div className="mt-2 text-[10px] text-slate-400 dark:text-slate-500 flex items-center gap-1 font-mono">
                  <Cpu className="w-3 h-3" />
                  <span>{m.modelUsed}</span>
                </div>
              )}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-slate-800 text-white flex items-center justify-center">
              <Bot className="w-4 h-4 animate-spin" />
            </div>
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-500 flex items-center gap-2">
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-blue-600" />
              <span>Thinking with {selectedModel}...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Message Input Form */}
      <form
        onSubmit={handleSendMessage}
        className="p-4 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center gap-3"
      >
        <input
          type="text"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          placeholder={`Ask ${selectedRole} (e.g. 'How do UK customs thresholds apply to handcrafted ceramics under £135?')...`}
          className="flex-1 px-4 py-3 bg-slate-50 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          type="submit"
          disabled={!inputMessage.trim() || isLoading}
          className="px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md transition-all flex items-center gap-2 cursor-pointer disabled:opacity-40"
        >
          <Send className="w-4 h-4" />
          <span className="hidden sm:inline">Send</span>
        </button>
      </form>
    </div>
  );
};
