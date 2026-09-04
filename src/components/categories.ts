// Category definitions shared between the seeker landing pills, the queue
// filters, and the database seed. Labels live in messages/*.json under
// "categories".<key>.
export type CategoryDef = { slug: string; key: string; crisis?: boolean };

export const CATEGORY_DEFS: readonly CategoryDef[] = [
  { slug: "anxiety", key: "anxiety" },
  { slug: "grief", key: "grief" },
  { slug: "relationships", key: "relationships" },
  { slug: "academic-stress", key: "academicStress" },
  { slug: "family", key: "family" },
  { slug: "work", key: "work" },
  { slug: "crisis-self-harm", key: "crisisSelfHarm", crisis: true },
  { slug: "other", key: "other" },
];

export function categoryKey(slug: string): string {
  return CATEGORY_DEFS.find((c) => c.slug === slug)?.key ?? "other";
}

export function isCrisisCategory(slug: string): boolean {
  return CATEGORY_DEFS.find((c) => c.slug === slug)?.crisis === true;
}
