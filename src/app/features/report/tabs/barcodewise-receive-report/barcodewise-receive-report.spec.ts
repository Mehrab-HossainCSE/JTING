import { TestBed } from '@angular/core/testing';
import { BarcodewiseReceiveReport } from './barcodewise-receive-report';

describe('BarcodewiseReceiveReport', () => {
  let component: BarcodewiseReceiveReport;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BarcodewiseReceiveReport]
    }).compileComponents();

    const fixture = TestBed.createComponent(BarcodewiseReceiveReport);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
