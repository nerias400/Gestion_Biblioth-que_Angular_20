
import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/auth/auth.service';
import { LibraryApiService } from '../../../core/api/library-api.service';

import type {
  Author,
  AuthorInput,
  Book,
  BookInput,
  LibraryUser,
  UserInput,
  Loan,
  LoanInput
} from '../../../core/models/library.models';

import { BookTable } from './book-table';
import { LoanTable } from './loan-table';
import { AuthorTable } from './author-table';
import { Sidebar, DashboardSection } from './sidebar';
import { StatisticsSection } from './statistics-section';
import { UserTable, RowAction } from './user-table';
import { RecordDialog, RecordField } from './record-dialog';

type EntityType = 'clients' | 'authors' | 'books' | 'loans';
type DialogMode = 'details' | 'edit' | 'create' | 'confirm';
type DashboardRecord = LibraryUser | Author | Book | Loan;

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    RouterLink,
    Sidebar,
    StatisticsSection,
    UserTable,
    BookTable,
    LoanTable,
    RecordDialog,
    AuthorTable
  ],
  templateUrl: './dashboard.html'
})
export class Dashboard implements OnInit, OnDestroy {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly api = inject(LibraryApiService);

  readonly userEmail = this.authService.userEmail;

  readonly todayLabel = new Intl.DateTimeFormat('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  }).format(new Date());

  activeSection: DashboardSection = 'clients';
  dialogMode: DialogMode | null = null;
  selectedRecord: DashboardRecord | null = null;
  selectedEntity: EntityType | null = null;
  dialogValues: Record<string, string | number> = {};
  toastMessage = '';
  logoutConfirmation = false;
  loading = false;

  clients: LibraryUser[] = [];
  authors: Author[] = [];
  books: Book[] = [];
  loans: Loan[] = [];

  private toastTimer: ReturnType<typeof setTimeout> | undefined;

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.loading = true;

    let completed = 0;
    const finishRequest = (): void => {
      completed++;
      if (completed === 4) {
        this.loading = false;
      }
    };

    this.api.listUsers().subscribe({
      next: users => {
        this.clients = users;
        finishRequest();
      },
      error: error => {
        this.handleApiError(error, 'Impossible de charger les utilisateurs.');
        finishRequest();
      }
    });

    this.api.listAuthors().subscribe({
      next: authors => {
        this.authors = authors;
        finishRequest();
      },
      error: error => {
        this.handleApiError(error, 'Impossible de charger les auteurs.');
        finishRequest();
      }
    });

    this.api.listBooks().subscribe({
      next: books => {
        this.books = books;
        finishRequest();
      },
      error: error => {
        this.handleApiError(error, 'Impossible de charger les livres.');
        finishRequest();
      }
    });

    this.api.listLoans().subscribe({
      next: loans => {
        this.loans = loans;
        finishRequest();
      },
      error: error => {
        this.handleApiError(error, 'Impossible de charger les emprunts.');
        finishRequest();
      }
    });
  }

  get activeLoansCount(): number {
    return this.loans.filter(loan => loan.returnDate === null).length;
  }

  get overdueLoansCount(): number {
    const today = this.localDateString();

    return this.loans.filter(loan =>
      loan.returnDate === null && loan.endDate < today
    ).length;
  }

  // Le backend ne gère pas encore les quantités en stock.
  // Cette statistique ne peut donc pas être calculée correctement.
  get lowStockBooksCount(): number {
    return 0;
  }

  sectionTabClass(section: DashboardSection): string {
    const base =
      'rounded-lg px-3 py-1.5 text-[11px] font-semibold transition focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-1';

    return this.activeSection === section
      ? `${base} bg-white text-violet-900 shadow-sm`
      : `${base} text-slate-500 hover:bg-white/70 hover:text-slate-900`;
  }

  get dialogTitle(): string {
    const entityName = this.entityLabel(this.selectedEntity);

    if (this.dialogMode === 'confirm') {
      return `Supprimer ${entityName.toLowerCase()} ?`;
    }
    if (this.dialogMode === 'edit') {
      return `Modifier ${entityName.toLowerCase()}`;
    }
    if (this.dialogMode === 'create') {
      return `Ajouter ${entityName.toLowerCase()}`;
    }

    return `Détails ${entityName.toLowerCase()}`;
  }

