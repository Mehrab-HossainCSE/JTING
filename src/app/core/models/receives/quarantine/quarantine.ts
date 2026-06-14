export interface BoxLocation {
  location: string;
  selected: boolean;
  block: string;
  arch: string;
  line: string;
}

export interface QuarantineRecord {
  quarantineNo: string;
  skuDescription: string;
  palletQty: number;
  createDate: string;
}

export interface PalletDetail {
  boxLocation: string;
  palletNo: string;
  batchNo: string;
  receiveDate: string;
  qty: number;
  status: 'Pending' | 'Reviewing' | 'Released' | 'Destroyed';
  skuCode: string;
}
