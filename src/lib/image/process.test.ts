import { describe, expect, it } from "vitest";
import { defaultProcessSettings, suggestedDownloadName } from "./process";

describe("suggestedDownloadName", () => {
  it("replaces the extension for the chosen output format", () => {
    expect(suggestedDownloadName("Holiday Photo.PNG", "jpeg")).toBe("Holiday Photo-fitkb.jpg");
    expect(suggestedDownloadName("shot", "webp")).toBe("shot-fitkb.webp");
  });
});

describe("defaultProcessSettings", () => {
  it("starts in target-size mode", () => {
    expect(defaultProcessSettings("jpeg").mode).toBe("targetKb");
    expect(defaultProcessSettings("png").outputFormat).toBe("png");
  });
});
