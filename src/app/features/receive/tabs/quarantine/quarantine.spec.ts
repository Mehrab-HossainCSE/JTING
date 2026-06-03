import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Quarantine } from './quarantine';
import { ToastrService } from 'ngx-toastr';
import { StorageService } from '../../../../core/services/storage.service';

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

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Quarantine],
      providers: [
        { provide: ToastrService, useValue: toastrMock },
        { provide: StorageService, useValue: storageMock }
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
