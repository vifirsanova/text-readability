import type { TextStats } from "../utils/textAnalysis";

export function VocabularyCard({ stats }: { stats: TextStats }) {
  const items = [
    {
      label: "Type/Token ratio",
      value: stats.typeTokenRatio.toFixed(2),
      hint: "Vocabulary diversity. Higher = richer vocabulary (0–1).",
      pct: stats.typeTokenRatio,
    },
    {
      label: "Avg syllables / word",
      value: stats.averageSyllablesPerWord.toFixed(2),
      hint: "Lower = simpler words. 1.0 is very easy.",
      pct: Math.min(1, stats.averageSyllablesPerWord / 2.5),
    },
    {
      label: "Avg characters / word",
      value: stats.averageCharactersPerWord.toFixed(1),
      hint: "Average word length in characters.",
      pct: Math.min(1, stats.averageCharactersPerWord / 7),
    },
    {
      label: "Complex words (3+ syl)",
      value: `${stats.complexWords} (${pct(stats.complexWords, stats.words)}%)`,
      hint: "Words with 3 or more syllables.",
      pct: stats.words ? stats.complexWords / stats.words : 0,
    },
    {
      label: "Long words (6+ char)",
      value: `${stats.longWords} (${pct(stats.longWords, stats.words)}%)`,
      hint: "Words with 6 or more characters.",
      pct: stats.words ? stats.longWords / stats.words : 0,
    },
    {
      label: "Monosyllables",
      value: `${stats.monosyllables} (${pct(stats.monosyllables, stats.words)}%)`,
      hint: "1-syllable words. Higher = simpler.",
      pct: stats.words ? stats.monosyllables / stats.words : 0,
    },
  ];

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <h3 className="text-sm font-semibold text-slate-800">Vocabulary & complexity</h3>
      <ul className="mt-3 space-y-3">
        {items.map((it) => (
          <li key={it.label}>
            <div className="flex items-baseline justify-between text-xs">
              <span className="font-medium text-slate-700">{it.label}</span>
              <span className="font-semibold tabular-nums text-slate-800">{it.value}</span>
            </div>
            <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-gradient-to-r from-sky-400 to-indigo-500"
                style={{ width: `${Math.min(100, it.pct * 100)}%` }}
              />
            </div>
            <div className="mt-0.5 text-[11px] text-slate-500">{it.hint}</div>
          </li>
        ))}
      </ul>
    </div>
  );
}

function pct(part: number, whole: number): string {
  if (!whole) return "0";
  return ((part / whole) * 100).toFixed(1);
}
