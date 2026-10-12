// Crisis keyword screening safety net.
//
// The seeker-selected crisis category is the primary signal; keyword screening
// acts as a fallback safety net that evaluates the initial reflection and every
// subsequent seeker message for explicit crisis language.


const CRISIS_KEYWORDS = [
  "suicide", "suicidal", "kill myself", "killing myself", "end my life",
  "ending my life", "want to die", "wanting to die", "better off dead",
  "hurt myself", "hurting myself", "harm myself", "self harm", "self-harm",
  "no reason to live", "don't want to be here", "overdose", "cut myself",
  "end it all",
];

export function screenForCrisis(content: string): boolean {
  const text = content.toLowerCase();
  return CRISIS_KEYWORDS.some((kw) => text.includes(kw));
}

