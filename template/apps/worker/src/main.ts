import "reflect-metadata";

import { NestFactory } from "@nestjs/core";

import { AppModule } from "./app.module";

const DEFAULT_PORT = {{LOCAL_WORKER_PORT}};
const DEFAULT_HOST = "127.0.0.1";

function getPort() {
  const port = Number.parseInt(process.env.PORT ?? "", 10);
  return Number.isInteger(port) && port > 0 ? port : DEFAULT_PORT;
}

function getHost() {
  return process.env.HOST || DEFAULT_HOST;
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  await app.listen(getPort(), getHost());
}

void bootstrap();