  get dialogFields(): RecordField[] {
    const readOnly = this.dialogMode === 'details';
    const fields: RecordField[] = [];

    switch (this.selectedEntity) {
      case 'clients':
        fields.push(
          { key: 'id', label: 'Identifiant utilisateur', type: 'number', editable: false },
          { key: 'firstName', label: 'Prénom', type: 'text', required: true },
          { key: 'lastName', label: 'Nom', type: 'text', required: true },
          { key: 'email', label: 'E-mail', type: 'email', required: true },
          { key: 'contact', label: 'Contact', type: 'tel' },
          {
            key: 'type',
            label: 'Type de compte',
            type: 'select',
            options: [
              { value: 'CLIENT', label: 'Client' },
              { value: 'GESTIONNAIRE', label: 'Gestionnaire' }
            ],
            required: true
          }
        );

        if (this.dialogMode === 'create') {
          fields.push({
            key: 'password',
            label: 'Mot de passe (gestionnaire uniquement)',
            type: 'password'
          });
        }
        break;

      case 'authors':
        fields.push(
          { key: 'id', label: 'Identifiant auteur', type: 'number', editable: false },
          { key: 'name', label: 'Nom de l’auteur', type: 'text', required: true },
          { key: 'birthdate', label: 'Date de naissance', type: 'date', required: true }
        );
        break;

      case 'books':
        fields.push(
          { key: 'id', label: 'Identifiant du livre', type: 'number', editable: false },
          { key: 'name', label: 'Titre du livre', type: 'text', required: true },
          { key: 'isbn', label: 'ISBN', type: 'text', required: true },
          {
            key: 'authorId',
            label: 'Auteur',
            type: 'select',
            options: this.authors.map(author => ({
              value: String(author.id),
              label: author.name
            })),
            required: true
          },
          { key: 'description', label: 'Description', type: 'textarea' },
          { key: 'year', label: 'Année de publication', type: 'number' },
          { key: 'pages', label: 'Nombre de pages', type: 'number' },
          { key: 'image', label: 'URL de l’image', type: 'url' }
        );
        break;

      case 'loans':
        if (this.dialogMode === 'create') {
          fields.push(
            {
              key: 'userId',
              label: 'Utilisateur',
              type: 'select',
              options: this.clients.map(user => ({
                value: String(user.id),
                label: `${user.firstName} ${user.lastName}`
              })),
              required: true
            },
            {
              key: 'bookId',
              label: 'Livre',
              type: 'select',
              options: this.books.map(book => ({
                value: String(book.id),
                label: book.name
              })),
              required: true
            }
          );
        } else {
          fields.push(
            { key: 'id', label: 'Identifiant du prêt', type: 'number', editable: false },
            { key: 'userId', label: 'Identifiant utilisateur', type: 'number', editable: false },
            { key: 'bookId', label: 'Identifiant du livre', type: 'number', editable: false },
            { key: 'requestDate', label: 'Date de prêt', type: 'date', editable: false },
            { key: 'endDate', label: 'Date limite de retour', type: 'date', editable: false },
            { key: 'returnDate', label: 'Date de retour effectif', type: 'date', editable: false },
            { key: 'penalty', label: 'Pénalité (FCFA)', type: 'number', editable: false }
          );
        }
        break;
    }

    return readOnly
      ? fields.map(field => ({ ...field, editable: false }))
      : fields.filter(field => field.editable !== false);
  }

  get dialogDescription(): string {
    if (this.dialogMode === 'confirm') {
      return 'Cette action sera appliquée aux données enregistrées.';
    }

    if (this.selectedEntity === 'loans' && this.dialogMode === 'create') {
      return 'La date de prêt, la date limite et la pénalité initiale seront calculées par le serveur.';
    }

    return '';
  }

  clientName(userId: number): string {
    const user = this.clients.find(item => item.id === userId);
    return user ? `${user.firstName} ${user.lastName}` : `Utilisateur #${userId}`;
  }

  bookTitle(bookId: number): string {
    return this.books.find(item => item.id === bookId)?.name ?? `Livre #${bookId}`;
  }

  authorName(authorId: number): string {
    return this.authors.find(item => item.id === authorId)?.name ?? `Auteur #${authorId}`;
  }

  loanStatus(loan: Loan): 'En cours' | 'En retard' | 'Retourné' {
    if (loan.returnDate !== null) {
      return 'Retourné';
    }

    return loan.endDate < this.localDateString() ? 'En retard' : 'En cours';
  }

