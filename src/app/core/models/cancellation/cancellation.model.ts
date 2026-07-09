export interface ReceiveCancellationSaveRequest {
  barcodes: string[] | null;
  pallets: string[] | null;
  remarks: string | null;
}

export interface ListDataForLocationRequest {
  barcodes: string[] | null;
}

export interface SkuCancelDetailsResponse {
  isESL: boolean;
  pallets: string[];
  boxes: string[];
}

export interface ReceiveCancelDetailDto {
  palletRcvId: number;
  batchNo: string | null;
  palletNo: string | null;
  rcvDate: string | null;
  shift: string | null;
  barcode: string | null;
  sequenceNo: string | null;
  controlName: string | null;
  skuCode: string | null;
  skuname: string | null;
  qty: number;
  deliverQty: number;
  slno: number;
  deliverQtyOld: number;
}

export interface DeliveryCancellationSaveRequest {
  items: ReceiveCancelDetailDto[] | null;
  locations: ReceiveCancelDetailDto[] | null;
  remarks: string | null;
}


export interface SequenceRecord {
  seqNo: string;
  isChecked: boolean;
  barcode?: string;
}

export interface CancelItem {
  skuName: string;
  seqNo: string;
  qty: number;
  barcode?: string;
}

export interface SkuWithoutPicking {
  skuName: string;
  batchNo: string;
  palletNo: string;
  date: string;
  location: string;
}