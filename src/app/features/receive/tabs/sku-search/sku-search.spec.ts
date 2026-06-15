import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SkuSearch } from './sku-search';
import { ToastrService } from 'ngx-toastr';
import { StorageService } from '../../../../core/services/storage.service';
import { of } from 'rxjs';
import { BlockService } from '../../../../core/services/setupServices/block-service';
import { ArchService } from '../../../../core/services/setupServices/arch-service';
import { LineService } from '../../../../core/services/setupServices/line-service';
import { SkuService } from '../../../../core/services/skuServices/sku-service';
import { ErrorHandlerService } from '../../../../core/services/error-handler.service';

describe('SkuSearch', () => {
  let component: SkuSearch;
  let fixture: ComponentFixture<SkuSearch>;

  const toastrMock = {
    success: () => {},
    error: () => {},
    warning: () => {},
    info: () => {}
  };

  const storageMock = {
    getAngularItem: () => []
  };

  const blockServiceMock = {
    getAll: () => of({ success: true, data: [] })
  };

  const archServiceMock = {
    getByBlockId: () => of({ success: true, data: [] })
  };

  const lineServiceMock = {
    getByArchId: () => of({ success: true, data: [] })
  };

  const skuServiceMock = {
    getAll: () => of({ success: true, data: [] }),
    getSetting: () => of({ success: true, data: [] }),
    getSkuBySearchData: () => of({ success: true, data: [] })
  };

  const errorHandlerMock = {
    handleErrorWithToster: () => {}
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SkuSearch],
      providers: [
        { provide: ToastrService, useValue: toastrMock },
        { provide: StorageService, useValue: storageMock },
        { provide: BlockService, useValue: blockServiceMock },
        { provide: ArchService, useValue: archServiceMock },
        { provide: LineService, useValue: lineServiceMock },
        { provide: SkuService, useValue: skuServiceMock },
        { provide: ErrorHandlerService, useValue: errorHandlerMock }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(SkuSearch);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

