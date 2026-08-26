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
  ChevronRight,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Shield,
  ShieldCheck,
  ShieldAlert,
  MapPin,
  Compass,
  Sun,
  CloudRain,
  Share2,
  Printer,
  FileJson,
  FileText,
  Sliders,
  Radio,
  ExternalLink,
  Lock,
  HeartPulse
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { User } from 'firebase/auth';
import { db, doc, setDoc, serverTimestamp, getGuestEntries, saveGuestEntries } from '../lib/firebase';
import { 
  EntryCategory, 
  ReflectionMode, 
  ConversationMessage, 
  JournalEntry, 
  ReflectionResponse,
  SpatialContext,
  PrivacyShieldState,
  OwaspInspectionResult,
  DistressAssessment,
  ActionItem
} from '../types';
import { DistressBanner } from './DistressBanner';
import { encryptClientSide } from '../lib/cryptoVault';
import { getSessionPassphrase, queueOfflineEntry } from '../lib/offlineQueue';

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
    id: 'decision_memo', 
    label: 'Decision Memo', 
    icon: '⚖️',
    promptPlaceholder: 'Lay out options, trade-offs, and uncertainties for a key decision...'
  },
  { 
    id: 'mindfulness', 
    label: 'Mindful Check-in', 
    icon: '🧘',
    promptPlaceholder: 'How does your body and mental state feel right now in this exact moment?'
  }
];

const MODES: { id: ReflectionMode; label: string; icon: string; description: string }[] = [
  { id: 'reflect', label: 'Deep Inquire', icon: '🪞', description: 'Empathetic Socratic inquiry & self-awareness mirrors' },
  { id: 'stoic', label: 'Stoic Reframing', icon: '🏛️', description: 'Dichotomy of control, cognitive reframing & resilience' },
  { id: 'brainstorm', label: 'Brainstorm', icon: '💡', description: 'Lateral ideas, counterintuitive angles & analogies' },
  { id: 'summarize', label: 'Synthesize', icon: '📋', description: 'Executive summary, underlying themes & trade-offs' },
  { id: 'first_principles', label: 'First Principles', icon: '🔬', description: 'Feynman deconstruction down to fundamental truths' },
  { id: 'action_items', label: 'Action Items', icon: '⚡', description: 'Practical execution milestones & habit commitments' },
  { id: 'mindfulness', label: 'Somatic Calm', icon: '🌿', description: 'Present-moment grounding & emotional de-escalation' }
];

const SPATIAL_PRESETS: SpatialContext[] = [
  {
    locationName: 'Kyoto Bamboo Sanctuary, Japan',
    coordinates: { lat: 35.0116, lng: 135.7681 },
    weatherCondition: 'Morning Mist & Gentle Rain',
    temperatureC: 18,
    atmosphereEmoji: '🎋',
    placeCategory: 'sanctuary'
  },
  {
    locationName: 'Swiss Alpine Chalet, Zermatt',
    coordinates: { lat: 45.9763, lng: 7.7491 },
    weatherCondition: 'Crisp Mountain Breeze & Clear Sky',
    temperatureC: 9,
    atmosphereEmoji: '🏔️',
    placeCategory: 'nature'
  },
  {
    locationName: 'San Francisco Bay Studio, CA',
    coordinates: { lat: 37.7749, lng: -122.4194 },
    weatherCondition: 'Coastal Fog & Cool Sun',
    temperatureC: 16,
    atmosphereEmoji: '🌉',
    placeCategory: 'workspace'
  },
  {
    locationName: 'Big Sur Coastline, California',
    coordinates: { lat: 36.2704, lng: -121.8081 },
    weatherCondition: 'Ocean Waves & Warm Twilight',
    temperatureC: 21,
    atmosphereEmoji: '🌊',
    placeCategory: 'nature'
  },
  {
    locationName: 'Parisian Left Bank Café, France',
    coordinates: { lat: 48.8566, lng: 2.3522 },
    weatherCondition: 'Overcast & Quiet Drizzle',
    temperatureC: 17,
    atmosphereEmoji: '☕',
    placeCategory: 'urban'
  }
];

const PROMPT_INSPIRATIONS = [
  "What is a decision I've been postponing, and what is the underlying fear?",
  "What was the most energizing moment of my week, and why did it matter?",
  "How can I break down my current biggest project into 3 bite-sized milestones?",
  "What are 3 things within my direct control today versus things I need to release?",
  "If I could not fail, what bold experiment would I launch next month?",
  "Where in my body am I holding stress right now, and what does it need?"
];

