// Text analysis utilities: tokenization, syllable counting, readability metrics,
// CEFR estimation, and vocabulary statistics.

export type CEFRLevel = "A1" | "A2" | "B1" | "B2" | "C1" | "C2";

export interface TextStats {
  characters: number;
  charactersNoSpaces: number;
  words: number;
  uniqueWords: number;
  sentences: number;
  paragraphs: number;
  syllables: number;
  complexWords: number; // 3+ syllables
  longWords: number; // 6+ chars
  monosyllables: number;
  polysyllables: number; // 2+ syllables
  averageWordsPerSentence: number;
  averageSyllablesPerWord: number;
  averageCharactersPerWord: number;
  typeTokenRatio: number; // lexical diversity
  longestSentenceLength: number; // in words
  shortestSentenceLength: number;
  readingTimeMinutes: number;
  speakingTimeMinutes: number;
  fleschReadingEase: number;
  fleschKincaidGrade: number;
  gunningFog: number;
  smogIndex: number;
  colemanLiau: number;
  automatedReadabilityIndex: number;
  cefr: CEFRLevel;
  cefrScore: number; // 0–100
  cefrConfidence: number; // 0–1
  daleChall: number; // approximate
  topWords: { word: string; count: number }[];
  sentencesBreakdown: { sentence: string; words: number; syllables: number; isComplex: boolean }[];
}

// Common English function words (high-frequency). Used for Dale–Chall-like approximation.
const COMMON_WORDS = new Set<string>([
  "a","about","above","across","after","again","against","all","almost","also","am","an","and","any","are","as","at",
  "back","be","because","been","before","being","below","between","both","but","by",
  "can","could","did","do","does","doing","done","down","during","each","either","else","ever","every",
  "few","for","from","further",
  "get","go","goes","going","gone","got",
  "had","has","have","having","he","her","here","hers","herself","him","himself","his","how",
  "i","if","in","into","is","it","its","itself",
  "just","let","like","likely",
  "make","many","may","maybe","me","might","more","most","much","must","my","myself",
  "no","nor","not","now",
  "of","off","on","once","one","only","or","other","our","ours","ourselves","out","over","own",
  "people","per","perhaps",
  "quite",
  "rather","really",
  "said","same","say","says","see","seen","shall","she","should","since","so","some","someone","something","still","such",
  "than","that","the","their","theirs","them","themselves","then","there","these","they","thing","things","think","this","those","though","through","thus","to","too",
  "under","until","up","upon","us",
  "very",
  "was","we","well","were","what","when","where","whether","which","while","who","whom","why","will","with","within","without","would",
  "yes","yet","you","your","yours","yourself","yourselves"
]);

// Simple irregular plural/conjugation map so "ran", "running", "children" still count
// as common when we check Dale–Chall style familiarity.
const SIMPLE_UNINFLECT_MAP: Record<string, string> = {
  ran: "run", running: "run", runs: "run",
  went: "go", going: "go", goes: "go", gone: "go",
  ate: "eat", eating: "eat", eaten: "eat", eats: "eat",
  saw: "see", seen: "see", seeing: "see", sees: "see",
  was: "be", were: "be", been: "be", being: "be", am: "be", is: "be", are: "be",
  had: "have", has: "have", having: "have",
  did: "do", does: "do", done: "do", doing: "do",
  said: "say", says: "say", saying: "say",
  made: "make", making: "make", makes: "make",
  children: "child", men: "man", women: "woman", people: "person",
  better: "good", best: "good", worse: "bad", worst: "bad",
  mice: "mouse",
  feet: "foot", teeth: "tooth", geese: "goose",
};

