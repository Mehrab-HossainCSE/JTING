import { TestBed } from '@angular/core/testing';
import { ReceiveReport } from './receive-report';

describe('ReceiveReport', () => {
  let component: ReceiveReport;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReceiveReport]
    }).compileComponents();

    const fixture = TestBed.createComponent(ReceiveReport);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
