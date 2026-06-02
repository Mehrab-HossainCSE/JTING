import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Quarantine } from './quarantine';

describe('Quarantine', () => {
  let component: Quarantine;
  let fixture: ComponentFixture<Quarantine>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Quarantine],
    }).compileComponents();

    fixture = TestBed.createComponent(Quarantine);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
