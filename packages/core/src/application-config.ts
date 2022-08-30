import { ExceptionFilter, VersioningOptions } from 'nest-web-common';

export class ApplicationConfig {
  private globalFilters: Array<ExceptionFilter> = [];
  private versioningOptions: VersioningOptions;

  public getGlobalFilters(): ExceptionFilter[] {
    return this.globalFilters;
  }

  public addGlobalFilter(filter: ExceptionFilter) {
    this.globalFilters.push(filter);
  }

  public useGlobalFilters(...filters: ExceptionFilter[]) {
    this.globalFilters = this.globalFilters.concat(filters);
  }

  public enableVersioning(options: VersioningOptions): void {
    if (Array.isArray(options.defaultVersion)) {
      // Drop duplicated versions
      options.defaultVersion = Array.from(new Set(options.defaultVersion));
    }

    this.versioningOptions = options;
  }

  public getVersioning(): VersioningOptions | undefined {
    return this.versioningOptions;
  }
}
