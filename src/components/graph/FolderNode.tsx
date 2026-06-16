import { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { Folder } from 'lucide-react';

type NodeData = {
  label: string;
  path: string;
  importance?: 'high' | 'medium' | 'low';
};

type FolderNodeProps = {
  data: NodeData;
  selected?: boolean;
};

function FolderNodeComponent({ data, selected }: FolderNodeProps) {
  return (
    <div
      className="px-4 py-3 rounded-xl border-2 border-black dark:border-white bg-white dark:bg-neutral-900 transition-all duration-200 min-w-[140px]"
      style={{
        boxShadow: selected 
          ? '4px 4px 0 var(--accent)' 
          : '2px 2px 0 var(--foreground)',
        backgroundColor: selected ? 'var(--foreground)' : 'var(--background)',
        color: selected ? 'var(--background)' : 'var(--foreground)',
      }}
    >
      <Handle 
        type="target" 
        position={Position.Top} 
        className="!w-2 !h-2 !bg-neutral-600 dark:!bg-neutral-400 !border-2 !border-white dark:!border-black"
      />
      <div className="flex items-center gap-2">
        <Folder className="h-5 w-5" />
        <span className="font-handwritten text-sm font-semibold">{data.label}</span>
      </div>
      <Handle 
        type="source" 
        position={Position.Bottom} 
        className="!w-2 !h-2 !bg-neutral-600 dark:!bg-neutral-400 !border-2 !border-white dark:!border-black"
      />
    </div>
  );
}

export const FolderNode = memo(FolderNodeComponent);
