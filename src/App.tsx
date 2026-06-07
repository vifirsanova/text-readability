import { useEffect, useMemo, useState } from "react";
import { analyzeText, SAMPLE_TEXTS } from "./utils/textAnalysis";
import type { TextStats } from "./utils/textAnalysis";
import { StatBar } from "./components/StatBar";
import { CEFRCard } from "./components/CEFRCard";
import { KincaidCard } from "./components/KincaidCard";
import { TopWords } from "./components/TopWords";
import { SentencesView } from "./components/SentencesView";
import { VocabularyCard } from "./components/VocabularyCard";

const DEFAULT_TEXT = SAMPLE_TEXTS[1].text;

export default function App() {
  const [text, setText] = useState<string>(DEFAULT_TEXT);
  const [copied, setCopied] = useState(false);

  // Debounce analysis for very large inputs.
  const debouncedText = useDebounce(text, 180);
  const stats: TextStats | null = useMemo(
    () => analyzeText(debouncedText),
    [debouncedText]
  );

  useEffect(() => {
    if (!copied) return;
    const t = setTimeout(() => setCopied(false), 1200);
    return () => clearTimeout(t);
  }, [copied]);

  const handleCopy = async () => {
    if (!stats) return;
    try {
      await navigator.clipboard.writeText(buildSummary(stats));
      setCopied(true);
    } catch {
      setCopied(false);
    }
  };

  const handleClear = () => setText("");
  const handleSample = (sample: string) => setText(sample);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/40 text-slate-800">
      {/* Header */}
      <header className="border-b border-slate-200/70 bg-white/60 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 shadow-md shadow-indigo-200">
              <svg
                className="h-5 w-5 text-white"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M4 6h16" />
                <path d="M4 12h10" />
                <path d="M4 18h13" />
                <circle cx="20" cy="12" r="1.5" fill="currentColor" />
              </svg>
            </div>
            <div>
              <h1 className="text-base font-semibold tracking-tight text-slate-900 sm:text-lg">
                Text Analysis Studio
              </h1>
              <p className="hidden text-xs text-slate-500 sm:block">
                CEFR level · Flesch–Kincaid grade · readability metrics
              </p>
            </div>
          </div>
          <a
            href="https://en.wikipedia.org/wiki/Flesch%E2%80%93Kincaid_readability_tests"
            target="_blank"
            rel="noreferrer noopener"
            className="hidden text-xs font-medium text-slate-500 hover:text-slate-800 sm:inline-flex sm:items-center sm:gap-1"
          >
            About metrics
            <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path d="M7 17L17 7" />
              <path d="M7 7h10v10" />
            </svg>
          </a>
        </div>
      </header>

      <main className="mx-auto max-w-7xl space-y-6 px-4 py-6 sm:px-6 sm:py-8">
        {/* Hero / Input */}
        <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <div>
              <h2 className="text-sm font-semibold text-slate-800">Your text</h2>
              <p className="text-xs text-slate-500">
                Paste or type. Analysis updates as you write.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-1 rounded-lg border border-slate-200 bg-slate-50 p-0.5">
                {SAMPLE_TEXTS.map((s) => (
                  <button
                    key={s.label}
                    onClick={() => handleSample(s.text)}
                    className="rounded-md px-2.5 py-1 text-[11px] font-medium text-slate-600 transition hover:bg-white hover:text-slate-900"
                  >
                    {s.label}
                  </button>
                ))}
              </div>
              <button
                onClick={handleCopy}
                disabled={!stats}
                className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-medium text-slate-600 transition hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {copied ? (
                  <>
                    <svg className="h-3 w-3 text-emerald-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3}>
                      <path d="M5 12l5 5L20 7" />
                    </svg>
                    Copied
                  </>
                ) : (
                  <>
                    <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                      <rect x="9" y="9" width="13" height="13" rx="2" />
                      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                    </svg>
                    Copy summary
                  </>
                )}
              </button>
              <button
                onClick={handleClear}
                className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-medium text-slate-600 transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-700"
              >
                Clear
              </button>
            </div>
          </div>

          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Paste an essay, an article, or any passage…"
            className="block h-64 w-full resize-y rounded-xl border border-slate-200 bg-slate-50/40 p-4 font-mono text-sm leading-relaxed text-slate-800 placeholder-slate-400 outline-none transition focus:border-indigo-300 focus:bg-white focus:ring-2 focus:ring-indigo-200/60 sm:h-80"
          />

          {stats && (
            <div className="mt-4">
              <StatBar stats={stats} />
            </div>
          )}
        </section>

        {/* Main analysis: CEFR + Kincaid */}
        {stats ? (
          <>
            <section className="grid gap-4 lg:grid-cols-2">
              <CEFRCard
                level={stats.cefr}
                score={stats.cefrScore}
                confidence={stats.cefrConfidence}
              />
              <KincaidCard
                grade={stats.fleschKincaidGrade}
                fleschReadingEase={stats.fleschReadingEase}
                gunningFog={stats.gunningFog}
                smogIndex={stats.smogIndex}
                colemanLiau={stats.colemanLiau}
                ari={stats.automatedReadabilityIndex}
                daleChall={stats.daleChall}
              />
            </section>

            {/* Lower grid: vocabulary + top words */}
            <section className="grid gap-4 lg:grid-cols-5">
              <div className="lg:col-span-2">
                <VocabularyCard stats={stats} />
              </div>
              <div className="lg:col-span-3">
                <TopWords stats={stats} />
              </div>
            </section>

            {/* Sentence breakdown */}
            <section>
              <SentencesView stats={stats} />
            </section>
          </>
        ) : (
          <EmptyState />
        )}

        <footer className="pb-6 pt-2 text-center text-[11px] text-slate-400">
          All analysis runs locally in your browser. No data is uploaded.
        </footer>
      </main>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="rounded-2xl border border-dashed border-slate-300 bg-white/60 p-10 text-center">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
        <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
          <path d="M4 6h16" />
          <path d="M4 12h10" />
          <path d="M4 18h13" />
        </svg>
      </div>
      <h3 className="mt-3 text-sm font-semibold text-slate-700">No text to analyze yet</h3>
      <p className="mx-auto mt-1 max-w-sm text-xs text-slate-500">
        Paste text into the editor above, or pick a sample to see how the analyzer works.
      </p>
    </div>
  );
}

function buildSummary(s: TextStats): string {
  return [
    `CEFR level: ${s.cefr} (difficulty ${s.cefrScore}/100)`,
    `Flesch–Kincaid grade: ${s.fleschKincaidGrade}`,
    `Flesch Reading Ease: ${s.fleschReadingEase}`,
    `Words: ${s.words} · Sentences: ${s.sentences} · Syllables: ${s.syllables}`,
    `Avg sentence: ${s.averageWordsPerSentence.toFixed(1)} wd · Avg syllables/word: ${s.averageSyllablesPerWord.toFixed(2)}`,
    `Complex words: ${s.complexWords} (${s.words ? ((s.complexWords / s.words) * 100).toFixed(1) : "0"}%)`,
  ].join("\n");
}

function useDebounce<T>(value: T, delay: number): T {
  const [v, setV] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setV(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return v;
}
