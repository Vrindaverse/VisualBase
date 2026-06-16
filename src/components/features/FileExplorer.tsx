import { useState } from 'react';
import { ChevronRight, ChevronDown, Folder, File } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { TreeNode } from '@/types';

interface FileExplorerProps {
  nodes: TreeNode[];
  selectedNode: TreeNode | null;
  onSelectNode: (node: TreeNode) => void;
}

export function FileExplorer({ nodes, selectedNode, onSelectNode }: FileExplorerProps) {
  return (
    <ScrollArea className="h-full">
      <div className="p-2">
        {nodes.map((node) => (
          <TreeItem key={node.path} node={node} depth={0} selectedNode={selectedNode} onSelectNode={onSelectNode} />
        ))}
      </div>
    </ScrollArea>
  );
}

function TreeItem({ node, depth, selectedNode, onSelectNode }: { node: TreeNode; depth: number; selectedNode: TreeNode | null; onSelectNode: (n: TreeNode) => void }) {
  const [expanded, setExpanded] = useState(depth < 1);
  const isSelected = selectedNode?.path === node.path;
  const hasChildren = node.children && node.children.length > 0;

  const handleClick = () => {
    onSelectNode(node);
    if (node.type === 'folder' && hasChildren) setExpanded(!expanded);
  };

  return (
    <div>
      <div
        onClick={handleClick}
        className={`tree-item ${isSelected ? 'selected' : ''}`}
        style={{ paddingLeft: `${depth * 16 + 8}px` }}
      >
        {node.type === 'folder' ? (
          <>
            {expanded ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
            <Folder className="h-4 w-4 text-yellow-500" />
          </>
        ) : (
          <>
            <span className="w-3" />
            <File className="h-4 w-4" />
          </>
        )}
        <span className="flex-1 truncate font-doodle text-sm">{node.name}</span>
        {node.language && <span className="badge-doodle text-[10px]">{node.language}</span>}
      </div>
      {expanded && hasChildren && (
        <div className="transition-all">
          {node.children!.map((child) => (
            <TreeItem key={child.path} node={child} depth={depth + 1} selectedNode={selectedNode} onSelectNode={onSelectNode} />
          ))}
        </div>
      )}
    </div>
  );
}
