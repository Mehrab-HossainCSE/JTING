export interface TransferRestoreItem {
  controlName: string;
  qty: number;
  palletNo: string;
  boxId: string;
  isActive: boolean;
  skuCode: string;
  skuname: string;
  rcvDate: string;
  fullPaletQty: number;
  restQty: number;
  requiredQty: number;
  pickerName: string;
  batchNo: string;
  settingQty: number;
  barcode: string;
  pickingAreaStock: number;
  totalStock: number;
  palletQty: number;
  createDate: string;
  pickingNo: string;
  button1: string;
  button2: string;
  button3: string;
  button4: string;
  fromBoxId: string;
  shift: string;
  secquenceNo: string;
  archName: string;
  lineName: string;
  boxName: string;
  palletRcvId: number;
  deliverQty: number;
  slno: number;
  deliverQtyOld: number;
  transferBlock: boolean;
  currentPickingQty: number;
  blockQty: number;
}

export interface SaveTransferRequest {
  sourceList: TransferRestoreItem[];
  destinationList: TransferRestoreItem[];
  pickerName: string;
  transferNo: string;
  isUpdate: boolean;
}

export interface SaveRestoreRequest {
  sourceList: TransferRestoreItem[];
  destinationList: TransferRestoreItem[];
  pickerName: string;
  restoreNo: string;
  batchNo: string;
  skuCode: string;
  skuName: string;
  isUpdate: boolean;
}

export interface PickingSkuBatch {
  batchNo: string;
  qty?: number;
  skuCode?: string;
  [key: string]: any;
}
