import { BaseController } from 'src/app/Framework/BaseController';
import { UIService } from 'src/app/services/UI';
import { PluginsService } from 'src/app/services/Plugins';
import { NavigatorService } from 'src/app/services/Navigator';
import { Utilities } from 'src/app/services/Utilities';


export abstract class BaseDevController<T> extends BaseController<T> {
  constructor(
    modelType: new () => T,
    navigator: NavigatorService,
    utilities: Utilities,
    protected ui: UIService,
    protected plugins: PluginsService
  ) {
    super(modelType, navigator, utilities);
  }

  protected help_click(helpMessage: string): void {
    this.ui.alert(helpMessage, "Help");
  }

  protected copyValue_click(value: any, name: string): void {
    this.ui.confirm(`Copy ${name} to clipboard?`)
      .then((dialogOk: boolean) => {
        if (dialogOk) {
          this.plugins.clipboard.write({
            string: value,
          });
        }
      });
  }
}