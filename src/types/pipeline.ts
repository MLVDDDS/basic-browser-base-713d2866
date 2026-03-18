/**
 * 🔧 UNIFIED PIPELINE TYPES
 * 
 * Централизованные типы для всей системы генерации.
 * Используются в: unified-orchestrator, Builder UI
 */

// ============ COMPLEXITY & ROUTING ============

export type ComplexityLevel = 'light' | 'low' | 'medium' | 'high' | 'epic';

export type PipelineMode = 'light' | 'low' | 'medium' | 'high';

export type PipelinePhase = 
  | 'intake'      // Приём и анализ промпта
  | 'analyze'     // Детальный анализ требований  
  | 'plan'        // Планирование архитектуры
  | 'execute'     // Генерация кода
  | 'validate'    // Валидация качества
  | 'fix'         // Автоматические исправления
  | 'preview'     // Подготовка preview
  | 'deploy'      // Публикация
  | 'complete';   // Завершено

export type StepStatus = 'pending' | 'active' | 'completed' | 'failed' | 'skipped';

// ============ REQUIREMENTS SPEC ============

export interface RequirementsSpec {
  id: string;
  originalPrompt: string;
  cleanedPrompt: string;
  language: 'ru' | 'en' | 'mixed';
  
  // Parsed requirements
  goals: string[];
  constraints: string[];
  integrations: string[];
  
  // Non-functional requirements
  nfr: {
    responsive: boolean;
    a11y: boolean;
    seo: boolean;
    performance: boolean;
    i18n: boolean;
  };
  
  // Acceptance criteria
  acceptanceCriteria: string[];
  
  // Complexity analysis
  complexity: {
    level: ComplexityLevel;
    score: number; // 0-100
    factors: string[];
    estimatedTokens: number;
    estimatedMinutes: number;
  };
  
  // Risk assessment
  risks: Array<{
    type: 'technical' | 'scope' | 'integration' | 'performance';
    description: string;
    severity: 'low' | 'medium' | 'high';
    mitigation?: string;
  }>;
  
  createdAt: string;
}

// ============ PLANNING ============

export interface Epic {
  id: string;
  title: string;
  description: string;
  priority: number;
  estimatedEffort: 'small' | 'medium' | 'large';
  stories: Story[];
  dependencies: string[]; // Epic IDs
  status: StepStatus;
}

export interface Story {
  id: string;
  epicId: string;
  title: string;
  description: string;
  tasks: Task[];
  acceptanceCriteria: string[];
  status: StepStatus;
}

export interface Task {
  id: string;
  storyId: string;
  title: string;
  description: string;
  type: 'create' | 'modify' | 'delete' | 'integrate' | 'test';
  targetFiles: string[];
  estimatedTokens: number;
  status: StepStatus;
  result?: TaskResult;
}

export interface TaskResult {
  success: boolean;
  filesChanged: string[];
  tokensUsed: number;
  duration: number;
  error?: string;
}

export interface Plan {
  id: string;
  requirementsId: string;
  architecture: string;
  techStack: string[];
  epics: Epic[];
  totalTasks: number;
  estimatedDuration: number; // minutes
  createdAt: string;
  status: StepStatus;
}

// ============ EXECUTION STEPS ============

export interface PipelineStep {
  id: string;
  phase: PipelinePhase;
  label: string;
  description?: string;
  status: StepStatus;
  
  // Timing
  startedAt?: string;
  completedAt?: string;
  duration?: number; // ms
  
  // Progress
  progress?: number; // 0-100
  subSteps?: PipelineStep[];
  
  // Results
  result?: {
    success: boolean;
    data?: Record<string, unknown>;
    error?: string;
  };
  
  // Metadata
  model?: string;
  tokensUsed?: number;
  filesChanged?: string[];
}

// ============ ARTIFACTS ============

export type ArtifactType = 
  | 'file'        // Generated file
  | 'diff'        // File diff/patch
  | 'snapshot'    // Full project snapshot
  | 'log'         // Execution log
  | 'preview'     // Preview URL/embed
  | 'validation'; // Validation report

export interface Artifact {
  id: string;
  type: ArtifactType;
  name: string;
  
