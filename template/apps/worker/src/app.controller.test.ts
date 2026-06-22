import "reflect-metadata";

import { Test } from "@nestjs/testing";
import { describe, expect, it } from "vitest";

import { AppController } from "./app.controller";
import { AppService } from "./app.service";

describe("AppController", () => {
  it("returns the worker service name", async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [AppController],
      providers: [AppService],
    }).compile();

    const controller = moduleRef.get(AppController);

    expect(controller.getRoot()).toEqual({
      name: "jjlabsio-starter-worker",
      status: "ok",
    });
  });
});
