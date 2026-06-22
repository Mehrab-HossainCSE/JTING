import { TestBed } from '@angular/core/testing';
import { PickingReport } from './picking-report';

describe('PickingReport', () => {
  let component: PickingReport;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PickingReport]
    }).compileComponents();

    const fixture = TestBed.createComponent(PickingReport);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
