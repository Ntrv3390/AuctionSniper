import dayjs, { Dayjs } from 'dayjs';
import { LogLevel } from 'src/app/models/log-level.enum';

export class LogEntry {
  id?: string;
  timestamp?: Date;
  level?: LogLevel;
  tag?: string;
  message?: string;
  metadata?: any;

  constructor(init?: Partial<LogEntry>) {
    Object.assign(this, init);
    if (init?.timestamp && !(init.timestamp instanceof Date)) {
      this.timestamp = new Date(init.timestamp);
    }
  }
}