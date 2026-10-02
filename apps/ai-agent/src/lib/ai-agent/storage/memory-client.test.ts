import { describe, expect, it } from "vitest";
import { MemoryObjectStorageClient } from "@/lib/ai-agent/storage/memory-client";

describe("MemoryObjectStorageClient", () => {
  it("puts and gets objects", async () => {
    const store = new MemoryObjectStorageClient();
    await store.ensureBucket();
    const ref = await store.putObject({
      key: "demos/hello.txt",
      body: "hello propilot",
      contentType: "text/plain",
    });
    expect(ref.key).toBe("demos/hello.txt");
    const got = await store.getObject("demos/hello.txt");
    expect(got?.toString("utf8")).toBe("hello propilot");
    await store.deleteObject("demos/hello.txt");
    expect(await store.getObject("demos/hello.txt")).toBeNull();
  });
});
