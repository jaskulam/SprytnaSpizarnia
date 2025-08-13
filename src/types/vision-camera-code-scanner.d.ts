declare module 'vision-camera-code-scanner' {
  import type { Frame } from 'react-native-vision-camera';
  export enum BarcodeFormat {
    AZTEC,
    CODE_128,
    CODE_39,
    CODE_93,
    CODABAR,
    DATA_MATRIX,
    EAN_13,
    EAN_8,
    ITF,
    PDF_417,
    QR_CODE,
    UPC_A,
    UPC_E,
  }
  export function scanBarcodes(frame: Frame, types: BarcodeFormat[]): Array<any>;
}
