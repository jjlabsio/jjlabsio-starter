import "reflect-metadata";

import { NestFactory } from "@nestjs/core";

import { AppModule } from "./app.module";

const DEFAULT_PORT = {{LOCAL_API_PORT}};

function getPort() {
  const port = Number.parseInt(process.env.PORT ?? "", 10);
  return Number.isInteger(port) && port > 0 ? port : DEFAULT_PORT;
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();

  await app.listen(getPort(), "0.0.0.0");
}

void bootstrap();
