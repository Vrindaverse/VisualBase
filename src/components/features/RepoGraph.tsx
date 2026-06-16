import { useState, useMemo, useCallback } from 'react';
import { 
  ReactFlow, 
  Background,
  MiniMap,
  useNodesState, 
  useEdgesState,
  type Node,
  type Edge,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { FolderNode } from '@/components/graph/FolderNode';
import { FileNode } from '@/components/graph/FileNode';
import { ComponentNode } from '@/components/graph/ComponentNode';
import { 
  Search, 
  ChevronDown, 
  ChevronRight,
  Folder,
  File,
  X,
  ZoomIn,
  ZoomOut,
  Maximize,
  ChevronLeft,
  ChevronRight as ChevronRightIcon,
  Info,
  GitBranch,
} from 'lucide-react';
import type { TreeNode as TreeNodeType } from '@/types';

const nodeTypes = {
  folder: FolderNode,
  file: FileNode,
  component: ComponentNode,
};

interface RepoGraphProps {
  structure: TreeNodeType[];
  onSelectNode: (node: TreeNodeType) => void;
  repoInfo?: { owner: string; repo: string; description?: string; stars?: number };
}

export function RepoGraph({ structure, onSelectNode, repoInfo }: RepoGraphProps) {
  const [viewMode, setViewMode] = useState<'graph' | 'tree'>('graph');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'folders' | 'files'>('all');
  const [expandedPaths, setExpandedPaths] = useState<Set<string>>(new Set());
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [showExplorer, setShowExplorer] = useState(true);
  const [showInfo, setShowInfo] = useState(false);

  const graphData = useMemo(() => buildGraphData(structure, filterType), [structure, filterType]);
  const [nodes, , onNodesChange] = useNodesState(graphData.nodes);
  const [edges, , onEdgesChange] = useEdgesState(graphData.edges);

  const handleNodeClick = useCallback((_: React.MouseEvent, node: Node) => {
    setSelectedNodeId(node.id);
    const path = node.data.path as string;
    function findNode(items: TreeNodeType[]): TreeNodeType | null {
      for (const item of items) {
        if (item.path === path) return item;
        if (item.children) {
          const found = findNode(item.children);
          if (found) return found;
        }
      }
      return null;
    }
    const found = findNode(structure);
    if (found) onSelectNode(found);
  }, [structure, onSelectNode]);

  const toggleFolder = useCallback((path: string) => {
    setExpandedPaths(prev => {
      const next = new Set(prev);
      if (next.has(path)) next.delete(path);
      else next.add(path);
      return next;
    });
  }, []);

  const expandAll = useCallback(() => {
    const allPaths = new Set<string>();
    function collect(nodes: TreeNodeType[]) {
      for (const node of nodes) {
        if (node.type === 'folder') {
          allPaths.add(node.path);
          if (node.children) collect(node.children);
        }
      }
    }
    collect(structure);
    setExpandedPaths(allPaths);
  }, [structure]);

  const collapseAll = useCallback(() => {
    setExpandedPaths(new Set());
  }, []);

  const countItems = (nodes: TreeNodeType[]): { folders: number; files: number } => {
    let folders = 0, files = 0;
    for (const n of nodes) {
      if (n.type === 'folder') {
        folders++;
        if (n.children) {
          const child = countItems(n.children);
          folders += child.folders;
          files += child.files;
        }
      } else {
        files++;
      }
    }
    return { folders, files };
  };

  const counts = useMemo(() => countItems(structure), [structure]);

  const filteredCounts = useMemo(() => {
    function filterCount(nodes: TreeNodeType[]): { folders: number; files: number } {
      let folders = 0, files = 0;
      for (const n of nodes) {
        const matchSearch = !searchQuery || 
          n.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          n.path.toLowerCase().includes(searchQuery.toLowerCase());
        
        if (!matchSearch) continue;
        
        if (n.type === 'folder') {
          if (filterType === 'all' || filterType === 'folders') folders++;
          if (n.children) {
            const child = filterCount(n.children);
            folders += child.folders;
            files += child.files;
          }
        } else {
          if (filterType === 'all' || filterType === 'files') files++;
        }
      }
      return { folders, files };
    }
    return filterCount(structure);
  }, [structure, searchQuery, filterType]);

  if (structure.length === 0) {
    return (
      <div className="h-full flex items-center justify-center">
        <p className="font-doodle text-[var(--muted-foreground)]">enter a repo to visualize</p>
      </div>
    );
  }

  return (
    <div className="h-full w-full flex relative">
      {/* Collapsible Explorer Panel */}
      <div 
        className={`h-full border-r-2 border-black dark:border-white bg-[var(--card)] flex flex-col transition-all duration-300 ${
          showExplorer ? 'w-72' : 'w-12'
        }`}
      >
        <div className="p-3 border-b-2 border-black dark:border-white flex items-center justify-between">
          {showExplorer && <span className="font-handwritten font-bold">Explorer</span>}
          <button 
            onClick={() => setShowExplorer(!showExplorer)}
            className="p-1.5 hover:bg-[var(--muted)] rounded"
          >
            {showExplorer ? <ChevronLeft className="h-4 w-4" /> : <ChevronRightIcon className="h-4 w-4" />}
          </button>
        </div>
        
        {showExplorer && (
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Repo Info */}
            {repoInfo && (
              <div className="p-3 border-b border-[var(--foreground)]/20">
                <div className="flex items-center gap-2 mb-2">
                  <GitBranch className="h-4 w-4 text-[var(--muted-foreground)]" />
                  <span className="font-doodle text-sm font-bold truncate">
                    {repoInfo.owner}/{repoInfo.repo}
                  </span>
                </div>
                {repoInfo.description && (
                  <p className="font-doodle text-xs text-[var(--muted-foreground)] line-clamp-2 mb-2">
                    {repoInfo.description}
                  </p>
                )}
                {repoInfo.stars !== undefined && (
                  <div className="flex items-center gap-1 text-xs text-[var(--muted-foreground)]">
                    <span>⭐</span>
                    <span className="font-doodle">{repoInfo.stars.toLocaleString()} stars</span>
                  </div>
                )}
              </div>
            )}

            {/* View Toggle */}
            <div className="p-3 border-b border-[var(--foreground)]/20">
              <div className="flex gap-1 bg-[var(--muted)] p-1 rounded">
                <button
                  onClick={() => setViewMode('tree')}
                  className={`flex-1 px-3 py-2 text-sm font-doodle rounded transition-all ${
                    viewMode === 'tree' ? 'bg-white dark:bg-black text-black dark:text-white shadow-sm' : ''
                  }`}
                >
                  Tree
                </button>
                <button
                  onClick={() => setViewMode('graph')}
                  className={`flex-1 px-3 py-2 text-sm font-doodle rounded transition-all ${
                    viewMode === 'graph' ? 'bg-white dark:bg-black text-black dark:text-white shadow-sm' : ''
                  }`}
                >
                  Graph
                </button>
              </div>
            </div>

            {/* Search */}
            <div className="p-3 border-b border-[var(--foreground)]/20">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--muted-foreground)]" />
                <input
                  type="text"
                  placeholder="Search files..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-10 py-2.5 text-sm font-doodle border-2 border-black dark:border-white bg-[var(--background)]"
                />
                {searchQuery && (
                  <button 
                    onClick={() => setSearchQuery('')} 
                    className="absolute right-3 top-1/2 -translate-y-1/2 hover:bg-[var(--muted)] p-1 rounded"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Filter */}
            <div className="p-3 border-b border-[var(--foreground)]/20">
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value as typeof filterType)}
                className="w-full px-3 py-2.5 text-sm font-doodle border-2 border-black dark:border-white bg-[var(--background)]"
              >
                <option value="all">All Items ({filteredCounts.folders + filteredCounts.files})</option>
                <option value="folders">Folders ({filteredCounts.folders})</option>
                <option value="files">Files ({filteredCounts.files})</option>
              </select>
            </div>

            {/* Expand/Collapse */}
            <div className="p-3 border-b border-[var(--foreground)]/20">
              <div className="grid grid-cols-2 gap-2">
                <button 
                  onClick={collapseAll} 
                  className="px-3 py-2 text-sm font-doodle border-2 border-black dark:border-white hover:bg-[var(--muted)]"
                >
                  Collapse All
                </button>
                <button 
                  onClick={expandAll} 
                  className="px-3 py-2 text-sm font-doodle border-2 border-black dark:border-white hover:bg-[var(--muted)]"
                >
                  Expand All
                </button>
              </div>
            </div>

            {/* Tree View */}
            <div className="flex-1 overflow-auto scrollbar-doodle p-2">
              <div className="text-xs font-doodle text-[var(--muted-foreground)] mb-2 px-2">
                Showing {filteredCounts.folders + filteredCounts.files} of {counts.folders + counts.files} items
              </div>
              {structure.map(node => (
                <TreeItem
                  key={node.path}
                  node={node}
                  depth={0}
                  expandedPaths={expandedPaths}
                  selectedNodeId={selectedNodeId}
                  searchQuery={searchQuery}
                  filterType={filterType}
                  onToggle={toggleFolder}
                  onSelect={(n, id) => {
                    setSelectedNodeId(id);
                    onSelectNode(n);
                  }}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Main Area */}
      <div className="flex-1 flex flex-col relative">
        {/* Toolbar */}
        <div className="h-12 border-b-2 border-black dark:border-white bg-[var(--secondary)] px-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="font-doodle text-sm">
              {counts.folders} folders · {counts.files} files
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowInfo(!showInfo)}
              className={`p-2 rounded hover:bg-[var(--muted)] ${showInfo ? 'bg-[var(--muted)]' : ''}`}
            >
              <Info className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 relative overflow-hidden">
          {viewMode === 'tree' ? (
            <div className="h-full overflow-auto p-6">
              <div className="max-w-2xl mx-auto">
                {structure.map(node => (
                  <TreeItem
                    key={node.path}
                    node={node}
                    depth={0}
                    expandedPaths={expandedPaths}
                    selectedNodeId={selectedNodeId}
                    searchQuery={searchQuery}
                    filterType={filterType}
                    onToggle={toggleFolder}
                    onSelect={(n, id) => {
                      setSelectedNodeId(id);
                      onSelectNode(n);
                    }}
                  />
                ))}
              </div>
            </div>
          ) : (
            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onNodeClick={handleNodeClick}
              nodeTypes={nodeTypes}
              fitView
              minZoom={0.05}
              maxZoom={4}
              className="bg-background"
            >
              <Background gap={20} />
              
              {/* Zoom Controls */}
              <div className="absolute bottom-4 right-4 flex flex-col gap-2">
                <div className="doodle-border bg-[var(--card)] p-1 flex flex-col gap-1">
                  <button className="p-2 hover:bg-[var(--muted)] rounded" title="Zoom In">
                    <ZoomIn className="h-5 w-5" />
                  </button>
                  <button className="p-2 hover:bg-[var(--muted)] rounded" title="Zoom Out">
                    <ZoomOut className="h-5 w-5" />
                  </button>
                  <button className="p-2 hover:bg-[var(--muted)] rounded" title="Fit View">
                    <Maximize className="h-5 w-5" />
                  </button>
                </div>
              </div>
              
              {/* MiniMap */}
              <div className="absolute bottom-4 left-4">
                <MiniMap
                  className="!border-2 !border-black dark:!border-white !rounded-lg !bg-[var(--background)] !w-48 !h-32"
                  nodeColor={(node) => node.type === 'folder' ? '#666' : '#999'}
                />
              </div>
            </ReactFlow>
          )}
        </div>
      </div>
    </div>
  );
}

