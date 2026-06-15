export interface SkuSearchRequest {
  blockId: string;
  archId: string;
  lineId: string;
  skuCode: string;
  boxName: string;
  palletNo: string | null;
  settingQty: string | null;
  isPa: boolean;
}

export interface SkuSearchResult {
  blockName: string;
  archName: string;
  lineName: string;
  skuname: string;
  controlName: string;
  skuCode: string;
  batchNo: string;
  currentPallet: string;
  qty: number;
}
