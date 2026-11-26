import "reflect-metadata";
import { Module, type INestApplication } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import type { NestExpressApplication } from "@nestjs/platform-express";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import express from "express";
import { AuthModule } from "./auth/auth.module.js";
import { DiagnosticsModule } from "./auth/diagnostics.js";
import { API_CONFIG, ConfigModule, type ApiConfig } from "./config.js";
import { DashboardModule } from "./dashboard.js";
import { ContentAdminModule } from "./editorial/content.module.js";
import { PublicSiteModule } from "./editorial/public-site.js";
import { PublicBlogModule } from "./editorial/public-blog.js";
import { EditorialModule } from "./editorial/editorial.js";
import { MediaModule, mediaCors } from "./media/media.module.js";
import { HealthModule } from "./health.js";
import { ApiErrorFilter, jsonErrors, requestContext } from "./http.js";
import { documentApi } from "./openapi.js";

@Module({ imports: [ConfigModule, HealthModule, EditorialModule, AuthModule, DashboardModule, DiagnosticsModule, ContentAdminModule, MediaModule, PublicBlogModule, PublicSiteModule] })
class AppModule {}

export async function createApp(): Promise<INestApplication> {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    abortOnError: false,
    bodyParser: false,
    logger: false,
  });
  app.disable("x-powered-by");
  app.use(requestContext);
  app.use(mediaCors(app.get<ApiConfig>(API_CONFIG).appOrigin));
  app.use(express.json({ limit: 1024 * 1024, strict: true }));
  app.use(jsonErrors);
  app.setGlobalPrefix("api/v1");
  app.useGlobalFilters(new ApiErrorFilter());
  app.enableShutdownHooks();

  const config = new DocumentBuilder()
    .setTitle("Globows LM API")
    .setVersion("1.0")
    .addBearerAuth({ type: "http", scheme: "bearer" }, "ownerSession")
    .addBearerAuth({ type: "http", scheme: "bearer" }, "uploadTicket")
    .addApiKey({ type: "apiKey", in: "header", name: "X-Cms-Bff" }, "cmsBff")
    .build();
  SwaggerModule.setup("api/v1/openapi", app, () => documentApi(SwaggerModule.createDocument(app, config)), {
    ui: false,
    raw: ["json"],
    jsonDocumentUrl: "api/v1/openapi.json",
  });
  return app;
}
