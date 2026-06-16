import { Injectable } from "@nestjs/common";

@Injectable()
export class AppService {
  getRoot() {
    return {
      name: "jjlabsio-starter-api",
      status: "ok",
    };
  }
}
