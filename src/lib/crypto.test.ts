import { describe, expect, it } from "vitest";
import { checksum } from "./crypto";

describe("checksum", () => { it("is deterministic and changes when content changes", () => { expect(checksum("body\n#tag")).toBe(checksum("body\n#tag")); expect(checksum("body\n#tag")).not.toBe(checksum("changed\n#tag")); }); });
