import { describe, expect, it } from "vitest";
import { canonicalizeUrl, getDomain, getFaviconUrl, getInitials, isHttpUrl, slugify } from "@/lib/utils";

describe("URL and label helpers", () => {
  it("canonicalizes HTTP URLs and removes fragments and a root slash", () => {
    expect(canonicalizeUrl(" HTTPS://Example.COM/ ")).toBe("https://example.com");
    expect(canonicalizeUrl("https://example.com/docs/#intro")).toBe("https://example.com/docs");
  });

  it("rejects non-HTTP protocols and malformed values", () => {
    expect(isHttpUrl("javascript:alert(1)")).toBe(false);
    expect(isHttpUrl("not a url")).toBe(false);
    expect(getDomain("https://www.example.com/path")).toBe("example.com");
  });

  it("derives a favicon and a neutral fallback label", () => {
    expect(getFaviconUrl("https://example.com/docs")).toBe("https://example.com/favicon.ico");
    expect(getFaviconUrl("bad")).toBeNull();
    expect(getInitials("Hugging Face")).toBe("HF");
    expect(getInitials("拾页")).toBe("拾页");
  });

  it("creates safe slugs", () => {
    expect(slugify("  AI & Tools  ")).toBe("ai-tools");
  });
});
