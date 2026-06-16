import { useState } from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { parseGitHubUrl } from '@/lib/utils';

interface RepoInputProps {
  onSubmit: (url: string) => void;
  isLoading: boolean;
}

export function RepoInput({ onSubmit, isLoading }: RepoInputProps) {
  const [url, setUrl] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const trimmed = url.trim();
    if (!trimmed) return;
    const parsed = parseGitHubUrl(trimmed);
    if (!parsed) {
      setError('not a valid github url');
      return;
    }
    onSubmit(trimmed);
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-md">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--muted-foreground)]" />
          <Input
            type="text"
            placeholder="github.com/user/repo"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="doodle-input pl-10"
            disabled={isLoading}
          />
        </div>
        <button type="submit" disabled={isLoading} className="doodle-button">
          {isLoading ? 'loading...' : 'go'}
        </button>
      </div>
      {error && <p className="font-doodle text-xs text-[var(--destructive)] mt-1">{error}</p>}
    </form>
  );
}
