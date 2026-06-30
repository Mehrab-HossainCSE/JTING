export interface DeliveryMasterData {
  driverId: string;
  driverName: string;
  truckId: string;
  truckName: string;
  destinationId: string;
  destinationName: string;
}

export interface DeliveryTempItem {
  barcode: string;
  batchNo: string;
  batchQty: number;
  skuCode: string;
  skuName: string;
  qty: number;
  remarks: string;
  driverId: string;
  driverName: string;
  truckId: string;
  truckName: string;
  destinationId: string;
  destinationName: string;
  challanNo: string;
  salesOrder: string;
  settingQty: number;
  settingText: string;
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
