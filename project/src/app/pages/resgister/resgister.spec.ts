import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Resgister } from './resgister';

describe('Resgister', () => {
  let component: Resgister;
  let fixture: ComponentFixture<Resgister>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Resgister],
    }).compileComponents();

    fixture = TestBed.createComponent(Resgister);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
