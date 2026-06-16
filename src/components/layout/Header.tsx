export function Header() {
  return (
    <header className="border-b-2 border-[var(--foreground)] bg-[var(--card)]">
      <div className="container flex h-12 items-center px-4">
        <div className="flex items-center gap-2">
          <span className="text-2xl">📦</span>
          <span className="font-handwritten text-xl font-bold">Visualbase</span>
        </div>
        <div className="flex-1" />
        <div className="flex items-center gap-3 font-doodle text-sm">
          <span className="text-[var(--muted-foreground)]">the repo visualizer™</span>
          <span className="text-xs px-2 py-0.5 bg-[var(--accent)] text-white rounded-full">beta-ish</span>
        </div>
      </div>
    </header>
  );
}
