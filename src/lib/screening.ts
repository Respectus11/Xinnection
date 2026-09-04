// Crisis keyword screening.
//
// IMPORTANT: these lists are a starting point and are explicitly flagged for
// native-speaker review (docs/translation-review.md). Machine-assisted
// translations of crisis language carry real risk of both false negatives and
// false positives, so they must be tuned with human review — not shipped as
// "done". The seeker-selected crisis category is the primary signal; keyword
// screening is a safety net that also runs on every later seeker message.

const CRISIS_KEYWORDS: Record<string, string[]> = {
  en: [
    "suicide", "suicidal", "kill myself", "killing myself", "end my life",
    "ending my life", "want to die", "wanting to die", "better off dead",
    "hurt myself", "hurting myself", "harm myself", "self harm", "self-harm",
    "no reason to live", "don't want to be here", "overdose", "cut myself",
    "end it all",
  ],
  // Amharic — REVIEW REQUIRED by a native speaker before launch.
  am: ["ራሴን ማጥፋት", "መሞት እፈልጋለሁ", "ራሴን ላጥፋ", "ህይወቴን ማብቃት", "ራስን መጉማት"],
  // Afaan Oromoo — REVIEW REQUIRED by a native speaker before launch.
  om: ["of ajjeesuu", "of ajjeesu", "du'uu nan barbaada", "du'aa nan barbaada", "ofii nan mure"],
  // Tigrinya — REVIEW REQUIRED by a native speaker before launch.
  ti: ["ራስየይ ምቕታል", "ንዓየ ክገድፍ እደይ", "ነብሰይ ክኣክል"],
};

// English is always screened (it is the source list); the thread's declared
// language list is screened in addition.
export function screenForCrisis(content: string, language: string): boolean {
  const text = content.toLowerCase();
  const lists = [CRISIS_KEYWORDS.en, CRISIS_KEYWORDS[language] ?? []];
  return lists.some((list) => list.some((kw) => text.includes(kw.toLowerCase())));
}
