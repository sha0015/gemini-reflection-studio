export type EntryCategory = 
  | 'reflection' 
  | 'journal' 
  | 'brainstorm' 
  | 'gratitude' 
  | 'goal' 
  | 'mindfulness';

export type ReflectionMode = 'reflect' | 'brainstorm' | 'summarize' | 'action_items';

export interface ConversationMessage {
  id: string;
  role: 'user' | 'model';
  content: string;
  timestamp: number;
  modelUsed?: string;
}

export interface JournalEntry {
  id: string;
  userId: string;
  title: string;
  category: EntryCategory;
  tags: string[];
  summary: string;
  sentiment: string;
  keyInsights: string[];
  actionItems: string[];
  messages: ConversationMessage[];
  isFavorite: boolean;
  wordCount: number;
  createdAt: any;
  updatedAt: any;
}

export interface ReflectionResponse {
  replyText: string;
  summary: string;
  keyInsights: string[];
  actionItems: string[];
  sentiment: string;
  suggestedTitle: string;
  tags: string[];
  modelUsed: string;
  latencyMs: number;
  fallbackTriggered: boolean;
  timestamp: string;
}

export interface UserProfile {
  uid: string;
  displayName: string | null;
  email: string | null;
  photoURL: string | null;
  isAnonymous?: boolean;
}

export type ThreatZone = 
  | 'input_surfaces'
  | 'planning_reasoning'
  | 'tool_execution'
  | 'memory_state'
  | 'inter_system_communication';

export type SeverityLevel = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'INFORMATIONAL';

export interface ThreatItem {
  id: string;
  zone: ThreatZone;
  title: string;
  scenario: string;
  owaspLLM: string; // e.g. "LLM01: Prompt Injection"
  owaspWeb: string; // e.g. "A03: Injection"
  strideCategory: 'Spoofing' | 'Tampering' | 'Repudiation' | 'Information Disclosure' | 'Denial of Service' | 'Elevation of Privilege';
  severity: SeverityLevel;
  attackVector: string;
  countermeasures: string[];
  codeRemediationSnippet: string;
  testVerificationSteps: string[];
}

export interface ThreatModelResult {
  systemName: string;
  architectureType: string;
  executiveSummary: string;
  threatScore: number; // 0-100
  threatZones: {
    zone: ThreatZone;
    zoneName: string;
    description: string;
    riskCount: number;
    highestSeverity: SeverityLevel;
    items: ThreatItem[];
  }[];
  generatedWithModel?: string;
  fallbackHops?: string[];
  latencyMs?: number;
  timestamp: string;
}

export interface SecurityVulnerability {
  id: string;
  title: string;
  category: string;
  severity: SeverityLevel;
  location: string;
  description: string;
  dataFlowTrace: {
    source: string;
    intermediate: string;
    sink: string;
  };
  originalSnippet: string;
  remediatedSnippet: string;
  diffExplanation: string;
  mitigationRules: string[];
}

export interface SecurityReviewResult {
  score: number; // 0 - 100
  status: 'PASSED' | 'WARNINGS' | 'CRITICAL_RISKS';
  summary: string;
  vulnerabilities: SecurityVulnerability[];
  safePatternsIdentified: string[];
  suggestedHeaders: Record<string, string>;
  modelUsed: string;
  latencyMs: number;
}

export interface FallbackAttempt {
  model: string;
  status: 'PENDING' | 'SUCCESS' | 'FAILED' | 'SKIPPED';
  statusCode?: number;
  errorMessage?: string;
  durationMs?: number;
}

export interface FallbackExecutionTelemetry {
  successfulModel: string;
  totalDurationMs: number;
  attempts: FallbackAttempt[];
  fallbackTriggered: boolean;
  timestamp: string;
}

export interface FirestoreRuleAuditResult {
  hasInsecureDefaults: boolean;
  ownerIsolationEnforced: boolean;
  rbacValidated: boolean;
  findings: {
    type: 'ERROR' | 'WARNING' | 'COMPLIANT';
    message: string;
    line?: number;
    ruleExcerpt?: string;
  }[];
  recommendedRules: string;
  isDeployable: boolean;
}

export interface TestCaseWalkthrough {
  id: string;
  module: string;
  userStory: string;
  preconditions: string[];
  steps: string[];
  expectedResult: string;
  actualStatus?: 'PASSED' | 'PENDING' | 'FAILED';
  category: 'THREAT_MODELING' | 'CODE_REVIEW' | 'FALLBACK_LADDER' | 'FIRESTORE_RULES' | 'SECRET_MANAGER' | 'DEPLOYMENT';
}
