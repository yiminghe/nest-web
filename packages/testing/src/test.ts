import { ModuleMetadata } from 'nest-web-common'; //'nest-web-common/interfaces/modules/module-metadata.interface';
import { MetadataScanner } from 'nest-web-core'; // '@nestjs/core/metadata-scanner';
import { TestingModuleBuilder } from './testing-module.builder';

export class Test {
  private static readonly metadataScanner = new MetadataScanner();

  public static createTestingModule(metadata: ModuleMetadata) {
    return new TestingModuleBuilder(this.metadataScanner, metadata);
  }
}
