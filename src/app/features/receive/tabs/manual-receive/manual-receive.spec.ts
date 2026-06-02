import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManualReceive } from './manual-receive';

describe('ManualReceive', () => {
  let component: ManualReceive;
  let fixture: ComponentFixture<ManualReceive>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ManualReceive],
    }).compileComponents();

    fixture = TestBed.createComponent(ManualReceive);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
