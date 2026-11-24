import {
  Controller, Get, Header, Module, ServiceUnavailableException,
} from "@nestjs/common";
import { ApiOkResponse, ApiProperty, ApiServiceUnavailableResponse, ApiTags } from "@nestjs/swagger";
import { DatabaseModule, DatabaseService } from "./database.js";
import { ApiError } from "./http.js";
import { MediaStorage, StorageModule } from "./storage.js";

class LiveStatus {
  @ApiProperty({ enum: ["live"] })
  status!: "live";
}

class ReadyStatus {
  @ApiProperty({ enum: ["ready"] })
  status!: "ready";
}

@ApiTags("health")
@Controller("health")
export class HealthController {
  constructor(
    private readonly database: DatabaseService,
    private readonly storage: MediaStorage,
  ) {}

  @Get("live")
  @Header("Cache-Control", "no-store")
  @ApiOkResponse({ type: LiveStatus })
  live(): LiveStatus {
    return { status: "live" };
  }

  @Get("ready")
  @Header("Cache-Control", "no-store")
  @ApiOkResponse({ type: ReadyStatus })
  @ApiServiceUnavailableResponse({ type: ApiError })
  async ready(): Promise<ReadyStatus> {
    const probes = await Promise.allSettled([this.database.isReady(), this.storage.isReady()]);
    if (probes.some((probe) => probe.status === "rejected" || !probe.value)) {
      throw new ServiceUnavailableException();
    }
    return { status: "ready" };
  }
}

@Module({ imports: [DatabaseModule, StorageModule], controllers: [HealthController] })
export class HealthModule {}
