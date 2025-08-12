import { TestBed } from '@angular/core/testing';

import { Helper } from './helper';

describe('Helper', () => {
  let service: Helper;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Helper);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
