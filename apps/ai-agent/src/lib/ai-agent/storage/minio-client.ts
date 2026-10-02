import * as Minio from "minio";
import type { ObjectStorageClient, PutObjectInput, StoredObjectRef } from "./types";

export type MinioConfig = {
  endPoint: string;
  port: number;
  useSSL: boolean;
  accessKey: string;
  secretKey: string;
  bucket: string;
  region?: string;
};

export class MinioObjectStorageClient implements ObjectStorageClient {
  private readonly client: Minio.Client;
  private readonly bucket: string;

  constructor(private readonly config: MinioConfig) {
    this.client = new Minio.Client({
      endPoint: config.endPoint,
      port: config.port,
      useSSL: config.useSSL,
      accessKey: config.accessKey,
      secretKey: config.secretKey,
      region: config.region,
    });
    this.bucket = config.bucket;
  }

  async ensureBucket(): Promise<void> {
    const exists = await this.client.bucketExists(this.bucket);
    if (!exists) {
      await this.client.makeBucket(this.bucket, this.config.region ?? "us-east-1");
    }
  }

  async putObject(input: PutObjectInput): Promise<StoredObjectRef> {
    const body = typeof input.body === "string" ? Buffer.from(input.body) : Buffer.from(input.body);
    const result = await this.client.putObject(
      this.bucket,
      input.key,
      body,
      body.length,
      {
        "Content-Type": input.contentType ?? "application/octet-stream",
        ...(input.metadata ?? {}),
      },
    );
    return { bucket: this.bucket, key: input.key, etag: result.etag, size: body.length };
  }

  async getObject(key: string): Promise<Buffer | null> {
    try {
      const stream = await this.client.getObject(this.bucket, key);
      const chunks: Buffer[] = [];
      for await (const chunk of stream) {
        chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
      }
      return Buffer.concat(chunks);
    } catch {
      return null;
    }
  }

  async deleteObject(key: string): Promise<void> {
    await this.client.removeObject(this.bucket, key);
  }
}

export function createMinioClientFromEnv(): MinioObjectStorageClient {
  const endpoint = process.env.OBJECT_STORAGE_ENDPOINT ?? "http://127.0.0.1:19000";
  const url = new URL(endpoint);
  return new MinioObjectStorageClient({
    endPoint: url.hostname,
    port: url.port ? Number(url.port) : url.protocol === "https:" ? 443 : 80,
    useSSL: url.protocol === "https:",
    accessKey: process.env.OBJECT_STORAGE_ACCESS_KEY ?? "minioadmin",
    secretKey: process.env.OBJECT_STORAGE_SECRET_KEY ?? "minioadmin",
    bucket: process.env.OBJECT_STORAGE_BUCKET ?? "proppilot",
    region: process.env.OBJECT_STORAGE_REGION ?? "us-east-1",
  });
}
