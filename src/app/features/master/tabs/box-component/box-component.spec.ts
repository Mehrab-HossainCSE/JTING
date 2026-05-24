import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BoxComponent } from './box-component';

describe('BoxComponent', () => {
  let component: BoxComponent;
  let fixture: ComponentFixture<BoxComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BoxComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(BoxComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
