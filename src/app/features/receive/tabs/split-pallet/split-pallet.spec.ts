import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { ToastrService } from 'ngx-toastr';

import { SplitPallet } from './split-pallet';
import { ErrorHandlerService } from '../../../../core/services/error-handler.service';
import { BlockService } from '../../../../core/services/setupServices/block-service';
import { ArchService } from '../../../../core/services/setupServices/arch-service';
import { LineService } from '../../../../core/services/setupServices/line-service';
import { BoxService } from '../../../../core/services/setupServices/box-service';
import { PalleteGenerateService } from '../../../../core/services/receiveServices/pallete-generate-service';

describe('SplitPallet', () => {
  let component: SplitPallet;
  let fixture: ComponentFixture<SplitPallet>;

  const httpClientMock = {};
  const toastrMock = {
    success: () => {},
    error: () => {},
    warning: () => {},
    info: () => {},
  };
  const errorHandlerMock = {
    handleErrorWithToster: () => {},
  };

  const blockServiceMock = {
    getAll: () => of({ success: true, data: [], message: '', errors: null, errorCode: null, traceId: null }),
  };
  const archServiceMock = {
    getByBlockId: () => of({ success: true, data: [], message: '', errors: null, errorCode: null, traceId: null }),
  };
  const lineServiceMock = {
    getByArchId: () => of({ success: true, data: [], message: '', errors: null, errorCode: null, traceId: null }),
  };
  const boxServiceMock = {
    getByLineId: () => of({ success: true, data: [], message: '', errors: null, errorCode: null, traceId: null }),
  };
  const palletGenerateServiceMock = {
    reprintPallet: () => of(new Blob()),
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SplitPallet],
      providers: [
        { provide: HttpClient, useValue: httpClientMock },
        { provide: ToastrService, useValue: toastrMock },
        { provide: ErrorHandlerService, useValue: errorHandlerMock },
        { provide: BlockService, useValue: blockServiceMock },
        { provide: ArchService, useValue: archServiceMock },
        { provide: LineService, useValue: lineServiceMock },
        { provide: BoxService, useValue: boxServiceMock },
        { provide: PalleteGenerateService, useValue: palletGenerateServiceMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(SplitPallet);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
