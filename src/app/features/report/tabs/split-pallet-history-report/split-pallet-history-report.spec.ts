import { TestBed } from '@angular/core/testing';
import { SplitPalletHistoryReport } from './split-pallet-history-report';

describe('SplitPalletHistoryReport', () => {
  let component: SplitPalletHistoryReport;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SplitPalletHistoryReport]
    }).compileComponents();

    const fixture = TestBed.createComponent(SplitPalletHistoryReport);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
