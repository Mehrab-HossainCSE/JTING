import { TestBed } from '@angular/core/testing';
import { DeliveryReport } from './delivery-report';

describe('DeliveryReport', () => {
  let component: DeliveryReport;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DeliveryReport]
    }).compileComponents();

    const fixture = TestBed.createComponent(DeliveryReport);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
