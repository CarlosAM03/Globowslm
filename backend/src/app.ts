import "reflect-metadata";
import { Module, type INestApplication } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import type { NestExpressApplication } from "@nestjs/platform-express";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { ConfigModule } from "./config.js";
import { EditorialModule } from "./editorial/editorial.js";
import { HealthModule } from "./health.js";
import { ApiErrorFilter, requestContext } from "./http.js";

@Module({ imports: [ConfigModule, HealthModule, EditorialModule] })
class AppModule {}

export async function createApp(): Promise<INestApplication> {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    abortOnError: false,
    bodyParser: false,
    logger: false,
  });
  app.disable("x-powered-by");
  app.use(requestContext);
  app.setGlobalPrefix("api/v1");
  app.useGlobalFilters(new ApiErrorFilter());
  app.enableShutdownHooks();

  const config = new DocumentBuilder()
    .setTitle("Globows LM API")
    .setVersion("1.0")
    .build();
  SwaggerModule.setup("api/v1/openapi", app, () => SwaggerModule.createDocument(app, config), {
    ui: false,
    raw: ["json"],
    jsonDocumentUrl: "api/v1/openapi.json",
  });
  return app;
}
