import { describe, expect, it } from "vitest";
import { screenForCrisis } from "@/lib/screening";

describe("crisis keyword screening", () => {
  it("flags explicit English crisis language", () => {
    expect(screenForCrisis("I have been thinking about suicide", "en")).toBe(true);
    expect(screenForCrisis("Sometimes I want to die", "en")).toBe(true);
    expect(screenForCrisis("I want to hurt myself tonight", "en")).toBe(true);
  });

  it("flags crisis language written in the thread language", () => {
    expect(screenForCrisis("ራሴን ማጥፋት እፈልጋለሁ", "am")).toBe(true);
    expect(screenForCrisis("of ajjeesuu yaadachaa jira", "om")).toBe(true);
  });

  it("does not flag ordinary distress", () => {
    expect(screenForCrisis("I am overwhelmed by exams and can't sleep", "en")).toBe(false);
    expect(screenForCrisis("ጭንቀት በጣም አለብኝ", "am")).toBe(false);
  });

  it("flags non-English crisis language even on an English-declared thread", () => {
    expect(screenForCrisis("ራሴን ማጥፋት እፈልጋለሁ", "en")).toBe(true);
    expect(screenForCrisis("of ajjeesuu yaadachaa jira", "en")).toBe(true);
    expect(screenForCrisis("ራስየይ ምቕታል", "en")).toBe(true);
  });
});
