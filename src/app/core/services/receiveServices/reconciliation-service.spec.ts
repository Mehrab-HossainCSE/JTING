import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ReconciliationService } from './reconciliation-service';
import { environment } from '../../../../environments/environment';
import { ReceiveReconciliationRequest } from '../../models/receives/reconciliation/reconciliation';

describe('ReconciliationService', () => {
  let service: ReconciliationService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [ReconciliationService]
    });
    service = TestBed.inject(ReconciliationService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should call receiveExcelFileReader and post data', () => {
    const mockFile = new File([''], 'test.xlsx');
    const dummyResponse = { success: true, message: 'Uploaded', data: null, errors: null, errorCode: null, traceId: null };

    const req = httpMock.expectOne(`${environment.apiUrl}/Reconciliation/ReceiveExcellFileReader`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body instanceof FormData).toBe(true);
    req.flush(dummyResponse);
  });

  it('should call receiveReconciliation and post data', () => {
    const dummyResponse = { success: true, message: 'Saved', data: null, errors: null, errorCode: null, traceId: null };
    const payload: ReceiveReconciliationRequest = {
      listReceive: [],
      settingQty: '0',
      shift: 'string',
      dateFrom: 'string',
      dateTo: 'string',
      reconcilationNo: 'string',
      userName: 'string'
    };

    service.receiveReconciliation(payload).subscribe(res => {
      expect(res.success).toBe(true);
      expect(res.message).toBe('Saved');
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/Reconciliation/ReceiveReconciliation`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(payload);
    req.flush(dummyResponse);
  });
});
