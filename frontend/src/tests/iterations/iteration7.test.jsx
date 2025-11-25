import { describe, it, expect } from "vitest";
import fs from "fs";
import path from "path";

describe("Iteration 7 - README discussion present", () => {
  it("top-level README.md is not empty", () => {
    const readmePath = path.resolve(__dirname, "../../../../README.md");
    const content = fs.readFileSync(readmePath, "utf-8");
    expect(content.trim().length).toBeGreaterThan(0);
  });
});