  openDialog(
    entity: EntityType,
    mode: DialogMode,
    record: DashboardRecord
  ): void {
    this.selectedEntity = entity;
    this.selectedRecord = record;
    this.dialogValues = Object.fromEntries(
      Object.entries(record).map(([key, value]) => [
        key,
        value === null || value === undefined ? '' : String(value)
      ])
    );
    this.dialogMode = mode;
  }

  openCreateDialog(entity: EntityType): void {
    if (entity === 'loans' && (!this.clients.length || !this.books.length)) {
      this.showToast('Ajoutez au moins un utilisateur et un livre avant de créer un prêt.');
      return;
    }

    if (entity === 'books' && !this.authors.length) {
      this.showToast('Ajoutez au moins un auteur avant de créer un livre.');
      return;
    }

    this.selectedEntity = entity;
    this.selectedRecord = null;
    this.dialogMode = 'create';

    switch (entity) {
      case 'clients':
        this.dialogValues = {
          firstName: '',
          lastName: '',
          email: '',
          contact: '',
          type: 'CLIENT',
          password: ''
        };
        break;

      case 'authors':
        this.dialogValues = {
          name: '',
          birthdate: this.localDateString()
        };
        break;

      case 'books':
        this.dialogValues = {
          name: '',
          isbn: '',
          authorId: String(this.authors[0].id),
          description: '',
          year: new Date().getFullYear(),
          pages: '',
          image: ''
        };
        break;

      case 'loans':
        this.dialogValues = {
          userId: String(this.clients[0].id),
          bookId: String(this.books[0].id)
        };
        break;
    }
  }

  closeDialog(): void {
    this.dialogMode = null;
    this.selectedEntity = null;
    this.selectedRecord = null;
    this.dialogValues = {};
  }

  saveRecord(values: Record<string, string | number>): void {
    if (!this.selectedEntity) {
      return;
    }

    const entity = this.selectedEntity;
    const creating = this.dialogMode === 'create';

    if (entity === 'clients') {
      const user: UserInput = {
        firstName: String(values['firstName'] ?? ''),
        lastName: String(values['lastName'] ?? ''),
        email: String(values['email'] ?? ''),
        contact: this.nullableString(values['contact']),
        type: String(values['type'] ?? 'CLIENT') as UserInput['type']
      };

      const password = String(values['password'] ?? '').trim();
      if (password) {
        user.password = password;
      }

      const request = creating
        ? this.api.createUser(user)
        : this.api.updateUser((this.selectedRecord as LibraryUser).id, user);

      request.subscribe({
        next: () => this.afterSave(entity, creating),
        error: error => this.handleApiError(error, 'Échec de l’enregistrement de l’utilisateur.')
      });

      return;
    }

    if (entity === 'authors') {
      const author: AuthorInput = {
        name: String(values['name'] ?? ''),
        birthdate: String(values['birthdate'] ?? '')
      };

      const request = creating
        ? this.api.createAuthor(author)
        : this.api.updateAuthor((this.selectedRecord as Author).id, author);

      request.subscribe({
        next: () => this.afterSave(entity, creating),
        error: error => this.handleApiError(error, 'Échec de l’enregistrement de l’auteur.')
      });

      return;
    }

    if (entity === 'books') {
      const book: BookInput = {
        name: String(values['name'] ?? ''),
        isbn: String(values['isbn'] ?? ''),
        authorId: Number(values['authorId']),
        description: this.nullableString(values['description']),
        year: this.nullableNumber(values['year']),
        pages: this.nullableNumber(values['pages']),
        image: this.nullableString(values['image'])
      };

      const request = creating
        ? this.api.createBook(book)
        : this.api.updateBook((this.selectedRecord as Book).id, book);

      request.subscribe({
        next: () => this.afterSave(entity, creating),
        error: error => this.handleApiError(error, 'Échec de l’enregistrement du livre.')
      });

      return;
    }

    if (entity === 'loans') {
      if (!creating) {
        this.showToast('La modification d’un emprunt n’est pas disponible dans l’API.');
        return;
      }

      const loan: LoanInput = {
        userId: Number(values['userId']),
        bookId: Number(values['bookId'])
      };

      this.api.createLoan(loan).subscribe({
        next: () => this.afterSave(entity, true),
        error: error => this.handleApiError(error, 'Échec de la création de l’emprunt.')
      });
    }
  }

