import { create } from 'zustand';
import type { 
  Repository, 
  TreeNode, 
  AnalysisResult, 
  AIExplanation, 
  FileContent,
  LoadingState 
} from '@/types';

interface RepoStore {
  repository: Repository | null;
  structure: TreeNode[];
  analysis: AnalysisResult | null;
  explanation: AIExplanation | null;
  selectedNode: TreeNode | null;
  selectedFile: FileContent | null;
  loadingState: LoadingState;
  error: string | null;
  loadingProgress: number;
  
  setRepository: (repo: Repository | null) => void;
  setStructure: (structure: TreeNode[]) => void;
  setAnalysis: (analysis: AnalysisResult | null) => void;
  setExplanation: (explanation: AIExplanation | null) => void;
  setSelectedNode: (node: TreeNode | null) => void;
  setSelectedFile: (file: FileContent | null) => void;
  setLoadingState: (state: LoadingState) => void;
  setError: (error: string | null) => void;
  setLoadingProgress: (progress: number) => void;
  reset: () => void;
}

const initialState = {
  repository: null,
  structure: [],
  analysis: null,
  explanation: null,
  selectedNode: null,
  selectedFile: null,
  loadingState: 'idle' as LoadingState,
  error: null,
  loadingProgress: 0,
};

export const useRepoStore = create<RepoStore>((set) => ({
  ...initialState,

  setRepository: (repo) => set({ repository: repo }),
  
  setStructure: (structure) => set({ structure }),
  
  setAnalysis: (analysis) => set({ analysis }),
  
  setExplanation: (explanation) => set({ explanation }),
  
  setSelectedNode: (node) => set({ selectedNode: node }),
  
  setSelectedFile: (file) => set({ selectedFile: file }),
  
  setLoadingState: (state) => set({ loadingState: state }),
  
  setError: (error) => set({ error }),
  
  setLoadingProgress: (progress) => set({ loadingProgress: progress }),
  
  reset: () => set(initialState),
}));
