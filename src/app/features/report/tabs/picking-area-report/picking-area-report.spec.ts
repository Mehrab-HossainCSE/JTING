import { TestBed } from '@angular/core/testing';
import { PickingAreaReport } from './picking-area-report';

describe('PickingAreaReport', () => {
  let component: PickingAreaReport;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PickingAreaReport]
    }).compileComponents();

    const fixture = TestBed.createComponent(PickingAreaReport);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
