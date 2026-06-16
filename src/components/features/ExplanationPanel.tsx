import { ScrollArea } from '@/components/ui/scroll-area';
import { Folder, Code, Database, Layers } from 'lucide-react';
import type { TreeNode, AIExplanation, AnalysisResult } from '@/types';

interface ExplanationPanelProps {
  selectedNode: TreeNode | null;
  explanation: AIExplanation | null;
  analysis: AnalysisResult | null;
  repository: { owner: string; repo: string; description?: string; stars?: number; language?: string } | null;
}

export function ExplanationPanel({ selectedNode, explanation, analysis, repository }: ExplanationPanelProps) {
  if (!repository) {
    return (
      <div className="h-full flex items-center justify-center text-center p-4">
        <div className="space-y-3">
          <div className="text-4xl">👈</div>
          <p className="font-doodle text-sm text-[var(--muted-foreground)]">
            select a file or folder to see details
          </p>
        </div>
      </div>
    );
  }

  if (!selectedNode) {
    return (
      <ScrollArea className="h-full">
        <div className="p-4 space-y-4">
          {/* Repo Overview */}
          <div className="doodle-border p-4 bg-[var(--card)]">
            <h3 className="font-handwritten text-lg font-bold mb-3 flex items-center gap-2">
              <Code className="h-4 w-4" />
              Project Overview
            </h3>
            <div className="space-y-2">
              <div>
                <span className="font-doodle text-xs text-[var(--muted-foreground)]">Repository</span>
                <p className="font-doodle text-sm font-medium">{repository.owner}/{repository.repo}</p>
              </div>
              {repository.description && (
                <div>
                  <span className="font-doodle text-xs text-[var(--muted-foreground)]">Description</span>
                  <p className="font-doodle text-sm">{repository.description}</p>
                </div>
              )}
              {repository.language && (
                <div>
                  <span className="font-doodle text-xs text-[var(--muted-foreground)]">Main Language</span>
                  <p className="font-doodle text-sm">{repository.language}</p>
                </div>
              )}
              {repository.stars !== undefined && (
                <div>
                  <span className="font-doodle text-xs text-[var(--muted-foreground)]">Stars</span>
                  <p className="font-doodle text-sm">⭐ {repository.stars.toLocaleString()}</p>
                </div>
              )}
            </div>
          </div>

          {/* Tech Stack */}
          {analysis && analysis.techStack.length > 0 && (
            <div className="doodle-border p-4 bg-[var(--card)]">
              <h3 className="font-handwritten text-lg font-bold mb-3 flex items-center gap-2">
                <Layers className="h-4 w-4" />
                Tech Stack
              </h3>
              <div className="flex flex-wrap gap-2">
                {analysis.techStack.map((tech) => (
                  <span key={tech} className="badge-doodle text-xs">{tech}</span>
                ))}
              </div>
            </div>
          )}

          {/* Description from AI */}
          {explanation && explanation.overview && (
            <div className="doodle-border p-4 bg-[var(--card)]">
              <h3 className="font-handwritten text-lg font-bold mb-2">About</h3>
              <p className="font-doodle text-sm leading-relaxed">{explanation.overview}</p>
            </div>
          )}

          {/* Architecture */}
          {explanation && explanation.architecture && (
            <div className="doodle-border p-4 bg-[var(--card)]">
              <h3 className="font-handwritten text-lg font-bold mb-2 flex items-center gap-2">
                <Database className="h-4 w-4" />
                Architecture
              </h3>
              <p className="font-doodle text-sm leading-relaxed">{explanation.architecture}</p>
            </div>
          )}
        </div>
      </ScrollArea>
    );
  }

  return (
    <ScrollArea className="h-full">
      <div className="p-4 space-y-4">
        {/* Selected Item */}
        <div className="doodle-border p-4 bg-[var(--card)]">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-2xl">
              {selectedNode.type === 'folder' ? '📁' : '📄'}
            </span>
            <h3 className="font-handwritten text-lg font-bold truncate">{selectedNode.name}</h3>
          </div>
          
          <div className="space-y-2">
            <div>
              <span className="font-doodle text-xs text-[var(--muted-foreground)]">Path</span>
              <p className="font-doodle text-xs break-all bg-[var(--muted)] p-2 rounded">{selectedNode.path}</p>
            </div>
            <div>
              <span className="font-doodle text-xs text-[var(--muted-foreground)]">Type</span>
              <p className="font-doodle text-sm">{selectedNode.type === 'folder' ? 'Folder' : 'File'}</p>
            </div>
            {selectedNode.language && (
              <div>
                <span className="font-doodle text-xs text-[var(--muted-foreground)]">Language</span>
                <p className="font-doodle text-sm">{selectedNode.language}</p>
              </div>
            )}
            {selectedNode.size && (
              <div>
                <span className="font-doodle text-xs text-[var(--muted-foreground)]">Size</span>
                <p className="font-doodle text-sm">{formatSize(selectedNode.size)}</p>
              </div>
            )}
          </div>
        </div>

        {/* Folder Contents */}
        {selectedNode.type === 'folder' && selectedNode.children && (
          <div className="doodle-border p-4 bg-[var(--card)]">
            <h4 className="font-handwritten text-base font-bold mb-3 flex items-center gap-2">
              <Folder className="h-4 w-4" />
              Contents ({selectedNode.children.length})
            </h4>
            <div className="space-y-1 max-h-48 overflow-auto">
              {selectedNode.children.slice(0, 20).map((child) => (
                <div 
                  key={child.path} 
                  className="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-[var(--muted)] text-sm"
                >
                  <span>{child.type === 'folder' ? '📁' : '📄'}</span>
                  <span className="font-doodle text-sm truncate flex-1">{child.name}</span>
                  {child.language && (
                    <span className="text-[10px] opacity-60">{child.language}</span>
                  )}
                </div>
              ))}
              {selectedNode.children.length > 20 && (
                <p className="font-doodle text-xs text-[var(--muted-foreground)] pt-2">
                  +{selectedNode.children.length - 20} more items
                </p>
              )}
            </div>
          </div>
        )}

        {/* AI File Explanation */}
        {selectedNode.type === 'file' && explanation?.fileSummaries?.[selectedNode.path] && (
          <div className="doodle-border p-4 bg-[var(--card)]">
            <h4 className="font-handwritten text-base font-bold mb-2">AI Summary</h4>
            <p className="font-doodle text-sm leading-relaxed">
              {explanation.fileSummaries[selectedNode.path]}
            </p>
          </div>
        )}

        {/* AI Folder Explanation */}
        {selectedNode.type === 'folder' && explanation?.folderExplanations?.[selectedNode.path] && (
          <div className="doodle-border p-4 bg-[var(--card)]">
            <h4 className="font-handwritten text-base font-bold mb-2">AI Explanation</h4>
            <p className="font-doodle text-sm leading-relaxed">
              {explanation.folderExplanations[selectedNode.path]}
            </p>
          </div>
        )}
      </div>
    </ScrollArea>
  );
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
