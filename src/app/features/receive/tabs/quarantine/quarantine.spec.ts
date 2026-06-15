import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Quarantine } from './quarantine';
import { ToastrService } from 'ngx-toastr';
import { StorageService } from '../../../../core/services/storage.service';
import { of } from 'rxjs';
import { SkuService } from '../../../../core/services/skuServices/sku-service';
import { BlockService } from '../../../../core/services/setupServices/block-service';
import { ArchService } from '../../../../core/services/setupServices/arch-service';
import { LineService } from '../../../../core/services/setupServices/line-service';
import { QuarantineService } from '../../../../core/services/receiveServices/quarantine-service';
import { ErrorHandlerService } from '../../../../core/services/error-handler.service';

describe('Quarantine', () => {
  let component: Quarantine;
  let fixture: ComponentFixture<Quarantine>;

  const toastrMock = {
    success: () => {},
    error: () => {},
    warning: () => {},
    info: () => {}
  };

  const storageMock = {
    getAngularItem: () => []
  };

  const skuServiceMock = {
    getSKUWithOutESL: () => of({ success: true, data: [] })
  };

  const blockServiceMock = {
    getAllBySkuCode: () => of({ success: true, data: [] })
  };

  const archServiceMock = {
    getAllByBlockAndSku: () => of({ success: true, data: [] })
  };

  const lineServiceMock = {
    getAllByArch: () => of({ success: true, data: [] })
  };

  const quarantineServiceMock = {
    getSkuAndLineWiseLocation: () => of({ success: true, data: [] }),
    setLocationQuarantine: () => of({ success: true, data: null }),
    getQuarantineByDate: () => of({ success: true, data: [] }),
    getQuarantineDetailsData: () => of({ success: true, data: [] }),
    unQuarantine: () => of({ success: true, data: null })
  };

  const errorHandlerMock = {
    handleErrorWithToster: () => {}
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Quarantine],
      providers: [
        { provide: ToastrService, useValue: toastrMock },
        { provide: StorageService, useValue: storageMock },
        { provide: SkuService, useValue: skuServiceMock },
        { provide: BlockService, useValue: blockServiceMock },
        { provide: ArchService, useValue: archServiceMock },
        { provide: LineService, useValue: lineServiceMock },
        { provide: QuarantineService, useValue: quarantineServiceMock },
        { provide: ErrorHandlerService, useValue: errorHandlerMock }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(Quarantine);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
