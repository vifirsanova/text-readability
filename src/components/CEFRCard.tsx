import type { CEFRLevel } from "../utils/textAnalysis";

interface CEFRInfo {
  label: string;
  description: string;
  examples: string;
  bg: string;
  text: string;
  ring: string;
  bar: string;
  chip: string;
}

export const CEFR_INFO: Record<CEFRLevel, CEFRInfo> = {
  A1: {
    label: "Beginner",
    description: "Very short sentences, everyday vocabulary, present tense. The most basic level of communication.",
    examples: "Greetings, simple instructions, signs and notices.",
    bg: "from-emerald-50 to-emerald-100/60",
    text: "text-emerald-900",
    ring: "ring-emerald-200",
    bar: "bg-emerald-500",
    chip: "bg-emerald-100 text-emerald-700 border-emerald-200",
  },
  A2: {
    label: "Elementary",
    description: "Simple sentences on familiar topics. Can handle short social exchanges.",
    examples: "Personal info, shopping, simple descriptions.",
    bg: "from-lime-50 to-lime-100/60",
    text: "text-lime-900",
    ring: "ring-lime-200",
    bar: "bg-lime-500",
    chip: "bg-lime-100 text-lime-700 border-lime-200",
  },
  B1: {
    label: "Intermediate",
    description: "Straightforward connected text on familiar matters. Can describe experiences and events.",
    examples: "Travel, hobbies, simple narratives.",
    bg: "from-amber-50 to-amber-100/60",
    text: "text-amber-900",
    ring: "ring-amber-200",
    bar: "bg-amber-500",
    chip: "bg-amber-100 text-amber-800 border-amber-200",
  },
  B2: {
    label: "Upper-Intermediate",
    description: "Complex text on concrete and abstract topics. Comfortable interaction with fluent speakers.",
    examples: "News, opinion pieces, technical writing.",
    bg: "from-orange-50 to-orange-100/60",
    text: "text-orange-900",
    ring: "ring-orange-200",
    bar: "bg-orange-500",
    chip: "bg-orange-100 text-orange-800 border-orange-200",
  },
  C1: {
    label: "Advanced",
    description: "Wide range of demanding, longer texts. Implicit meaning, flexible language use.",
    examples: "Academic prose, professional reports, literature.",
    bg: "from-rose-50 to-rose-100/60",
    text: "text-rose-900",
    ring: "ring-rose-200",
    bar: "bg-rose-500",
    chip: "bg-rose-100 text-rose-800 border-rose-200",
  },
  C2: {
    label: "Proficient",
    description: "Virtually effortless understanding of everything heard or read. Subtle nuances.",
    examples: "Scholarly articles, abstract literary works, legal text.",
    bg: "from-violet-50 to-violet-100/60",
    text: "text-violet-900",
    ring: "ring-violet-200",
    bar: "bg-violet-500",
    chip: "bg-violet-100 text-violet-800 border-violet-200",
  },
};

const CEFR_ORDER: CEFRLevel[] = ["A1", "A2", "B1", "B2", "C1", "C2"];

export function CEFRCard({
  level,
  score,
  confidence,
}: {
  level: CEFRLevel;
  score: number;
  confidence: number;
}) {
  const info = CEFR_INFO[level];
  const idx = CEFR_ORDER.indexOf(level);
  const confidencePct = Math.round(confidence * 100);

  return (
    <div
      className={`relative overflow-hidden rounded-2xl border border-slate-200 bg-gradient-to-br ${info.bg} p-6 shadow-sm ring-1 ${info.ring}`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-slate-500">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-slate-400" />
            CEFR Level
          </div>
          <div className={`text-5xl font-bold tracking-tight ${info.text}`}>{level}</div>
          <div className={`text-base font-medium ${info.text} opacity-80`}>{info.label}</div>
        </div>

        <div className="text-right">
          <div className={`text-3xl font-semibold tabular-nums ${info.text}`}>{score}</div>
          <div className="text-xs text-slate-500">difficulty · 0–100</div>
          <div className="mt-2 inline-flex items-center gap-1 rounded-full border bg-white/70 px-2 py-0.5 text-[10px] font-medium text-slate-600">
            <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
            {confidencePct}% confidence
          </div>
        </div>
      </div>

      <p className={`mt-4 text-sm leading-relaxed ${info.text} opacity-90`}>
        {info.description}
      </p>
      <p className="mt-1 text-xs text-slate-600 italic">Typical: {info.examples}</p>

      {/* CEFR track */}
      <div className="mt-5">
        <div className="flex items-center justify-between text-[10px] font-medium uppercase tracking-wider text-slate-500">
          {CEFR_ORDER.map((lvl) => (
            <span
              key={lvl}
              className={`flex-1 text-center ${lvl === level ? info.text : "text-slate-400"}`}
            >
              {lvl}
            </span>
          ))}
        </div>
        <div className="mt-1.5 flex gap-1">
          {CEFR_ORDER.map((lvl) => (
            <div
              key={lvl}
              className={`h-1.5 flex-1 rounded-full ${
                CEFR_ORDER.indexOf(lvl) <= idx
                  ? info.bar
                  : "bg-slate-200/80"
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