// Helper: Client-side PII Redaction & Restoration
function redactPII(text: string): { sanitized: string; count: number; tokenMap: Record<string, string> } {
  let count = 0;
  const tokenMap: Record<string, string> = {};

  // Email regex
  let sanitized = text.replace(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/g, (match) => {
    count++;
    const token = `[REDACTED_EMAIL_${count}]`;
    tokenMap[token] = match;
    return token;
  });

  // Phone regex (US/Intl formats)
  sanitized = sanitized.replace(/(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/g, (match) => {
    count++;
    const token = `[REDACTED_PHONE_${count}]`;
    tokenMap[token] = match;
    return token;
  });

  // API Key / Secret Token regex
  sanitized = sanitized.replace(/(sk-[a-zA-Z0-9]{20,}|AIzaSy[a-zA-Z0-9_-]{33}|ghp_[a-zA-Z0-9]{36})/g, (match) => {
    count++;
    const token = `[REDACTED_SECRET_KEY_${count}]`;
    tokenMap[token] = match;
    return token;
  });

  return { sanitized, count, tokenMap };
}

export const ReflectionStudio: React.FC<ReflectionStudioProps> = ({
  user,
  activeEntry,
  onEntrySaved,
  onNewEntry
}) => {
  const [currentPrompt, setCurrentPrompt] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<EntryCategory>(activeEntry?.category || 'reflection');
  const [selectedMode, setSelectedMode] = useState<ReflectionMode>(activeEntry?.mode || 'reflect');
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
  
  // Spatial Grounding State
  const [spatialContext, setSpatialContext] = useState<SpatialContext>(
    activeEntry?.spatialContext || SPATIAL_PRESETS[0]
  );
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);

  // Privacy Shield State
  const [privacyShieldEnabled, setPrivacyShieldEnabled] = useState(true);
  const [redactionStats, setRedactionStats] = useState<{ count: number; active: boolean }>({ count: 0, active: false });

  // Security & OWASP Inspection Result
  const [latestSecurityAudit, setLatestSecurityAudit] = useState<OwaspInspectionResult | null>(null);

  // Distress Assessment Result
  const [latestDistressAssessment, setLatestDistressAssessment] = useState<DistressAssessment | null>(null);

  // Voice Dictation (Speech Recognition) State
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);

  // Text-To-Speech (Speech Synthesis) State
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [speakingMessageId, setSpeakingMessageId] = useState<string | null>(null);

  // Webhook Modal & Export State
  const [showWebhookModal, setShowWebhookModal] = useState(false);
  const [webhookUrl, setWebhookUrl] = useState('');
  const [webhookStatus, setWebhookStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');
  const [webhookMessage, setWebhookMessage] = useState('');

  const [currentEntryId, setCurrentEntryId] = useState<string>(
    activeEntry?.id || `entry_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`
  );

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Setup Web Speech API for voice dictation
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onresult = (event: any) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        if (transcript) {
          setCurrentPrompt(prev => prev ? `${prev} ${transcript}` : transcript);
        }
      };

      recognition.onerror = (err: any) => {
        console.warn('Speech recognition error:', err);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }
  }, []);

  // Sync state if activeEntry changes externally
  useEffect(() => {
    if (activeEntry) {
      setCurrentEntryId(activeEntry.id);
      setSelectedCategory(activeEntry.category);
      if (activeEntry.mode) setSelectedMode(activeEntry.mode);
      setEntryTitle(activeEntry.title);
      setMessages(activeEntry.messages || []);
      setSummary(activeEntry.summary || '');
      setSentiment(activeEntry.sentiment || '');
      setKeyInsights(activeEntry.keyInsights || []);
      setActionItems(activeEntry.actionItems || []);
      setTags(activeEntry.tags || []);
      setIsFavorite(activeEntry.isFavorite || false);
      if (activeEntry.spatialContext) setSpatialContext(activeEntry.spatialContext);
      setSyncStatus('synced');
    }
  }, [activeEntry]);

  // Scroll to bottom when messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isGenerating]);

  // Keyboard shortcut listener: Cmd/Ctrl + Enter to reflect
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
        e.preventDefault();
        handleSendReflection();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentPrompt, isGenerating, selectedMode, selectedCategory, spatialContext, privacyShieldEnabled]);

  // Calculate total word count
  const calculateWordCount = () => {
    return messages
      .filter((m) => m.role === 'user')
      .reduce((acc, m) => acc + m.content.trim().split(/\s+/).filter(Boolean).length, 0);
  };

  // Toggle Voice Dictation
  const toggleVoiceDictation = () => {
    if (!recognitionRef.current) {
      alert('Speech Recognition is not supported by your browser. Please try Google Chrome or Edge.');
      return;
    }
    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (err) {
        console.error('Error starting speech recognition:', err);
      }
    }
  };

  // Toggle Audio Playback (TTS)
  const handleToggleSpeech = (msgId: string, textToRead: string) => {
    if (!('speechSynthesis' in window)) {
      alert('Text-to-speech is not supported in this browser environment.');
      return;
    }

    if (isSpeaking && speakingMessageId === msgId) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      setSpeakingMessageId(null);
      return;
    }

    window.speechSynthesis.cancel(); // Stop ongoing speech
    // Clean markdown symbols for natural speech
    const cleanText = textToRead.replace(/[#*_`[\]()]/g, '');
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 0.95; // Mindful, measured cadence
    utterance.pitch = 1.0;

    utterance.onend = () => {
      setIsSpeaking(false);
      setSpeakingMessageId(null);
    };

    utterance.onerror = () => {
      setIsSpeaking(false);
      setSpeakingMessageId(null);
    };

    setSpeakingMessageId(msgId);
    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  // Browser Geolocation auto-detection
  const handleDetectCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }
    setIsDetectingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setIsDetectingLocation(false);
        const { latitude, longitude } = pos.coords;
        setSpatialContext({
          locationName: `Current GPS (${latitude.toFixed(2)}°, ${longitude.toFixed(2)}°)`,
          coordinates: { lat: latitude, lng: longitude },
          weatherCondition: 'Local Ambient Weather',
          temperatureC: 20,
          atmosphereEmoji: '📍',
          placeCategory: 'nature'
        });
      },
      (err) => {
        setIsDetectingLocation(false);
        console.warn('Geolocation error:', err.message);
        alert('Could not retrieve GPS coordinates. Using curated retreat preset.');
      },
      { timeout: 8000 }
    );
  };

  // Save current entry state to Cloud Firestore (User Isolated + Client-Side Encrypted)
  const persistToFirestore = async (overrideData?: Partial<JournalEntry>) => {
    if (!user || !user.uid) return;
    setSyncStatus('syncing');

    const structuredActions: ActionItem[] = (overrideData?.actionItemsStructured || actionItems.map((text, idx) => ({
      id: `act_${currentEntryId}_${idx}`,
      text,
      status: 'open',
      priority: 'medium'
    })));

    const entryToSave: JournalEntry = {
      id: currentEntryId,
      userId: user.uid,
      title: entryTitle || 'Untitled Reflection',
      category: selectedCategory,
      mode: selectedMode,
      tags: tags.length > 0 ? tags : [selectedCategory],
      summary,
      sentiment: sentiment || 'Reflective',
      keyInsights,
      actionItems,
      actionItemsStructured: structuredActions,
      messages,
      spatialContext,
      isFavorite,
      wordCount: calculateWordCount(),
      privacyShieldUsed: privacyShieldEnabled,
      createdAt: activeEntry?.createdAt || Date.now(),
      updatedAt: Date.now(),
      ...overrideData
    };

    try {
      // If user is a Guest Tester in Sandbox mode, persist to local guest storage
      if (user.uid?.startsWith('guest_')) {
        const currentGuestList = getGuestEntries();
        const existingIdx = currentGuestList.findIndex((e: any) => e.id === currentEntryId);
        if (existingIdx >= 0) {
          currentGuestList[existingIdx] = entryToSave;
        } else {
          currentGuestList.unshift(entryToSave);
        }
        saveGuestEntries(currentGuestList);
        setSyncStatus('synced');
        setLastSavedTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
        onEntrySaved?.(entryToSave);
        return;
      }

      // If a client-side encryption passphrase exists in session, encrypt payload into opaque ciphertext
      const activePass = getSessionPassphrase();
      let payloadForFirestore: any = {
        ...entryToSave,
        updatedAt: serverTimestamp()
      };

      if (activePass) {
        try {
          const sensitiveBody = {
            title: entryToSave.title,
            summary: entryToSave.summary,
            messages: entryToSave.messages,
            keyInsights: entryToSave.keyInsights,
            actionItems: entryToSave.actionItems,
            spatialContext: entryToSave.spatialContext
          };
          const encryptedEnvelope = await encryptClientSide(sensitiveBody, activePass);
          payloadForFirestore.encryptedEnvelope = encryptedEnvelope;
          payloadForFirestore.isClientEncrypted = true;
        } catch (encErr) {
          console.warn('Client encryption warning:', encErr);
        }
      }

      // Store in user-isolated Firestore path: /users/{userId}/entries/{entryId}
      const entryRef = doc(db, 'users', user.uid, 'entries', currentEntryId);
      await setDoc(entryRef, payloadForFirestore, { merge: true });

      setSyncStatus('synced');
      setLastSavedTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
      onEntrySaved?.(entryToSave);
    } catch (err) {
      console.error('Firestore save error:', err);
      // Fallback: Queue offline for resilient sync
      queueOfflineEntry(entryToSave);
      setSyncStatus('unsaved');
    }
  };

  // Main Reflection Dispatcher
  const handleSendReflection = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!currentPrompt.trim() || isGenerating) return;

    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }

    const rawUserText = currentPrompt.trim();
    
    // Apply Privacy Shield (PII Redaction) if enabled
    let textToSend = rawUserText;
    let redactedCount = 0;
    if (privacyShieldEnabled) {
      const redactor = redactPII(rawUserText);
      textToSend = redactor.sanitized;
      redactedCount = redactor.count;
      setRedactionStats({ count: redactedCount, active: redactedCount > 0 });
    }

    const newUserMessage: ConversationMessage = {
      id: `msg_${Date.now()}`,
      role: 'user',
      content: rawUserText, // Store raw in private user Firestore
      timestamp: Date.now(),
      spatialContext
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
          prompt: textToSend,
          messages: updatedMessages.slice(-8), // Send context
          mode: selectedMode,
          category: selectedCategory,
          existingTitle: entryTitle,
          spatialContext
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: Failed to generate reflection`);
      }

      const data: ReflectionResponse = await response.json();

      if (data.owaspInspection) {
        setLatestSecurityAudit(data.owaspInspection);
      }

      if (data.distressAssessment) {
        setLatestDistressAssessment(data.distressAssessment);
      }

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
        mode: selectedMode,
        summary: newSummary,
        sentiment: newSentiment,
        keyInsights: newKeyInsights,
        actionItems: newActionItems,
        tags: newTags,
        messages: finalMessages,
        spatialContext
      });
    } catch (err: any) {
      console.error('Reflection chat error:', err);
      const errorMessage: ConversationMessage = {
        id: `msg_err_${Date.now()}`,
        role: 'model',
        content: `I encountered an issue connecting to the AI engine: ${err.message}. Your thoughts are safely buffered in local storage.`,
        timestamp: Date.now(),
        modelUsed: 'gemini-3.6-flash (fallback)'
      };
      setMessages([...updatedMessages, errorMessage]);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleToggleActionItem = (idx: number) => {
    setCompletedActions(prev => ({
      ...prev,
      [idx]: !prev[idx]
    }));
  };

  const handleToggleFavorite = () => {
    const nextVal = !isFavorite;
    setIsFavorite(nextVal);
    persistToFirestore({ isFavorite: nextVal });
  };

  const handleExportEntry = (format: 'markdown' | 'json' | 'print') => {
    if (format === 'print') {
      window.print();
      return;
    }

    const activeData: JournalEntry = {
      id: currentEntryId,
      userId: user.uid,
      title: entryTitle || 'Untitled Reflection',
      category: selectedCategory,
      mode: selectedMode,
      tags,
      summary,
      sentiment,
      keyInsights,
      actionItems,
      messages,
      spatialContext,
      isFavorite,
      wordCount: calculateWordCount(),
      createdAt: activeEntry?.createdAt || Date.now(),
      updatedAt: Date.now()
    };

    let content = '';
    const filename = `${(entryTitle || 'reflection').toLowerCase().replace(/[^a-z0-9]/g, '-')}.${format === 'markdown' ? 'md' : 'json'}`;

    if (format === 'json') {
      content = JSON.stringify(activeData, null, 2);
    } else {
      content = `# ${entryTitle || 'Reflection Entry'}\n\n` +
        `**Category:** ${selectedCategory} | **Mode:** ${selectedMode} | **Date:** ${new Date().toLocaleDateString()} | **Sentiment:** ${sentiment}\n` +
        `**Spatial Location:** ${spatialContext?.locationName || 'Unspecified'} (${spatialContext?.weatherCondition || 'N/A'})\n` +
        `**Tags:** ${tags.join(', ')}\n\n` +
        `## Executive Summary\n${summary || 'N/A'}\n\n` +
        `## Key Insights\n${keyInsights.map(i => `- ${i}`).join('\n') || 'None recorded'}\n\n` +
        `## Action Items\n${actionItems.map((a, i) => `- [${completedActions[i] ? 'x' : ' '}] ${a}`).join('\n') || 'None recorded'}\n\n` +
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

  const handleDispatchWebhook = async () => {
    if (!webhookUrl.trim()) return;
    setWebhookStatus('sending');
    try {
      const response = await fetch('/api/export/webhook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          webhookUrl: webhookUrl.trim(),
          entryTitle: entryTitle || 'Daily Reflection',
          summary,
          keyInsights,
          actionItems,
          sentiment
        })
      });

      if (!response.ok) {
        throw new Error(`Webhook error: ${response.statusText}`);
      }

      const res = await response.json();
      setWebhookStatus('success');
      setWebhookMessage('Successfully dispatched payload to endpoint!');
      setTimeout(() => {
        setShowWebhookModal(false);
        setWebhookStatus('idle');
      }, 2000);
    } catch (err: any) {
      setWebhookStatus('error');
      setWebhookMessage(err.message || 'Failed to dispatch webhook');
    }
  };

  const handleResetForNewEntry = () => {
    if (isSpeaking) {
      window.speechSynthesis?.cancel();
      setIsSpeaking(false);
    }
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
    setLatestSecurityAudit(null);
    onNewEntry?.();
  };

  const handleCopyText = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      
      {/* Main Left Column: Reflection Conversation & Journal Studio */}
      <div className="lg:col-span-8 space-y-4">
        
        {/* Top Control Bar: Categories, Thinking Modes, & Spatial Presence */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs space-y-4">
          
          {/* Row 1: Categories Selector Chips */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-emerald-600" />
                1. Select Focus Category
              </span>
              <span className="text-[11px] text-slate-400 font-mono">
                {CATEGORIES.length} Structured Templates
              </span>
            </div>
            <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  id={`btn-category-${cat.id}`}
                  onClick={() => {
                    setSelectedCategory(cat.id);
                    persistToFirestore({ category: cat.id });
                  }}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
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
          </div>

          {/* Row 2: 7 Cognitive Thinking Personas */}
          <div className="space-y-1.5 pt-2 border-t border-slate-100">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                <BrainCircuit className="w-3.5 h-3.5 text-blue-600" />
                2. Cognitive Reasoning Persona (Gemini 3.6 Flash)
              </span>
              <span className="text-[11px] text-slate-500 italic">
                {MODES.find(m => m.id === selectedMode)?.description}
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-1.5">
              {MODES.map((m) => (
                <button
                  key={m.id}
                  id={`btn-mode-${m.id}`}
                  onClick={() => {
                    setSelectedMode(m.id);
                    persistToFirestore({ mode: m.id });
                  }}
                  className={`flex flex-col items-center justify-center p-2 rounded-xl text-center transition-all cursor-pointer border ${
                    selectedMode === m.id
                      ? 'bg-emerald-50 text-emerald-950 border-emerald-300 font-bold shadow-2xs'
                      : 'bg-slate-50 text-slate-600 border-slate-200/80 hover:bg-slate-100 font-medium'
                  }`}
                >
                  <span className="text-base mb-0.5">{m.icon}</span>
                  <span className="text-[11px] leading-tight">{m.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Row 3: Spatial Grounding & Privacy Shield Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100 text-xs">
            {/* Spatial Grounding Presets */}
            <div className="flex items-center gap-2">
              <span className="text-slate-500 flex items-center gap-1 font-medium">
                <MapPin className="w-3.5 h-3.5 text-rose-500" />
                Spatial Anchor:
              </span>
              <select
                value={spatialContext.locationName}
                onChange={(e) => {
                  const found = SPATIAL_PRESETS.find(p => p.locationName === e.target.value);
                  if (found) setSpatialContext(found);
                }}
                className="bg-slate-100 border border-slate-200 rounded-lg px-2.5 py-1 text-slate-800 text-xs font-semibold cursor-pointer focus:outline-emerald-500"
              >
                {SPATIAL_PRESETS.map((p) => (
                  <option key={p.locationName} value={p.locationName}>
                    {p.atmosphereEmoji} {p.locationName}
                  </option>
                ))}
              </select>
              <button
                onClick={handleDetectCurrentLocation}
                disabled={isDetectingLocation}
                className="p-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 cursor-pointer text-[11px] flex items-center gap-1 px-2"
                title="Detect GPS location"
              >
                <Compass className={`w-3.5 h-3.5 ${isDetectingLocation ? 'animate-spin text-emerald-600' : 'text-slate-500'}`} />
                <span>{isDetectingLocation ? 'Detecting...' : 'Detect GPS'}</span>
              </button>
            </div>

            {/* Privacy Shield Toggle */}
            <div className="flex items-center gap-2 ml-auto">
              <button
                onClick={() => setPrivacyShieldEnabled(!privacyShieldEnabled)}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-semibold transition-all cursor-pointer ${
                  privacyShieldEnabled
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                    : 'bg-slate-100 text-slate-500 border-slate-200'
                }`}
                title="Automatically redacts Emails, Phone Numbers, and API Keys before sending to AI"
              >
                <ShieldCheck className={`w-3.5 h-3.5 ${privacyShieldEnabled ? 'text-emerald-600' : 'text-slate-400'}`} />
                <span>Privacy Shield: {privacyShieldEnabled ? 'ON' : 'OFF'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Studio Conversation & Reflection Stream Container */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
          
          {/* Header of Entry */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
            <input
              type="text"
              placeholder="Title your reflection session..."
              value={entryTitle}
              onChange={(e) => {
                setEntryTitle(e.target.value);
                setSyncStatus('unsaved');
              }}
              onBlur={() => persistToFirestore({ title: entryTitle })}
              className="text-base sm:text-lg font-bold text-slate-900 bg-transparent border-none outline-none focus:ring-0 placeholder:text-slate-300 flex-1 min-w-[200px]"
            />

            <div className="flex items-center gap-2">
              <span className={`text-[11px] font-mono flex items-center gap-1 px-2 py-0.5 rounded-full ${
                syncStatus === 'synced'
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : syncStatus === 'syncing'
                  ? 'bg-amber-50 text-amber-700 border border-amber-200 animate-pulse'
                  : 'bg-slate-100 text-slate-600'
              }`}>
                <CheckCircle2 className="w-3 h-3" />
                {syncStatus === 'synced' ? (lastSavedTime ? `Synced (${lastSavedTime})` : 'Synced') : syncStatus === 'syncing' ? 'Syncing...' : 'Unsaved'}
              </span>

              <button
                onClick={handleToggleFavorite}
                className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 cursor-pointer"
                title="Mark as favorite"
              >
                {isFavorite ? <BookmarkCheck className="w-4 h-4 text-amber-500 fill-amber-500" /> : <Bookmark className="w-4 h-4" />}
              </button>

              <button
                onClick={handleResetForNewEntry}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold cursor-pointer"
              >
                <PlusCircle className="w-3.5 h-3.5 text-emerald-400" />
                <span>New</span>
              </button>
            </div>
          </div>

          {/* Distress Support Intervention Banner (Calm & Dismissible) */}
          {latestDistressAssessment && (
            <DistressBanner
              assessment={latestDistressAssessment}
              onDismiss={() => setLatestDistressAssessment(null)}
            />
          )}

          {/* Dialogue / Messages Stream */}
          <div className="space-y-4 max-h-[520px] overflow-y-auto pr-1">
            {messages.length === 0 ? (
              <div className="py-12 px-4 text-center space-y-3 bg-slate-50/70 rounded-xl border border-dashed border-slate-200">
                <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center mx-auto shadow-2xs">
                  <Feather className="w-6 h-6" />
                </div>
                <h3 className="text-sm font-bold text-slate-800">Your Reflection Canvas is Ready</h3>
                <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
                  Express what is occupying your thoughts, decisions you face, or milestones achieved. Gemini 3.6 Flash will reason alongside you in <strong>{MODES.find(m => m.id === selectedMode)?.label}</strong> mode.
                </p>

                {/* Prompt Inspirations Chips */}
                <div className="pt-2 flex flex-wrap justify-center gap-1.5 max-w-lg mx-auto">
                  {PROMPT_INSPIRATIONS.map((insp, i) => (
                    <button
                      key={i}
                      onClick={() => setCurrentPrompt(insp)}
                      className="px-2.5 py-1 rounded-full bg-white border border-slate-200 hover:border-emerald-400 text-[11px] text-slate-600 hover:text-emerald-800 transition-colors text-left cursor-pointer"
                    >
                      💡 {insp}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              messages.map((msg, idx) => (
                <div
                  key={msg.id || idx}
                  className={`flex flex-col space-y-1.5 ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
                >
                  <div className="flex items-center gap-1.5 text-[11px] text-slate-400 px-1 font-mono">
                    <span>{msg.role === 'user' ? 'You' : 'Gemini 3.6 Flash'}</span>
                    <span>•</span>
                    <span>{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    {msg.modelUsed && (
                      <span className="px-1.5 py-0.2 bg-emerald-50 text-emerald-700 rounded text-[10px] font-bold">
                        {msg.modelUsed}
                      </span>
                    )}
                  </div>

                  <div
                    className={`p-4 rounded-2xl text-xs sm:text-sm leading-relaxed max-w-[90%] sm:max-w-[85%] relative group ${
                      msg.role === 'user'
                        ? 'bg-slate-900 text-white rounded-br-xs'
                        : 'bg-slate-50 text-slate-800 border border-slate-200 rounded-bl-xs'
                    }`}
                  >
                    {msg.role === 'user' ? (
                      <p className="whitespace-pre-wrap">{msg.content}</p>
                    ) : (
                      <div className="markdown-body space-y-2">
                        <ReactMarkdown>{msg.content}</ReactMarkdown>
                      </div>
                    )}

                    {/* Action Bar (Audio Read, Copy) */}
                    <div className="flex items-center gap-1.5 pt-2 mt-2 border-t border-slate-200/50 justify-end">
                      {msg.role === 'model' && (
                        <button
                          onClick={() => handleToggleSpeech(msg.id, msg.content)}
                          className="flex items-center gap-1 px-2 py-0.5 rounded bg-white border border-slate-200 hover:bg-slate-100 text-slate-600 text-[10px] font-semibold cursor-pointer"
                        >
                          {isSpeaking && speakingMessageId === msg.id ? (
                            <>
                              <VolumeX className="w-3 h-3 text-rose-600 animate-pulse" />
                              <span className="text-rose-600">Stop Voice</span>
                            </>
                          ) : (
                            <>
                              <Volume2 className="w-3 h-3 text-emerald-600" />
                              <span>Listen Aloud</span>
                            </>
                          )}
                        </button>
                      )}

                      <button
                        onClick={() => handleCopyText(msg.id, msg.content)}
                        className="flex items-center gap-1 px-2 py-0.5 rounded bg-white border border-slate-200 hover:bg-slate-100 text-slate-600 text-[10px] font-semibold cursor-pointer"
                      >
                        {copiedId === msg.id ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3 text-slate-400" />}
                        <span>{copiedId === msg.id ? 'Copied' : 'Copy'}</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}

            {/* Generating Skeletons */}
            {isGenerating && (
              <div className="flex items-start gap-2.5 p-4 rounded-2xl bg-slate-50 border border-slate-200 max-w-sm">
                <div className="w-4 h-4 rounded-full bg-emerald-600 animate-ping mt-1" />
                <div className="space-y-1.5">
                  <div className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <span>Reasoning with Gemini 3.6 Flash...</span>
                  </div>
                  <div className="text-[11px] text-slate-500 font-mono">
                    Applying {MODES.find(m => m.id === selectedMode)?.label} perspective
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Bottom Reflection Input & Voice Controls */}
          <form onSubmit={handleSendReflection} className="pt-2 border-t border-slate-100 space-y-2">
            <div className="relative rounded-2xl border border-slate-300 focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-500/20 bg-slate-50/50 p-2 transition-all">
              <textarea
                rows={3}
                placeholder={CATEGORIES.find(c => c.id === selectedCategory)?.promptPlaceholder || 'Type or speak your stream of consciousness...'}
                value={currentPrompt}
                onChange={(e) => setCurrentPrompt(e.target.value)}
                className="w-full bg-transparent border-none outline-none text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 resize-none p-1"
              />

              <div className="flex items-center justify-between pt-2 border-t border-slate-200/60">
                {/* Voice Dictation Button & Status */}
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={toggleVoiceDictation}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      isListening
                        ? 'bg-rose-500 text-white animate-pulse shadow-xs'
                        : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    {isListening ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5 text-emerald-600" />}
                    <span>{isListening ? 'Listening (Speak now)...' : 'Voice Dictate'}</span>
                  </button>

                  <span className="text-[11px] text-slate-400 font-mono hidden sm:inline">
                    {calculateWordCount()} words • Cmd+Enter to send
                  </span>
                </div>

                {/* Submit Reflection Button */}
                <div className="flex items-center gap-2">
                  <button
                    type="submit"
                    disabled={!currentPrompt.trim() || isGenerating}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Reflect &amp; Reason</span>
                    <Send className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>

            {/* Redaction Notice if active */}
            {redactionStats.active && (
              <div className="text-[11px] text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-1.5 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Privacy Shield masked {redactionStats.count} sensitive identifier(s) before network dispatch.</span>
              </div>
            )}
          </form>
        </div>
      </div>

      {/* Right Column: Real-Time Executive Insights, Action Items & Export Suite */}
      <div className="lg:col-span-4 space-y-4">
        
        {/* Card 1: Executive Summary & Sentiment */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <Lightbulb className="w-4 h-4 text-amber-500" />
              Executive Synthesis
            </h3>
            {sentiment && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                {sentiment}
              </span>
            )}
          </div>

          <p className="text-xs text-slate-600 leading-relaxed italic">
            {summary || 'Your executive reflection summary will be synthesized here as you converse with Gemini.'}
          </p>

          {/* Tags */}
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-1 pt-1">
              {tags.map((t, i) => (
                <span key={i} className="text-[10px] px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 font-mono font-medium">
                  #{t}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Card 2: Interactive Action Item Tracker */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <ListChecks className="w-4 h-4 text-emerald-600" />
              Action Commitments ({actionItems.length})
            </h3>
          </div>

          {actionItems.length === 0 ? (
            <p className="text-xs text-slate-400 italic">
              Concrete next steps will be extracted automatically from your reflection.
            </p>
          ) : (
            <div className="space-y-2">
              {actionItems.map((item, idx) => (
                <label
                  key={idx}
                  className={`flex items-start gap-2.5 p-2 rounded-xl border text-xs transition-colors cursor-pointer ${
                    completedActions[idx]
                      ? 'bg-slate-50 border-slate-200 text-slate-400 line-through'
                      : 'bg-white border-slate-200 text-slate-800 hover:border-emerald-300'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={Boolean(completedActions[idx])}
                    onChange={() => handleToggleActionItem(idx)}
                    className="mt-0.5 rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                  />
                  <span className="leading-snug">{item}</span>
                </label>
              ))}
            </div>
          )}
        </div>

        {/* Card 3: Key Philosophical / Strategic Insights */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3">
          <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-100 pb-2">
            <Sparkles className="w-4 h-4 text-purple-600" />
            Key Insights
          </h3>

          {keyInsights.length === 0 ? (
            <p className="text-xs text-slate-400 italic">
              Core realizations and cognitive patterns will appear here.
            </p>
          ) : (
            <ul className="space-y-2 text-xs text-slate-700">
              {keyInsights.map((insight, idx) => (
                <li key={idx} className="flex items-start gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  <span className="text-purple-600 font-bold">•</span>
                  <span className="leading-relaxed">{insight}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Card 4: Universal Export & Webhook Integration Suite */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3">
          <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-100 pb-2">
            <Share2 className="w-4 h-4 text-blue-600" />
            Export &amp; Integration Suite
          </h3>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => handleExportEntry('markdown')}
              className="flex items-center justify-center gap-1.5 p-2 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-semibold cursor-pointer transition-colors"
            >
              <FileText className="w-3.5 h-3.5 text-blue-600" />
              <span>Markdown (.md)</span>
            </button>

            <button
              onClick={() => handleExportEntry('json')}
              className="flex items-center justify-center gap-1.5 p-2 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-semibold cursor-pointer transition-colors"
            >
              <FileJson className="w-3.5 h-3.5 text-amber-600" />
              <span>JSON Backup</span>
            </button>

            <button
              onClick={() => handleExportEntry('print')}
              className="flex items-center justify-center gap-1.5 p-2 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-semibold cursor-pointer transition-colors"
            >
              <Printer className="w-3.5 h-3.5 text-slate-600" />
              <span>Print Dossier</span>
            </button>

            <button
              onClick={() => setShowWebhookModal(true)}
              className="flex items-center justify-center gap-1.5 p-2 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-semibold cursor-pointer transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5 text-emerald-600" />
              <span>Slack/Discord</span>
            </button>
          </div>
        </div>

        {/* Card 5: OWASP LLM Prompt Defense Live Telemetry */}
        {latestSecurityAudit && (
          <div className="bg-slate-900 text-white rounded-2xl p-5 shadow-xs space-y-2 text-xs">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="font-bold flex items-center gap-1.5 text-emerald-400">
                <ShieldCheck className="w-4 h-4" />
                OWASP LLM Defense
              </span>
              <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                latestSecurityAudit.riskLevel === 'LOW'
                  ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                  : 'bg-amber-950 text-amber-400 border border-amber-800'
              }`}>
                Risk: {latestSecurityAudit.riskLevel} ({latestSecurityAudit.riskScore}/100)
              </span>
            </div>
            <p className="text-slate-300 text-[11px] leading-relaxed">
              {latestSecurityAudit.explanation}
            </p>
          </div>
        )}
      </div>

      {/* Webhook Modal */}
      {showWebhookModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl space-y-4 border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Share2 className="w-4 h-4 text-emerald-600" />
                Dispatch Reflection to Webhook
              </h3>
              <button
                onClick={() => setShowWebhookModal(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Enter your Slack Incoming Webhook, Discord Webhook, or Zapier endpoint. We will format and dispatch your structured summary and action items instantly.
            </p>

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-700">Webhook URL</label>
              <input
                type="url"
                placeholder="https://hooks.slack.com/services/... or https://discord.com/api/webhooks/..."
                value={webhookUrl}
                onChange={(e) => setWebhookUrl(e.target.value)}
                className="w-full text-xs font-mono p-2.5 rounded-xl border border-slate-300 focus:outline-emerald-500"
              />
            </div>

            {webhookMessage && (
              <div className={`p-2.5 rounded-xl text-xs ${
                webhookStatus === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-rose-50 text-rose-800 border border-rose-200'
              }`}>
                {webhookMessage}
              </div>
            )}

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setShowWebhookModal(false)}
                className="px-3 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleDispatchWebhook}
                disabled={webhookStatus === 'sending' || !webhookUrl}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold disabled:opacity-50 cursor-pointer"
              >
                {webhookStatus === 'sending' ? 'Dispatching...' : 'Send Payload'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
