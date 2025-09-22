import { LogEntry } from 'src/app/models/log-entry.model'; // Adjust path as needed

export class DevLogDetailViewModel {
  public logEntry!: LogEntry;
  public icon!: string;
  public date!: string;
  public time!: string;
  public levelDisplay!: string;
  public color!: string;
  public formattedMetadata!: string;

  public httpVerb!: string;
  public httpUrl!: string;
  public httpCode!: string;
}
