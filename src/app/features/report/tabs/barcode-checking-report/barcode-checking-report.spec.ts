import { TestBed } from '@angular/core/testing';
import { BarcodeCheckingReport } from './barcode-checking-report';

describe('BarcodeCheckingReport', () => {
  let component: BarcodeCheckingReport;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BarcodeCheckingReport]
    }).compileComponents();

    const fixture = TestBed.createComponent(BarcodeCheckingReport);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
