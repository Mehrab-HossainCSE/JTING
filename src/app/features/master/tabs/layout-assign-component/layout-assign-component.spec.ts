import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LayoutAssignComponent } from './layout-assign-component';

describe('LayoutAssignComponent', () => {
  let component: LayoutAssignComponent;
  let fixture: ComponentFixture<LayoutAssignComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LayoutAssignComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(LayoutAssignComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
