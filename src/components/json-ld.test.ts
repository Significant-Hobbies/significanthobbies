import { describe, expect, it } from "vitest";

import { serializeJsonLd } from "./json-ld";

describe("serializeJsonLd", () => {
  it("escapes characters that can break out of a JSON-LD script tag", () => {
    const serialized = serializeJsonLd({
      headline: "</script><script>alert(1)</script>",
      description: "Fish & chips < tacos > pizza",
      note: "line separator\u2028paragraph\u2029end",
    });

    expect(serialized).not.toContain("</script>");
    expect(serialized).toContain("\\u003c/script\\u003e\\u003cscript\\u003ealert(1)\\u003c/script\\u003e");
    expect(serialized).toContain("Fish \\u0026 chips \\u003c tacos \\u003e pizza");
    expect(serialized).toContain("\\u2028");
    expect(serialized).toContain("\\u2029");
  });
});
