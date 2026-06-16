import { RepoInput } from '@/components/features/RepoInput';
import { RepoGraph } from '@/components/features/RepoGraph';
import { ExplanationPanel } from '@/components/features/ExplanationPanel';
import { useRepoStore } from '@/stores/repoStore';
import { useRepoData } from '@/hooks/useRepoData';
import { TooltipProvider } from '@/components/ui/tooltip';
import { ReactFlowProvider } from '@xyflow/react';
import { BookOpen } from 'lucide-react';

function App() {
  const { fetchRepo, isLoading } = useRepoData();
  const { repository, structure, analysis, explanation, selectedNode, setSelectedNode } = useRepoStore();

  return (
    <TooltipProvider>
      <div className="h-screen flex flex-col bg-background overflow-hidden">
        {/* Header */}
        <header className="border-b-2 border-black dark:border-white bg-[var(--card)] px-6 py-4 flex-shrink-0">
          <div className="flex items-center justify-between max-w-[1800px] mx-auto">
            <div className="flex items-center gap-3">
              <span className="text-2xl">📦</span>
              <h1 className="font-handwritten text-2xl font-bold">Visualbase</h1>
            </div>
            <div className="w-full max-w-md">
              <RepoInput onSubmit={fetchRepo} isLoading={isLoading} />
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 flex flex-col overflow-hidden">
          {!repository ? (
            <div className="flex-1 flex items-center justify-center p-8">
              <div className="w-full max-w-md text-center space-y-8">
                <div className="space-y-2">
                  <h2 className="font-handwritten text-4xl font-bold">Visualbase</h2>
                  <p className="font-doodle text-base text-[var(--muted-foreground)]">
                    visualize any github repo as an interactive graph
                  </p>
                </div>

                <div className="doodle-border p-6 bg-[var(--card)]">
                  <RepoInput onSubmit={fetchRepo} isLoading={isLoading} />
                </div>

                <div className="space-y-3">
                  <p className="font-doodle text-xs text-[var(--muted-foreground)]">popular repos</p>
                  <div className="flex flex-wrap justify-center gap-2">
                    {['facebook/react', 'twbs/bootstrap', 'microsoft/vscode', 'vuejs/core'].map((repo) => (
                      <button
                        key={repo}
                        onClick={() => fetchRepo(repo)}
                        className="badge-doodle text-sm cursor-pointer hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors"
                      >
                        {repo}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex overflow-hidden">
              {/* Explorer & Graph */}
              <div className="flex-1 overflow-hidden">
                <ReactFlowProvider>
                  <RepoGraph 
                    structure={structure} 
                    onSelectNode={setSelectedNode}
                    repoInfo={{
                      owner: repository.owner,
                      repo: repository.repo,
                      description: repository.description || undefined,
                      stars: repository.stars,
                    }}
                  />
                </ReactFlowProvider>
              </div>

              {/* Details Panel */}
              <div className="w-80 border-l-2 border-black dark:border-white bg-[var(--card)] flex flex-col flex-shrink-0">
                <div className="p-4 border-b-2 border-black dark:border-white flex items-center gap-2">
                  <BookOpen className="h-4 w-4" />
                  <span className="font-handwritten font-bold">Details</span>
                </div>
                <div className="flex-1 overflow-hidden">
                  <ExplanationPanel
                    selectedNode={selectedNode}
                    explanation={explanation}
                    analysis={analysis}
                    repository={repository}
                  />
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </TooltipProvider>
  );
}

export default App;
