import { DropDownItem } from 'src/app/Interfaces/dropdown-item.model';

export class LoginViewModel {
  public showSignIn!: boolean;

  public showDebugOptions!: boolean;
  public versionDisplay!: string;

  public userId!: string;
  public password!: string;
  public confirmPassword!: string;
  public email!: string;
  public timeZone!: number;

  public timeZoneList!: DropDownItem<number>[];
}
