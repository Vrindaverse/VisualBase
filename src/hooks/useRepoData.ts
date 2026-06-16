import { useState, useCallback } from 'react';
import { useRepoStore } from '@/stores/repoStore';
import { fetchRepository, explainRepository } from '@/lib/api';
import { parseGitHubUrl } from '@/lib/utils';
import type { TreeNode } from '@/types';

interface UseRepoDataReturn {
  fetchRepo: (url: string) => Promise<void>;
  isLoading: boolean;
  error: string | null;
}

function flattenTree(nodes: TreeNode[], depth = 0): string {
  return nodes
    .map((node) => {
      const indent = '  '.repeat(depth);
      const icon = node.type === 'folder' ? '📁' : '📄';
      return `${indent}${icon} ${node.name}`;
    })
    .join('\n');
}

function detectTechStack(structure: TreeNode[]): { techStack: string[]; projectType: string } {
  const allFiles = new Set<string>();
  
  function collectFiles(nodes: TreeNode[]) {
    for (const node of nodes) {
      allFiles.add(node.name);
      if (node.children) {
        collectFiles(node.children);
      }
    }
  }
  
  collectFiles(structure);
  const fileList = Array.from(allFiles);
  
  const techStack: string[] = [];
  let projectType = 'unknown';

  if (fileList.some(f => f === 'package.json')) {
    const hasReact = fileList.some(f => f.includes('react'));
    const hasNext = fileList.some(f => f.includes('next'));
    const hasNode = fileList.some(f => f.includes('node') || f.includes('express'));
    
    if (hasReact || hasNext) {
      techStack.push('React');
      if (hasNext) techStack.push('Next.js');
      projectType = 'frontend';
    }
    if (hasNode) {
      techStack.push('Node.js');
      if (projectType === 'frontend') projectType = 'fullstack';
      else projectType = 'backend';
    }
  }
  
  if (fileList.some(f => f.endsWith('.py') && !f.startsWith('.'))) {
    techStack.push('Python');
    if (projectType === 'unknown') projectType = 'backend';
  }
  
  if (fileList.some(f => f.endsWith('.go'))) {
    techStack.push('Go');
    if (projectType === 'unknown') projectType = 'backend';
  }
  
  if (fileList.some(f => f.endsWith('.rs'))) {
    techStack.push('Rust');
    if (projectType === 'unknown') projectType = 'library';
  }
  
  if (fileList.some(f => f === 'Cargo.toml')) {
    techStack.push('Cargo');
  }
  
  if (fileList.some(f => f === 'go.mod')) {
    techStack.push('Go Modules');
  }
  
  if (fileList.some(f => f.includes('docker') || f.includes('Dockerfile'))) {
    techStack.push('Docker');
  }
  
  if (fileList.some(f => f.includes('.env'))) {
    techStack.push('Environment Config');
  }
  
  if (fileList.some(f => f.includes('tsconfig') || f.includes('.typescript'))) {
    techStack.push('TypeScript');
  }

  return { techStack, projectType };
}

function findKeyFiles(structure: TreeNode[]): string[] {
  const keyFiles: string[] = [];
  
  function search(nodes: TreeNode[], depth = 0) {
    if (depth > 2) return;
    
    for (const node of nodes) {
      if (node.type === 'file') {
        const importantPatterns = [
          /package\.json$/,
          /tsconfig\.json$/,
          /README\.md$/,
          /index\./,
          /main\./,
          /App\./,
          /\.config\./,
        ];
        
        if (importantPatterns.some(p => p.test(node.name))) {
          keyFiles.push(node.path);
        }
      }
      
      if (node.children) {
        search(node.children, depth + 1);
      }
    }
  }
  
  search(structure);
  return keyFiles.slice(0, 10);
}

export function useRepoData(): UseRepoDataReturn {
  const {
    setRepository,
    setStructure,
    setAnalysis,
    setExplanation,
    setLoadingState,
    setError,
    setLoadingProgress,
    reset,
  } = useRepoStore();

  const [isLoading, setIsLoading] = useState(false);

  const fetchRepo = useCallback(async (url: string) => {
    reset();
    setIsLoading(true);
    setLoadingState('loading');
    setLoadingProgress(10);

    try {
      const parsed = parseGitHubUrl(url);
      if (!parsed) {
        throw new Error('Invalid GitHub URL');
      }

      setLoadingProgress(20);
      
      const data = await fetchRepository(url);
      
      setRepository(data.repository);
      setStructure(data.structure);
      setLoadingProgress(50);

      const { techStack, projectType } = detectTechStack(data.structure);
      const keyFiles = findKeyFiles(data.structure);

      setLoadingProgress(60);

      const analysis: any = {
        techStack,
        projectType,
        architecture: 'Analyzing...',
        keyComponents: keyFiles,
        description: data.repository.description || '',
      };
      setAnalysis(analysis);

      setLoadingProgress(70);

      try {
        const explanationData = await explainRepository(
          url,
          data.repository.repo,
          data.repository.description,
          techStack,
          projectType,
          flattenTree(data.structure),
          keyFiles
        );
        setExplanation(explanationData.explanation);
      } catch (aiError) {
        console.warn('AI explanation failed, using fallback:', aiError);
        setExplanation({
          overview: `This is a ${projectType} project using ${techStack.join(', ') || 'various technologies'}.`,
          architecture: 'Architecture analysis unavailable.',
          folderExplanations: {},
          fileSummaries: {},
          techStack,
        });
      }

      setLoadingProgress(100);
      setLoadingState('success');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to fetch repository';
      setError(message);
      setLoadingState('error');
    } finally {
      setIsLoading(false);
    }
  }, [reset, setRepository, setStructure, setAnalysis, setExplanation, setLoadingState, setError, setLoadingProgress]);

  return { fetchRepo, isLoading, error: null };
}
