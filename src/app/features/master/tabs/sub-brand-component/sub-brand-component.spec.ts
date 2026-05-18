import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SubBrandComponent } from './sub-brand-component';

describe('SubBrandComponent', () => {
  let component: SubBrandComponent;
  let fixture: ComponentFixture<SubBrandComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SubBrandComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(SubBrandComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