function uninflect(word: string): string {
  const lower = word.toLowerCase();
  if (COMMON_WORDS.has(lower)) return lower;
  if (SIMPLE_UNINFLECT_MAP[lower]) return SIMPLE_UNINFLECT_MAP[lower];
  // crude suffix stripping
  if (lower.endsWith("ies") && lower.length > 4) return lower.slice(0, -3) + "y";
  if (lower.endsWith("es") && lower.length > 3) return lower.slice(0, -2);
  if (lower.endsWith("s") && !lower.endsWith("ss") && lower.length > 3) return lower.slice(0, -1);
  if (lower.endsWith("ed") && lower.length > 3) return lower.slice(0, -2);
  if (lower.endsWith("ing") && lower.length > 4) return lower.slice(0, -3);
  return lower;
}

// Syllable counter based on heuristic vowel-group counting with adjustments.
export function countSyllables(word: string): number {
  if (!word) return 0;
  let w = word.toLowerCase().replace(/[^a-z]/g, "");
  if (!w) return 0;
  if (w.length <= 3) return 1;

  // Common silent endings.
  let silent = false;
  if (w.endsWith("e") && !w.endsWith("le") && w.length > 3) {
    w = w.slice(0, -1);
    silent = true;
  }
  if (w.endsWith("es") || w.endsWith("ed")) {
    // usually silent
    if (w.length > 3) {
      w = w.slice(0, -2);
    }
  }

  // Count contiguous vowel groups.
  const matches = w.match(/[aeiouy]+/g);
  let count = matches ? matches.length : 0;
  if (count === 0) count = 1;
  if (silent) count = Math.max(1, count - 0); // already removed e
  return Math.max(1, count);
}

