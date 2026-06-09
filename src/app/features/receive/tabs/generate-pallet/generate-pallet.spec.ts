import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { ToastrService } from 'ngx-toastr';

import { GeneratePallet } from './generate-pallet';
import { StorageService } from '../../../../core/services/storage.service';
import { PalleteGenerateService } from '../../../../core/services/receiveServices/pallete-generate-service';
import { ErrorHandlerService } from '../../../../core/services/error-handler.service';

describe('GeneratePallet', () => {
  let component: GeneratePallet;
  let fixture: ComponentFixture<GeneratePallet>;

  const toastrMock = {
    success: () => {},
    error: () => {},
    warning: () => {},
    info: () => {},
  };

  const storageMock = {
    getAngularItem: () => [
      {
        name: 'RECEIVE_MODULE',
        url: '/receive',
        children: [
          {
            name: 'GENERATE_PALLET',
            url: '/pallet-generate',
            canView: true,
            canCreate: true,
            canUpdate: true,
            canDelete: true,
          },
        ],
      },
    ],
  };

  const palletServiceMock = {
    getPalletGenerateList: () => of({ success: true, data: [], message: '', errors: null, errorCode: null, traceId: null }),
    generatePallet: () => of({ success: true, data: null, message: '', errors: null, errorCode: null, traceId: null }),
    searchPalletRecords: () => of({ success: true, data: [], message: '', errors: null, errorCode: null, traceId: null }),
    deletePalletRecord: () => of({ success: true, data: null, message: '', errors: null, errorCode: null, traceId: null }),
    printPallet: () => of(new Blob()),
    reprintPallet: () => of(new Blob()),
  };

  const errorHandlerMock = {
    handleErrorWithToster: () => {},
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GeneratePallet],
      providers: [
        { provide: ToastrService, useValue: toastrMock },
        { provide: StorageService, useValue: storageMock },
        { provide: PalleteGenerateService, useValue: palletServiceMock },
        { provide: ErrorHandlerService, useValue: errorHandlerMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(GeneratePallet);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

