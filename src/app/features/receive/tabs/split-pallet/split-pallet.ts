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

interface CaseItem {
  skuName: string;
  sequenceNo: string;
  selected: boolean;
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

  oldPalletSequenceNos = computed(() =>
    this.caseItems()
      .filter((item) => !item.selected)
      .map((item) => item.sequenceNo)
  );

  newPalletSequenceNos = computed(() =>
    this.caseItems()
      .filter((item) => item.selected)
      .map((item) => item.sequenceNo)
  );

  oldPallet: PalletDetail = { palletNo: '', arch: '', line: '', box: '', total: '' };
  newPallet: PalletDetail = { palletNo: '', arch: '', line: '', box: '', total: '' };

  ngOnInit(): void {
    this.loadBlocks();
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
    // Reset case list on form field change
    this.caseItems.set([]);
    this.selectedCount = 0;
  }

  onPalletChange(): void {
    this.onFormChange();
  }

  onSubmit(): void {
    if (!this.form.sku || !this.form.palletNo) return;

    // Simulate loading cases based on selected pallet
    this.caseItems.set(Array.from({ length: 8 }, (_, i) => ({
      skuName: 'Navy Special Filter 10s',
      sequenceNo: String(101791 + i),
      selected: false,
    })));

    this.oldPallet = {
      palletNo: this.form.palletNo,
      arch: this.form.arch,
      line: this.form.line,
      box: this.form.box,
      total: this.caseItems().length,
    };

    // Populate the readonly fields for review
    this.form.palletNoInput = this.form.palletNo;
    this.form.qty = this.caseItems().length;

    this.newPallet = { palletNo: '', arch: '', line: '', box: '', total: '' };
    this.selectedCount = 0;
  }

  onCheckboxChange(): void {
    // Trigger signal updates
    this.caseItems.update((items) => [...items]);
    this.selectedCount = this.caseItems().filter((i) => i.selected).length;

    // Update new pallet total based on selection
    this.newPallet = {
      palletNo: this.selectedCount > 0 ? 'NEW-PLT-001' : '',
      arch: this.selectedCount > 0 ? this.form.arch : '',
      line: this.selectedCount > 0 ? this.form.line : '',
      box: this.selectedCount > 0 ? this.form.box : '',
      total: this.selectedCount > 0 ? this.selectedCount : '',
    };

    // Update old pallet total
    if (this.caseItems().length > 0) {
      this.oldPallet.total = this.caseItems().length - this.selectedCount;
    }
  }

  onSplitNow(): void {
    if (this.selectedCount === 0) return;
    // Split action — hook up to your service here
    alert(`Split completed: ${this.selectedCount} case(s) moved to new pallet.`);
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