import type { TreeNode, FileContent, Repository, AnalysisResult, AIExplanation } from '@/types';

const GITHUB_API = 'https://api.github.com';

const headers: Record<string, string> = {
  'Accept': 'application/vnd.github.v3+json',
};

export async function fetchRepository(url: string): Promise<{
  repository: Repository;
  structure: TreeNode[];
  files: FileContent[];
}> {
  const match = url.match(/github\.com\/([a-zA-Z0-9-_]+)\/([a-zA-Z0-9-_.-]+)/);
  if (!match) {
    throw new Error('Invalid GitHub URL');
  }

  const [, owner, repo] = match;
  const cleanRepo = repo.replace(/\.git$/, '');

  const repoResponse = await fetch(`${GITHUB_API}/repos/${owner}/${cleanRepo}`, { headers });
  if (!repoResponse.ok) {
    throw new Error(`Repository not found: ${repoResponse.status}`);
  }
  const repoData = await repoResponse.json();

  const branchResponse = await fetch(
    `${GITHUB_API}/repos/${owner}/${cleanRepo}/branches/${repoData.default_branch}`,
    { headers }
  );
  const branchData = await branchResponse.json();
  const treeSha = branchData.commit.commit.tree.sha;

  const treeResponse = await fetch(
    `${GITHUB_API}/repos/${owner}/${cleanRepo}/git/trees/${treeSha}?recursive=1`,
    { headers }
  );
  const treeData = await treeResponse.json();

  const structure = buildTree(treeData.tree || []);
  const importantFiles = await fetchImportantFiles(owner, cleanRepo, structure);

  return {
    repository: {
      owner,
      repo: cleanRepo,
      url,
      defaultBranch: repoData.default_branch,
      description: repoData.description,
      stars: repoData.stargazers_count,
      language: repoData.language,
      topics: repoData.topics || [],
    },
    structure,
    files: importantFiles,
  };
}

function buildTree(items: Array<{ path: string; type: string; size?: number; sha?: string }>): TreeNode[] {
  const pathMap = new Map<string, TreeNode>();

  const sortedItems = [...items]
    .filter(item => !item.path.includes('/node_modules/') && !item.path.includes('/.git/'))
    .sort((a, b) => a.path.localeCompare(b.path));

  for (const item of sortedItems) {
    const parts = item.path.split('/');
    const name = parts[parts.length - 1];
    const isFolder = item.type === 'tree';
    
    const node: TreeNode = {
      name,
      path: item.path,
      type: isFolder ? 'folder' : 'file',
      size: item.size,
      sha: item.sha,
    };

    if (!isFolder) {
      node.language = getLanguage(name);
    }

    if (isFolder) {
      node.children = [];
    }

    pathMap.set(item.path, node);

    if (parts.length === 1) {
      pathMap.set(item.path, node);
    } else {
      const parentPath = parts.slice(0, -1).join('/');
      const parent = pathMap.get(parentPath);
      if (parent) {
        if (!parent.children) parent.children = [];
        parent.children.push(node);
      }
    }
  }

  return Array.from(pathMap.values()).filter(n => n.path.split('/').length === 1);
}

function getLanguage(filename: string): string {
  const ext = filename.split('.').pop()?.toLowerCase() || '';
  const languages: Record<string, string> = {
    js: 'javascript', jsx: 'javascript',
    ts: 'typescript', tsx: 'typescript',
    py: 'python', rb: 'ruby', java: 'java',
    go: 'go', rs: 'rust', cpp: 'cpp',
    c: 'c', cs: 'csharp', php: 'php',
    swift: 'swift', kt: 'kotlin', scala: 'scala',
    html: 'html', css: 'css', scss: 'scss',
    json: 'json', yaml: 'yaml', yml: 'yaml',
    md: 'markdown', sql: 'sql', sh: 'shell',
  };
  return languages[ext] || 'text';
}

async function fetchImportantFiles(owner: string, repo: string, structure: TreeNode[]): Promise<FileContent[]> {
  const importantPaths: string[] = [];
  
  function collectImportantPaths(nodes: TreeNode[], depth = 0) {
    if (depth > 2) return;
    for (const node of nodes) {
      const importantPatterns = [
        'package.json', 'tsconfig.json', 'README.md', 'LICENSE',
        'index.ts', 'index.js', 'main.ts', 'main.js',
        'App.tsx', 'App.jsx', 'vite.config.ts', 'webpack.config.js',
      ];
      if (importantPatterns.some(p => node.name === p || node.path.endsWith(p))) {
        importantPaths.push(node.path);
      }
      if (node.children) {
        collectImportantPaths(node.children, depth + 1);
      }
    }
  }
  
  collectImportantPaths(structure);
  
  const files: FileContent[] = [];
  
  for (const path of importantPaths.slice(0, 10)) {
    try {
      const response = await fetch(`${GITHUB_API}/repos/${owner}/${repo}/contents/${path}`, { headers });
      if (response.ok) {
        const data = await response.json();
        if (data.content && data.encoding === 'base64') {
          files.push({
            path: data.path,
            content: atob(data.content),
            size: data.size,
            language: getLanguage(data.name),
            encoding: data.encoding,
          });
        }
      }
    } catch (e) {
      console.error(`Failed to fetch ${path}:`, e);
    }
  }
  
  return files;
}

export async function explainRepository(
  _repoUrl: string,
  _repoName: string,
  description: string | undefined,
  techStack: string[],
  projectType: string,
  _folderStructure: string,
  _keyFiles: string[]
): Promise<{ explanation: AIExplanation }> {
  return {
    explanation: {
      overview: description || `This is a ${projectType} project using ${techStack.join(', ') || 'various technologies'}.`,
      architecture: `This repository appears to be a ${projectType} application. The structure suggests a modern software architecture with organized modules and clear separation of concerns.`,
      folderExplanations: {},
      fileSummaries: {},
      techStack,
    },
  };
}

export async function analyzeRepository(
  _repoUrl: string,
  _structure: TreeNode[]
): Promise<{ analysis: AnalysisResult }> {
  return {
    analysis: {
      techStack: [],
      projectType: 'unknown',
      architecture: '',
      keyComponents: [],
      description: '',
    },
  };
}
