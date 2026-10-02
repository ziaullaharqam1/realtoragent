import type { ObjectStorageClient, PutObjectInput, StoredObjectRef } from "./types";

/**
 * In-memory storage for unit tests and local fallback when MinIO is unavailable.
 * Not for production.
 */
export class MemoryObjectStorageClient implements ObjectStorageClient {
  private readonly objects = new Map<string, { body: Buffer; contentType?: string }>();
  constructor(private readonly bucket = "proppilot") {}

  async ensureBucket(): Promise<void> {
    /* no-op */
  }

  async putObject(input: PutObjectInput): Promise<StoredObjectRef> {
    const body = typeof input.body === "string" ? Buffer.from(input.body) : Buffer.from(input.body);
    this.objects.set(input.key, { body, contentType: input.contentType });
    return { bucket: this.bucket, key: input.key, size: body.length };
  }

  async getObject(key: string): Promise<Buffer | null> {
    return this.objects.get(key)?.body ?? null;
  }

  async deleteObject(key: string): Promise<void> {
    this.objects.delete(key);
  }
}
