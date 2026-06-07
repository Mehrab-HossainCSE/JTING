import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ProductReceiveService } from './product-receive-service';

describe('ProductReceiveService', () => {
  let service: ProductReceiveService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [ProductReceiveService]
    });
    service = TestBed.inject(ProductReceiveService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
