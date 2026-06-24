export interface PickingItem {
  controlName: string;
  qty: number;
  palletNo: string;
  boxId: string;
  isActive: boolean;
  skuCode: string;
  skuname: string;
  rcvDate: string;
  challanNo?: string;
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

export interface GeneratePickingRequest {
  skuCode: string;
  qty: number;
  settingQty: number;
  pickingNo: string;
}

export interface CompletePickingRequest {
  pickingNo: string;
}

export interface SavePickingItem {
  controlName: string;
  palletNo: string;
  skuname: string;
  skuCode: string;
  palletQty: number;
  fullPaletQty: number;
  restQty: number;
  requiredQty: number;
  currentPickingQty: number;
  pickerName: string;
  settingQty: number;
  pickingNo: string;
}

export interface SavePickingRequest {
  items: SavePickingItem[];
  pickerName: string;
  pickingNo: string;
}

export interface ValidateManualLocationRequest {
  controlName: string;
  batchNo: string;
  rcvDate: string;
  skuCode: string;
  qty: number;
  settingQty: number;
  alreadyAddedLocations: PickingItem[];
}
