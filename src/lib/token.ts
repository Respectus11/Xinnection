import crypto from "node:crypto";

// Memorable-but-strong anonymous codes, e.g. "cloud-river-stone-42-k7q".
//
// Entropy (see docs/security-notes.md): 3 words from a 160-word list
// (~21.9 bits) + 2 digits (6.6 bits) + 3 characters from a 30-character
// unambiguous alphabet (~14.7 bits) = ~43 bits. Lookup attempts are rate
// limited (lib/rateLimit.ts), which keeps brute-force cost far out of reach
// for the threat model of a deletable anonymous thread.

const WORDS = [
  "cloud", "river", "stone", "dawn", "ember", "harbor", "willow", "cedar", "maple", "birch",
  "frost", "mist", "meadow", "brook", "thunder", "rain", "storm", "snow", "breeze", "summit",
  "valley", "canyon", "prairie", "ocean", "island", "dune", "delta", "spring", "autumn", "winter",
  "summer", "sunrise", "sunset", "moon", "star", "twilight", "horizon", "mountain", "forest", "desert",
  "glacier", "volcano", "sparrow", "heron", "falcon", "robin", "wren", "finch", "owl", "eagle",
  "swift", "swallow", "lark", "dove", "crane", "stork", "tern", "gull", "puffin", "otter",
  "beaver", "badger", "fox", "wolf", "bear", "deer", "moose", "hare", "rabbit", "squirrel",
  "hedgehog", "lynx", "panther", "jaguar", "tiger", "lion", "zebra", "giraffe", "elephant", "rhino",
  "hippo", "buffalo", "antelope", "gazelle", "impala", "kudu", "oryx", "springbok", "meerkat", "mongoose",
  "civet", "genet", "serval", "caracal", "ocelot", "margay", "capybara", "tapir", "llama", "alpaca",
  "vicuna", "guanaco", "camel", "donkey", "mule", "pony", "stallion", "mare", "foal", "lamb",
  "ewe", "ram", "goat", "pig", "boar", "rooster", "hen", "duck", "goose", "swan",
  "turkey", "quail", "pheasant", "partridge", "grouse", "curlew", "godwit", "avocet", "stilt", "plover",
  "sandpiper", "dunlin", "sanderling", "turnstone", "oystercatcher", "petrel", "shearwater", "albatross", "skua", "murre",
  "dipper", "thrush", "blackbird", "warbler", "wagtail", "pipit", "linnet", "serin", "siskin", "redpoll",
];

// No i / l / o / 0 / 1 — nothing that gets misread from a handwritten note.
const CODE_ALPHABET = "abcdefghjkmnpqrstvwxyz23456789".split("");

function securePick<T>(items: readonly T[]): T {
  return items[crypto.randomInt(0, items.length)];
}

export function generateSeekerCode(): string {
  const word = () => securePick(WORDS);
  const digits = String(crypto.randomInt(0, 100)).padStart(2, "0");
  const suffix = Array.from({ length: 3 }, () => securePick(CODE_ALPHABET)).join("");
  return `${word()}-${word()}-${word()}-${digits}-${suffix}`;
}
