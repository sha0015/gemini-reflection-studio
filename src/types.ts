export type EntryCategory = 
  | 'reflection' 
  | 'journal' 
  | 'brainstorm' 
  | 'gratitude' 
  | 'goal' 
  | 'mindfulness'
  | 'decision_memo';

export type ReflectionMode = 
  | 'reflect' 
  | 'stoic' 
  | 'brainstorm' 
  | 'summarize' 
  | 'first_principles' 
  | 'action_items' 
  | 'mindfulness';

export interface SpatialContext {
  locationName: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
  weatherCondition?: string;
  temperatureC?: number;
  atmosphereEmoji?: string;
  placeCategory?: 'nature' | 'urban' | 'workspace' | 'sanctuary' | 'travel';
}

export interface PrivacyShieldState {
  enabled: boolean;
  redactedCount: number;
  tokensRedacted: string[];
}

export interface OwaspInspectionResult {
  isClean: boolean;
  riskScore: number; // 0 to 100
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'BLOCKED';
  detectedPatterns: string[];
  explanation?: string;
}

export type ActionItemStatus = 'open' | 'done' | 'dropped';

export interface ActionItem {
  id: string;
  text: string;
  status: ActionItemStatus;
  completed?: boolean;
  targetDate?: string;
  resolvedAt?: string;
  priority?: 'high' | 'medium' | 'low';
  followUpNote?: string;
}

export interface ConversationMessage {
  id: string;
  role: 'user' | 'model';
  content: string;
  timestamp: number;
  modelUsed?: string;
  spatialContext?: SpatialContext;
}

export interface DistressResource {
  name: string;
  contact: string;
  description: string;
  available: string;
}

export interface DistressAssessment {
  isDistressDetected: boolean;
  category: 'None' | 'Severe_Anxiety' | 'Depressive_Overwhelm' | 'Burnout' | 'Crisis_Distress';
  calmNotice: string;
  resources: DistressResource[];
}

export interface KeyWrap {
  salt: string;
  iv: string;
  wrappedKey: string;
}

export interface EncryptedEnvelope {
  v: number;
  iv: string;
  ct: string;
  tagLength?: number;
  encryptedAt: string;
  keyWraps: {
    passphrase: KeyWrap;
    recovery: KeyWrap;
  };
}

export interface JournalEntry {
  id: string;
  userId: string;
  title: string;
  category: EntryCategory;
  mode?: ReflectionMode;
  tags: string[];
  summary: string;
  sentiment: string;
  keyInsights: string[];
  actionItems: string[];
  actionItemsStructured?: ActionItem[];
  messages: ConversationMessage[];
  spatialContext?: SpatialContext;
  isFavorite: boolean;
  wordCount: number;
  privacyShieldUsed?: boolean;
  // Client-Side Zero-Knowledge Encryption
  isClientEncrypted?: boolean;
  encryptedEnvelope?: EncryptedEnvelope;
  needsPassphrase?: boolean;
  decryptionFailed?: boolean;
  createdAt: any;
  updatedAt: any;
}

export interface ReflectionResponse {
  replyText: string;
  summary: string;
  keyInsights: string[];
  actionItems: string[];
  actionItemsStructured?: ActionItem[];
  sentiment: string;
  suggestedTitle: string;
  tags: string[];
  modelUsed: string;
  latencyMs: number;
  fallbackTriggered: boolean;
  timestamp: string;
  owaspInspection?: OwaspInspectionResult;
  distressAssessment?: DistressAssessment;
}

export interface RedactedSpan {
  original: string;
  redactedRole: string;
  category: 'Name' | 'Organization' | 'Location' | 'Specific Number' | 'Other';
}

export interface RedactedShareDraft {
  originalText: string;
  redactedText: string;
  redactedSpans: RedactedSpan[];
  proposedTitle: string;
  summary: string;
  keyInsights: string[];
  actionItems: string[];
}

export interface SharedReflectionDoc {
  id: string;
  sharerUid: string;
  sharerEmail?: string;
  granteeUid: string;
  granteeEmail?: string;
  title: string;
  summary: string;
  redactedContent: string;
  keyInsights: string[];
  actionItems: string[];
  sentiment: string;
  category: string;
  tags: string[];
  createdAt: any;
  expiresAt: any;
  revoked: boolean;
}

