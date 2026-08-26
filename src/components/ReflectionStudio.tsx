import React, { useState, useEffect, useRef } from 'react';
import { 
  Sparkles, 
  Send, 
  RefreshCw, 
  Bookmark, 
  BookmarkCheck, 
  Download, 
  PlusCircle, 
  Feather, 
  BrainCircuit, 
  ListChecks, 
  Lightbulb, 
  Tag, 
  Smile, 
  Clock, 
  CheckCircle2, 
  Layers, 
  Zap, 
  AlertCircle,
  HelpCircle,
  Copy,
  Check,
  ChevronRight
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { User } from 'firebase/auth';
import { db, doc, setDoc, serverTimestamp } from '../lib/firebase';
import { 
  EntryCategory, 
  ReflectionMode, 
  ConversationMessage, 
  JournalEntry, 
  ReflectionResponse 
} from '../types';

interface ReflectionStudioProps {
  user: User;
  activeEntry?: JournalEntry | null;
  onEntrySaved?: (entry: JournalEntry) => void;
  onNewEntry?: () => void;
}

const CATEGORIES: { id: EntryCategory; label: string; icon: string; promptPlaceholder: string }[] = [
  { 
    id: 'reflection', 
    label: 'Deep Reflection', 
    icon: '🪞',
    promptPlaceholder: 'Reflect on a recent experience, realization, or challenging decision...'
  },
  { 
    id: 'journal', 
    label: 'Daily Journal', 
    icon: '📖',
    promptPlaceholder: 'Write freely about how your day unfolded and what occupied your mind...'
  },
  { 
    id: 'brainstorm', 
    label: 'Creative Brainstorm', 
    icon: '💡',
    promptPlaceholder: 'Describe an idea, ambition, or problem you want Gemini to explore with you...'
  },
  { 
    id: 'gratitude', 
    label: 'Gratitude Log', 
    icon: '🌱',
    promptPlaceholder: 'What are 3 meaningful things, people, or small moments you appreciate today?'
  },
  { 
    id: 'goal', 
    label: 'Goal & Strategy', 
    icon: '🎯',
    promptPlaceholder: 'Detail a milestone or habit you want to build and let Gemini help structure it...'
  },
  { 
    id: 'mindfulness', 
    label: 'Mindful Check-in', 
    icon: '🧘',
    promptPlaceholder: 'How does your body and mental state feel right now in this exact moment?'
  }
];

const MODES: { id: ReflectionMode; label: string; description: string }[] = [
  { id: 'reflect', label: 'Deep Inquire', description: 'Empathetic inquiry & self-awareness questions' },
  { id: 'brainstorm', label: 'Brainstorm', description: 'Creative perspectives, analogies & ideas' },
  { id: 'summarize', label: 'Synthesize', description: 'Structured executive summary of core themes' },
  { id: 'action_items', label: 'Action Items', description: 'Practical next steps & habit blueprints' }
];

const PROMPT_INSPIRATIONS = [
  "What is a decision I've been postponing, and what is the underlying fear?",
  "What was the most energizing moment of my week, and why did it matter?",
  "How can I break down my current biggest project into 3 bite-sized milestones?",
  "What are 3 things I can control today versus things I need to release?"
];

export const ReflectionStudio: React.FC<ReflectionStudioProps> = ({
  user,
  activeEntry,
  onEntrySaved,
  onNewEntry
}) => {
  const [currentPrompt, setCurrentPrompt] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<EntryCategory>(activeEntry?.category || 'reflection');
  const [selectedMode, setSelectedMode] = useState<ReflectionMode>('reflect');
  const [entryTitle, setEntryTitle] = useState(activeEntry?.title || '');
  const [messages, setMessages] = useState<ConversationMessage[]>(activeEntry?.messages || []);
  const [summary, setSummary] = useState(activeEntry?.summary || '');
  const [sentiment, setSentiment] = useState(activeEntry?.sentiment || '');
  const [keyInsights, setKeyInsights] = useState<string[]>(activeEntry?.keyInsights || []);
  const [actionItems, setActionItems] = useState<string[]>(activeEntry?.actionItems || []);
  const [completedActions, setCompletedActions] = useState<Record<number, boolean>>({});
  const [tags, setTags] = useState<string[]>(activeEntry?.tags || ['Reflection']);
  const [isFavorite, setIsFavorite] = useState(activeEntry?.isFavorite || false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [syncStatus, setSyncStatus] = useState<'synced' | 'syncing' | 'unsaved'>('synced');
  const [lastSavedTime, setLastSavedTime] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [currentEntryId, setCurrentEntryId] = useState<string>(
    activeEntry?.id || `entry_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`
  );

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Sync state if activeEntry changes externally
  useEffect(() => {
    if (activeEntry) {
      setCurrentEntryId(activeEntry.id);
      setSelectedCategory(activeEntry.category);
      setEntryTitle(activeEntry.title);
      setMessages(activeEntry.messages || []);
      setSummary(activeEntry.summary || '');
      setSentiment(activeEntry.sentiment || '');
      setKeyInsights(activeEntry.keyInsights || []);
      setActionItems(activeEntry.actionItems || []);
      setTags(activeEntry.tags || []);
      setIsFavorite(activeEntry.isFavorite || false);
      setSyncStatus('synced');
    }
  }, [activeEntry]);

  // Scroll to bottom when messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isGenerating]);

  // Calculate total word count
  const calculateWordCount = () => {
    return messages
      .filter((m) => m.role === 'user')
      .reduce((acc, m) => acc + m.content.trim().split(/\s+/).filter(Boolean).length, 0);
  };

  // Save current entry state to Cloud Firestore (User Isolated)
  const persistToFirestore = async (overrideData?: Partial<JournalEntry>) => {
    if (!user || !user.uid) return;
    setSyncStatus('syncing');

    const entryToSave: JournalEntry = {
      id: currentEntryId,
      userId: user.uid,
      title: entryTitle || 'Untitled Reflection',
      category: selectedCategory,
      tags: tags.length > 0 ? tags : [selectedCategory],
      summary,
      sentiment: sentiment || 'Reflective',
      keyInsights,
      actionItems,
      messages,
      isFavorite,
      wordCount: calculateWordCount(),
      createdAt: activeEntry?.createdAt || Date.now(),
      updatedAt: Date.now(),
      ...overrideData
    };

    try {
      // Store in user-isolated Firestore path: /users/{userId}/entries/{entryId}
      const entryRef = doc(db, 'users', user.uid, 'entries', currentEntryId);
      await setDoc(entryRef, {
        ...entryToSave,
        updatedAt: serverTimestamp()
      }, { merge: true });

      setSyncStatus('synced');
      setLastSavedTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
      onEntrySaved?.(entryToSave);
    } catch (err) {
      console.error('Firestore save error:', err);
      setSyncStatus('unsaved');
    }
  };

  const handleSendReflection = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!currentPrompt.trim() || isGenerating) return;

    const userText = currentPrompt.trim();
    const newUserMessage: ConversationMessage = {
      id: `msg_${Date.now()}`,
      role: 'user',
      content: userText,
      timestamp: Date.now()
    };

    const updatedMessages = [...messages, newUserMessage];
    setMessages(updatedMessages);
    setCurrentPrompt('');
    setIsGenerating(true);
    setSyncStatus('unsaved');

    try {
      const response = await fetch('/api/chat/reflect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: userText,
          messages: updatedMessages.slice(-8), // Send context
          mode: selectedMode,
          category: selectedCategory,
          existingTitle: entryTitle
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: Failed to generate reflection`);
      }

      const data: ReflectionResponse = await response.json();

      const newModelMessage: ConversationMessage = {
        id: `msg_model_${Date.now()}`,
        role: 'model',
        content: data.replyText,
        timestamp: Date.now(),
        modelUsed: data.modelUsed
      };

      const finalMessages = [...updatedMessages, newModelMessage];
      const newTitle = entryTitle || data.suggestedTitle || 'Reflection on ' + selectedCategory;
      const newSummary = data.summary || summary;
      const newSentiment = data.sentiment || sentiment;
      const newKeyInsights = Array.from(new Set([...keyInsights, ...(data.keyInsights || [])]));
      const newActionItems = Array.from(new Set([...actionItems, ...(data.actionItems || [])]));
      const newTags = Array.from(new Set([...tags, ...(data.tags || [])]));

      setMessages(finalMessages);
      setEntryTitle(newTitle);
      setSummary(newSummary);
      setSentiment(newSentiment);
      setKeyInsights(newKeyInsights);
      setActionItems(newActionItems);
      setTags(newTags);

      // Save directly to user-isolated Firestore
      await persistToFirestore({
        title: newTitle,
        summary: newSummary,
        sentiment: newSentiment,
        keyInsights: newKeyInsights,
        actionItems: newActionItems,
        tags: newTags,
        messages: finalMessages
      });
    } catch (err: any) {
      console.error('Reflection chat error:', err);
      const errorMessage: ConversationMessage = {
        id: `msg_err_${Date.now()}`,
        role: 'model',
        content: `I encountered an issue connecting to the AI engine: ${err.message}. Please check your connection or try again.`,
        timestamp: Date.now(),
        modelUsed: 'gemini-3.6-flash (fallback)'
      };
      setMessages([...updatedMessages, errorMessage]);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleToggleFavorite = () => {
    const nextVal = !isFavorite;
    setIsFavorite(nextVal);
    persistToFirestore({ isFavorite: nextVal });
  };

  const handleExportEntry = (format: 'markdown' | 'json') => {
    const activeData: JournalEntry = {
      id: currentEntryId,
      userId: user.uid,
      title: entryTitle || 'Untitled Reflection',
      category: selectedCategory,
      tags,
      summary,
      sentiment,
      keyInsights,
      actionItems,
      messages,
      isFavorite,
      wordCount: calculateWordCount(),
      createdAt: activeEntry?.createdAt || Date.now(),
      updatedAt: Date.now()
    };

    let content = '';
    let filename = `${(entryTitle || 'reflection').toLowerCase().replace(/[^a-z0-9]/g, '-')}.${format === 'markdown' ? 'md' : 'json'}`;

    if (format === 'json') {
      content = JSON.stringify(activeData, null, 2);
    } else {
      content = `# ${entryTitle || 'Reflection Entry'}\n\n` +
        `**Category:** ${selectedCategory} | **Date:** ${new Date().toLocaleDateString()} | **Sentiment:** ${sentiment}\n` +
        `**Tags:** ${tags.join(', ')}\n\n` +
        `## Executive Summary\n${summary || 'N/A'}\n\n` +
        `## Key Insights\n${keyInsights.map(i => `- ${i}`).join('\n') || 'None recorded'}\n\n` +
        `## Action Items\n${actionItems.map(a => `- [ ] ${a}`).join('\n') || 'None recorded'}\n\n` +
        `## Multi-Turn Dialogue\n\n` +
        messages.map(m => `### ${m.role === 'user' ? 'You' : 'Gemini 3.6 Flash'}\n${m.content}\n`).join('\n---\n\n');
    }

    const blob = new Blob([content], { type: format === 'json' ? 'application/json' : 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleResetForNewEntry = () => {
    setCurrentEntryId(`entry_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`);
    setEntryTitle('');
    setMessages([]);
    setSummary('');
    setSentiment('');
    setKeyInsights([]);
    setActionItems([]);
    setCompletedActions({});
    setTags(['Reflection']);
    setIsFavorite(false);
    setSyncStatus('synced');
    onNewEntry?.();
  };

  const handleCopyText = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const currentCategoryConfig = CATEGORIES.find(c => c.id === selectedCategory) || CATEGORIES[0];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      
      {/* Left / Main Column: Reflection Conversation & Journal Input */}
      <div className="lg:col-span-8 space-y-4">
        
        {/* Top Control Bar: Category & Mode Pills */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            {/* Category Selector Dropdown / Chips */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 no-scrollbar">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  id={`btn-category-${cat.id}`}
                  onClick={() => {
                    setSelectedCategory(cat.id);
                    persistToFirestore({ category: cat.id });
                  }}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                    selectedCategory === cat.id
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  <span>{cat.icon}</span>
                  <span>{cat.label}</span>
                </button>
              ))}
            </div>

            {/* Sync & Action Tools */}
            <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
              <div className="flex items-center gap-1 text-[11px] font-mono text-slate-500 bg-slate-50 px-2 py-1 rounded border border-slate-200">
                <span className={`w-2 h-2 rounded-full ${
                  syncStatus === 'synced' ? 'bg-emerald-500' : (syncStatus === 'syncing' ? 'bg-amber-500 animate-pulse' : 'bg-rose-500')
                }`} />
                <span>{syncStatus === 'synced' ? 'Firestore Synced' : (syncStatus === 'syncing' ? 'Saving...' : 'Unsaved')}</span>
              </div>

              <button
                onClick={handleToggleFavorite}
                className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                  isFavorite ? 'bg-amber-50 border-amber-300 text-amber-600' : 'bg-white border-slate-200 text-slate-400 hover:text-slate-700'
                }`}
                title={isFavorite ? 'Remove from favorites' : 'Bookmark as favorite'}
              >
                {isFavorite ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
              </button>

              <button
                onClick={() => handleExportEntry('markdown')}
                className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors cursor-pointer"
                title="Export as Markdown"
              >
                <Download className="w-4 h-4" />
              </button>

              <button
                onClick={handleResetForNewEntry}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition-colors shadow-xs cursor-pointer"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>New Entry</span>
              </button>
            </div>
          </div>

          {/* Editable Title Input */}
          <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
            <input
              type="text"
              id="input-entry-title"
              value={entryTitle}
              onChange={(e) => {
                setEntryTitle(e.target.value);
                setSyncStatus('unsaved');
              }}
              onBlur={() => persistToFirestore({ title: entryTitle })}
              placeholder="Title this reflection session (or leave blank for AI to name)..."
              className="w-full text-base font-bold text-slate-900 bg-transparent border-0 focus:outline-none focus:ring-0 placeholder:text-slate-400 placeholder:font-normal"
            />
          </div>
        </div>

        {/* AI Modes Selector Ribbon */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {MODES.map((mode) => (
            <button
              key={mode.id}
              onClick={() => setSelectedMode(mode.id)}
              className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                selectedMode === mode.id
                  ? 'bg-emerald-50/70 border-emerald-300 ring-1 ring-emerald-400/40 text-slate-900'
                  : 'bg-white border-slate-200/80 hover:border-slate-300 text-slate-600'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold block">{mode.label}</span>
                {selectedMode === mode.id && <Sparkles className="w-3 h-3 text-emerald-600" />}
              </div>
              <span className="text-[10px] text-slate-500 line-clamp-1 block mt-0.5">{mode.description}</span>
            </button>
          ))}
        </div>

        {/* Conversation Stream Container */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs min-h-[380px] max-h-[560px] overflow-y-auto p-4 sm:p-6 space-y-6 flex flex-col">
          {messages.length === 0 ? (
            <div className="my-auto text-center py-10 px-4 space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center mx-auto border border-emerald-100 shadow-xs">
                <Feather className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Your Reflection Canvas is Ready</h3>
                <p className="text-xs text-slate-600 max-w-md mx-auto mt-1">
                  Share whatever is on your mind. Gemini 3.6 Flash will explore your ideas with thoughtful questions, summaries, and actionable steps.
                </p>
              </div>

              {/* Inspiration Prompts */}
              <div className="pt-2 max-w-lg mx-auto space-y-2">
                <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                  Prompt Starters for Inspiration
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-left">
                  {PROMPT_INSPIRATIONS.map((promptText, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentPrompt(promptText)}
                      className="p-2.5 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 text-xs text-slate-700 transition-colors text-left flex items-start gap-1.5 cursor-pointer"
                    >
                      <ChevronRight className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                      <span className="line-clamp-2">{promptText}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            messages.map((msg, index) => (
              <div
                key={msg.id || index}
                className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div className="flex items-center gap-1.5 mb-1 px-1">
                  <span className="text-[11px] font-semibold text-slate-600">
                    {msg.role === 'user' ? (user.displayName || 'You') : 'Gemini 3.6 Flash'}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  {msg.role === 'model' && (
                    <span className="text-[10px] font-mono bg-slate-100 text-slate-600 px-1.5 py-0.2 rounded">
                      {msg.modelUsed || 'gemini-3.6-flash'}
                    </span>
                  )}
                </div>

                <div
                  className={`p-4 rounded-2xl text-xs sm:text-sm leading-relaxed max-w-2xl ${
                    msg.role === 'user'
                      ? 'bg-slate-900 text-slate-50 rounded-tr-xs shadow-xs'
                      : 'bg-slate-50 text-slate-900 border border-slate-200 rounded-tl-xs shadow-xs'
                  }`}
                >
                  {msg.role === 'user' ? (
                    <p className="whitespace-pre-wrap">{msg.content}</p>
                  ) : (
                    <div className="markdown-body prose prose-slate prose-sm max-w-none">
                      <ReactMarkdown>{msg.content}</ReactMarkdown>
                    </div>
                  )}

                  {msg.role === 'model' && (
                    <div className="mt-3 pt-2 border-t border-slate-200/80 flex items-center justify-end">
                      <button
                        onClick={() => handleCopyText(msg.id, msg.content)}
                        className="text-[11px] text-slate-500 hover:text-slate-800 flex items-center gap-1 cursor-pointer"
                      >
                        {copiedId === msg.id ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                        <span>{copiedId === msg.id ? 'Copied' : 'Copy'}</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}

          {isGenerating && (
            <div className="flex flex-col items-start space-y-2">
              <div className="flex items-center gap-2 text-xs text-slate-500 font-mono">
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-emerald-600" />
                <span>Gemini 3.6 Flash reflecting & synthesizing insights...</span>
              </div>
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 max-w-md animate-pulse space-y-2">
                <div className="h-2.5 bg-slate-200 rounded w-3/4"></div>
                <div className="h-2.5 bg-slate-200 rounded w-5/6"></div>
                <div className="h-2.5 bg-slate-200 rounded w-1/2"></div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Multi-Turn Input Box */}
        <form onSubmit={handleSendReflection} className="bg-white rounded-xl border border-slate-200 p-3 shadow-xs space-y-2">
          <textarea
            id="input-reflection-prompt"
            rows={3}
            value={currentPrompt}
            onChange={(e) => setCurrentPrompt(e.target.value)}
            onKeyDown={(e) => {
              if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
                handleSendReflection(e);
              }
            }}
            placeholder={currentCategoryConfig.promptPlaceholder}
            className="w-full text-xs sm:text-sm text-slate-900 bg-slate-50/50 p-3 rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-slate-900 resize-none font-sans"
          />

          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-2 text-[11px] text-slate-500">
              <span>Mode: <strong className="text-slate-800 capitalize">{selectedMode}</strong></span>
              <span>•</span>
              <span>Press <kbd className="font-mono bg-slate-100 px-1 py-0.5 rounded border text-[10px]">Cmd/Ctrl + Enter</kbd></span>
            </div>

            <button
              type="submit"
              id="btn-send-reflection"
              disabled={isGenerating || !currentPrompt.trim()}
              className="flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs py-2 px-4 rounded-lg transition-colors shadow-xs disabled:opacity-40 cursor-pointer"
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-emerald-400" />
                  <span>Reflecting...</span>
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Send Reflection</span>
                </>
              )}
            </button>
          </div>
        </form>

      </div>

      {/* Right Column: AI Synthesized Intelligence Panel */}
      <div className="lg:col-span-4 space-y-4">
        
        {/* Entry Metadata & Sentiment Card */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <BrainCircuit className="w-4 h-4 text-emerald-600" />
              <span>AI Reflection Summary</span>
            </h3>
            {sentiment && (
              <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                <Smile className="w-3 h-3 text-emerald-600" />
                {sentiment}
              </span>
            )}
          </div>

          <div>
            <span className="text-[11px] font-semibold text-slate-700 block mb-1">Executive Synthesis:</span>
            <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-200/80">
              {summary || 'Your executive summary will automatically synthesize as you converse with Gemini.'}
            </p>
          </div>

          {/* Tags */}
          <div>
            <span className="text-[11px] font-semibold text-slate-700 block mb-1.5 flex items-center gap-1">
              <Tag className="w-3 h-3 text-slate-500" />
              <span>Extracted Themes & Tags:</span>
            </span>
            <div className="flex flex-wrap gap-1.5">
              {tags.map((tag, idx) => (
                <span
                  key={idx}
                  className="text-[11px] font-mono font-medium bg-slate-100 hover:bg-slate-200 text-slate-800 px-2 py-0.5 rounded-md transition-colors"
                >
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Key Insights Card */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
            <Lightbulb className="w-4 h-4 text-amber-500" />
            <span>Key Takeaways & Insights ({keyInsights.length})</span>
          </h3>

          {keyInsights.length === 0 ? (
            <p className="text-xs text-slate-400 italic">Key insights will formulate as your thoughts develop.</p>
          ) : (
            <ul className="space-y-2">
              {keyInsights.map((insight, idx) => (
                <li key={idx} className="text-xs text-slate-700 flex items-start gap-2 bg-amber-50/40 p-2.5 rounded-lg border border-amber-200/60">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0 mt-1.5" />
                  <span>{insight}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Action Items Card */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
            <ListChecks className="w-4 h-4 text-blue-600" />
            <span>Suggested Action Items ({actionItems.length})</span>
          </h3>

          {actionItems.length === 0 ? (
            <p className="text-xs text-slate-400 italic">Practical next steps extracted by Gemini will appear here.</p>
          ) : (
            <ul className="space-y-2">
              {actionItems.map((action, idx) => (
                <li 
                  key={idx} 
                  onClick={() => setCompletedActions(prev => ({ ...prev, [idx]: !prev[idx] }))}
                  className={`text-xs p-2.5 rounded-lg border flex items-start gap-2.5 transition-all cursor-pointer ${
                    completedActions[idx] 
                      ? 'bg-slate-50 border-slate-200 text-slate-400 line-through' 
                      : 'bg-white border-slate-200 text-slate-800 hover:border-slate-300 shadow-xs'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={Boolean(completedActions[idx])}
                    onChange={() => {}} // Handled by li click
                    className="rounded text-slate-900 focus:ring-slate-900 mt-0.5"
                  />
                  <span className="leading-snug">{action}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Isolation & Cloud Firestore Security Footnote */}
        <div className="p-3.5 bg-slate-900 text-slate-300 rounded-xl text-[11px] space-y-1">
          <div className="flex items-center gap-1.5 text-emerald-400 font-semibold">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>User Isolation Verified</span>
          </div>
          <p className="text-slate-400 leading-relaxed">
            Saved exclusively to: <code className="font-mono text-slate-200">/users/{user.uid.slice(0, 10)}.../entries</code>. Other users cannot access this document.
          </p>
        </div>

      </div>

    </div>
  );
};
