import type { TextStats } from "../utils/textAnalysis";

function formatReadingTime(minutes: number): string {
  if (minutes < 1 / 60) return "< 1 sec";
  if (minutes < 1) return `${Math.round(minutes * 60)} sec`;
  if (minutes < 10) return `${minutes.toFixed(1)} min`;
  return `${Math.round(minutes)} min`;
}

export function StatBar({ stats }: { stats: TextStats }) {
  const items = [
    { label: "Words", value: stats.words.toLocaleString() },
    { label: "Sentences", value: stats.sentences.toLocaleString() },
    { label: "Paragraphs", value: stats.paragraphs.toLocaleString() },
    { label: "Syllables", value: stats.syllables.toLocaleString() },
    { label: "Unique words", value: stats.uniqueWords.toLocaleString() },
    {
      label: "Avg sentence",
      value: `${stats.averageWordsPerSentence.toFixed(1)} wd`,
    },
    {
      label: "Reading time",
      value: formatReadingTime(stats.readingTimeMinutes),
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-7">
      {items.map((it) => (
        <div
          key={it.label}
          className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 shadow-sm"
        >
          <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
            {it.label}
          </div>
          <div className="mt-0.5 text-lg font-semibold tabular-nums text-slate-800">
            {it.value}
          </div>
        </div>
      ))}
    </div>
  );
}
