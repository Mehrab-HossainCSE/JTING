import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Reconciliation } from './reconciliation';
import { ToastrService } from 'ngx-toastr';
import { StorageService } from '../../../../core/services/storage.service';

describe('Reconciliation', () => {
  let component: Reconciliation;
  let fixture: ComponentFixture<Reconciliation>;

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
      imports: [Reconciliation],
      providers: [
        { provide: ToastrService, useValue: toastrMock },
        { provide: StorageService, useValue: storageMock }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(Reconciliation);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