  // Content based on type
  content?: string;
  url?: string;
  metadata?: Record<string, unknown>;
  
  // Relations
  stepId?: string;
  versionId?: string;
  
  // File info (for file/diff types)
  path?: string;
  action?: 'created' | 'modified' | 'deleted';
  
  createdAt: string;
  size?: number; // bytes
}

// ============ VERSIONS ============

export interface ProjectVersion {
  id: string;
  projectId: string;
  versionNumber: number;
  
  // Content
  files: Record<string, string>;
  packages: string[];
  
  // Diff from previous
  diff?: {
    added: string[];
    modified: string[];
    removed: string[];
  };
  
  // Stats
  filesChanged: number;
  linesAdded: number;
  linesRemoved: number;
  
  // Metadata
  message?: string;
  parentVersionId?: string;
  isPublished: boolean;
  publishedAt?: string;
  
  // Quality
  validationScore?: number;
  
  createdAt: string;
  createdBy: string;
}

// ============ JOB QUEUE ============

export type JobType = 
  | 'generate'    // Full generation
  | 'build'       // Build/compile
  | 'validate'    // Validation only
  | 'fix'         // Auto-fix
  | 'deploy'      // Deploy to domain
  | 'plan'        // Planning only
  | 'review';     // Code review

export type JobStatus = 
  | 'pending'     // Waiting in queue
  | 'scheduled'   // Scheduled for later
  | 'processing'  // Currently running
  | 'completed'   // Finished successfully
  | 'failed'      // Finished with error
  | 'cancelled';  // Cancelled by user

export interface Job {
  id: string;
  projectId?: string;
  userId: string;
  
  // Type and status
  type: JobType;
  status: JobStatus;
  priority: number; // 1-10, higher = more important
  
  // Payload
  payload: {
    prompt?: string;
    files?: Record<string, string>;
    packages?: string[];
    options?: Record<string, unknown>;
  };
  
  // Results
  result?: {
    success: boolean;
    data?: Record<string, unknown>;
    artifacts?: Artifact[];
    versionId?: string;
  };
  
  // Error handling
  error?: string;
  attempts: number;
  maxAttempts: number;
  
  // Timing
  scheduledFor: string;
  startedAt?: string;
  completedAt?: string;
  
  // Progress tracking
  currentPhase?: PipelinePhase;
  currentStep?: string;
  progress?: number;
  
  createdAt: string;
  updatedAt: string;
}

export interface JobLog {
  id: string;
  jobId: string;
  level: 'debug' | 'info' | 'warn' | 'error';
  message: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
}

// ============ VALIDATION ============

export type ValidationCategory = 
  | 'typescript'
  | 'syntax'
  | 'structure'
  | 'css'
  | 'a11y'
  | 'style'
  | 'ux'
  | 'security';

export interface ValidationIssue {
  type: 'error' | 'warning' | 'info';
  category: ValidationCategory;
  file: string;
  line?: number;
  message: string;
  suggestion?: string;
  autoFixable?: boolean;
}

export interface ValidationResult {
  valid: boolean;
  score: number; // 0-100
  issues: ValidationIssue[];
  summary: {
    errors: number;
    warnings: number;
    info: number;
  };
  byCategory: Record<ValidationCategory, number>;
}

// ============ STREAMING EVENTS ============

export type PipelineEventType =
  // Lifecycle
  | 'pipeline_start'
  | 'pipeline_complete'
  | 'pipeline_error'
  
  // Phases
  | 'phase_start'
  | 'phase_complete'
  
  // Planning
  | 'requirements_parsed'
  | 'plan_created'
  | 'epic_start'
  | 'story_start'
  | 'task_start'
  | 'task_complete'
  
  // Execution
  | 'iteration_start'
  | 'tool_start'
  | 'tool_result'
  | 'file_created'
  | 'file_modified'
  | 'file_deleted'
  | 'text'
  | 'thinking'
  
  // Validation
  | 'validation_start'
  | 'validation_category'
  | 'validation_complete'
  
  // Auto-fix
  | 'auto_fix_start'
  | 'auto_fix_applied'
  | 'auto_fix_complete'
  | 'auto_fix_error'
  
  // Preview & Deploy
  | 'preview_ready'
  | 'deploy_start'
  | 'deploy_complete'
  
  // Version
  | 'version_created';

