// Build-time constant (injected by Vite)
declare const __API_URL__: string;

// Category option for dropdown
export interface CategoryOption {
  value: string;  // Value sent to API
  label: string;  // Display label
}

// Widget configuration
export interface WidgetConfig {
  apiUrl?: string;  // Optional - uses baked-in default if not provided
  position?: 'bottom-right' | 'bottom-left';
  theme?: {
    primaryColor?: string;
    fontFamily?: string;
  };
  labels?: {
    placeholder?: string;
    title?: string;
    sendButton?: string;
  };
  sessionTimeout?: number;
  features?: {
    copyButton?: boolean;
    feedbackButtons?: boolean;
    chatHistory?: boolean;  // Send previous messages for context
    includeArchived?: boolean;  // Include archived documents in search
  };
  // Categories for filtering - easily replaceable
  categories?: CategoryOption[];
}

// Internal resolved config with defaults applied
export interface ResolvedConfig {
  apiUrl: string;
  position: 'bottom-right' | 'bottom-left';
  theme: {
    primaryColor: string;
    fontFamily: string;
  };
  labels: {
    placeholder: string;
    title: string;
    sendButton: string;
    copyTooltip: string;
    copiedToast: string;
    sourcesHeader: string;
    loading: string;
    error: string;
    feedbackPrompt: string;
    feedbackCommentPlaceholder: string;
    feedbackSubmit: string;
    feedbackNudge: string;
    feedbackThankYou: string;
    newChat: string;
    welcomeMessage: string;
    settings: string;
    chatHistoryLabel: string;
    includeArchivedLabel: string;
    expand: string;
    collapse: string;
    allCategories: string;
    categoryLabel: string;
  };
  sessionTimeout: number;
  features: {
    copyButton: boolean;
    feedbackButtons: boolean;
    chatHistory: boolean;
    includeArchived: boolean;
  };
  categories: CategoryOption[];
  selectedCategory: string | null;  // null = all categories
}

// Chat messages
export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  sources?: Source[];
  timestamp: number;
  feedback?: 'up' | 'down' | null;
}

// Source citation from RAG API
export interface Source {
  index: number;
  doc_id: string;
  title: string;
  location: string;
  snippet: string;
  confidence: number;
  uri?: string;
}

// RAG API request
export interface SearchRequest {
  query: string;
  k?: number;
  history?: { role: 'user' | 'assistant'; content: string }[];
}

// RAG API response (non-streaming)
export interface SearchResponse {
  query: string;
  answer: {
    answer: string;
    confidence: 'high' | 'medium' | 'low';
    sources: Source[];
    related_documents: RelatedDocument[];
    evidence_count: number;
    insufficient_evidence: boolean;
  };
  retrieval_info: {
    plan?: string;
    total_hits: number;
    sources_used: number;
    complexity: number;
    complexity_label: string;
  };
}

export interface RelatedDocument {
  doc_id: string;
  title: string;
  location: string;
  relevance: string;
}

// SSE event types
export interface SSEMetaEvent {
  complexity: number;
  hits: number;
}

export interface SSESourcesEvent {
  sources: Source[];
}

// Session storage structure
export interface ChatSession {
  messages: Message[];
  lastActivity: number;
  isOpen: boolean;
}

// Mascot states
export type MascotState = 'idle' | 'greeting' | 'thinking' | 'responding' | 'success' | 'error';

// Callback types for streaming
export interface StreamCallbacks {
  onMeta?: (meta: SSEMetaEvent) => void;
  onSources?: (sources: Source[]) => void;
  onChunk?: (chunk: string) => void;
  onDone?: () => void;
  onError?: (error: string) => void;
}
