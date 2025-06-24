import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getTime(): object {
    return {
      now: Date.now(),
    };
  }
}