function tokenizeWords(text: string): string[] {
  // Words include contractions and hyphenated forms.
  const matches = text.match(/[A-Za-z][A-Za-z'\-]*/g);
  return matches ? matches : [];
}

function tokenizeSentences(text: string): string[] {
  // Split on sentence-ending punctuation. Keep non-empty.
  const cleaned = text.replace(/\s+/g, " ").trim();
  if (!cleaned) return [];
  const parts = cleaned.split(/(?<=[.!?…])\s+/);
  // Filter out non-sentence fragments (no letters).
  return parts.filter((p) => /[A-Za-z]/.test(p));
}

function tokenizeParagraphs(text: string): string[] {
  return text.split(/\n\s*\n+/).map((p) => p.trim()).filter(Boolean);
}

function safeDiv(a: number, b: number): number {
  return b === 0 ? 0 : a / b;
}

function round(n: number, digits = 1): number {
  const f = Math.pow(10, digits);
  return Math.round(n * f) / f;
}

// CEFR estimation using a weighted composite of readability signals.
// Returns a level, a 0–100 score, and a confidence value.
function estimateCEFR(
  asl: number,        // avg words/sentence
  asw: number,        // avg syllables/word
  pctComplex: number, // % of complex (3+ syllable) words
  pctLong: number,    // % of long (6+ char) words
  ttr: number,        // type-token ratio
  pctFamiliar: number // % of common/familiar words
): { level: CEFRLevel; score: number; confidence: number } {
  // Build a composite difficulty score.
  // Components normalized roughly to 0–1.
  const cASL = Math.min(1, asl / 25);            // 25+ w/s => very hard
  const cASW = Math.min(1, (asw - 1) / 1.2);     // 1.0 = easy, 2.2 = very hard
  const cComplex = Math.min(1, pctComplex / 25); // 25%+ complex => very hard
  const cLong = Math.min(1, pctLong / 30);       // 30%+ long words => very hard
  const cTTR = Math.min(1, Math.max(0, (ttr - 0.35) / 0.4)); // > 0.75 = very diverse
  const cFam = Math.max(0, Math.min(1, (pctFamiliar - 50) / 40)); // < 10% => very hard

  const difficulty =
    0.28 * cASL +
    0.22 * cASW +
    0.18 * cComplex +
    0.12 * cLong +
    0.10 * cTTR +
    0.10 * cFam;

  // Convert difficulty to score (0 easiest, 100 hardest).
  const score = Math.round(difficulty * 100);

  // Map score to CEFR.
  let level: CEFRLevel;
  if (score < 18) level = "A1";
  else if (score < 35) level = "A2";
  else if (score < 52) level = "B1";
  else if (score < 68) level = "B2";
  else if (score < 84) level = "C1";
  else level = "C2";

  // Confidence: how cleanly the composite sits in the band (not near a boundary).
  // Boundaries: 18, 35, 52, 68, 84.
  const boundaries = [18, 35, 52, 68, 84];
  let minDist = Infinity;
  for (const b of boundaries) minDist = Math.min(minDist, Math.abs(score - b));
  const confidence = Math.max(0, Math.min(1, 1 - minDist / 12));

  return { level, score, confidence };
}

export function analyzeText(rawText: string): TextStats | null {
  const text = rawText || "";
  if (!text.trim()) return null;

  const characters = text.length;
  const charactersNoSpaces = text.replace(/\s/g, "").length;

  const words = tokenizeWords(text);
  const wordCount = words.length;

  const sentences = tokenizeSentences(text);
  const sentenceCount = sentences.length;

  const paragraphs = tokenizeParagraphs(text);
  const paragraphCount = paragraphs.length;

  let totalSyllables = 0;
  let complexWords = 0;
  let longWords = 0;
  let monosyllables = 0;
  let polysyllables = 0;
  let familiarWords = 0;

  const wordFreq = new Map<string, number>();
  for (const w of words) {
    const lower = w.toLowerCase();
    wordFreq.set(lower, (wordFreq.get(lower) || 0) + 1);

    const syl = countSyllables(w);
    totalSyllables += syl;
    if (syl >= 3) complexWords++;
    if (syl >= 2) polysyllables++;
    else monosyllables++;
    if (w.replace(/[^A-Za-z]/g, "").length >= 6) longWords++;
    const base = uninflect(w);
    if (COMMON_WORDS.has(base)) familiarWords++;
  }

  const uniqueWords = wordFreq.size;
  const typeTokenRatio = safeDiv(uniqueWords, wordCount);

  const averageWordsPerSentence = safeDiv(wordCount, sentenceCount);
  const averageSyllablesPerWord = safeDiv(totalSyllables, wordCount);
  const averageCharactersPerWord = safeDiv(charactersNoSpaces, wordCount);

  const pctComplex = wordCount ? (complexWords / wordCount) * 100 : 0;
  const pctLong = wordCount ? (longWords / wordCount) * 100 : 0;
  const pctFamiliar = wordCount ? (familiarWords / wordCount) * 100 : 0;

  // Flesch Reading Ease: 206.835 - 1.015*(W/S) - 84.6*(Syl/W)
  const fleschReadingEase =
    206.835 - 1.015 * averageWordsPerSentence - 84.6 * averageSyllablesPerWord;
  // Flesch-Kincaid Grade Level
  const fleschKincaidGrade =
    0.39 * averageWordsPerSentence + 11.8 * averageSyllablesPerWord - 15.59;
  // Gunning Fog
  const gunningFog = 0.4 * (averageWordsPerSentence + 100 * safeDiv(complexWords, wordCount));
  // SMOG (uses 30-sentence window; approximation using overall counts)
  const smogIndex =
    sentenceCount >= 3
      ? 1.043 * Math.sqrt(complexWords * safeDiv(30, sentenceCount)) + 3.1291
      : fleschKincaidGrade; // fallback for very short text

  // Coleman-Liau
  const L = safeDiv(charactersNoSpaces, wordCount) * 100; // letters per 100 words
  const S = safeDiv(sentenceCount, wordCount) * 100;      // sentences per 100 words
  const colemanLiau = 0.0588 * L - 0.296 * S - 15.8;

  // Automated Readability Index
  const ari =
    4.71 * safeDiv(charactersNoSpaces, wordCount) +
    0.5 * averageWordsPerSentence -
    21.43;

  // Dale–Chall-like approximation: 0.1579*(unfamiliar%) + 0.0496*ASL
  // Adjust for short texts.
  const unfamiliarPct = Math.max(0, 100 - pctFamiliar);
  const daleChall = 0.1579 * unfamiliarPct + 0.0496 * averageWordsPerSentence;
  const daleChallAdjusted = wordCount < 100 ? daleChall + 3.635 : daleChall;

  // Per-sentence breakdown
  const sentencesBreakdown = sentences.map((s) => {
    const sw = tokenizeWords(s);
    let syl = 0;
    for (const w of sw) syl += countSyllables(w);
    return {
      sentence: s,
      words: sw.length,
      syllables: syl,
      isComplex: sw.length > 20 || syl / Math.max(1, sw.length) > 1.8,
    };
  });

  const sentenceLengths = sentencesBreakdown.map((s) => s.words);
  const longestSentenceLength = sentenceLengths.length ? Math.max(...sentenceLengths) : 0;
  const shortestSentenceLength = sentenceLengths.length ? Math.min(...sentenceLengths) : 0;

  // CEFR
  const { level, score, confidence } = estimateCEFR(
    averageWordsPerSentence,
    averageSyllablesPerWord,
    pctComplex,
    pctLong,
    typeTokenRatio,
    pctFamiliar
  );

  // Top words (alphabetical sorting by frequency, then word)
  const topWords = [...wordFreq.entries()]
    .filter(([w]) => w.length > 1) // ignore single letters
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, 12)
    .map(([word, count]) => ({ word, count }));

  // Reading time: ~225 wpm
  const readingTimeMinutes = wordCount / 225;
  // Speaking time: ~150 wpm
  const speakingTimeMinutes = wordCount / 150;

  return {
    characters,
    charactersNoSpaces,
    words: wordCount,
    uniqueWords,
    sentences: sentenceCount,
    paragraphs: paragraphCount,
    syllables: totalSyllables,
    complexWords,
    longWords,
    monosyllables,
    polysyllables,
    averageWordsPerSentence,
    averageSyllablesPerWord,
    averageCharactersPerWord,
    typeTokenRatio,
    longestSentenceLength,
    shortestSentenceLength,
    readingTimeMinutes,
    speakingTimeMinutes,
    fleschReadingEase: round(fleschReadingEase, 1),
    fleschKincaidGrade: round(fleschKincaidGrade, 1),
    gunningFog: round(gunningFog, 1),
    smogIndex: round(smogIndex, 1),
    colemanLiau: round(colemanLiau, 1),
    automatedReadabilityIndex: round(ari, 1),
    cefr: level,
    cefrScore: score,
    cefrConfidence: round(confidence, 2),
    daleChall: round(daleChallAdjusted, 1),
    topWords,
    sentencesBreakdown,
  };
}

export const SAMPLE_TEXTS: { label: string; text: string }[] = [
  {
    label: "Simple (A1–A2)",
    text: `Cats are small animals. Many people like cats. Cats have soft fur and sharp claws. They like to sleep in the sun. Some cats like to play with string. Cats drink water and eat fish. They are good friends for people.`,
  },
  {
    label: "Intermediate (B1–B2)",
    text: `Reading is one of the most valuable habits a person can develop. It improves vocabulary, sharpens focus, and exposes us to ideas we would never encounter in everyday conversation. A good book can change the way you think about the world, and it can introduce you to people whose lives are nothing like your own. In an age of short messages and quick notifications, sitting down with a novel requires a kind of patience that feels almost old-fashioned — and that is exactly what makes it rewarding.`,
  },
  {
    label: "Advanced (C1–C2)",
    text: `The epistemological foundations of scientific realism have been contested throughout the twentieth century, and contemporary debates continue to interrogate the relationship between theoretical entities and observable phenomena. Anti-realists argue that the success of a theory does not guarantee the existence of its posited entities, while realists counter that the best explanation for the predictive and technological efficacy of mature sciences is the approximate truth of their central claims. This dialectic, far from being merely academic, has practical consequences for how we allocate research funding, design experiments, and interpret anomalies. A philosophically informed methodology, attentive to the underdetermination of theory by data, can help researchers distinguish productive puzzles from mere artifacts of instrumentation.`,
  },
];
