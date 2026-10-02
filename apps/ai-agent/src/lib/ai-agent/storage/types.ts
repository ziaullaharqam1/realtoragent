export type PutObjectInput = {
  key: string;
  body: Buffer | Uint8Array | string;
  contentType?: string;
  metadata?: Record<string, string>;
};

export type StoredObjectRef = {
  bucket: string;
  key: string;
  etag?: string;
  size?: number;
};

export interface ObjectStorageClient {
  ensureBucket(): Promise<void>;
  putObject(input: PutObjectInput): Promise<StoredObjectRef>;
  getObject(key: string): Promise<Buffer | null>;
  deleteObject(key: string): Promise<void>;
}
