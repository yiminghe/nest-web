import { Test } from 'nest-web/testing';
import { RenderService } from './render.service';
import { AppModule } from './app.module';
import { AppService } from './app.service';

describe('app', () => {
  it('should works', async () => {
    const app = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    const renderService = app.get<RenderService>(RenderService);
    expect(renderService.render()).toBe('1.x');
  });

  it('mock works', async () => {
    const app = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(AppService)
      .useValue({
        getVersion: () => '2.x',
      })
      .compile();
    const renderService = app.get<RenderService>(RenderService);
    expect(renderService.render()).toBe('2.x');
  });
});
