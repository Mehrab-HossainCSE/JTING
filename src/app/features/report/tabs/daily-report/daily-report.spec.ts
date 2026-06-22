import { TestBed } from '@angular/core/testing';
import { DailyReport } from './daily-report';

describe('DailyReport', () => {
  let component: DailyReport;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DailyReport]
    }).compileComponents();

    const fixture = TestBed.createComponent(DailyReport);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
