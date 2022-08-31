# nest-web

using nestjs DI on web

## usage

```js
import { NestFactory } from 'nest-web/core';
import { Injectable } from 'nest-web/common';

const app = await NestFactory.createApplicationContext(...);
const service = app.get(...);
```