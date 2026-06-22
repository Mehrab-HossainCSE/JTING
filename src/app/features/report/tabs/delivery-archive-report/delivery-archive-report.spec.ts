import { TestBed } from '@angular/core/testing';
import { DeliveryArchiveReport } from './delivery-archive-report';

describe('DeliveryArchiveReport', () => {
  let component: DeliveryArchiveReport;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DeliveryArchiveReport]
    }).compileComponents();

    const fixture = TestBed.createComponent(DeliveryArchiveReport);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