export interface CrossEntryPatternReport {
  analyzedPeriod: string;
  totalEntriesAnalyzed: number;
  recurringTriggers: {
    trigger: string;
    frequency: number;
    impactSummary: string;
    actionableShift: string;
  }[];
  actionItemIntegrity: {
    completionRatePercent: number;
    doneCount: number;
    openCount: number;
    droppedCount: number;
    synthesis: string;
  };
  spatialAtmosphereCorrelations: {
    placeTypeOrLocation: string;
    dominantTone: string;
    insightSummary: string;
  }[];
  holisticSynthesis: string;
  growthTrajectorScore: number;
  generatedAt: string;
}

export interface UserProfile {
  uid: string;
  displayName: string | null;
  email: string | null;
  photoURL: string | null;
  isAnonymous?: boolean;
}

export interface HealthCheckReport {
  status: 'healthy' | 'degraded' | 'error';
  timestamp: string;
  model: string;
  region: string;
  dependencies: {
    geminiAi: { status: 'ok' | 'fail'; latencyMs: number; lastChecked: string };
    cloudFirestore: { status: 'ok' | 'fail'; lastChecked: string };
    geolocationAtmosphere: { status: 'ok' | 'fail'; quotaOk: boolean };
    webSpeechApi: { supported: boolean };
  };
}

// Full types for legacy audit workbench components
export interface FirestoreRuleAuditResult {
  isStrict: boolean;
  score: number;
  evaluatedAt: string;
  hasInsecureDefaults: boolean;
  ownerIsolationEnforced: boolean;
  isDeployable?: boolean;
  recommendedRules?: string;
  findings: Array<{ 
    type: 'ERROR' | 'WARNING' | 'COMPLIANT'; 
    rule?: string; 
    pass?: boolean; 
    note?: string; 
    message: string; 
    ruleExcerpt?: string 
  }>;
}

export interface FallbackAttempt {
  tier?: number;
  model: string;
  status: 'SUCCESS' | 'FAILED' | 'success' | 'failed';
  latencyMs?: number;
  durationMs?: number;
  statusCode?: number;
  errorMessage?: string;
}

export interface SecurityVulnerability {
  id: string;
  title: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  description: string;
  mitigation: string;
  dataFlowTrace?: {
    source: string;
    intermediate: string;
    sink: string;
  };
  originalSnippet?: string;
  remediatedSnippet?: string;
}

export interface SecurityReviewResult {
  score: number;
  status?: string;
  summary?: string;
  vulnerabilities: SecurityVulnerability[];
  auditTimestamp: string;
}

export type ThreatZone = 
  | 'input_surfaces'
  | 'planning_reasoning'
  | 'tool_execution'
  | 'memory_state'
  | 'inter_system_communication'
  | 'INPUT_SURFACES'
  | 'PROMPT_PLANNING'
  | 'TOOL_EXECUTION'
  | 'MEMORY_STORAGE'
  | 'INTER_SYSTEM';

export interface ThreatItem {
  id: string;
  title?: string;
  name?: string;
  scenario?: string;
  risk?: string;
  defense?: string;
  severity?: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  owaspLLM?: string;
  owaspWeb?: string;
  owaspMapping?: string;
  strideCategory?: string;
  description?: string;
  attackScenario?: string;
  attackVector?: string;
  countermeasures?: string[];
  testVerificationSteps?: string[];
  codeRemediationSnippet?: string;
  remediationSnippet?: string;
}

export interface ThreatModelResult {
  systemName?: string;
  generatedWithModel?: string;
  executiveSummary?: string;
  threatScore?: number;
  overallRating: string;
  zones?: any[];
  threatZones?: Array<{
    id: string;
    zone?: string;
    name: string;
    description: string;
    threatCount: number;
    items: ThreatItem[];
  }>;
}

export interface TestCaseWalkthrough {
  id: string;
  module?: string;
  category?: string;
  userStory?: string;
  preconditions?: string[];
  steps?: string[];
  expectedResult?: string;
  actualStatus?: 'PASSED' | 'FAILED' | 'PENDING' | 'passed' | 'failed' | 'pending';
  name?: string;
  assertion?: string;
  status?: 'passed' | 'failed' | 'pending';
}
