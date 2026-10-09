import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { LibraryApiService } from './library-api.service';

describe('LibraryApiService', () => {
  let api: LibraryApiService;
  let httpTesting: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()]
    });
    api = TestBed.inject(LibraryApiService);
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpTesting.verify());

  it('uses the configured REST collection endpoints', () => {
    api.listClients().subscribe();
    api.listBooks().subscribe();
    api.listLoans().subscribe();

    expect(httpTesting.expectOne('http://localhost:8080/api/clients').request.method).toBe('GET');
    expect(httpTesting.expectOne('http://localhost:8080/api/books').request.method).toBe('GET');
    expect(httpTesting.expectOne('http://localhost:8080/api/loans').request.method).toBe('GET');
  });
});
