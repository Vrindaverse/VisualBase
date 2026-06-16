const SYSTEM_PROMPT = `You are a senior software architect explaining code repositories to developers. 
Your explanations should be:
- Clear and concise
- Technical but accessible
- Focused on architecture and patterns
- Actionable for understanding the codebase

Respond with JSON only.`;

export function getExplainRepoPrompt(
  repoName: string,
  description: string | undefined,
  techStack: string[],
  projectType: string,
  folderStructure: string
): string {
  return `${SYSTEM_PROMPT}

Explain this repository in simple terms.

Repository: ${repoName}
Description: ${description || 'No description provided'}
Tech Stack: ${techStack.join(', ') || 'Unknown'}
Project Type: ${projectType}

Folder Structure (first 2 levels):
${folderStructure}

Provide a JSON response with:
{
  "overview": "2-3 sentence summary of what this project does",
  "purpose": "The main purpose and use case",
  "keyFeatures": ["feature1", "feature2", "feature3"],
  "targetUsers": "Who is this project for"
}`;
}

export function getExplainArchitecturePrompt(
  repoName: string,
  folderStructure: string,
  keyFiles: string[]
): string {
  return `${SYSTEM_PROMPT}

Describe the architecture of this repository.

Repository: ${repoName}
Key Files: ${keyFiles.join(', ')}

Folder Structure:
${folderStructure}

Provide a JSON response with:
{
  "pattern": "Main architectural pattern (e.g., MVC, Clean Architecture, etc.)",
  "layers": ["layer1", "layer2", "layer3"],
  "components": [
    {
      "name": "component name",
      "description": "what it does",
      "dependencies": ["what it depends on"]
    }
  ],
  "dataFlow": "How data flows through the system",
  "entryPoints": ["main entry points"]
}`;
}

export function getExplainFolderPrompt(
  folderName: string,
  files: string[],
  parentContext?: string
): string {
  return `${SYSTEM_PROMPT}

Explain this folder/directory in the context of a codebase.

Folder: ${folderName}
Files: ${files.join(', ')}
Context: ${parentContext || 'Part of a larger codebase'}

Provide a JSON response with:
{
  "purpose": "What this folder is for",
  "responsibility": "Single responsibility of this module",
  "keyFiles": ["most important files and why"],
  "relationships": "How this relates to other parts"
}`;
}

export function getExplainFilePrompt(
  fileName: string,
  filePath: string,
  fileContent: string,
  context?: string
): string {
  const truncatedContent = fileContent.slice(0, 3000);
  
  return `${SYSTEM_PROMPT}

Explain this file in detail.

File: ${fileName}
Path: ${filePath}
Context: ${context || 'Part of a codebase'}

Content:
\`\`\`
${truncatedContent}
\`\`\`

Provide a JSON response with:
{
  "purpose": "What this file does",
  "type": "component|utility|config|style|test|entry point",
  "keyExports": ["main things exported"],
  "dependencies": ["external dependencies used"],
  "codePattern": "Notable patterns used (e.g., React hook, class, etc.)",
  "summary": "Brief technical summary"
}`;
}

export function getDetectTechStackPrompt(
  packageJson?: string,
  fileList?: string[]
): string {
  return `${SYSTEM_PROMPT}

Detect the technology stack from this repository.

${packageJson ? `package.json content:\n${packageJson}\n` : ''}
${fileList ? `Key files found:\n${fileList.slice(0, 50).join('\n')}\n` : ''}

Provide a JSON response with:
{
  "languages": ["JavaScript", "TypeScript", "Python", etc.],
  "frameworks": ["React", "Next.js", "Express", etc.],
  "tools": ["Vite", "Webpack", "Docker", etc.],
  "databases": ["PostgreSQL", "MongoDB", etc.] (if applicable),
  "cloudServices": ["AWS", "Vercel", etc.] (if applicable),
  "projectType": "frontend|backend|fullstack|library|monorepo|unknown"
}`;
}

export function getSuggestGraphLayoutPrompt(
  folderStructure: string
): string {
  return `${SYSTEM_PROMPT}

Suggest a graph layout for visualizing this repository structure.

Folder Structure:
${folderStructure}

Provide a JSON response with nodes and edges for a graph visualization:
{
  "nodes": [
    {
      "id": "unique-id",
      "type": "component|service|api|folder",
      "label": "Display name",
      "path": "file/folder path",
      "x": 0-100 (percentage x position),
      "y": 0-100 (percentage y position)
    }
  ],
  "edges": [
    {
      "from": "source-node-id",
      "to": "target-node-id",
      "label": "relationship if helpful"
    }
  ]
}`;
}

export const MAX_TOKENS = {
  overview: 200,
  architecture: 400,
  folder: 150,
  file: 300,
  techStack: 150,
  graphLayout: 500,
};

export const TEMPERATURE = 0.3;
