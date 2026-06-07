import type { TextStats } from "../utils/textAnalysis";

export function TopWords({ stats }: { stats: TextStats }) {
  const max = Math.max(...stats.topWords.map((w) => w.count), 1);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-baseline justify-between">
        <h3 className="text-sm font-semibold text-slate-800">Most frequent words</h3>
        <span className="text-xs text-slate-500">excluding single letters</span>
      </div>
      <ul className="mt-3 space-y-1.5">
        {stats.topWords.map((w, i) => {
          const pct = (w.count / max) * 100;
          return (
            <li key={w.word} className="flex items-center gap-3 text-sm">
              <span className="w-5 text-right text-[10px] font-mono text-slate-400">
                {i + 1}
              </span>
              <span className="w-24 truncate font-medium text-slate-700">{w.word}</span>
              <div className="relative h-2 flex-1 overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-indigo-400 to-violet-500"
                  style={{ width: `${pct}%` }}
                />
              </div>
              <span className="w-8 text-right text-xs tabular-nums text-slate-500">
                {w.count}
              </span>
            </li>
          );
        })}
        {stats.topWords.length === 0 && (
          <li className="text-sm text-slate-400">No words yet.</li>
        )}
      </ul>
    </div>
  );
}
