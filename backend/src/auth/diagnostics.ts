import { Controller, Get, Header, Module } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { DatabaseModule, DatabaseService } from "../database.js";
import { MediaStorage, StorageModule } from "../storage.js";
import { AdminOnly } from "./access.js";

@ApiTags("admin")
@ApiBearerAuth("ownerSession")
@AdminOnly()
@Controller("admin/diagnostics")
class DiagnosticsController {
  constructor(private readonly db: DatabaseService, private readonly storage: MediaStorage) {}

  @Get()
  @Header("Cache-Control", "no-store")
  @ApiOperation({ summary: "Diagnóstico sanitizado y auditoría reciente para ADMIN." })
  async read() {
    const [database, storage, audit] = await Promise.allSettled([
      this.db.isReady(),
      this.storage.isReady(),
      this.db.auditEvent.findMany({
        select: { actorId: true, action: true, entityType: true, requestId: true, at: true, outcome: true },
        orderBy: [{ at: "desc" }, { id: "desc" }],
        take: 25,
      }),
    ]);
    return {
      database: database.status === "fulfilled" && database.value ? "ok" : "unavailable",
      storage: storage.status === "fulfilled" && storage.value ? "ok" : "unavailable",
      audit: audit.status === "fulfilled" ? audit.value : null,
    };
  }
}

@Module({ imports: [DatabaseModule, StorageModule], controllers: [DiagnosticsController] })
export class DiagnosticsModule {}
