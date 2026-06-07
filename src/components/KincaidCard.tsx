interface KincaidCardProps {
  grade: number;
  fleschReadingEase: number;
  gunningFog: number;
  smogIndex: number;
  colemanLiau: number;
  ari: number;
  daleChall: number;
}

function gradeAudience(grade: number): { label: string; color: string; bg: string; ring: string } {
  if (grade < 1) return { label: "Pre-reader / very easy", color: "text-emerald-700", bg: "from-emerald-50 to-emerald-100/60", ring: "ring-emerald-200" };
  if (grade < 5) return { label: "Elementary school", color: "text-lime-700", bg: "from-lime-50 to-lime-100/60", ring: "ring-lime-200" };
  if (grade < 8) return { label: "Middle school", color: "text-amber-700", bg: "from-amber-50 to-amber-100/60", ring: "ring-amber-200" };
  if (grade < 11) return { label: "High school", color: "text-orange-700", bg: "from-orange-50 to-orange-100/60", ring: "ring-orange-200" };
  if (grade < 14) return { label: "College / undergraduate", color: "text-rose-700", bg: "from-rose-50 to-rose-100/60", ring: "ring-rose-200" };
  if (grade < 17) return { label: "Graduate level", color: "text-violet-700", bg: "from-violet-50 to-violet-100/60", ring: "ring-violet-200" };
  return { label: "Specialist / academic", color: "text-fuchsia-700", bg: "from-fuchsia-50 to-fuchsia-100/60", ring: "ring-fuchsia-200" };
}

function easeLabel(score: number): { label: string; color: string } {
  if (score >= 90) return { label: "Very easy", color: "text-emerald-700" };
  if (score >= 80) return { label: "Easy", color: "text-lime-700" };
  if (score >= 70) return { label: "Fairly easy", color: "text-amber-700" };
  if (score >= 60) return { label: "Standard", color: "text-orange-700" };
  if (score >= 50) return { label: "Fairly difficult", color: "text-rose-700" };
  if (score >= 30) return { label: "Difficult", color: "text-violet-700" };
  return { label: "Very confusing", color: "text-fuchsia-700" };
}

export function KincaidCard(props: KincaidCardProps) {
  const aud = gradeAudience(props.grade);
  const ease = easeLabel(props.fleschReadingEase);

  return (
    <div
      className={`relative overflow-hidden rounded-2xl border border-slate-200 bg-gradient-to-br ${aud.bg} p-6 shadow-sm ring-1 ${aud.ring}`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-slate-500">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-slate-400" />
            Flesch–Kincaid Grade Level
          </div>
          <div className={`text-5xl font-bold tracking-tight ${aud.color}`}>
            {props.grade.toFixed(1)}
          </div>
          <div className={`text-base font-medium ${aud.color} opacity-80`}>{aud.label}</div>
        </div>

        <div className="text-right">
          <div className={`text-3xl font-semibold tabular-nums ${aud.color}`}>
            {Math.max(0, Math.round(props.fleschReadingEase))}
          </div>
          <div className="text-xs text-slate-500">Flesch Reading Ease</div>
          <div className={`mt-2 inline-block rounded-full border bg-white/70 px-2 py-0.5 text-[10px] font-medium ${ease.color}`}>
            {ease.label}
          </div>
        </div>
      </div>

      <p className="mt-4 text-sm leading-relaxed text-slate-700">
        Estimates the U.S. school grade a student would need to understand the text on first reading.
        Computed as <code className="rounded bg-white/60 px-1 py-0.5 text-[11px]">0.39·(words/sentences) + 11.8·(syllables/words) − 15.59</code>.
      </p>

      {/* Grade scale */}
      <div className="mt-5">
        <div className="flex items-center justify-between text-[10px] font-medium uppercase tracking-wider text-slate-500">
          <span>K</span><span>2</span><span>5</span><span>8</span><span>12</span><span>16+</span>
        </div>
        <div className="relative mt-1.5 h-2 rounded-full bg-gradient-to-r from-emerald-200 via-amber-200 to-fuchsia-300">
          <div
            className="absolute -top-1 h-4 w-1 rounded-full bg-slate-700 shadow"
            style={{ left: `calc(${Math.min(100, (props.grade / 18) * 100)}% - 2px)` }}
          />
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2 text-xs sm:grid-cols-3">
        <Mini label="Gunning Fog" value={props.gunningFog} />
        <Mini label="SMOG" value={props.smogIndex} />
        <Mini label="Coleman–Liau" value={props.colemanLiau} />
        <Mini label="ARI" value={props.ari} />
        <Mini label="Dale–Chall" value={props.daleChall} />
        <Mini label="Ease" value={props.fleschReadingEase} mono={false} />
      </div>
    </div>
  );
}

function Mini({ label, value, mono = true }: { label: string; value: number; mono?: boolean }) {
  return (
    <div className="rounded-lg border border-slate-200/70 bg-white/60 px-2.5 py-1.5">
      <div className="text-[10px] font-medium uppercase tracking-wider text-slate-500">{label}</div>
      <div className={`text-sm font-semibold text-slate-800 ${mono ? "tabular-nums" : ""}`}>
        {value.toFixed(1)}
      </div>
    </div>
  );
}
