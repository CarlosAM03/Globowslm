import { constants } from "node:fs";
import { join } from "node:path";
import { access, stat } from "node:fs/promises";
import { Inject, Injectable, Module } from "@nestjs/common";
import { API_CONFIG, type ApiConfig } from "./config.js";

export const storageNamePattern = /^[0-9a-f]{8}(?:-[0-9a-f]{4}){3}-[0-9a-f]{12}\.(?:tmp|jpeg|png|webp|mp4|webm)$/;

@Injectable()
export class MediaStorage {
  constructor(@Inject(API_CONFIG) private readonly config: ApiConfig) {}

  file(key: string): string {
    if (!storageNamePattern.test(key)) throw new Error("Clave de almacenamiento inválida");
    return join(this.config.mediaRoot, key);
  }

  async isReady(): Promise<boolean> {
    const path = this.config.mediaRoot;
    if (!(await stat(path)).isDirectory()) return false;
    await access(path, constants.R_OK | constants.W_OK | constants.X_OK);
    return true;
  }
}

@Module({ providers: [MediaStorage], exports: [MediaStorage] })
export class StorageModule {}
