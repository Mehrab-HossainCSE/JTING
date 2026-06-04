export interface PalletGenerateItem {
  skucode: string;
  skuname: string;
  palletCount: number;
  currentPalletCount: number;
  rcvDate: string;
  batchNo: string;
  isESL: boolean;
}

export interface PalletGenerateCreatePayload {
  skucode: string;
  batchNo: string;
  rcvDate: string;
  isESL: boolean;
  currentPalletCount: number;
  palletCount: number;
}

export interface PalletRecord {
  skucode: string;
  skuname: string;
  palletLocation: string;
  palletNo: string;
  rcvDate: string;
}

