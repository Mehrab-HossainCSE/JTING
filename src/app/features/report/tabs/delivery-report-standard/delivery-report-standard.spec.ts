import { TestBed } from '@angular/core/testing';
import { DeliveryReportStandard } from './delivery-report-standard';

describe('DeliveryReportStandard', () => {
  let component: DeliveryReportStandard;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DeliveryReportStandard]
    }).compileComponents();

    const fixture = TestBed.createComponent(DeliveryReportStandard);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
