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
  HeartPulse,
  Search,
  Wind,
  Droplets,
  Thermometer,
  SendHorizonal,
  Eye,
  EyeOff,
  KeyRound
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
import { encryptClientSide, decryptClientSide, generateRecoveryPhrase, generatePassphrase } from '../lib/cryptoVault';
import { getSessionPassphrase, setSessionPassphrase, getStoredRecoveryPhrase, setStoredRecoveryPhrase, queueOfflineEntry } from '../lib/offlineQueue';

interface ReflectionStudioProps {
  user: User;
  activeEntry?: JournalEntry | null;
  entries?: JournalEntry[];
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
  entries,
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
  const [placeSearchQuery, setPlaceSearchQuery] = useState('');
  const [isSearchingPlace, setIsSearchingPlace] = useState(false);
  const [showSpatialModal, setShowSpatialModal] = useState(false);

  // Mandatory Encryption Vault Setup: every real (non-guest) save requires a session
  // passphrase. If one isn't set yet, the save is deferred and this gate collects one.
  const [showVaultSetupModal, setShowVaultSetupModal] = useState(false);
  const [pendingSaveOverride, setPendingSaveOverride] = useState<Partial<JournalEntry> | null>(null);
  const [vaultPassphraseInput, setVaultPassphraseInput] = useState('');
  const [vaultPassphraseVisible, setVaultPassphraseVisible] = useState(false);
  const [vaultSetupError, setVaultSetupError] = useState<string | null>(null);
  const [vaultRecoveryToShow, setVaultRecoveryToShow] = useState<string | null>(null);
  // 'passphrase' = normal entry; 'mismatch' = typed passphrase doesn't decrypt existing
  // entries; 'reset' = resetting the passphrase via the recovery phrase instead.
  const [vaultStep, setVaultStep] = useState<'passphrase' | 'mismatch' | 'reset'>('passphrase');
  const [vaultResetInput, setVaultResetInput] = useState('');
  const [vaultResetError, setVaultResetError] = useState<string | null>(null);
  const [vaultResetBusy, setVaultResetBusy] = useState(false);

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
  const [webhookBroadcastType, setWebhookBroadcastType] = useState<'reflection' | 'actions'>('reflection');
  const [webhookStatus, setWebhookStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');
  const [webhookMessage, setWebhookMessage] = useState('');
  const [isPingingWebhook, setIsPingingWebhook] = useState(false);

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

  // Live Spatial & Atmospheric Weather Lookup via Coordinates or Place Query
  const fetchLiveSpatialWeather = async (params: { lat?: number; lng?: number; placeQuery?: string; category?: any }) => {
    try {
      const res = await fetch('/api/spatial/weather-and-location', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params)
      });
      if (res.ok) {
        const spatialData: SpatialContext = await res.json();
        setSpatialContext(spatialData);
        return spatialData;
      }
    } catch (err) {
      console.warn('Live spatial weather fetch error:', err);
    }
    return null;
  };

  // Browser Geolocation auto-detection + Live Weather Fetch
  const handleDetectCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }
    setIsDetectingLocation(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        const liveSpatial = await fetchLiveSpatialWeather({
          lat: latitude,
          lng: longitude,
          category: 'nature'
        });
        setIsDetectingLocation(false);
        if (!liveSpatial) {
          setSpatialContext({
            locationName: `Current GPS (${latitude.toFixed(2)}°, ${longitude.toFixed(2)}°)`,
            coordinates: { lat: latitude, lng: longitude },
            weatherCondition: 'Local Ambient Climate',
            temperatureC: 20,
            atmosphereEmoji: '📍',
            placeCategory: 'nature'
          });
        }
      },
      (err) => {
        setIsDetectingLocation(false);
        console.warn('Geolocation error:', err.message);
        alert('Could not retrieve GPS coordinates. Using curated retreat preset.');
      },
      { timeout: 10000 }
    );
  };

  // Custom Place / Sanctuary Search + Live Weather Fetch
  const handleSearchPlaceLocation = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!placeSearchQuery.trim()) return;
    setIsSearchingPlace(true);
    try {
      await fetchLiveSpatialWeather({ placeQuery: placeSearchQuery.trim() });
      setShowSpatialModal(false);
      setPlaceSearchQuery('');
    } finally {
      setIsSearchingPlace(false);
    }
  };

  // Save current entry state to Cloud Firestore (User Isolated + Client-Side Encrypted)
  const persistToFirestore = async (overrideData?: Partial<JournalEntry>) => {
    if (!user || !user.uid) return;

    // Encryption is mandatory for every real account -- the local guest sandbox never
    // touches Firestore at all, so it's exempt. If no passphrase is active yet, defer
    // this save and collect one instead of writing plaintext.
    const isGuestUser = Boolean(user.uid?.startsWith('guest_'));
    if (!isGuestUser && !getSessionPassphrase()) {
      setPendingSaveOverride(overrideData || {});
      setShowVaultSetupModal(true);
      return;
    }

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

      // If a client-side encryption passphrase exists in session, replace the human-readable
      // fields with an opaque ciphertext envelope before anything reaches Firestore.
      const activePass = getSessionPassphrase();
      let payloadForFirestore: any = {
        ...entryToSave,
        updatedAt: serverTimestamp()
      };

      if (activePass) {
        try {
          // A recovery phrase must exist so entries stay recoverable even if the
          // passphrase is lost -- generate and persist one now if none exists yet.
          let recoveryPhrase = getStoredRecoveryPhrase();
          if (!recoveryPhrase) {
            recoveryPhrase = generateRecoveryPhrase();
            setStoredRecoveryPhrase(recoveryPhrase);
          }

          const sensitiveBody = {
            title: entryToSave.title,
            summary: entryToSave.summary,
            messages: entryToSave.messages,
            keyInsights: entryToSave.keyInsights,
            actionItems: entryToSave.actionItems,
            actionItemsStructured: entryToSave.actionItemsStructured,
            sentiment: entryToSave.sentiment,
            tags: entryToSave.tags,
            spatialContext: entryToSave.spatialContext
          };
          const encryptedEnvelope = await encryptClientSide(sensitiveBody, activePass, recoveryPhrase);

          // Sensitive fields are replaced with locked placeholders -- Firestore only
          // ever sees the ciphertext envelope, never the plaintext reflection.
          payloadForFirestore = {
            ...payloadForFirestore,
            title: '🔒 Encrypted Entry',
            summary: '',
            messages: [],
            keyInsights: [],
            actionItems: [],
            actionItemsStructured: [],
            sentiment: 'Encrypted',
            tags: [],
            spatialContext: null,
            encryptedEnvelope,
            isClientEncrypted: true
          };
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

  const handleTestPingWebhook = async () => {
    if (!webhookUrl.trim()) return;
    setIsPingingWebhook(true);
    setWebhookMessage('');
    try {
      const response = await fetch('/api/webhooks/test-ping', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ webhookUrl: webhookUrl.trim() })
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Webhook ping failed');
      }
      setWebhookStatus('success');
      setWebhookMessage(`✅ Verification Ping Successful! Connected to ${data.platform || 'Webhook'}.`);
    } catch (err: any) {
      setWebhookStatus('error');
      setWebhookMessage(`❌ Verification Failed: ${err.message || 'Could not connect'}`);
    } finally {
      setIsPingingWebhook(false);
    }
  };

  const handleDispatchWebhook = async () => {
    if (!webhookUrl.trim()) return;
    setWebhookStatus('sending');
    setWebhookMessage('');
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
          sentiment,
          spatialContext,
          broadcastType: webhookBroadcastType
        })
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || `Webhook error: ${response.statusText}`);
      }

      const res = await response.json();
      setWebhookStatus('success');
      setWebhookMessage(`✅ Successfully dispatched ${webhookBroadcastType === 'actions' ? 'action commitments' : 'reflection digest'} to ${res.platform || 'Webhook'}!`);
      setTimeout(() => {
        setShowWebhookModal(false);
        setWebhookStatus('idle');
      }, 2500);
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

  // Finalizes vault setup (passphrase now active for this session) and retries
  // whatever save was waiting on it.
  // The most recently saved encrypted entry, used purely as a live decryption
  // canary -- if a typed secret can unwrap this entry's data key, it's the right
  // secret. There's no separate stored password hash anywhere; this check *is*
  // the verification.
  const findEncryptedCanaryEntry = () =>
    (entries || []).find(e => e.isClientEncrypted && e.encryptedEnvelope);

  const resetVaultModalState = () => {
    setShowVaultSetupModal(false);
    setVaultPassphraseInput('');
    setVaultPassphraseVisible(false);
    setVaultSetupError(null);
    setVaultRecoveryToShow(null);
    setVaultStep('passphrase');
    setVaultResetInput('');
    setVaultResetError(null);
    setVaultResetBusy(false);
  };

  const finishVaultSetup = () => {
    resetVaultModalState();
    const override = pendingSaveOverride;
    setPendingSaveOverride(null);
    persistToFirestore(override || undefined);
  };

  const activatePassphraseAndProceed = (passphrase: string) => {
    setSessionPassphrase(passphrase);

    // First time this browser has ever encrypted anything: generate a recovery
    // phrase and force the user to see it before continuing -- it's the only way
    // back in if the passphrase is lost. If one already exists, nothing new to show.
    let recoveryPhrase = getStoredRecoveryPhrase();
    if (!recoveryPhrase) {
      recoveryPhrase = generateRecoveryPhrase();
      setStoredRecoveryPhrase(recoveryPhrase);
      setVaultRecoveryToShow(recoveryPhrase);
    } else {
      finishVaultSetup();
    }
  };

  const handleUnlockVault = async (e?: React.FormEvent) => {
    e?.preventDefault();
    const passphrase = vaultPassphraseInput.trim();
    if (passphrase.length < 8) {
      setVaultSetupError('Use a passphrase of at least 8 characters.');
      return;
    }
    setVaultSetupError(null);

    // If any entry is already encrypted, this typed passphrase must actually
    // decrypt it before we trust it -- otherwise a mistyped or half-remembered
    // passphrase would silently start a second, disconnected vault instead of
    // failing loudly.
    const canary = findEncryptedCanaryEntry();
    if (canary?.encryptedEnvelope) {
      try {
        await decryptClientSide(canary.encryptedEnvelope as any, passphrase);
      } catch {
        setVaultStep('mismatch');
        return;
      }
    }

    activatePassphraseAndProceed(passphrase);
  };

  const handleGeneratePassphrase = () => {
    const generated = generatePassphrase();
    setVaultPassphraseInput(generated);
    setVaultPassphraseVisible(true);
    setVaultSetupError(null);
  };

  const handleTryPassphraseAgain = () => {
    setVaultStep('passphrase');
    setVaultPassphraseInput('');
    setVaultSetupError(null);
  };

  const handleResetWithRecovery = async (e?: React.FormEvent) => {
    e?.preventDefault();
    const recoveryPhrase = vaultResetInput.trim();
    const canary = findEncryptedCanaryEntry();
    if (!recoveryPhrase || !canary?.encryptedEnvelope) return;

    setVaultResetBusy(true);
    setVaultResetError(null);
    try {
      await decryptClientSide(canary.encryptedEnvelope as any, recoveryPhrase);
      // Recovery phrase confirmed valid against real data -- the passphrase
      // typed a moment ago is now deliberately adopted as the new one. Existing
      // entries stay wrapped under the old passphrase; they remain reachable
      // through this same recovery phrase, which never changes.
      activatePassphraseAndProceed(vaultPassphraseInput.trim());
    } catch {
      setVaultResetError('That recovery phrase doesn\'t match your existing entries either.');
    } finally {
      setVaultResetBusy(false);
    }
  };

  const handleCancelVaultSetup = () => {
    resetVaultModalState();
    setPendingSaveOverride(null);
  };

  // This entry's content is encrypted and couldn't be decrypted with the current
  // session passphrase. Refuse to open the editor: its state hydrates directly from
  // activeEntry's (placeholder) fields, and saving would silently overwrite the real
  // ciphertext with blank content.
  if (activeEntry?.needsPassphrase) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-10 text-center space-y-3 shadow-xs">
        <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 mx-auto">
          <Lock className="w-6 h-6" />
        </div>
        <h3 className="text-sm font-bold text-slate-900">This entry is locked</h3>
        <p className="text-xs text-slate-500 max-w-sm mx-auto">
          {activeEntry.decryptionFailed
            ? "The passphrase in this session doesn't match this entry's encryption key."
            : 'Enter your passphrase or recovery phrase in the Encryption Proof tab to unlock it, then come back here.'}
        </p>
        <button
          onClick={() => onNewEntry?.()}
          className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 cursor-pointer"
        >
          Start a new entry instead
        </button>
      </div>
    );
  }

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
            {/* Spatial Grounding with Live Meteorological Weather */}
            <div className="flex flex-wrap items-center gap-2">
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
                className="bg-slate-100 border border-slate-200 rounded-lg px-2.5 py-1 text-slate-800 text-xs font-semibold cursor-pointer focus:outline-emerald-500 max-w-[200px] truncate"
              >
                {SPATIAL_PRESETS.map((p) => (
                  <option key={p.locationName} value={p.locationName}>
                    {p.atmosphereEmoji} {p.locationName}
                  </option>
                ))}
              </select>

              {/* Live Weather Badge */}
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 border border-emerald-200/80 text-emerald-900 font-medium text-[11px]" title={`Atmosphere: ${spatialContext.weatherCondition || 'Calm'}`}>
                <span>{spatialContext.atmosphereEmoji || '🌤️'}</span>
                <span className="font-bold">{spatialContext.temperatureC ?? 20}°C</span>
                <span className="text-emerald-700 hidden sm:inline">• {spatialContext.weatherCondition || 'Clear'}</span>
              </div>

              {/* GPS Detection */}
              <button
                onClick={handleDetectCurrentLocation}
                disabled={isDetectingLocation}
                className="p-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 cursor-pointer text-[11px] flex items-center gap-1 px-2 transition-colors"
                title="Detect GPS & Fetch Live Meteorological Data"
              >
                <Compass className={`w-3.5 h-3.5 ${isDetectingLocation ? 'animate-spin text-emerald-600' : 'text-slate-500'}`} />
                <span>{isDetectingLocation ? 'Locating...' : 'Live GPS'}</span>
              </button>

              {/* Custom Place Search Button */}
              <button
                onClick={() => setShowSpatialModal(true)}
                className="p-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 cursor-pointer text-[11px] flex items-center gap-1 px-2 transition-colors"
                title="Search any city or custom retreat"
              >
                <Search className="w-3.5 h-3.5 text-slate-500" />
                <span>Search City</span>
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

      {/* Spatial Grounding Search Modal */}
      {showSpatialModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl space-y-4 border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-rose-500" />
                Spatial Atmosphere Grounding
              </h3>
              <button
                onClick={() => setShowSpatialModal(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Search any city, neighborhood, or sanctuary. We will geocode your anchor and fetch real-time atmospheric weather metrics (temperature, humidity, sky condition) to contextually ground Gemini 3.7's reflection.
            </p>

            <form onSubmit={handleSearchPlaceLocation} className="space-y-3">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-700">City, Place, or Sanctuary</label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="e.g. Kyoto Japan, Reykjavik Iceland, Lake Tahoe..."
                    value={placeSearchQuery}
                    onChange={(e) => setPlaceSearchQuery(e.target.value)}
                    className="flex-1 text-xs p-2.5 rounded-xl border border-slate-300 focus:outline-emerald-500"
                    autoFocus
                  />
                  <button
                    type="submit"
                    disabled={isSearchingPlace || !placeSearchQuery.trim()}
                    className="px-3.5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold disabled:opacity-50 cursor-pointer flex items-center gap-1.5"
                  >
                    {isSearchingPlace ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Search className="w-3.5 h-3.5" />}
                    <span>Search</span>
                  </button>
                </div>
              </div>
            </form>

            <div className="pt-2 border-t border-slate-100">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-2">Curated Sanctuaries</span>
              <div className="flex flex-wrap gap-1.5">
                {SPATIAL_PRESETS.map((p) => (
                  <button
                    key={p.locationName}
                    onClick={() => {
                      setSpatialContext(p);
                      setShowSpatialModal(false);
                    }}
                    className="px-2.5 py-1 rounded-lg text-xs bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 cursor-pointer flex items-center gap-1"
                  >
                    <span>{p.atmosphereEmoji}</span>
                    <span>{p.locationName.split(',')[0]}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mandatory Encryption Vault Setup Modal */}
      {showVaultSetupModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 text-white rounded-2xl max-w-md w-full p-6 shadow-xl space-y-4 border border-slate-800">
            {vaultRecoveryToShow ? (
              <>
                <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
                  <ShieldCheck className="w-5 h-5 text-emerald-400" />
                  <h3 className="text-sm font-bold text-slate-100">Save your recovery phrase</h3>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  This is the only backup to your encrypted entries if you forget your passphrase. Write it down somewhere safe — it will not be shown again automatically.
                </p>
                <div className="bg-slate-950 border border-slate-700 rounded-xl p-3 font-mono text-xs text-amber-300 select-all">
                  {vaultRecoveryToShow}
                </div>
                <button
                  onClick={finishVaultSetup}
                  className="w-full px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold cursor-pointer"
                >
                  I've saved it — Continue
                </button>
              </>
            ) : vaultStep === 'mismatch' ? (
              <>
                <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
                  <ShieldAlert className="w-5 h-5 text-amber-400" />
                  <h3 className="text-sm font-bold text-slate-100">That doesn't match your existing entries</h3>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  This passphrase can't decrypt what you've already saved. Typing it anyway would start a second, disconnected vault instead of unlocking your real one — so it's blocked rather than silently forked.
                </p>
                <div className="flex gap-2 pt-1">
                  <button
                    onClick={handleTryPassphraseAgain}
                    className="flex-1 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold cursor-pointer"
                  >
                    Try again
                  </button>
                  <button
                    onClick={() => { setVaultStep('reset'); setVaultResetError(null); }}
                    className="flex-1 px-4 py-2.5 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-bold cursor-pointer"
                  >
                    Use recovery phrase
                  </button>
                </div>
              </>
            ) : vaultStep === 'reset' ? (
              <>
                <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
                  <ShieldCheck className="w-5 h-5 text-emerald-400" />
                  <h3 className="text-sm font-bold text-slate-100">Reset your passphrase</h3>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Enter your 12-word recovery phrase to confirm it's really you. Once confirmed, <span className="text-slate-200 font-semibold">{vaultPassphraseInput || 'the passphrase you just typed'}</span> becomes your passphrase going forward. Existing entries stay exactly as they are — this recovery phrase still unlocks them.
                </p>
                <form onSubmit={handleResetWithRecovery} className="space-y-2">
                  <textarea
                    autoFocus
                    rows={2}
                    placeholder="twelve word recovery phrase, space separated"
                    value={vaultResetInput}
                    onChange={(e) => setVaultResetInput(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2.5 text-xs font-mono text-slate-100 focus:outline-emerald-500 resize-none"
                  />
                  {vaultResetError && (
                    <p className="text-[11px] text-rose-400 flex items-center gap-1"><AlertCircle className="w-3 h-3 shrink-0" />{vaultResetError}</p>
                  )}
                  <div className="flex gap-2 pt-1">
                    <button
                      type="button"
                      onClick={handleTryPassphraseAgain}
                      className="flex-1 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold cursor-pointer"
                    >
                      Back
                    </button>
                    <button
                      type="submit"
                      disabled={vaultResetBusy || !vaultResetInput.trim()}
                      className="flex-1 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold cursor-pointer disabled:opacity-50"
                    >
                      {vaultResetBusy ? 'Verifying…' : 'Confirm & reset'}
                    </button>
                  </div>
                </form>
              </>
            ) : (
              <>
                <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
                  <Lock className="w-5 h-5 text-emerald-400" />
                  <h3 className="text-sm font-bold text-slate-100">Unlock your encryption vault</h3>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Every reflection is encrypted client-side before it reaches Firestore — plaintext never touches the server. Enter your passphrase to continue saving. If this is your first time, this creates it. Use the same one every time so your entries stay unlockable.
                </p>
                <form onSubmit={handleUnlockVault} className="space-y-2">
                  <div className="relative">
                    <input
                      type={vaultPassphraseVisible ? 'text' : 'password'}
                      autoFocus
                      placeholder="Encryption passphrase (min. 8 characters)"
                      value={vaultPassphraseInput}
                      onChange={(e) => setVaultPassphraseInput(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-3 pr-9 py-2.5 text-xs font-mono text-slate-100 focus:outline-emerald-500"
                    />
                    <button
                      type="button"
                      onClick={() => setVaultPassphraseVisible(v => !v)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 cursor-pointer"
                      title={vaultPassphraseVisible ? 'Hide' : 'Reveal'}
                    >
                      {vaultPassphraseVisible ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={handleGeneratePassphrase}
                    className="w-full flex items-center justify-center gap-1.5 px-3 py-2 bg-slate-800/60 hover:bg-slate-800 border border-dashed border-slate-700 text-slate-300 rounded-lg text-[11px] font-semibold cursor-pointer"
                  >
                    <KeyRound className="w-3.5 h-3.5 text-emerald-400" />
                    Generate a strong passphrase for me
                  </button>
                  {vaultSetupError && (
                    <p className="text-[11px] text-rose-400 flex items-center gap-1"><AlertCircle className="w-3 h-3 shrink-0" />{vaultSetupError}</p>
                  )}
                  <div className="flex gap-2 pt-1">
                    <button
                      type="button"
                      onClick={handleCancelVaultSetup}
                      className="flex-1 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex-1 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold cursor-pointer"
                    >
                      Unlock &amp; Save
                    </button>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      )}

      {/* Webhook Modal */}
      {showWebhookModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl space-y-4 border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Share2 className="w-4 h-4 text-emerald-600" />
                <h3 className="text-sm font-bold text-slate-900">
                  Outbound Webhook Dispatcher
                </h3>
              </div>
              <button
                onClick={() => setShowWebhookModal(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Dispatch your sanitized reflection summary, sentiment, and action commitments directly to team channels in Slack, Discord, or automated webhook endpoints.
            </p>

            {/* Platform Identification Badge */}
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold text-slate-500">Destination:</span>
              {webhookUrl.includes('hooks.slack.com') ? (
                <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-[11px] font-bold">
                  🟢 Slack Incoming Webhook (Block Kit Formatted)
                </span>
              ) : webhookUrl.includes('discord.com/api/webhooks') ? (
                <span className="px-2 py-0.5 rounded-md bg-indigo-100 text-indigo-800 text-[11px] font-bold">
                  🟣 Discord Webhook (Rich Embed Formatted)
                </span>
              ) : webhookUrl ? (
                <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[11px] font-bold">
                  🌐 Standard JSON Webhook Payload
                </span>
              ) : (
                <span className="text-[11px] text-slate-400">Enter URL below</span>
              )}
            </div>

            {/* Webhook URL Input */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-bold text-slate-700">Webhook URL</label>
                <button
                  onClick={handleTestPingWebhook}
                  disabled={!webhookUrl.trim() || isPingingWebhook}
                  className="text-[11px] text-blue-600 hover:text-blue-700 font-bold disabled:opacity-40 cursor-pointer flex items-center gap-1"
                >
                  {isPingingWebhook ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Zap className="w-3 h-3" />}
                  <span>Send Test Ping</span>
                </button>
              </div>
              <input
                type="url"
                placeholder="https://hooks.slack.com/services/... or https://discord.com/api/webhooks/..."
                value={webhookUrl}
                onChange={(e) => setWebhookUrl(e.target.value)}
                className="w-full text-xs font-mono p-2.5 rounded-xl border border-slate-300 focus:outline-emerald-500"
              />
            </div>

            {/* Broadcast Mode Selection */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-700">Broadcast Content</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setWebhookBroadcastType('reflection')}
                  className={`p-2.5 rounded-xl text-left border cursor-pointer transition-all ${
                    webhookBroadcastType === 'reflection'
                      ? 'bg-emerald-50 border-emerald-300 text-emerald-950 font-bold'
                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100 text-xs'
                  }`}
                >
                  <div className="text-xs">🪞 Full Reflection</div>
                  <div className="text-[10px] text-slate-500 font-normal">Summary, insights & action items</div>
                </button>

                <button
                  type="button"
                  onClick={() => setWebhookBroadcastType('actions')}
                  className={`p-2.5 rounded-xl text-left border cursor-pointer transition-all ${
                    webhookBroadcastType === 'actions'
                      ? 'bg-emerald-50 border-emerald-300 text-emerald-950 font-bold'
                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100 text-xs'
                  }`}
                >
                  <div className="text-xs">⚡ Action Items Only</div>
                  <div className="text-[10px] text-slate-500 font-normal">Team commitment checklist</div>
                </button>
              </div>
            </div>

            {webhookMessage && (
              <div className={`p-2.5 rounded-xl text-xs leading-relaxed ${
                webhookStatus === 'success' ? 'bg-emerald-50 text-emerald-900 border border-emerald-200' : 'bg-rose-50 text-rose-900 border border-rose-200'
              }`}>
                {webhookMessage}
              </div>
            )}

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => setShowWebhookModal(false)}
                className="px-3 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleDispatchWebhook}
                disabled={webhookStatus === 'sending' || !webhookUrl}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold disabled:opacity-50 cursor-pointer flex items-center gap-1.5"
              >
                {webhookStatus === 'sending' ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Dispatching...</span>
                  </>
                ) : (
                  <>
                    <SendHorizonal className="w-3.5 h-3.5" />
                    <span>Dispatch Payload</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
