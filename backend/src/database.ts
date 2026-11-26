import { Inject, Injectable, Module, type OnModuleDestroy } from "@nestjs/common";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import { API_CONFIG, type ApiConfig } from "./config.js";
import { PrismaClient } from "./generated/prisma/client.js";

@Injectable()
export class DatabaseService extends PrismaClient implements OnModuleDestroy {
  private readonly pool: Pool;

  constructor(@Inject(API_CONFIG) config: ApiConfig) {
    const pool = new Pool({
      connectionString: config.databaseUrl,
      connectionTimeoutMillis: 2000,
      statement_timeout: 2000,
    });
    super({ adapter: new PrismaPg(pool) });
    this.pool = pool;
  }

  async isReady(): Promise<boolean> {
    const row = await this.databaseInitialization.findUnique({
      where: { id: "globows-v2" },
      select: { id: true },
    });
    return row !== null;
  }

  async onModuleDestroy(): Promise<void> {
    await this.$disconnect();
    await this.pool.end();
  }
}

@Module({ providers: [DatabaseService], exports: [DatabaseService] })
export class DatabaseModule {}
