import { Component, inject, signal, OnInit, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { ToastrService } from 'ngx-toastr';
import { ErrorHandlerService } from '../../../../core/services/error-handler.service';
import { BoxService } from '../../../../core/services/setupServices/box-service';
import { ArchService } from '../../../../core/services/setupServices/arch-service';
import { LineService } from '../../../../core/services/setupServices/line-service';
import { BlockService } from '../../../../core/services/setupServices/block-service';
import { ApiResponse } from '../../../../core/models/ApiResponse.model';
import { Block } from '../../../../core/models/setups/block/block';
import { Arch } from '../../../../core/models/setups/arch/arch';
import { Line } from '../../../../core/models/setups/line/line';
import { Box } from '../../../../core/models/setups/box/box';
import { PalletSplit } from '../../../../core/services/receiveServices/pallet-split';
import { Sku } from '../../../../core/models/setups/sku/sku';
import { SkuService } from '../../../../core/services/skuServices/sku-service';
import { PalletPickingSku, SplitPalletPayload } from '../../../../core/models/receives/split-pallet/split-pallet';

interface CaseItem {
  skuName: string;
  sequenceNo: string;
  selected: boolean;
  palletNo?: string;
  skuCode?: string;
  barcode?: string;
  batchNo?: string;
  controlName?: string | null;
}

interface PalletDetail {
  palletNo: string;
  arch: string;
  line: string;
  box: string;
  total: string | number;
}

@Component({
  selector: 'app-split-pallet',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './split-pallet.html',
  styleUrl: './split-pallet.scss',
})
export class SplitPallet implements OnInit {

  private http = inject(HttpClient);
  private toastr = inject(ToastrService);
  private errorHandler = inject(ErrorHandlerService);

  private blockService = inject(BlockService);
  private archService = inject(ArchService);
  private lineService = inject(LineService);
  private boxService = inject(BoxService);
  private palletSplitService = inject(PalletSplit);
  private skuService = inject(SkuService);

  blocks = signal<Block[]>([]);
  selectedBlock = signal<Block | null>(null);
  boxes = signal<Box[]>([]);
  selectedBox = signal<Box | null>(null);
  lines = signal<Line[]>([]);
  selectedLine = signal<Line | null>(null);
  archives = signal<Arch[]>([]);
  selectedArch = signal<Arch | null>(null);
  filteredLines = signal<Line[]>([]);
  filteredBoxes = signal<Box[]>([]);
  manualBoxes = signal<Box[]>([]);
  skus = signal<Sku[]>([]);
  pickingPallets = signal<PalletPickingSku[]>([]);

  form = {
    block: '',
    arch: '',
    line: '',
    box: '',
    palletNoInput: '',
    qty: null as number | null,
    date: new Date().toISOString().split('T')[0],
    destinationAuto: true,
    manual: '',
    pa: false,
    sku: '',
    palletNo: '',
  };

  remarks: string = '';
  selectedCount: number = 0;
  caseItems = signal<CaseItem[]>([]);

  oldPalletSequenceNos = signal<string[]>([]);
  newPalletSequenceNos = signal<string[]>([]);

  oldPallet: PalletDetail = { palletNo: '', arch: '', line: '', box: '', total: '' };
  newPallet: PalletDetail = { palletNo: '', arch: '', line: '', box: '', total: '' };

  ngOnInit(): void {
    this.loadBlocks();
    this.loadSkus();
  }

  loadBlocks(): void {
    this.blockService.getAll().subscribe({
      next: (res) => {
        if (res.success) {
          this.blocks.set(res.data);
        } else {
          this.toastr.error(res.message || 'Failed to load blocks');
        }
      },
      error: (err) => this.errorHandler.handleErrorWithToster(err),
    });
  }

  loadSkus(): void {
    this.skuService.getSKUWithOutESL().subscribe({
      next: (res) => {
        if (res.success) {
          this.skus.set(res.data);
        } else {
          this.toastr.error(res.message || 'Failed to load SKUs');
        }
      },
      error: (err) => this.errorHandler.handleErrorWithToster(err),
    });
  }

  onBlockChange(blockId: string): void {
    this.form.arch = '';
    this.form.line = '';
    this.form.box = '';
    this.archives.set([]);
    this.lines.set([]);
    this.boxes.set([]);
    this.onFormChange();

    if (blockId) {
      this.archService.getByBlockId(blockId).subscribe({
        next: (res) => {
          if (res.success) {
            this.archives.set(res.data);
          } else {
            this.toastr.error(res.message || 'Failed to load arches');
          }
        },
        error: (err) => this.errorHandler.handleErrorWithToster(err),
      });
    }
  }

  onArchChange(archId: string): void {
    this.form.line = '';
    this.form.box = '';
    this.lines.set([]);
    this.boxes.set([]);
    this.onFormChange();

    if (archId) {
      this.lineService.getByArchId(archId).subscribe({
        next: (res) => {
          if (res.success) {
            this.lines.set(res.data);
          } else {
            this.toastr.error(res.message || 'Failed to load lines');
          }
        },
        error: (err) => this.errorHandler.handleErrorWithToster(err),
      });
    }
  }

  onLineChange(lineId: string): void {
    this.form.box = '';
    this.boxes.set([]);
    this.onFormChange();

    if (lineId) {
      this.boxService.getSplitBoxByLineId(lineId).subscribe({
        next: (res) => {
          if (res.success) {
            this.boxes.set(res.data);
          } else {
            this.toastr.error(res.message || 'Failed to load boxes');
          }
        },
        error: (err) => this.errorHandler.handleErrorWithToster(err),
      });
    }
  }

  onFormChange(): void {
    if (this.form.destinationAuto) {
      this.form.manual = '';
    }
  }

  onBoxChange(boxId: string): void {
    this.onFormChange();
    this.caseItems.set([]);
    this.selectedCount = 0;
    this.oldPalletSequenceNos.set([]);
    this.newPalletSequenceNos.set([]);
    this.oldPallet = { palletNo: '', arch: '', line: '', box: '', total: '' };
    this.newPallet = { palletNo: '', arch: '', line: '', box: '', total: '' };
    if (!boxId) return;

    this.palletSplitService.getSplitDataByBoxId(boxId).subscribe({
      next: (res) => {
        if (res.success && res.data) {
          const items = res.data.map(item => ({
            skuName: item.skuname,
            sequenceNo: item.secquenceNo,
            selected: false,
            palletNo: item.palletNo,
            skuCode: item.skucode,
            barcode: item.barcode,
            batchNo: item.batchNo,
            controlName: item.controlName
          }));
          this.caseItems.set(items);
          //this.oldPalletSequenceNos.set(items.map(item => item.sequenceNo));
          //this.newPalletSequenceNos.set([]);

          if (res.data.length > 0) {
            const palletNo = res.data[0].palletNo;
            this.form.palletNo = palletNo;
            this.form.palletNoInput = palletNo;
            this.form.sku = res.data[0].skucode;

            this.palletSplitService.getQtyAndDateByPalletNo(palletNo).subscribe({
              next: (resQty) => {
                if (resQty.success && resQty.data && resQty.data.length > 0) {
                  this.form.date = resQty.data[0].rcvDate ? resQty.data[0].rcvDate.split('T')[0] : '';
                  this.form.qty = resQty.data[0].qty;

                  // this.oldPallet = {
                  //   palletNo: palletNo,
                  //   arch: this.form.arch,
                  //   line: this.form.line,
                  //   box: this.form.box,
                  //   total: resQty.data[0].qty
                  // };
                }
              },
              error: (err) => this.errorHandler.handleErrorWithToster(err)
            });
          }
        } else {
          this.toastr.error(res.message || 'Failed to load box split data');
        }
      },
      error: (err) => this.errorHandler.handleErrorWithToster(err)
    });

    this.boxService.getAll().subscribe({
      next: (resBoxes) => {
        if (resBoxes.success) {
          this.manualBoxes.set(resBoxes.data);
        } else {
          this.toastr.error(resBoxes.message || 'Failed to load manual boxes');
        }
      },
      error: (err) => this.errorHandler.handleErrorWithToster(err)
    });
  }

  onPalletChange(palletNo: string): void {
    this.onFormChange();
    this.caseItems.set([]);
    this.selectedCount = 0;
    this.oldPalletSequenceNos.set([]);
    this.newPalletSequenceNos.set([]);
    this.oldPallet = { palletNo: '', arch: '', line: '', box: '', total: '' };
    this.newPallet = { palletNo: '', arch: '', line: '', box: '', total: '' };
  }

  onPaChange(): void {
    if (!this.form.pa) {
      this.form.sku = '';
      this.form.palletNo = '';
    }
    //this.onFormChange();
  }

  onSkuChange(skuCode: string): void {
    this.onFormChange();
    this.pickingPallets.set([]);
    this.form.palletNo = '';

    if (!skuCode) return;

    this.palletSplitService.getPalletNoFromPickingBySku(skuCode).subscribe({
      next: (res) => {
        if (res.success) {
          this.pickingPallets.set(res.data);
        } else {
          this.toastr.error(res.message || 'Failed to load pallet numbers');
        }
      },
      error: (err) => this.errorHandler.handleErrorWithToster(err),
    });
  }

  onSubmit(): void {
    if (!this.form.pa) return;

    if (!this.form.sku || !this.form.palletNo) {
      this.toastr.warning('Please select SKU and Pallet No.', 'Validation Warning');
      return;
    }

    if (!this.form.destinationAuto && !this.form.manual) {
      this.toastr.warning('Please select a manual option.', 'Validation Warning');
      return;
    }

    const palletNo = this.form.palletNo;
    this.form.palletNoInput = palletNo;

    this.palletSplitService.getSplitDataByPalletNo(palletNo).subscribe({
      next: (res) => {
        if (res.success && res.data) {
          const items = res.data.map(item => ({
            skuName: item.skuname,
            sequenceNo: item.secquenceNo,
            selected: false,
            palletNo: item.palletNo,
            skuCode: item.skucode,
            barcode: item.barcode,
            batchNo: item.batchNo,
            controlName: item.controlName
          }));
          this.caseItems.set(items);
          this.palletSplitService.getQtyAndDateByPalletNo(palletNo).subscribe({
            next: (resQty) => {
              if (resQty.success && resQty.data && resQty.data.length > 0) {
                this.form.date = resQty.data[0].rcvDate ? resQty.data[0].rcvDate.split('T')[0] : '';
                this.form.qty = resQty.data[0].qty;
              }
            },
            error: (err) => this.errorHandler.handleErrorWithToster(err)
          });

          this.toastr.success('Cases loaded successfully for the selected Pallet.', 'Success');
        } else {
          this.toastr.error(res.message || 'Failed to load pallet split data');
        }
      },
      error: (err) => this.errorHandler.handleErrorWithToster(err)
    });
  }

  onCheckboxChange(): void {
    // Trigger signal updates
    this.caseItems.update((items) => [...items]);
    this.selectedCount = this.caseItems().filter((i) => i.selected).length;
  }

  onSplitNow(): void {
    debugger;
    if (this.selectedCount === 0) {
      this.toastr.warning('Please select at least one case to split.', 'Validation Warning');
      return;
    }

    const selectedItems = this.caseItems().filter(item => item.selected);
    const nonSelectedItems = this.caseItems().filter(item => !item.selected);
    const firstItem = selectedItems[0];

    const seqs = selectedItems.map(item => item.sequenceNo);

    const payload: SplitPalletPayload = {
      barcodes: selectedItems.map(item => item.barcode || ''),
      secquenceNo: seqs,
      secquenceNos: seqs,
      sequenceNo: seqs,
      sequenceNos: seqs,
      isPA: this.form.pa,
      controlName: firstItem?.controlName || '',
      batchNo: firstItem?.batchNo || '',
      skuCode: this.form.pa ? this.form.sku : (firstItem?.skuCode || ''),
      date: this.form.date,
      isAuto: this.form.destinationAuto,
      boxLocation: this.form.box,
      manualBox: this.form.destinationAuto ? '' : this.form.manual,
      skuName: this.form.pa ? '' : (firstItem?.skuName || ''),
      oldPalletNo: this.form.pa ? this.form.palletNo : this.form.palletNoInput,
      remarks: this.remarks
    };

    this.palletSplitService.splitPallet(payload).subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.toastr.success(res.message || 'Pallet split completed successfully.');

          const data = res.data;

          // Extract old pallet details from response data
          const oldPal = data.oldPalletDetails || data.oldPallet || {};
          const oldPalNo = oldPal.palletNo || data.oldPalletNo || (this.form.pa ? this.form.palletNo : this.form.palletNoInput);
          const oldArch = oldPal.arch || data.oldArch || this.form.arch;
          const oldLine = oldPal.line || data.oldLine || this.form.line;
          const oldBox = oldPal.box || data.oldBox || this.form.box;
          const oldTotal = oldPal.total !== undefined ? oldPal.total : (data.oldTotal !== undefined ? data.oldTotal : nonSelectedItems.length);
          const oldSeqs = oldPal.sequenceNos || oldPal.sequences || data.oldSequenceNos || data.oldSequences || nonSelectedItems.map(i => i.sequenceNo);

          // Extract new pallet details from response data
          const newPal = data.newPalletDetails || data.newPallet || {};
          const newPalNo = newPal.palletNo || data.newPalletNo || 'NEW-PLT-001';
          const newArch = newPal.arch || data.newArch || this.form.arch;
          const newLine = newPal.line || data.newLine || this.form.line;
          const newBox = newPal.box || data.newBox || (this.form.destinationAuto ? this.form.box : this.form.manual);
          const newTotal = newPal.total !== undefined ? newPal.total : (data.newTotal !== undefined ? data.newTotal : selectedItems.length);
          const newSeqs = newPal.sequenceNos || newPal.sequences || data.newSequenceNos || data.newSequences || selectedItems.map(i => i.sequenceNo);

          this.oldPalletSequenceNos.set(oldSeqs);
          this.newPalletSequenceNos.set(newSeqs);

          this.oldPallet = {
            palletNo: oldPalNo,
            arch: oldArch,
            line: oldLine,
            box: oldBox,
            total: oldTotal
          };

          this.newPallet = {
            palletNo: newPalNo,
            arch: newArch,
            line: newLine,
            box: newBox,
            total: newTotal
          };
        } else {
          this.toastr.error(res.message || 'Failed to split pallet.');
        }
      },
      error: (err) => this.errorHandler.handleErrorWithToster(err)
    });
  }

  onPrintOld(): void {
    if (!this.oldPallet.palletNo) return;
    alert(`Printing Old Pallet: ${this.oldPallet.palletNo}`);
  }

  onPrintNew(): void {
    if (!this.newPallet.palletNo) return;
    alert(`Printing New Pallet: ${this.newPallet.palletNo}`);
  }
}