import {
  Inject,
  Injectable,
  LoggerService,
  NestMiddleware,
} from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  constructor(
    @Inject(WINSTON_MODULE_NEST_PROVIDER)
    private readonly logger: LoggerService,
  ) {}
  use(req: Request, res: Response, next: NextFunction) {
    const baseUrl = req.baseUrl.substring(1);
    const tempUrl = req.method + ' ' + req.url.split('?')[0];
    const _query = JSON.stringify(req.query ? req.query : '');
    const _body = JSON.stringify(req.body ? req.body : '');
    const _url = tempUrl ? tempUrl : '';
    this.logger.log(
      `${baseUrl} ${_url} ${_query} ${_body}`.replace(/\\/, ''),
      `${
        baseUrl[0].toUpperCase() + baseUrl.slice(1, baseUrl.length)
      }Controller`,
    );
    next();
  }
}