export interface PipelineEvent {
  type: PipelineEventType;
  timestamp: string;
  data?: Record<string, unknown>;
}

// ============ BUILDER CONTEXT ============

export interface BuilderContext {
  projectId?: string;
  projectSessionId?: string;
  projectName?: string;
  projectType?: 'website' | 'tma' | 'app';
  runKind?: 'initial' | 'iterative';
  
  // Current state
  existingFiles?: Record<string, string>;
  existingPackages?: string[];
  currentVersion?: number;
  
  // User intent
  preprocessedIntent?: {
    cleanedPrompt: string;
    actionType: 'create' | 'modify' | 'fix' | 'review' | 'deploy';
    complexity: ComplexityLevel;
    forceDeepReview?: boolean;
    minQualityScore?: number;
    planDetailLevel?: 'none' | 'micro' | 'standard' | 'detailed';
    planTaskLimit?: number;
  };
  
  // Session
  sessionId?: string;
  messageHistory?: Array<{ role: 'user' | 'assistant'; content: string }>;
}

// ============ DEPLOY CONFIG ============

export interface DeployConfig {
  provider: 'netlify' | 'vercel' | 'custom';
  
  // Domain settings
  domain?: string;
  subdomain?: string;
  customDomain?: string;
  
  // SSL
  ssl: boolean;
  sslStatus?: 'pending' | 'active' | 'failed';
  
  // Build settings
  buildCommand?: string;
  outputDir?: string;
  
  // Environment
  envVars?: Record<string, string>;
  
  // Status
  status: 'idle' | 'building' | 'deploying' | 'live' | 'failed';
  url?: string;
  lastDeployedAt?: string;
}

// ============ METRICS ============

export interface PipelineMetrics {
  // Timing
  totalDuration: number;
  phasesDuration: Record<PipelinePhase, number>;
  
  // Tokens
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
  
  // Quality
  initialScore: number;
  finalScore: number;
  autoFixCount: number;
  
  // Files
  filesCreated: number;
  filesModified: number;
  filesDeleted: number;
  totalLines: number;
  
  // Model usage
  modelCalls: Array<{
    model: string;
    phase: PipelinePhase;
    tokens: number;
    duration: number;
  }>;
}

// ============ HELPER FUNCTIONS ============

export function isComplexPrompt(prompt: string): boolean {
  const wordCount = prompt.split(/\s+/).length;
  const lineCount = prompt.split('\n').length;
  return wordCount > 100 || lineCount > 20;
}

export function estimateComplexity(prompt: string): ComplexityLevel {
  const wordCount = prompt.split(/\s+/).length;
  const lineCount = prompt.split('\n').length;
  
  // Epic: very long prompts (500+ words or 50+ lines)
  if (wordCount > 500 || lineCount > 50) return 'epic';
  
  // High: complex requirements
  if (wordCount > 100 || lineCount > 20) return 'high';
  
  // Medium: standard features
  if (wordCount > 40 || lineCount > 10) return 'medium';
  
  // Low: simple tasks
  if (wordCount > 15) return 'low';
  
  // Light: micro-tasks
  return 'light';
}

export function getPhaseLabel(phase: PipelinePhase): string {
  const labels: Record<PipelinePhase, string> = {
    intake: 'Приём запроса',
    analyze: 'Анализ требований',
    plan: 'Планирование',
    execute: 'Генерация кода',
    validate: 'Проверка качества',
    fix: 'Автоисправление',
    preview: 'Подготовка preview',
    deploy: 'Публикация',
    complete: 'Завершено',
  };
  return labels[phase] || phase;
}

export function getStatusColor(status: StepStatus): string {
  const colors: Record<StepStatus, string> = {
    pending: 'text-muted-foreground',
    active: 'text-blue-500',
    completed: 'text-green-500',
    failed: 'text-red-500',
    skipped: 'text-gray-400',
  };
  return colors[status] || 'text-muted-foreground';
}
