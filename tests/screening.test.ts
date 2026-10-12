import { describe, expect, it } from "vitest";
import { screenForCrisis } from "@/lib/screening";

describe("crisis keyword screening", () => {
  it("flags explicit English crisis language", () => {
    expect(screenForCrisis("I have been thinking about suicide")).toBe(true);
    expect(screenForCrisis("Sometimes I want to die")).toBe(true);
    expect(screenForCrisis("I want to hurt myself tonight")).toBe(true);
  });

  it("does not flag ordinary distress", () => {
    expect(screenForCrisis("I am overwhelmed by exams and can't sleep")).toBe(false);
  });
});
