export interface DeliveryMasterData {
  driverId: string;
  driverName: string;
  truckId: string;
  truckName: string;
  destinationId: string;
  destinationName: string;
}

export interface DeliveryTempItem {
  slno: number;
  driverID: string;
  driverName: string;
  truckID: string;
  truckName: string;
  destinationID: string;
  destinationName: string;
  barcode: string | null;
  chln: string | null;
  chlnQty: number | null;
  qty: number;
  oldQty: number | null;
  brandId: string | null;
  brandName: string | null;
  subBrandId: string | null;
  subBrandName: string | null;
  userId: string;
  barcodeType: string | null;
  skuname: string;
  skucode: string;
  id: string;
  isWithoutPicking: boolean;
  dcdt: string | null;
  pTimeA: string | null;
  remarks: string | null;
  healthWarningName: string | null;
  challanNo: string | null;
  salesOrder: string | null;
  uom: string;
}

export interface DeliveryTempProgress {
  details: DeliveryTempItem[];
  summary: DeliveryTempItem[];
}

export interface ScanBarcodeRequest {
  barcode: string;
  batchNo: string;
  batchQty: number;
  settingQty: number;
  settingText: string;
  driverId: string;
  driverName: string;
  truckId: string;
  truckName: string;
  destinationId: string;
  destinationName: string;
  challanNo: string;
  salesOrder: string;
  isWithoutPickingOverride: boolean;
}

export interface UpdateQtyRequest {
  barcode: string;
  skuCode: string;
  qty: number;
  settingQty: number;
  settingText: string;
}

export interface UpdateRemarksRequest {
  batchId: string;
  skuCode: string;
  remarks: string;
  settingQty: number;
  settingText: string;
}

export interface SaveDeliveryRequest {
  driverId: string;
  driverName: string;
  truckId: string;
  truckName: string;
  destinationId: string;
  destinationName: string;
  challanNo: string;
  salesOrder: string;
  forwarded: string;
  carrier: string;
  bookingNo: string;
  candF: string;
  po: string;
  containerNo: string;
  contactNo: string;
  lockNo: string;
}

export interface ScanBarcodeResponse {
  isSuccess: boolean;
  message: string;
  requiresPickingOverride: boolean;
  details: DeliveryTempItem[];
  summary: DeliveryTempItem[];
}

export interface SummaryItem {
  id: string;
  skucode: string;
  skuname: string;
  uom: string;
  qty: number;
  remarks: string | null;
}

export interface DataItem {
  barcode: string;
  skucode: string;
  skuname: string;
  uom: string;
  qty: number;
  editQty: number;
}