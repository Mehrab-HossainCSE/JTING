import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import { vi } from 'vitest';

import { Complete } from './complete';
import { PickingService } from '../../../../../../core/services/pickingServices/picking-service';
import { ErrorHandlerService } from '../../../../../../core/services/error-handler.service';


describe('Complete Component', () => {
  let component: Complete;
  let fixture: ComponentFixture<Complete>;

  const toastrMock = {
    success: vi.fn(),
    error: vi.fn(),
    warning: vi.fn(),
    info: vi.fn(),
  };

  const pickingServiceMock = {
    getCompleteList: vi.fn().mockReturnValue(of({
      success: true,
      message: 'Success',
      data: [
        {
          pickingNo: 'PK-2026-001',
          createDate: '2026-06-16T00:00:00Z',
          fullPaletQty: 12,
          palletQty: 12,
          qty: 24,
          palletNo: 'PLT-55',
          batchNo: 'B-001',
          rcvDate: '2026-06-10T00:00:00Z',
          skuname: 'Item Alpha Premium',
          controlName: 'A-10-B',
          pickerName: 'Mr. ms'
        }
      ],
      errors: null,
      errorCode: null,
      traceId: null
    })),
    getDetails: vi.fn().mockReturnValue(of({
      success: true,
      message: 'Success',
      data: [
        {
          pickingNo: 'PK-2026-001',
          createDate: '2026-06-16T00:00:00Z',
          fullPaletQty: 12,
          palletQty: 12,
          qty: 24,
          palletNo: 'PLT-55',
          batchNo: 'B-001',
          rcvDate: '2026-06-10T00:00:00Z',
          skuname: 'Item Alpha Premium',
          controlName: 'A-10-B',
          pickerName: 'Mr. ms'
        }
      ],
      errors: null,
      errorCode: null,
      traceId: null
    }))
  };

  const errorHandlerMock = {
    handleErrorWithToster: vi.fn(),
  };

  beforeEach(async () => {
    vi.clearAllMocks();

    await TestBed.configureTestingModule({
      imports: [Complete],
      providers: [
        { provide: ToastrService, useValue: toastrMock },
        { provide: PickingService, useValue: pickingServiceMock },
        { provide: ErrorHandlerService, useValue: errorHandlerMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(Complete);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should call getCompleteList on init and leave selection empty', () => {
    expect(pickingServiceMock.getCompleteList).toHaveBeenCalled();
    expect(component.masterList().length).toBe(1);
    expect(component.masterList()[0].pickingId).toBe('PK-2026-001');
    expect(component.selectedRowKey()).toBeNull();
    expect(component.selectedPickingNo()).toBeNull();
    expect(component.detailsList().length).toBe(0);
    expect(pickingServiceMock.getDetails).not.toHaveBeenCalled();
  });

  it('should reload data on manual search', () => {
    component.fromDate.set('2026-06-01');
    component.toDate.set('2026-06-30');
    component.onSearch();
    expect(pickingServiceMock.getCompleteList).toHaveBeenCalledWith('2026-06-01', '2026-06-30');
  });

  it('should load details when onSelectPicking is called', () => {
    const mockMaster = component.masterList()[0];
    component.onSelectPicking(mockMaster);
    expect(pickingServiceMock.getDetails).toHaveBeenCalledWith('PK-2026-001');
    expect(component.selectedRowKey()).toBe(mockMaster.uniqueKey);
    expect(component.selectedPickingNo()).toBe('PK-2026-001');
    expect(component.detailsList()[0].batch).toBe('B-001');
    expect(component.detailsList()[0].skuDescription).toBe('Item Alpha Premium');
  });

  it('should show toastr warning and clear details if pickingNo is null', () => {
    const nullMaster = {
      pickingId: '',
      pickingDate: '2026-06-16',
      fullPallet: 10,
      uniqueKey: 'row_1',
      originalItem: {
        pickingNo: '',
        batchNo: 'B-002',
        rcvDate: '2026-06-10',
        skuname: 'Item Beta',
        palletNo: 'PLT-56',
        controlName: 'A-10-C',
        qty: 12,
        pickerName: 'Test'
      } as any
    };

    component.onSelectPicking(nullMaster);
    expect(toastrMock.warning).toHaveBeenCalledWith('Picking No is null.', 'Warning');
    expect(component.detailsList().length).toBe(0);
  });

  it('should call toastr success and window.print on print', () => {
    const printSpy = vi.spyOn(window, 'print').mockImplementation(() => {});
    component.selectedPickingNo.set('PK-2026-001');
    component.onPrint();
    expect(toastrMock.success).toHaveBeenCalledWith('Printing picking log for: PK-2026-001', 'Print Success');
    expect(printSpy).toHaveBeenCalled();
    printSpy.mockRestore();
  });
});
