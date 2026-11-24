import { constants } from "node:fs";
import { access, stat } from "node:fs/promises";
import { Inject, Injectable, Module } from "@nestjs/common";
import { API_CONFIG, type ApiConfig } from "./config.js";

@Injectable()
export class MediaStorage {
  constructor(@Inject(API_CONFIG) private readonly config: ApiConfig) {}

  async isReady(): Promise<boolean> {
    const path = this.config.mediaRoot;
    if (!(await stat(path)).isDirectory()) return false;
    await access(path, constants.R_OK | constants.W_OK | constants.X_OK);
    return true;
  }
}

@Module({ providers: [MediaStorage], exports: [MediaStorage] })
export class StorageModule {}
