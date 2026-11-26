import { Controller, Get, Header, Injectable, Module, Req } from "@nestjs/common";
import { ApiBearerAuth, ApiOkResponse, ApiProperty, ApiTags } from "@nestjs/swagger";
import type { OwnerRequest } from "./auth/access.js";
import { DatabaseModule, DatabaseService } from "./database.js";
import { ContentKind } from "./generated/prisma/client.js";

class Totals {
  @ApiProperty()
  draft!: number;

  @ApiProperty()
  published!: number;

  @ApiProperty()
  withdrawn!: number;
}

class KindTotals extends Totals {
  @ApiProperty({ enum: ContentKind })
  kind!: ContentKind;
}

class Activity {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  action!: string;

  @ApiProperty()
  entityType!: string;

  @ApiProperty()
  entityId!: string;

  @ApiProperty()
  at!: string;
}

class DashboardResponse {
  @ApiProperty({ type: Totals })
  totals!: Totals;

  @ApiProperty({ type: [KindTotals] })
  byKind!: KindTotals[];

  @ApiProperty({ type: [Activity] })
  recent!: Activity[];
}

@Injectable()
class DashboardService {
  constructor(private readonly db: DatabaseService) {}

  async read(ownerId: string): Promise<DashboardResponse> {
    const [byKind, activity] = await Promise.all([
      this.db.$queryRaw<KindTotals[]>`
        SELECT "kind"::text AS "kind",
          COUNT(*) FILTER (WHERE "publishedRevisionId" IS NULL AND "archivedAt" IS NULL AND "withdrawnAt" IS NULL)::int AS "draft",
          COUNT(*) FILTER (WHERE "publishedRevisionId" IS NOT NULL)::int AS "published",
          COUNT(*) FILTER (WHERE "publishedRevisionId" IS NULL AND ("archivedAt" IS NOT NULL OR "withdrawnAt" IS NOT NULL))::int AS "withdrawn"
        FROM "content_entries" GROUP BY "kind" ORDER BY "kind"
      `,
      this.db.auditEvent.findMany({
        where: { actorId: ownerId },
        select: { id: true, action: true, entityType: true, entityId: true, at: true },
        orderBy: [{ at: "desc" }, { id: "desc" }],
        take: 8,
      }),
    ]);
    const totals = byKind.reduce((total, row) => ({
      draft: total.draft + row.draft,
      published: total.published + row.published,
      withdrawn: total.withdrawn + row.withdrawn,
    }), { draft: 0, published: 0, withdrawn: 0 });

    return { totals, byKind, recent: activity.map((event) => ({ ...event, at: event.at.toISOString() })) };
  }
}

@ApiTags("admin")
@ApiBearerAuth("ownerSession")
@Controller("admin/dashboard")
class DashboardController {
  constructor(private readonly dashboard: DashboardService) {}

  @Get()
  @Header("Cache-Control", "no-store")
  @ApiOkResponse({ type: DashboardResponse })
  read(@Req() req: OwnerRequest) {
    return this.dashboard.read(req.ownerSession.owner.id);
  }
}

@Module({ imports: [DatabaseModule], controllers: [DashboardController], providers: [DashboardService] })
export class DashboardModule {}
