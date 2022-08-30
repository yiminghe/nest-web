import 'reflect-metadata';
import { AppModule } from './app.module';
import { NestFactory } from 'nest-web-core';
import { RenderService } from './render.service';

async function init() {
  debugger
  const app = await NestFactory.createApplicationContext(AppModule);
  const renderService = app.get(RenderService);
  renderService.render();
}

init();
