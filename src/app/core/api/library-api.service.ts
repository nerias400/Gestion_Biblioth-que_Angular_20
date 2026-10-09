import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import type { Book, Client, Loan } from '../models/library.models';

@Injectable({ providedIn: 'root' })
export class LibraryApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.apiBaseUrl;

  listClients(): Observable<Client[]> {
    return this.http.get<Client[]>(this.endpoint('clients'));
  }

  createClient(client: Omit<Client, 'userId'>): Observable<Client> {
    return this.http.post<Client>(this.endpoint('clients'), client);
  }

  updateClient(userId: number, client: Partial<Client>): Observable<Client> {
    return this.http.put<Client>(this.endpoint('clients', userId), client);
  }

  deleteClient(userId: number): Observable<void> {
    return this.http.delete<void>(this.endpoint('clients', userId));
  }

  listBooks(): Observable<Book[]> {
    return this.http.get<Book[]>(this.endpoint('books'));
  }

  createBook(book: Omit<Book, 'id'>): Observable<Book> {
    return this.http.post<Book>(this.endpoint('books'), book);
  }

  updateBook(id: number, book: Partial<Book>): Observable<Book> {
    return this.http.put<Book>(this.endpoint('books', id), book);
  }

  deleteBook(id: number): Observable<void> {
    return this.http.delete<void>(this.endpoint('books', id));
  }

  listLoans(): Observable<Loan[]> {
    return this.http.get<Loan[]>(this.endpoint('loans'));
  }

  createLoan(loan: Omit<Loan, 'id'>): Observable<Loan> {
    return this.http.post<Loan>(this.endpoint('loans'), loan);
  }

  updateLoan(id: number, loan: Partial<Loan>): Observable<Loan> {
    return this.http.put<Loan>(this.endpoint('loans', id), loan);
  }

  deleteLoan(id: number): Observable<void> {
    return this.http.delete<void>(this.endpoint('loans', id));
  }

  private endpoint(resource: 'clients' | 'books' | 'loans', id?: number): string {
    const collectionUrl = `${this.baseUrl}/${resource}`;
    return id === undefined ? collectionUrl : `${collectionUrl}/${id}`;
  }
}
