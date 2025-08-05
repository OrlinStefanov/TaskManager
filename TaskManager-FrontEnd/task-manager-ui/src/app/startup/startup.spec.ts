import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Startup } from './startup';

describe('Startup', () => {
  let component: Startup;
  let fixture: ComponentFixture<Startup>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Startup]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Startup);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