function TreeItem({
  node,
  depth,
  expandedPaths,
  selectedNodeId,
  searchQuery,
  filterType,
  onToggle,
  onSelect,
}: {
  node: TreeNodeType;
  depth: number;
  expandedPaths: Set<string>;
  selectedNodeId: string | null;
  searchQuery: string;
  filterType: 'all' | 'folders' | 'files';
  onToggle: (path: string) => void;
  onSelect: (node: TreeNodeType, id: string) => void;
}) {
  const isExpanded = expandedPaths.has(node.path);
  const isSelected = selectedNodeId === node.path;
  const hasChildren = node.children && node.children.length > 0;

  const matchesSearch = !searchQuery || 
    node.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    node.path.toLowerCase().includes(searchQuery.toLowerCase());

  const matchesFilter = 
    filterType === 'all' || 
    (filterType === 'folders' && node.type === 'folder') ||
    (filterType === 'files' && node.type === 'file');

  if (!matchesSearch || !matchesFilter) return null;

  return (
    <div>
      <div
        onClick={() => {
          onSelect(node, node.path);
          if (node.type === 'folder') onToggle(node.path);
        }}
        className={`flex items-center gap-2 px-3 py-2.5 cursor-pointer transition-all rounded-lg mb-0.5 ${
          isSelected 
            ? 'bg-black text-white dark:bg-white dark:text-black font-medium' 
            : 'hover:bg-[var(--muted)]'
        }`}
        style={{ paddingLeft: `${depth * 16 + 12}px` }}
      >
        {node.type === 'folder' ? (
          <>
            {isExpanded ? (
              <ChevronDown className="h-4 w-4 flex-shrink-0" />
            ) : (
              <ChevronRight className="h-4 w-4 flex-shrink-0" />
            )}
            <Folder className="h-4 w-4 flex-shrink-0" />
          </>
        ) : (
          <>
            <span className="w-4" />
            <File className="h-4 w-4 flex-shrink-0" />
          </>
        )}
        <span className="flex-1 font-doodle text-sm truncate">{node.name}</span>
        {node.language && (
          <span className="text-[10px] px-2 py-0.5 border border-current opacity-60 rounded flex-shrink-0">
            {node.language}
          </span>
        )}
        {node.type === 'folder' && hasChildren && (
          <span className="text-[10px] opacity-50 flex-shrink-0">
            {node.children!.length}
          </span>
        )}
      </div>
      
      {node.type === 'folder' && isExpanded && hasChildren && (
        <div>
          {node.children!.map(child => (
            <TreeItem
              key={child.path}
              node={child}
              depth={depth + 1}
              expandedPaths={expandedPaths}
              selectedNodeId={selectedNodeId}
              searchQuery={searchQuery}
              filterType={filterType}
              onToggle={onToggle}
              onSelect={onSelect}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function buildGraphData(structure: TreeNodeType[], filterType: string): { nodes: Node[]; edges: Edge[] } {
  const graphNodes: Node[] = [];
  const graphEdges: Edge[] = [];
  let index = 0;

  function process(items: TreeNodeType[], parentId: string | null, depth: number): number {
    for (const item of items) {
      if (filterType === 'folders' && item.type === 'file') continue;
      if (filterType === 'files' && item.type === 'folder') continue;

      const nodeId = item.path.replace(/\//g, '-').replace(/\./g, '-');
      const x = Math.floor(index / 5) * 280;
      const y = depth * 150;

      graphNodes.push({
        id: nodeId,
        type: item.type === 'folder' ? 'folder' : 'file',
        position: { x, y },
        data: { label: item.name, path: item.path, language: item.language },
      });

      if (parentId) {
        graphEdges.push({
          id: `${parentId}-${nodeId}`,
          source: parentId,
          target: nodeId,
          type: 'smoothstep',
          style: { stroke: '#999', strokeWidth: 2 },
        });
      }

      if (item.type === 'folder' && item.children) {
        index = process(item.children, nodeId, depth + 1);
      }
      index++;
      if (index > 80) break;
    }
    return index;
  }

  process(structure, null, 0);
  return { nodes: graphNodes, edges: graphEdges };
}
