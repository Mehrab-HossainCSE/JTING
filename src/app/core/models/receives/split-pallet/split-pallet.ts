export interface SplitItem {
  palletNo: string;
  skuname: string;
  skucode: string;
  secquenceNo: string;
  barcode: string;
  batchNo: string;
  controlName: string | null;
}

export interface PalletQtyAndDate {
  qty: number;
  rcvDate: string;
}

export interface PalletPickingSku {
  palletNo: string;
  remarks: string;
}

export interface SplitPalletPayload {
  barcodes: string[];
  isPA: boolean;
  controlName: string;
  batchNo: string;
  skuCode: string;
  date: string;
  isAuto: boolean;
  boxLocation: string;
  manualBox: string;
  skuName: string;
  oldPalletNo: string;
  remarks: string;
}
