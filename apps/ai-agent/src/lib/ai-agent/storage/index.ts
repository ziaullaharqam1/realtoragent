import { createMinioClientFromEnv } from "./minio-client";
import { MemoryObjectStorageClient } from "./memory-client";
import type { ObjectStorageClient } from "./types";

/**
 * Production on Vercel: prefer Vercel Blob / R2 / Supabase storage via env.
 * Local: MinIO (S3-compatible, non-AWS). Never targets AWS S3 as deploy platform.
 */
export function createObjectStorageClient(): ObjectStorageClient {
  const provider = (process.env.OBJECT_STORAGE_PROVIDER ?? "minio").toLowerCase();
  if (provider === "memory") {
    return new MemoryObjectStorageClient();
  }
  if (provider === "vercel-blob") {
    // Placeholder until BLOB_READ_WRITE_TOKEN is wired in a later milestone slice.
    // Keeps compile-time boundary without pulling AWS SDKs.
    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      throw new Error(
        "OBJECT_STORAGE_PROVIDER=vercel-blob requires BLOB_READ_WRITE_TOKEN (Vercel Blob)",
      );
    }
    throw new Error(
      "Vercel Blob adapter is configured via env but not fully wired in M1; use minio locally or memory in tests",
    );
  }
  return createMinioClientFromEnv();
}
