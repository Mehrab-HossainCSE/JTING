export interface LocalReconciliationRequest {
  fromDate: string;
  toDate: string;
  shift: string;
  settingQty: number;
}

export interface ReceiveReconciliationItem {
  skucode: string;
  skuname: string;
  bum: string;
  batchNo: string;
  postingDate: string;
  sapQty: number;
  scanQty: number;
  physicalQty: number;
  variance1: number;
  variance2: number;
  variance3: number;
  remarks: string;
  fromDate: string;
  toDate: string;
}

export interface ReceiveReconciliationRequest {
  listReceive: ReceiveReconciliationItem[];
  settingQty: string;
  shift: string;
  dateFrom: string;
  dateTo: string;
  reconcilationNo: string;
  userName: string;
}

export interface DeliveryReconciliationItem {
  skucode: string;
  skuname: string;
  bum: string;
  batchNo: string;
  postingDate: string;
  sapQty: number;
  deliveryScanQty: number;
  variance1: number;
  remarks: string;
  fromDate: string;
  toDate: string;
}

export interface DeliveryReconciliationRequest {
  listDelivery: DeliveryReconciliationItem[];
  settingQty: string;
  dateFrom: string;
  dateTo: string;
  reconcilationNo: string;
  userName: string;
}

export interface HundredPercentReconciliationItem {
  skucode: string;
  skuname: string;
  bum: string;
  batchNo: string;
  unrestrictedQty: number;
  blockedQty: number;
  scanQty: number;
  scanBlockQty: number;
  physicalQty: number;
  physicalBlockQty: number;
  remarks: string;
  variance1: number;
  variance2: number;
  variance3: number;
  variance4: number;
  variance5: number;
  variance6: number;
}

export interface HundredPercentReconciliationRequest {
  list100Counting: HundredPercentReconciliationItem[];
  settingQty: string;
  dateFrom: string;
  dateTo: string;
  reconcilationNo: string;
  userName: string;
}

export interface PickingReconciliationItem {
  skucode: string;
  skuname: string;
  bum: string;
  batchNo: string;
  postingDate: string;
  sapQty: number;
  pickingScanQty: number;
  physicalQty: number;
  remarks: string;
  variance1: number;
  variance2: number;
  fromDate: string;
  toDate: string;
}

export interface PickingReconciliationRequest {
  listPicking: PickingReconciliationItem[];
  settingQty: string;
  dateFrom: string;
  dateTo: string;
  reconcilationNo: string;
  userName: string;
}
