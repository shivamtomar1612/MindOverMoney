export default function Loading() {
  return (
    <main className="page-container animate-pulse" aria-busy="true" aria-label="Loading page">
      <div className="h-3 w-24 bg-surface-muted" />
      <div className="mt-4 h-9 max-w-md bg-surface-muted" />
      <div className="mt-3 h-4 max-w-xl bg-surface-muted" />
      <div className="mt-8 border-y border-border">
        {Array.from({ length: 6 }, (_, index) => <div key={index} className="h-14 border-b border-border bg-surface-muted/55 last:border-0" />)}
      </div>
    </main>
  );
}
