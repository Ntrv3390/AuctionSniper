import { InjectionToken } from '@angular/core';
import { BuildVars } from 'src/app/Interfaces/build-vars.interface';

export const BUILD_VARS_TOKEN = new InjectionToken<BuildVars>('BuildVars');