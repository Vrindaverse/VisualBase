export interface TreeNode {
  name: string;
  path: string;
  type: 'file' | 'folder';
  children?: TreeNode[];
  language?: string;
  importance?: 'high' | 'medium' | 'low';
  size?: number;
  sha?: string;
}

export interface FileContent {
  path: string;
  content: string;
  size: number;
  language: string;
  encoding: string;
}

export interface Repository {
  owner: string;
  repo: string;
  url: string;
  defaultBranch: string;
  description?: string;
  stars?: number;
  language?: string;
  topics?: string[];
}

export interface AnalysisResult {
  techStack: string[];
  projectType: 'frontend' | 'backend' | 'fullstack' | 'library' | 'unknown';
  architecture: string;
  keyComponents: string[];
  description: string;
}

export interface GraphNode {
  id: string;
  type: 'component' | 'service' | 'api' | 'folder' | 'file';
  data: {
    label: string;
    path: string;
    language?: string;
    importance?: 'high' | 'medium' | 'low';
    description?: string;
  };
  position: { x: number; y: number };
}

export interface GraphEdge {
  id: string;
  source: string;
  target: string;
  type?: 'default' | 'smoothstep';
  animated?: boolean;
  label?: string;
}

export interface AIExplanation {
  overview: string;
  architecture: string;
  folderExplanations: Record<string, string>;
  fileSummaries: Record<string, string>;
  techStack: string[];
}

export interface CacheEntry {
  repoUrl: string;
  structure: TreeNode[];
  analysis: AnalysisResult;
  explanation: AIExplanation;
  cachedAt: number;
  expiresAt: number;
}

export type LoadingState = 'idle' | 'loading' | 'success' | 'error';

export interface RepoState {
  repository: Repository | null;
  structure: TreeNode[];
  analysis: AnalysisResult | null;
  explanation: AIExplanation | null;
  selectedNode: TreeNode | null;
  selectedFile: FileContent | null;
  loadingState: LoadingState;
  error: string | null;
  loadingProgress: number;
}
