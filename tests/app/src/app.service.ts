import { Injectable } from 'nest-web-common';

@Injectable()
export class AppService {
  getVersion(): string {
    return "1.x";
  }
}
