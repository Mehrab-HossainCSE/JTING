import { TestBed } from '@angular/core/testing';
import { QuarantineReport } from './quarantine-report';

describe('QuarantineReport', () => {
  let component: QuarantineReport;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [QuarantineReport]
    }).compileComponents();

    const fixture = TestBed.createComponent(QuarantineReport);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
