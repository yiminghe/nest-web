import { randomStringGenerator } from 'nest-web-common';
import { Module } from './module';

export class ModulesContainer extends Map<string, Module> {
  private readonly _applicationId = randomStringGenerator();

  get applicationId(): string {
    return this._applicationId;
  }
}
