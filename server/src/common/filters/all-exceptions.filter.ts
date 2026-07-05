import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';
import { WsException } from '@nestjs/websockets';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger('ExceptionFilter');

  catch(exception: unknown, host: ArgumentsHost) {
    this.logger.error(exception instanceof Error ? exception.stack : exception);

    if (host.getType() === 'ws') {
      const client = host.switchToWs().getClient<import('socket.io').Socket>();
      const message =
        exception instanceof WsException
          ? exception.getError()
          : exception instanceof HttpException
            ? exception.getResponse()
            : 'Internal server error';
      client.emit('exception', { message });
      return;
    }

    const ctx = host.switchToHttp();
    const res = ctx.getResponse<Response>();

    const status =
      exception instanceof HttpException ? exception.getStatus() : 500;

    const message =
      exception instanceof HttpException
        ? exception.getResponse()
        : 'Internal server error';

    res.status(status).json({
      statusCode: status,
      message,
    });
  }
}
