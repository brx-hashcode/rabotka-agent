import { describe, expect, it } from "vitest";

import { createSseParser } from "./sse";

describe("createSseParser", () => {
  it("returns events as they complete, across chunk boundaries", () => {
    const parse = createSseParser();
    expect(parse('event: notification\nid: 1\ndata: {"a"')).toEqual([]);
    expect(parse(":1}\n\nevent: ping\ndata: \n\n")).toEqual([
      { event: "notification", data: '{"a":1}' },
      { event: "ping", data: "" },
    ]);
  });

  it("joins multi-line data and defaults the event name", () => {
    const parse = createSseParser();
    expect(parse("data: one\ndata: two\n\n")).toEqual([{ event: "message", data: "one\ntwo" }]);
  });

  it("handles CRLF and ignores comments", () => {
    const parse = createSseParser();
    expect(parse(": keep-alive\r\n\r\nevent: x\r\ndata: y\r\n\r\n")).toEqual([
      { event: "x", data: "y" },
    ]);
  });
});
