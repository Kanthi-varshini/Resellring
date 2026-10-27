export function Loading({ label = 'Loading…' }) {
  return (
    <div className="flex flex-col items-center gap-4 py-20">
      <div className="relative h-10 w-10">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-edge2 border-t-acid" />
        <div className="absolute inset-2 rounded-full bg-acid/8 animate-pulse" />
      </div>
      <p className="display text-sm font-black uppercase tracking-wider text-zinc-600">{label}</p>
    </div>
  );
}

export function Empty({ title, hint, action }) {
  return (
    <div className="listing-card rounded-2xl px-8 py-16 text-center">
      <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-2xl border border-edge2 bg-card2 text-2xl">☐</div>
      <p className="display font-black uppercase tracking-wider text-zinc-200">{title}</p>
      {hint && <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-zinc-500">{hint}</p>}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}

export function ErrorState({ message, onRetry }) {
  return (
    <div className="rounded-2xl border border-red-500/15 bg-red-500/5 px-6 py-10 text-center">
      <div className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-full bg-red-500/10 text-xl">⚠</div>
      <p className="display font-black uppercase tracking-wider text-red-500">Error</p>
      <p className="mt-1 text-sm text-zinc-500">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-5 rounded-xl border border-red-500/25 bg-red-500/10 px-6 py-2 text-sm font-bold text-red-400 transition hover:bg-red-500/20"
        >
          Try again
        </button>
      )}
    </div>
  );
}
