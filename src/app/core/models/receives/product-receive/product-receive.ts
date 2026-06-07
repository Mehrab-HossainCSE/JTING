export interface ProductReceiveItem {
  slno: number;
  chln: string | null;
  chlnDT: string;
  pmid: number | null;
  pmName: string | null;
  barcode: string;
  id: string;
  brandName: string | null;
  subBrandName: string | null;
  qty: number;
  boardQty: number;
  pTime: string | null;
  pTimeA: string;
  issueTo: string;
  shift: string;
  userID: string | null;
  barcodeType: string;
  brandId: number | null;
  subBrandId: number | null;
  skucode: string;
  skuname: string;
  healthWarningName: string | null;
}

export interface PalletReceiveItem {
  palletNo: string;
  palletLocation: string;
  skucode: string;
  skuname: string;
  rcvDate: string;
  qty?: number;
}
