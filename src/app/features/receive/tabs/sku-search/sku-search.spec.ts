import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SkuSearch } from './sku-search';
import { ToastrService } from 'ngx-toastr';
import { StorageService } from '../../../../core/services/storage.service';

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

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SkuSearch],
      providers: [
        { provide: ToastrService, useValue: toastrMock },
        { provide: StorageService, useValue: storageMock }
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

