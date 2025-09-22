import { Device } from 'src/app/Interfaces/device.interface';

export interface Platform {
    native: boolean;            // Is the app running natively (iOS/Android)?
    tablet: boolean;            // Is the device a tablet?
    android: boolean;           // Is the OS Android?
    androidTablet: boolean;     // Is it an Android tablet?
    iOS: boolean;               // Is the OS iOS?
    iPhone: boolean;            // Is it an iPhone?
    iPad: boolean;              // Is it an iPad?
    iPod: boolean;              // Is it an iPod?
    device: Device;             // Detailed device info (likely a custom interface)
    viewport: {                 // Screen dimensions
        width: number;
        height: number;
    };
}
