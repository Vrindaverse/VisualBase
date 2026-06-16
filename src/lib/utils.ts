import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function parseGitHubUrl(url: string): { owner: string; repo: string } | null {
  const patterns = [
    /github\.com\/([a-zA-Z0-9-_]+)\/([a-zA-Z0-9-_.-]+)(?:\.git)?$/,
    /^([a-zA-Z0-9-_]+)\/([a-zA-Z0-9-_.-]+)$/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) {
      return { owner: match[1], repo: match[2].replace(/\.git$/, '') };
    }
  }
  return null;
}

export function getFileLanguage(filename: string): string {
  const ext = filename.split('.').pop()?.toLowerCase() || '';
  const languages: Record<string, string> = {
    js: 'javascript',
    jsx: 'javascript',
    ts: 'typescript',
    tsx: 'typescript',
    py: 'python',
    rb: 'ruby',
    java: 'java',
    go: 'go',
    rs: 'rust',
    cpp: 'cpp',
    c: 'c',
    cs: 'csharp',
    php: 'php',
    swift: 'swift',
    kt: 'kotlin',
    scala: 'scala',
    html: 'html',
    css: 'css',
    scss: 'scss',
    sass: 'sass',
    less: 'less',
    json: 'json',
    yaml: 'yaml',
    yml: 'yaml',
    md: 'markdown',
    sql: 'sql',
    sh: 'shell',
    bash: 'bash',
    dockerfile: 'dockerfile',
    vue: 'vue',
    svelte: 'svelte',
  };
  return languages[ext] || 'text';
}

export function isImportantFile(path: string): boolean {
  const importantPatterns = [
    /package\.json$/,
    /tsconfig\.json$/,
    /vite\.config\./,
    /webpack\.config\./,
    /next\.config\./,
    /\.env/,
    /README\.md$/,
    /CONTRIBUTING\.md$/,
    /LICENSE$/,
    /dockerfile$/i,
    /docker-compose/,
    /\.gitignore$/,
    /\.eslintrc/,
    /tsconfig\./,
    /jest\.config\./,
    /\.prettier/,
    /src\/index\./,
    /src\/main\./,
    /src\/App\./,
    /server\./,
    /api\./,
  ];
  return importantPatterns.some((p) => p.test(path));
}

export function getFileImportance(path: string): 'high' | 'medium' | 'low' {
  if (isImportantFile(path)) return 'high';
  const mediumPatterns = [
    /src\//,
    /lib\//,
    /components\//,
    /pages\//,
    /api\//,
    /routes\//,
    /services\./,
    /utils\./,
  ];
  if (mediumPatterns.some((p) => p.test(path))) return 'medium';
  return 'low';
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
}

export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null;
  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}
