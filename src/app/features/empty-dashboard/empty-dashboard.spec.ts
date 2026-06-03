import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmptyDashboard } from './empty-dashboard';

describe('EmptyDashboard', () => {
  let component: EmptyDashboard;
  let fixture: ComponentFixture<EmptyDashboard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EmptyDashboard],
    }).compileComponents();

    fixture = TestBed.createComponent(EmptyDashboard);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
