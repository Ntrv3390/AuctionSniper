import { DevLogDetailViewModel } from 'src/app/Views/More/Developer/Dev-Log-Detail/DevLogDetailViewModel'; // adjust path accordingly

export class DevLogsListViewModel {
  public logs: { [day: string]: DevLogDetailViewModel[] } = {};

  public showDebug: boolean = false;
  public showDebugOnlyHTTP: boolean = false;
  public showInfo: boolean = true;
  public showWarn: boolean = true;
  public showError: boolean = true;

  constructor() {
    // logs is initialized above
  }
}
