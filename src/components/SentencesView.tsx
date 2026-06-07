import { useMemo, useState } from "react";
import type { TextStats } from "../utils/textAnalysis";

type Filter = "all" | "long" | "complex" | "short";

export function SentencesView({ stats }: { stats: TextStats }) {
  const [filter, setFilter] = useState<Filter>("all");

  const filtered = useMemo(() => {
    if (filter === "all") return stats.sentencesBreakdown;
    if (filter === "long")
      return stats.sentencesBreakdown.filter((s) => s.words > stats.averageWordsPerSentence * 1.5);
    if (filter === "complex") return stats.sentencesBreakdown.filter((s) => s.isComplex);
    return stats.sentencesBreakdown.filter((s) => s.words <= 6);
  }, [filter, stats]);

  const tabs: { id: Filter; label: string; count: number }[] = [
    { id: "all", label: "All", count: stats.sentencesBreakdown.length },
    {
      id: "long",
      label: "Long",
      count: stats.sentencesBreakdown.filter((s) => s.words > stats.averageWordsPerSentence * 1.5).length,
    },
    {
      id: "complex",
      label: "Complex",
      count: stats.sentencesBreakdown.filter((s) => s.isComplex).length,
    },
    {
      id: "short",
      label: "Short ≤6",
      count: stats.sentencesBreakdown.filter((s) => s.words <= 6).length,
    },
  ];

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h3 className="text-sm font-semibold text-slate-800">Sentences</h3>
        <div className="text-xs text-slate-500">
          longest {stats.longestSentenceLength} · shortest {stats.shortestSentenceLength} words
        </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-1.5">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setFilter(t.id)}
            className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition ${
              filter === t.id
                ? "border-slate-800 bg-slate-800 text-white"
                : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50"
            }`}
          >
            {t.label}
            <span
              className={`rounded-full px-1.5 py-px text-[10px] tabular-nums ${
                filter === t.id ? "bg-white/20 text-white" : "bg-slate-100 text-slate-600"
              }`}
            >
              {t.count}
            </span>
          </button>
        ))}
      </div>

      <ul className="mt-4 max-h-80 space-y-2 overflow-y-auto pr-1">
        {filtered.slice(0, 60).map((s, i) => {
          const ratio = s.words / Math.max(1, stats.averageWordsPerSentence);
          const tone =
            s.isComplex
              ? "border-rose-200 bg-rose-50/60"
              : ratio > 1.5
                ? "border-amber-200 bg-amber-50/60"
                : s.words <= 6
                  ? "border-emerald-200 bg-emerald-50/60"
                  : "border-slate-200 bg-slate-50/40";

          return (
            <li
              key={i}
              className={`rounded-lg border p-2.5 text-sm leading-relaxed text-slate-700 ${tone}`}
            >
              <div className="flex items-baseline justify-between gap-2 text-[10px] uppercase tracking-wider text-slate-500">
                <span className="font-mono">#{i + 1}</span>
                <span>
                  {s.words} wd · {s.syllables} syl
                  {s.isComplex && (
                    <span className="ml-1 rounded bg-rose-100 px-1 text-rose-700">complex</span>
                  )}
                </span>
              </div>
              <div className="mt-1">{s.sentence}</div>
            </li>
          );
        })}
        {filtered.length === 0 && (
          <li className="text-sm text-slate-400">No sentences match this filter.</li>
        )}
        {filtered.length > 60 && (
          <li className="text-center text-xs text-slate-400">…showing first 60</li>
        )}
      </ul>
    </div>
  );
}
