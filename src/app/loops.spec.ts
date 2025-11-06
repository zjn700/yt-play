import { TestBed } from '@angular/core/testing';

import { Loops } from './loops';

describe('Loops', () => {
  let service: Loops;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Loops);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
