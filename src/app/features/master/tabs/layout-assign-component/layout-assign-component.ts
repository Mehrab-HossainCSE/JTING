import { Component, signal, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';

// Note: Adjust paths if your exact service location differs
import { BlockService } from '../../../../core/services/setupServices/block-service';
import { ArchService } from '../../../../core/services/setupServices/arch-service';
import { LineService } from '../../../../core/services/setupServices/line-service';
import { BoxService } from '../../../../core/services/setupServices/box-service';
import { ErrorHandlerService } from '../../../../core/services/error-handler.service';
import { BossAssaign } from '../../../../core/models/setups/box/boss-assaign';

@Component({
  selector: 'app-layout-assign-component',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './layout-assign-component.html',
  styleUrl: './layout-assign-component.scss',
})
export class LayoutAssignComponent implements OnInit {
  private blockService = inject(BlockService);
  private archService  = inject(ArchService);
  private lineService  = inject(LineService);
  private boxService   = inject(BoxService);
  private fb           = inject(FormBuilder);
  private toastr       = inject(ToastrService);
  private errorHandler = inject(ErrorHandlerService);

  isLoading = signal(false);
  isBoxAssigned = signal(false);

  blocks = signal<any[]>([]);
  arches = signal<any[]>([]);
  lines  = signal<any[]>([]);
  boxes  = signal<any[]>([]);

  // Hardcoded target values for the right panel
  targetBlocks = ['FG1', 'FG2', 'FG3', 'N1', 'N2', 'N3'];
  targetArches = Array.from({ length: 20 }, (_, i) => (i + 1).toString().padStart(2, '0'));
  targetLines  = Array.from({ length: 6 }, (_, i) => (i + 1).toString().padStart(2, '0'));
  targetBoxes  = Array.from({ length: 11 }, (_, i) => (i + 1).toString().padStart(2, '0'));

  // Left panel — source box selection
  sourceForm: FormGroup = this.fb.group({
    blockId:     ['', Validators.required],
    archId:      ['', Validators.required],
    lineId:      ['', Validators.required],
    boxId:       ['', Validators.required],
    allocatedTo: [{ value: '', disabled: true }],
  });

  // Right panel — target warehouse position
  targetForm: FormGroup = this.fb.group({
    blockId:     ['', Validators.required],
    archId:      ['', Validators.required],
    lineId:      ['', Validators.required],
    boxId:       ['', Validators.required],
    controlName: [''],
  });

  ngOnInit(): void {
    this.loadDropdownData();
    this.watchSourceBoxId();
    this.watchTargetFormForControlName();
  }

  loadDropdownData(): void {
    this.isLoading.set(true);

    this.blockService.getAll().subscribe({
      next: (res: any) => { if (res.success) this.blocks.set(res.data); },
      error: () => this.toastr.error('Failed to load blocks', 'Error'),
    });

    this.archService.getAll().subscribe({
      next: (res: any) => { if (res.success) this.arches.set(res.data); },
      error: () => this.toastr.error('Failed to load arches', 'Error'),
    });

    this.lineService.getAll().subscribe({
      next: (res: any) => { if (res.success) this.lines.set(res.data); },
      error: () => this.toastr.error('Failed to load lines', 'Error'),
    });

    this.boxService.getAll().subscribe({
      next: (res: any) => { if (res.success) this.boxes.set(res.data); },
      error: () => this.toastr.error('Failed to load boxes', 'Error'),
      complete: () => this.isLoading.set(false),
    });
  }

  /** Fetch assigned layout when a source box is selected */
  private watchSourceBoxId(): void {
    this.sourceForm.get('boxId')?.valueChanges.subscribe((boxId) => {
      if (boxId) {
        this.boxService.isAssignedBox(boxId).subscribe({
          next: (res) => {
            if (res.success && res.data && res.data.controlName) {
              this.isBoxAssigned.set(true);
              this.sourceForm.get('allocatedTo')?.setValue(res.data.controlName, { emitEvent: false });
            } else {
              this.isBoxAssigned.set(false);
              this.sourceForm.get('allocatedTo')?.setValue('', { emitEvent: false });
            }
          },
          error: () => {
            this.isBoxAssigned.set(false);
            this.sourceForm.get('allocatedTo')?.setValue('', { emitEvent: false });
          }
        });
      } else {
        this.isBoxAssigned.set(false);
        this.sourceForm.get('allocatedTo')?.setValue('', { emitEvent: false });
      }
    });
  }

  /** Auto-generate the "Control Name" display value from target selections */
  private watchTargetFormForControlName(): void {
    this.targetForm.valueChanges.subscribe(() => {
      const { blockId, archId, lineId, boxId } = this.targetForm.getRawValue();
      if (blockId && archId && lineId && boxId) {
        // Pad the block with a leading space if it's less than 3 characters long (e.g. 'N1' -> ' N1')
        const formattedBlock = blockId.padStart(3, ' ');
        const controlName = `${formattedBlock}A${archId}L${lineId}B${boxId}`;
        this.targetForm.get('controlName')?.setValue(controlName, { emitEvent: false });
      } else {
        this.targetForm.get('controlName')?.setValue('', { emitEvent: false });
      }
    });
  }

  isInvalid(field: string, form: FormGroup): boolean {
    const ctrl = form.get(field);
    return !!(ctrl && ctrl.invalid && (ctrl.dirty || ctrl.touched));
  }

  resetSourceForm(): void {
    this.sourceForm.reset();
    this.isBoxAssigned.set(false);
  }

  resetBoxLayout(): void {
    const boxId = this.sourceForm.get('boxId')?.value;
    if (!boxId) return;

    this.boxService.resetLayout(boxId).subscribe({
      next: (res) => {
        if (res.success) {
          this.toastr.success('Box layout reset successfully', 'Success');
          this.isBoxAssigned.set(false);
          this.sourceForm.get('allocatedTo')?.setValue('', { emitEvent: false });
        } else {
          this.toastr.error(res.message, 'Error');
        }
      },
      error: () => this.toastr.error('Failed to reset layout', 'Error')
    });
  }

  onPreview(): void {
    // Trigger preview logic — emit event or open modal as needed
    this.toastr.info('Preview not yet implemented', 'Preview');
  }

  onSaveAllocation(): void {
    if (this.sourceForm.invalid || this.targetForm.invalid) {
      this.sourceForm.markAllAsTouched();
      this.targetForm.markAllAsTouched();
      return;
    }

    const source = this.sourceForm.getRawValue();
    const target = this.targetForm.getRawValue();

    const payload: BossAssaign = {
      boxId: source.boxId,
      blockIdLayout: target.blockId,
      archIdLayout: target.archId,
      lineIdLayout: target.lineId,
      boxIdLayout: target.boxId,
      controlName: target.controlName
    };

    this.boxService.assignLayout(payload).subscribe({
      next: (res) => {
        if (res.success) {
          this.toastr.success('Layout allocated successfully', 'Success');
          this.resetSourceForm();
          this.targetForm.reset();
        } else {
          this.toastr.error(res.message, 'Error');
        }
      },
      error: (err) => this.errorHandler.handleErrorWithToster(err)
    });
  }
}