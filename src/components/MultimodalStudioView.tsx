import React, { useState, useRef } from 'react';
import {
  Mic,
  Square,
  Sparkles,
  Music,
  Image as ImageIcon,
  Video,
  Play,
  Pause,
  Upload,
  Copy,
  Check,
  RefreshCw,
  Sliders,
  AlertCircle,
  FileAudio,
} from 'lucide-react';
import { postApiJson } from '../utils/apiClient';

interface MultimodalStudioProps {
  onInsertToReply?: (text: string) => void;
}

export const MultimodalStudioView: React.FC<MultimodalStudioProps> = ({ onInsertToReply }) => {
  const [activeTab, setActiveTab] = useState<'audio' | 'image' | 'music' | 'video'>('audio');

  // ==========================================
  // 1. AUDIO TRANSCRIPTION (gemini-3.5-transcribe)
  // ==========================================
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [audioTranscript, setAudioTranscript] = useState('');
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [audioError, setAudioError] = useState<string | null>(null);
  const [copiedTranscript, setCopiedTranscript] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerIntervalRef = useRef<any>(null);

  const startRecording = async () => {
    try {
      setAudioError(null);
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        stream.getTracks().forEach((track) => track.stop());
        await processAudioTranscription(audioBlob);
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingSeconds(0);
      timerIntervalRef.current = setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);
    } catch (err: any) {
      console.error(err);
      setAudioError('Microphone permission denied or not available.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      clearInterval(timerIntervalRef.current);
    }
  };

  const processAudioTranscription = async (blob: Blob) => {
    setIsTranscribing(true);
    setAudioError(null);
    try {
      const reader = new FileReader();
      reader.readAsDataURL(blob);
      reader.onloadend = async () => {
        const base64Data = (reader.result as string).split(',')[1];
        const data = await postApiJson<{ transcript: string }>('/api/transcribe-audio', {
          audioBase64: base64Data,
          mimeType: blob.type || 'audio/webm',
        });
        setAudioTranscript(data.transcript || 'No speech detected.');
        setIsTranscribing(false);
      };
    } catch (err: any) {
      console.error(err);
      setAudioError('Failed to transcribe audio.');
      setIsTranscribing(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processAudioTranscription(file);
    }
  };

  // ==========================================
  // 2. CREATE & EDIT IMAGES (gemini-nano-banana-2.1)
  // ==========================================
  const [imagePrompt, setImagePrompt] = useState(
    'A high-end ceramic stoneware coffee mug placed on a clean sunlit minimalist wooden table with delicate steam rising, studio product photography.'
  );
  const [aspectRatio, setAspectRatio] = useState('1:1');
  const [sourceImageBase64, setSourceImageBase64] = useState<string | null>(null);
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [imageError, setImageError] = useState<string | null>(null);

  const handleGenerateImage = async () => {
    if (!imagePrompt.trim()) return;
    setIsGeneratingImage(true);
    setImageError(null);

    try {
      const data = await postApiJson<{ imageUrl: string }>('/api/generate-image', {
        prompt: imagePrompt,
        aspectRatio,
        sourceImageBase64,
      });
      setGeneratedImageUrl(data.imageUrl);
    } catch (err: any) {
      console.error(err);
      setImageError(err.message || 'Image generation failed.');
    } finally {
      setIsGeneratingImage(false);
    }
  };

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = (reader.result as string).split(',')[1];
        setSourceImageBase64(base64);
      };
      reader.readAsDataURL(file);
    }
  };

  // ==========================================
  // 3. GENERATE MUSIC (lyria-3-clip-preview)
  // ==========================================
  const [musicPrompt, setMusicPrompt] = useState(
    'Calm acoustic guitar and warm Japanese bamboo flute melody, peaceful artisanal pottery workshop ambiance.'
  );
  const [musicAudioUrl, setMusicAudioUrl] = useState<string | null>(null);
  const [musicLyrics, setMusicLyrics] = useState('');
  const [isGeneratingMusic, setIsGeneratingMusic] = useState(false);
  const [musicError, setMusicError] = useState<string | null>(null);

  const handleGenerateMusic = async () => {
    if (!musicPrompt.trim()) return;
    setIsGeneratingMusic(true);
    setMusicError(null);

    try {
      const data = await postApiJson<{ audioDataUrl: string; lyrics: string }>('/api/generate-music', {
        prompt: musicPrompt,
      });
      setMusicAudioUrl(data.audioDataUrl || null);
      setMusicLyrics(data.lyrics || '');
    } catch (err: any) {
      console.error(err);
      setMusicError(err.message || 'Music generation failed.');
    } finally {
      setIsGeneratingMusic(false);
    }
  };

  // ==========================================
  // 4. ANIMATE IMAGE INTO VIDEO (gemini-omni-1.2-flash via Interactions API)
  // ==========================================
  const [videoPrompt, setVideoPrompt] = useState(
    'Gentle 360-degree rotational camera glide around the handcrafted ceramic cup, showing glossy oatmeal glaze texture in sunlight.'
  );
  const [videoAspectRatio, setVideoAspectRatio] = useState<'16:9' | '9:16'>('16:9');
  const [videoSourceBase64, setVideoSourceBase64] = useState<string | null>(null);
  const [generatedVideoUrl, setGeneratedVideoUrl] = useState<string | null>(null);
  const [isGeneratingVideo, setIsGeneratingVideo] = useState(false);
  const [videoMessage, setVideoMessage] = useState<string | null>(null);

  const handleGenerateVideo = async () => {
    setIsGeneratingVideo(true);
    setVideoMessage(null);

    try {
      const data = await postApiJson<{ videoUrl: string; message: string }>('/api/generate-video', {
        prompt: videoPrompt,
        aspectRatio: videoAspectRatio,
        sourceImageBase64: videoSourceBase64,
      });
      setGeneratedVideoUrl(data.videoUrl || null);
      setVideoMessage(data.message);
    } catch (err: any) {
      console.error(err);
      setVideoMessage('Video request failed: ' + err.message);
    } finally {
      setIsGeneratingVideo(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
              Multimodal AI Studio
            </h1>
            <span className="px-2 py-0.5 text-[11px] font-bold rounded-md bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
              Audio · Image · Music · Video
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1 max-w-2xl leading-relaxed">
            Harness specialized generative models: voice transcription with <code className="text-purple-600 font-mono text-xs">gemini-3.5-transcribe</code>, high-res visual creation with <code className="text-purple-600 font-mono text-xs">gemini-nano-banana-2.1</code>, store background melodies with <code className="text-purple-600 font-mono text-xs">lyria-3-clip-preview</code>, and product animation with <code className="text-purple-600 font-mono text-xs">gemini-omni-1.2-flash</code>.
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
          <button
            onClick={() => setActiveTab('audio')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              activeTab === 'audio'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <Mic className="w-3.5 h-3.5" />
            <span>Audio Transcribe</span>
          </button>
          <button
            onClick={() => setActiveTab('image')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              activeTab === 'image'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <ImageIcon className="w-3.5 h-3.5" />
            <span>Image Studio</span>
          </button>
          <button
            onClick={() => setActiveTab('music')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              activeTab === 'music'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <Music className="w-3.5 h-3.5" />
            <span>Lyria Music</span>
          </button>
          <button
            onClick={() => setActiveTab('video')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              activeTab === 'video'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <Video className="w-3.5 h-3.5" />
            <span>Omni Video</span>
          </button>
        </div>
      </div>

      {/* ==========================================
          TAB 1: AUDIO TRANSCRIPTION
         ========================================== */}
      {activeTab === 'audio' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5 bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs space-y-5">
            <div className="space-y-1">
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Mic className="w-4 h-4 text-purple-600" />
                <span>Microphone & Voice Input</span>
              </h2>
              <p className="text-xs text-slate-500">
                Speak your customer support notes, voice memos, or customer inquiries aloud.
              </p>
            </div>

            {/* Mic Record Button */}
            <div className="flex flex-col items-center justify-center p-8 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-700/80 space-y-4">
              <button
                onClick={isRecording ? stopRecording : startRecording}
                disabled={isTranscribing}
                className={`w-20 h-20 rounded-full flex items-center justify-center transition-all shadow-lg cursor-pointer ${
                  isRecording
                    ? 'bg-rose-600 hover:bg-rose-700 text-white animate-pulse'
                    : 'bg-purple-600 hover:bg-purple-700 text-white hover:scale-105'
                }`}
              >
                {isRecording ? <Square className="w-8 h-8 fill-current" /> : <Mic className="w-8 h-8" />}
              </button>

              <div className="text-center">
                <div className="text-sm font-bold text-slate-900 dark:text-white">
                  {isRecording ? `Recording... (${recordingSeconds}s)` : 'Click To Record'}
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5">
                  Powered by gemini-3.5-transcribe
                </div>
              </div>
            </div>

            {/* File Upload Option */}
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-2">
                Or Upload Recorded Audio (.mp3, .wav, .webm)
              </label>
              <input
                type="file"
                accept="audio/*"
                onChange={handleFileUpload}
                disabled={isTranscribing || isRecording}
                className="w-full text-xs text-slate-500 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100 dark:file:bg-purple-950 dark:file:text-purple-300 cursor-pointer"
              />
            </div>

            {audioError && (
              <div className="p-3 bg-rose-50 text-rose-700 rounded-xl text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{audioError}</span>
              </div>
            )}
          </div>

          <div className="lg:col-span-7 bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <FileAudio className="w-4 h-4 text-purple-600" />
                  <span>Transcription Output</span>
                </h3>
                {isTranscribing && (
                  <span className="text-xs font-semibold text-purple-600 animate-pulse flex items-center gap-1.5">
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Transcribing with Gemini 3.5...</span>
                  </span>
                )}
              </div>

              <textarea
                value={audioTranscript}
                onChange={(e) => setAudioTranscript(e.target.value)}
                placeholder="Spoken words and customer questions will appear here cleanly transcribed..."
                rows={10}
                className="w-full mt-4 p-4 text-sm bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-purple-500 text-slate-900 dark:text-white font-sans leading-relaxed"
              />
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
              <span className="text-xs text-slate-400">
                {audioTranscript.length} characters
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(audioTranscript);
                    setCopiedTranscript(true);
                    setTimeout(() => setCopiedTranscript(false), 2000);
                  }}
                  disabled={!audioTranscript.trim()}
                  className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-40"
                >
                  {copiedTranscript ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedTranscript ? 'Copied' : 'Copy Transcript'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==========================================
          TAB 2: IMAGE STUDIO (gemini-nano-banana-2.1)
         ========================================== */}
      {activeTab === 'image' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5 bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <ImageIcon className="w-4 h-4 text-purple-600" />
              <span>Prompt & Specifications</span>
            </h2>

            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5 uppercase tracking-wider">
                Image Description / Edit Prompt
              </label>
              <textarea
                value={imagePrompt}
                onChange={(e) => setImagePrompt(e.target.value)}
                rows={4}
                className="w-full p-3 text-xs bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-purple-500 text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">
                Aspect Ratio
              </label>
              <div className="grid grid-cols-5 gap-1.5 text-xs">
                {['1:1', '16:9', '9:16', '4:3', '3:4'].map((ratio) => (
                  <button
                    key={ratio}
                    onClick={() => setAspectRatio(ratio)}
                    className={`py-1.5 rounded-lg border text-center font-semibold transition-colors ${
                      aspectRatio === ratio
                        ? 'border-purple-600 bg-purple-50 dark:bg-purple-950/70 text-purple-700 dark:text-purple-300'
                        : 'border-slate-200 dark:border-slate-700 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {ratio}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">
                Optional: Upload Existing Photo To Edit
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageFileChange}
                className="w-full text-xs text-slate-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100"
              />
            </div>

            <button
              onClick={handleGenerateImage}
              disabled={isGeneratingImage || !imagePrompt.trim()}
              className="w-full py-3 px-4 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isGeneratingImage ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              <span>{isGeneratingImage ? 'Generating Image...' : 'Generate with gemini-nano-banana-2.1'}</span>
            </button>
          </div>

          <div className="lg:col-span-7 bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col items-center justify-center min-h-[360px]">
            {generatedImageUrl ? (
              <div className="space-y-4 w-full flex flex-col items-center">
                <img
                  src={generatedImageUrl}
                  alt="Generated artisan visual"
                  className="max-h-[380px] w-auto rounded-xl object-contain shadow-lg border border-slate-200 dark:border-slate-700"
                />
                <a
                  href={generatedImageUrl}
                  download="replydesk-generated-visual.png"
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 transition-colors"
                >
                  Download High-Res PNG
                </a>
              </div>
            ) : (
              <div className="text-center p-8 text-slate-400 space-y-3">
                <ImageIcon className="w-12 h-12 mx-auto stroke-1" />
                <p className="text-xs">Generated product visual or edited photo preview will appear here.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ==========================================
          TAB 3: MUSIC (lyria-3-clip-preview)
         ========================================== */}
      {activeTab === 'music' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-6 bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Music className="w-4 h-4 text-purple-600" />
              <span>Brand Audio & Workshop Melody</span>
            </h2>

            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5 uppercase tracking-wider">
                Audio Prompt
              </label>
              <textarea
                value={musicPrompt}
                onChange={(e) => setMusicPrompt(e.target.value)}
                rows={4}
                className="w-full p-3 text-xs bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-purple-500 text-slate-900 dark:text-white"
              />
            </div>

            <button
              onClick={handleGenerateMusic}
              disabled={isGeneratingMusic || !musicPrompt.trim()}
              className="w-full py-3 px-4 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isGeneratingMusic ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Music className="w-4 h-4" />}
              <span>{isGeneratingMusic ? 'Synthesizing Audio Clip...' : 'Generate with lyria-3-clip-preview'}</span>
            </button>
          </div>

          <div className="lg:col-span-6 bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-center space-y-4">
            <div className="text-center p-6 bg-slate-50 dark:bg-slate-800/60 rounded-xl space-y-3">
              <Music className="w-10 h-10 text-purple-500 mx-auto" />
              <div className="text-xs font-bold text-slate-900 dark:text-white">
                {musicAudioUrl ? 'Generated Lyria Audio Track' : 'Store Ambiance Player'}
              </div>

              {musicAudioUrl ? (
                <audio controls src={musicAudioUrl} className="w-full mt-2" />
              ) : (
                <p className="text-xs text-slate-400">
                  Click generate to create an artisanal background melody or promo sound with Lyria.
                </p>
              )}
            </div>

            {musicLyrics && (
              <div className="p-3 bg-purple-50 dark:bg-purple-950/50 rounded-xl text-xs text-purple-800 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                <span className="font-bold block mb-1">Generated Notes:</span>
                <p className="italic">{musicLyrics}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ==========================================
          TAB 4: VIDEO (gemini-omni-1.2-flash via Interactions API)
         ========================================== */}
      {activeTab === 'video' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5 bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Video className="w-4 h-4 text-purple-600" />
              <span>Video & Motion Synthesis</span>
            </h2>

            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5 uppercase tracking-wider">
                Video Motion Prompt
              </label>
              <textarea
                value={videoPrompt}
                onChange={(e) => setVideoPrompt(e.target.value)}
                rows={3}
                className="w-full p-3 text-xs bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-purple-500 text-slate-900 dark:text-white"
              />
            </div>

            <div className="flex items-center gap-3">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Aspect Ratio:
              </label>
              <div className="flex gap-2">
                <button
                  onClick={() => setVideoAspectRatio('16:9')}
                  className={`px-3 py-1 text-xs rounded-lg border font-semibold ${
                    videoAspectRatio === '16:9'
                      ? 'border-purple-600 bg-purple-50 dark:bg-purple-950 text-purple-700'
                      : 'border-slate-200 text-slate-600'
                  }`}
                >
                  16:9 Landscape
                </button>
                <button
                  onClick={() => setVideoAspectRatio('9:16')}
                  className={`px-3 py-1 text-xs rounded-lg border font-semibold ${
                    videoAspectRatio === '9:16'
                      ? 'border-purple-600 bg-purple-50 dark:bg-purple-950 text-purple-700'
                      : 'border-slate-200 text-slate-600'
                  }`}
                >
                  9:16 Portrait
                </button>
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">
                Optional: Animate Photo Frame
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onloadend = () => {
                      setVideoSourceBase64((reader.result as string).split(',')[1]);
                    };
                    reader.readAsDataURL(file);
                  }
                }}
                className="w-full text-xs text-slate-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-purple-50 file:text-purple-700"
              />
            </div>

            <button
              onClick={handleGenerateVideo}
              disabled={isGeneratingVideo}
              className="w-full py-3 px-4 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isGeneratingVideo ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Video className="w-4 h-4" />}
              <span>{isGeneratingVideo ? 'Processing Video Interaction...' : 'Generate with gemini-omni-1.2-flash'}</span>
            </button>
          </div>

          <div className="lg:col-span-7 bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col items-center justify-center min-h-[360px]">
            {generatedVideoUrl ? (
              <video
                controls
                src={generatedVideoUrl}
                className="w-full max-h-[380px] rounded-xl object-contain bg-black shadow-lg"
              />
            ) : (
              <div className="text-center p-8 text-slate-400 space-y-3">
                <Video className="w-12 h-12 mx-auto stroke-1" />
                <p className="text-xs">Generated video animation will render and play here.</p>
                {videoMessage && (
                  <p className="text-xs text-purple-600 font-medium">{videoMessage}</p>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
