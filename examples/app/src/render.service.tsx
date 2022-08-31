import { AppService } from './app.service';
import { Injectable } from 'nest-web/common';

@Injectable()
export class RenderService {
  constructor(private readonly appService: AppService) {}
  render() {
    return this.appService.getVersion();
  }
}
