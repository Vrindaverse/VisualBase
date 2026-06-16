Deno.serve(async (req) => {
  try {
    const { repoUrl } = await req.json();
    
    if (!repoUrl) {
      return new Response(
        JSON.stringify({ error: 'Repository URL is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const match = repoUrl.match(/github\.com\/([a-zA-Z0-9-_]+)\/([a-zA-Z0-9-_.-]+)/);
    if (!match) {
      return new Response(
        JSON.stringify({ error: 'Invalid GitHub URL' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const [, owner, repo] = match;
    const cleanRepo = repo.replace(/\.git$/, '');
    const githubToken = Deno.env.get('GITHUB_TOKEN');

    const headers: Record<string, string> = {
      'Accept': 'application/vnd.github.v3+json',
    };
    if (githubToken) {
      headers['Authorization'] = `Bearer ${githubToken}`;
    }

    const repoResponse = await fetch(`https://api.github.com/repos/${owner}/${cleanRepo}`, { headers });
    if (!repoResponse.ok) {
      if (repoResponse.status === 404) {
        return new Response(
          JSON.stringify({ error: 'Repository not found' }),
          { status: 404, headers: { 'Content-Type': 'application/json' } }
        );
      }
      throw new Error(`GitHub API error: ${repoResponse.status}`);
    }
    const repoData = await repoResponse.json();

    const branchResponse = await fetch(
      `https://api.github.com/repos/${owner}/${cleanRepo}/branches/${repoData.default_branch}`,
      { headers }
    );
    const branchData = await branchResponse.json();
    const treeSha = branchData.commit.commit.tree.sha;

    const treeResponse = await fetch(
      `https://api.github.com/repos/${owner}/${cleanRepo}/git/trees/${treeSha}?recursive=1`,
      { headers }
    );
    const treeData = await treeResponse.json();

    const structure = buildTree(treeData.tree || []);
    const importantFiles = await fetchImportantFiles(owner, cleanRepo, structure, headers);

    return new Response(
      JSON.stringify({
        repository: {
          owner,
          repo: cleanRepo,
          url: repoUrl,
          defaultBranch: repoData.default_branch,
          description: repoData.description,
          stars: repoData.stargazers_count,
          language: repoData.language,
          topics: repoData.topics || [],
        },
        structure,
        files: importantFiles,
      }),
      { headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message || 'Failed to fetch repository' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
});

function buildTree(items: Array<{ path: string; type: string; size?: number; sha?: string }>) {
  const root: Array<{ name: string; path: string; type: string; children?: any[]; language?: string; size?: number; sha?: string }> = [];
  const pathMap = new Map<string, any>();

  const sortedItems = [...items]
    .filter(item => !item.path.includes('/node_modules/') && !item.path.includes('/.git/'))
    .sort((a, b) => a.path.localeCompare(b.path));

  for (const item of sortedItems) {
    const parts = item.path.split('/');
    const name = parts[parts.length - 1];
    const isFolder = item.type === 'tree';
    
    const node: any = {
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
      root.push(node);
    } else {
      const parentPath = parts.slice(0, -1).join('/');
      const parent = pathMap.get(parentPath);
      if (parent) {
        if (!parent.children) parent.children = [];
        parent.children.push(node);
      }
    }
  }

  return root;
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

async function fetchImportantFiles(
  owner: string,
  repo: string,
  structure: any[],
  headers: Record<string, string>
) {
  const importantPaths: string[] = [];
  
  function collectImportantPaths(nodes: any[], depth = 0) {
    if (depth > 2) return;
    for (const node of nodes) {
      const importantPatterns = [
        'package.json', 'tsconfig.json', 'README.md', 'LICENSE',
        'index.ts', 'index.js', 'main.ts', 'main.js',
        'App.tsx', 'App.jsx',
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
  
  const files: Array<{ path: string; content: string; size: number; language: string; encoding: string }> = [];
  
  for (const path of importantPaths.slice(0, 10)) {
    try {
      const response = await fetch(
        `https://api.github.com/repos/${owner}/${repo}/contents/${path}`,
        { headers }
      );
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
