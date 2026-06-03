import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AutoReceive } from './auto-receive';

describe('AutoReceive', () => {
  let component: AutoReceive;
  let fixture: ComponentFixture<AutoReceive>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AutoReceive],
    }).compileComponents();

    fixture = TestBed.createComponent(AutoReceive);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
