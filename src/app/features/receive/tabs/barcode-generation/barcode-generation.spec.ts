import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BarcodeGeneration } from './barcode-generation';
import { ToastrService } from 'ngx-toastr';
import { StorageService } from '../../../../core/services/storage.service';

describe('BarcodeGeneration', () => {
  let component: BarcodeGeneration;
  let fixture: ComponentFixture<BarcodeGeneration>;

  const toastrMock = {
    success: () => {},
    error: () => {},
    warning: () => {},
    info: () => {}
  };

  const storageMock = {
    getAngularItem: () => []
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BarcodeGeneration],
      providers: [
        { provide: ToastrService, useValue: toastrMock },
        { provide: StorageService, useValue: storageMock }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(BarcodeGeneration);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

