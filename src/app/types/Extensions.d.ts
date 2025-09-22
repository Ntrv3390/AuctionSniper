import { BuildVars } from 'src/app/Interfaces/build-vars.interface';

interface Window {
    Capacitor: CapTypes.Capacitor;
    __buildVars: BuildVars;
}
