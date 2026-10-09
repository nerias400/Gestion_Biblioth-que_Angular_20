
import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';

import type {
  Author,
  AuthorInput,
  Book,
  BookInput,
  LibraryUser,
  UserInput,
  Loan,
  LoanInput
} from '../models/library.models';

@Injectable({
  providedIn: 'root'
})
export class LibraryApiService {

  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.apiBaseUrl;

  // =========================
  // AUTEURS
  // =========================

  listAuthors(): Observable<Author[]> {
    return this.http.get<Author[]>(this.endpoint('authors'));
  }

  getAuthor(id: number): Observable<Author> {
    return this.http.get<Author>(this.endpoint('authors', id));
  }

  createAuthor(author: AuthorInput): Observable<Author> {
    return this.http.post<Author>(this.endpoint('authors'), author);
  }

  updateAuthor(id: number, author: AuthorInput): Observable<Author> {
    return this.http.put<Author>(this.endpoint('authors', id), author);
  }

  deleteAuthor(id: number): Observable<void> {
    return this.http.delete<void>(this.endpoint('authors', id));
  }

  // =========================
  // LIVRES
  // =========================

  listBooks(): Observable<Book[]> {
    return this.http.get<Book[]>(this.endpoint('books'));
  }

  getBook(id: number): Observable<Book> {
    return this.http.get<Book>(this.endpoint('books', id));
  }

  createBook(book: BookInput): Observable<Book> {
    return this.http.post<Book>(this.endpoint('books'), book);
  }

  updateBook(id: number, book: BookInput): Observable<Book> {
    return this.http.put<Book>(this.endpoint('books', id), book);
  }

  deleteBook(id: number): Observable<void> {
    return this.http.delete<void>(this.endpoint('books', id));
  }

  // =========================
  // UTILISATEURS
  // =========================

  listUsers(): Observable<LibraryUser[]> {
    return this.http.get<LibraryUser[]>(this.endpoint('users'));
  }

  getUser(id: number): Observable<LibraryUser> {
    return this.http.get<LibraryUser>(this.endpoint('users', id));
  }

  createUser(user: UserInput): Observable<LibraryUser> {
    return this.http.post<LibraryUser>(this.endpoint('users'), user);
  }

  updateUser(id: number, user: UserInput): Observable<LibraryUser> {
    return this.http.put<LibraryUser>(this.endpoint('users', id), user);
  }

  deleteUser(id: number): Observable<void> {
    return this.http.delete<void>(this.endpoint('users', id));
  }

  // =========================
  // EMPRUNTS
  // =========================

  listLoans(): Observable<Loan[]> {
    return this.http.get<Loan[]>(this.endpoint('loans'));
  }

  getLoan(id: number): Observable<Loan> {
    return this.http.get<Loan>(this.endpoint('loans', id));
  }

  createLoan(loan: LoanInput): Observable<Loan> {
    return this.http.post<Loan>(this.endpoint('loans'), loan);
  }

  listLoansByUser(userId: number): Observable<Loan[]> {
    return this.http.get<Loan[]>(
      this.endpoint(`loans/user/${userId}`)
    );
  }

  listLoansByBook(bookId: number): Observable<Loan[]> {
    return this.http.get<Loan[]>(
      this.endpoint(`loans/book/${bookId}`)
    );
  }

  returnBook(loanId: number): Observable<Loan> {
    return this.http.put<Loan>(
      this.endpoint(`loans/${loanId}/return`),
      {}
    );
  }

  // =========================
  // CONSTRUCTION DES URL
  // =========================

  private endpoint(resource: string, id?: number): string {
    const collectionUrl = `${this.baseUrl}/${resource}`;

    return id === undefined
      ? collectionUrl
      : `${collectionUrl}/${id}`;
  }
}
