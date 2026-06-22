import { TestBed } from '@angular/core/testing';
import { PalletInformationReport } from './pallet-information-report';

describe('PalletInformationReport', () => {
  let component: PalletInformationReport;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PalletInformationReport]
    }).compileComponents();

    const fixture = TestBed.createComponent(PalletInformationReport);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
