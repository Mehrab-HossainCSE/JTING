export interface Box {
  boxId: string;
  boxName: string;
  currentPallet?: string;
  isActive: boolean;
  blockId: string;
  archId: string;
  lineId: string;
  boxCode: string;
  serialNo: number;
  controlName?: string;
  blockName?: string;
  archName?: string;
  lineName?: string;
  batchNo?: string | null;
  skucode?: string | null;
  rcvDate?: string | null;
  palletNo?: string | null;
}
