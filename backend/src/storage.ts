import { constants, createReadStream } from "node:fs";
import { join } from "node:path";
import { access, link, lstat, readdir, rm, stat } from "node:fs/promises";
import { Inject, Injectable, Module } from "@nestjs/common";
import { API_CONFIG, type ApiConfig } from "./config.js";
import { SupabaseStorage, type ByteRange, type StoredEntry } from "./supabase-storage.js";

export const storageNamePattern = /^[0-9a-f]{8}(?:-[0-9a-f]{4}){3}-[0-9a-f]{12}\.(?:tmp|jpeg|png|webp|mp4|webm)$/;

@Injectable()
export class MediaStorage {
  private readonly cloud?: SupabaseStorage;

  constructor(@Inject(API_CONFIG) private readonly config: ApiConfig) {
    if (config.cloudStorage) this.cloud = new SupabaseStorage(config.cloudStorage);
  }

  file(key: string): string {
    if (!storageNamePattern.test(key)) throw new Error("Clave de almacenamiento inválida");
    return join(this.config.mediaRoot, key);
  }

  async size(key: string): Promise<number | null> {
    const filename = this.file(key);
    if (this.cloud) return this.cloud.size(key);
    const info = await lstat(filename).catch((error: NodeJS.ErrnoException) => {
      if (error.code === "ENOENT") return null;
      throw error;
    });
    return info?.isFile() ? info.size : null;
  }

  async read(key: string, size: number, range?: ByteRange) {
    const filename = this.file(key);
    if (this.cloud) return this.cloud.read(key, size, range);
    if (await this.size(key) !== size) return null;
    return createReadStream(filename, range);
  }

  async write(key: string, temporary: string, mime: string, size: number) {
    const filename = this.file(key);
    if (this.cloud) return this.cloud.write(key, temporary, mime, size);
    await link(temporary, filename);
  }

  async remove(key: string) {
    const filename = this.file(key);
    if (this.cloud) return this.cloud.remove(key);
    await rm(filename, { force: true });
  }

  async *entries(): AsyncGenerator<StoredEntry> {
    if (this.cloud) {
      yield* this.cloud.entries();
      return;
    }
    const listing = await readdir(this.config.mediaRoot, { withFileTypes: true });
    for (const entry of listing) {
      if (!entry.isFile() || !storageNamePattern.test(entry.name)) continue;
      const info = await lstat(this.file(entry.name));
      if (info.isFile()) yield { name: entry.name, updatedAt: info.mtimeMs, size: info.size };
    }
  }

  async isReady(): Promise<boolean> {
    const path = this.config.mediaRoot;
    if (!(await stat(path)).isDirectory()) return false;
    await access(path, constants.R_OK | constants.W_OK | constants.X_OK);
    return this.cloud ? this.cloud.isReady() : true;
  }
}

@Module({ providers: [MediaStorage], exports: [MediaStorage] })
export class StorageModule {}