  confirmDelete(): void {
    if (!this.selectedEntity || !this.selectedRecord) {
      return;
    }

    const entity = this.selectedEntity;
    const record = this.selectedRecord;

    if (entity === 'loans') {
      this.showToast('La suppression d’un emprunt n’est pas disponible dans l’API.');
      return;
    }

    const request =
      entity === 'clients'
        ? this.api.deleteUser((record as LibraryUser).id)
        : entity === 'authors'
          ? this.api.deleteAuthor((record as Author).id)
          : this.api.deleteBook((record as Book).id);

    request.subscribe({
      next: () => {
        this.closeDialog();
        this.showToast(`${this.entityLabel(entity)} supprimé avec succès.`);
        this.loadData();
      },
      error: error => this.handleApiError(error, `Échec de la suppression : ${this.entityLabel(entity).toLowerCase()}.`)
    });
  }

  handleClientAction(event: RowAction<LibraryUser>): void {
    this.openDialog(
      'clients',
      event.mode === 'delete' ? 'confirm' : event.mode,
      event.record
    );
  }

  handleBookAction(event: RowAction<Book>): void {
    this.openDialog(
      'books',
      event.mode === 'delete' ? 'confirm' : event.mode,
      event.record
    );
  }

  handleAuthorAction(event: RowAction<Author>): void {
    this.openDialog(
      'authors',
      event.mode === 'delete' ? 'confirm' : event.mode,
      event.record
    );
  }

  handleLoanAction(event: RowAction<Loan>): void {
    if (event.mode === 'delete' || event.mode === 'edit') {
      this.showToast('Cette opération n’est pas disponible pour les emprunts.');
      return;
    }

    this.openDialog('loans', event.mode, event.record);
  }

  returnLoan(loan: Loan): void {
    if (loan.returnDate !== null) {
      this.showToast('Cet emprunt est déjà retourné.');
      return;
    }

    this.api.returnBook(loan.id).subscribe({
      next: () => {
        this.showToast('Retour du livre enregistré.');
        this.loadData();
      },
      error: error => this.handleApiError(error, 'Échec de l’enregistrement du retour.')
    });
  }

  private afterSave(entity: EntityType, creating: boolean): void {
    this.closeDialog();
    this.showToast(
      `${this.entityLabel(entity)} ${creating ? 'ajouté' : 'modifié'} avec succès.`
    );
    this.loadData();
  }

  private nullableString(value: string | number | undefined): string | null {
    const result = String(value ?? '').trim();
    return result ? result : null;
  }

  private nullableNumber(value: string | number | undefined): number | null {
    const result = String(value ?? '').trim();
    if (!result) {
      return null;
    }

    const numberValue = Number(result);
    return Number.isFinite(numberValue) ? numberValue : null;
  }

  private localDateString(): string {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
  }

  private handleApiError(error: unknown, fallback: string): void {
    const message =
      typeof error === 'object' &&
      error !== null &&
      'error' in error &&
      typeof error.error === 'object' &&
      error.error !== null &&
      'detail' in error.error &&
      typeof error.error.detail === 'string'
        ? error.error.detail
        : fallback;

    this.showToast(message);
  }

  showToast(message: string): void {
    if (this.toastTimer) {
      clearTimeout(this.toastTimer);
    }

    this.toastMessage = message;
    this.toastTimer = setTimeout(() => {
      this.toastMessage = '';
      this.toastTimer = undefined;
    }, 3500);
  }

  ngOnDestroy(): void {
    if (this.toastTimer) {
      clearTimeout(this.toastTimer);
    }
  }

  private entityLabel(entity: EntityType | null): string {
    switch (entity) {
      case 'clients': return 'Utilisateur';
      case 'authors': return 'Auteur';
      case 'books': return 'Livre';
      case 'loans': return 'Emprunt';
      default: return 'Élément';
    }
  }

  selectSection(section: DashboardSection): void {
    this.activeSection = section;
  }

  signOut(): void {
    this.logoutConfirmation = true;
  }

  cancelSignOut(): void {
    this.logoutConfirmation = false;
  }

  confirmSignOut(): void {
    this.logoutConfirmation = false;
    this.authService.signOut();
    void this.router.navigateByUrl('/login');
  }
}