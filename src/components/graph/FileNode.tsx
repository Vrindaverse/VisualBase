import { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { FileCode, FileText, File, FileJson } from 'lucide-react';

type NodeData = {
  label: string;
  path: string;
  language?: string;
  importance?: 'high' | 'medium' | 'low';
};

type FileNodeProps = {
  data: NodeData;
  selected?: boolean;
};

const languageConfig: Record<string, { icon: typeof FileCode; abbr: string }> = {
  typescript: { icon: FileCode, abbr: 'TS' },
  javascript: { icon: FileCode, abbr: 'JS' },
  python: { icon: FileCode, abbr: 'PY' },
  rust: { icon: FileCode, abbr: 'RS' },
  go: { icon: FileCode, abbr: 'GO' },
  java: { icon: FileCode, abbr: 'JV' },
  json: { icon: FileJson, abbr: 'JSON' },
  markdown: { icon: FileText, abbr: 'MD' },
};

function getFileConfig(language?: string) {
  return languageConfig[language || ''] || { icon: File, abbr: language?.slice(0, 4).toUpperCase() || 'FILE' };
}

function FileNodeComponent({ data, selected }: FileNodeProps) {
  const config = getFileConfig(data.language);
  const Icon = config.icon;

  return (
    <div
      className="px-3 py-2 rounded-lg border-2 border-black dark:border-white bg-white dark:bg-neutral-900 transition-all duration-200 min-w-[100px]"
      style={{
        boxShadow: selected ? '4px 4px 0 var(--accent)' : '2px 2px 0 var(--foreground)',
        backgroundColor: selected ? 'var(--foreground)' : 'var(--background)',
        color: selected ? 'var(--background)' : 'var(--foreground)',
      }}
    >
      <Handle 
        type="target" 
        position={Position.Top} 
        className="!w-1.5 !h-1.5 !bg-neutral-400 dark:!bg-neutral-500 !border-2 !border-white dark:!border-black" 
      />
      <div className="flex items-center gap-2">
        <Icon className="h-4 w-4" />
        <span className="font-doodle text-xs font-medium truncate max-w-[80px]">{data.label}</span>
      </div>
      <Handle 
        type="source" 
        position={Position.Bottom} 
        className="!w-1.5 !h-1.5 !bg-neutral-400 dark:!bg-neutral-500 !border-2 !border-white dark:!border-black" 
      />
    </div>
  );
}

export const FileNode = memo(FileNodeComponent);
