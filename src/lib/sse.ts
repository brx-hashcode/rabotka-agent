export type SseEvent = { event: string; data: string };

/**
 * Incremental parser for a `text/event-stream` body: feed it decoded chunks as
 * they arrive, get back the complete events. Only `event` and `data` are read
 * (the backend sends nothing else worth keeping); comments and unknown fields
 * are ignored, as the spec says.
 */
export function createSseParser() {
  let buffer = "";

  return (chunk: string): SseEvent[] => {
    buffer += chunk.replace(/\r\n?/g, "\n");
    const events: SseEvent[] = [];
    let end = buffer.indexOf("\n\n");
    while (end !== -1) {
      const block = buffer.slice(0, end);
      buffer = buffer.slice(end + 2);
      end = buffer.indexOf("\n\n");

      let event = "message";
      const data: string[] = [];
      for (const line of block.split("\n")) {
        if (line === "" || line.startsWith(":")) continue;
        const colon = line.indexOf(":");
        const field = colon === -1 ? line : line.slice(0, colon);
        let value = colon === -1 ? "" : line.slice(colon + 1);
        if (value.startsWith(" ")) value = value.slice(1);
        if (field === "event") event = value;
        else if (field === "data") data.push(value);
      }
      if (data.length > 0) events.push({ event, data: data.join("\n") });
    }
    return events;
  };
}
