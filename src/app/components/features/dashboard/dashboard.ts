import { Author } from './../../../core/models/library.models';
import { Component, inject, OnDestroy } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/auth/auth.service';
import type { Book as LibraryBook, Client, Loan } from '../../../core/models/library.models';
import { BookTable } from './book-table';
import { LoanTable } from './loan-table';
import { AuthorTable } from './author-table';
import { Sidebar, DashboardSection } from './sidebar';
import { StatisticsSection } from './statistics-section';
import { UserTable } from './user-table';
import { RecordDialog, RecordField } from './record-dialog';
import type { RowAction } from './user-table';

type EntityType = 'clients'| 'authors' | 'books' | 'loans';
type DialogMode = 'details' | 'edit' | 'create' | 'confirm';
type Book = LibraryBook & { author: string };
type DashboardRecord = Client | Author | Book | Loan;

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [RouterLink, Sidebar, StatisticsSection, UserTable, BookTable, LoanTable, RecordDialog, AuthorTable],
  templateUrl: './dashboard.html'
})
export class Dashboard implements OnDestroy {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

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
  private toastTimer: ReturnType<typeof setTimeout> | undefined;

  clients: Client[] = [
    { userId: 1, firstName: 'Amina', lastName: 'Diallo', email: 'amina.diallo@example.com', contact: '+237 690 12 34 56', status: 'Actif' },
    { userId: 2, firstName: 'Marc', lastName: 'Ndi', email: 'marc.ndi@example.com', contact: '+237 677 45 67 89', status: 'Actif' },
    { userId: 3, firstName: 'Sarah', lastName: 'Mbarga', email: 'sarah.mbarga@example.com', contact: '+237 699 23 45 67', status: 'Inactif' },
    { userId: 4, firstName: 'Paul', lastName: 'Tchoumi', email: 'paul.tchoumi@example.com', contact: '+237 655 98 76 54', status: 'Actif' }
  ];

  authors: Author[] = [
    { id: 1, name: 'Djibril Tchen', birthDate: new Date('1960-05-15') },
    { id: 2, name: 'Mariama Bâ', birthDate: new Date('1955-08-22') },
    { id: 3, name: 'Camara Laye', birthDate: new Date('1948-12-10') },
    { id: 4, name: 'Léon Damas', birthDate: new Date('1952-03-30') }
  ];

  books: Book[] = [
    { id: 1, image: '', title: 'Les Soleils des indépendances', author: 'Djibril Tchen', description: 'Un roman majeur sur les mutations sociales après les indépendances.', quantity: 5, pages: 256, status: 'Disponible' },
    { id: 2, image: '', title: 'Une si longue lettre', author: 'Mariama Bâ', description: 'Le récit épistolaire de Ramatoulaye, entre amitié et changements sociaux.', quantity: 3, pages: 192, status: 'Emprunté' },
    { id: 3, image: '', title: 'L’Enfant noir', author: 'Camara Laye', description: 'Un récit autobiographique sur l’enfance en Haute-Guinée.', quantity: 4, pages: 224, status: 'Disponible' },
    { id: 4, image: '', title: 'Le Vieux Nègre et la médaille', author: 'Léon Damas', description: 'Un récit satirique sur la période coloniale.', quantity: 2, pages: 160, status: 'Emprunté' }
  ];

  loans: Loan[] = [
    { id: 1, userId: 1, bookId: 2, loanDate: '2026-09-28', returnDate: '2026-10-12', status: 'En cours' },
    { id: 2, userId: 2, bookId: 4, loanDate: '2026-09-12', returnDate: '2026-09-26', status: 'En retard' },
    { id: 3, userId: 4, bookId: 3, loanDate: '2026-09-01', returnDate: '2026-09-15', status: 'Retourné' }
  ];

  get activeLoansCount(): number {
    return this.loans.filter((loan) => loan.status !== 'Retourné').length;
  }

  get overdueLoansCount(): number {
    return this.loans.filter((loan) => loan.status === 'En retard').length;
  }

  get lowStockBooksCount(): number {
    return this.books.filter((book) => book.quantity <= 2).length;
  }

  sectionTabClass(section: DashboardSection): string {
    const base = 'rounded-lg px-3 py-1.5 text-[11px] font-semibold transition focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-1';
    return this.activeSection === section
      ? `${base} bg-white text-violet-900 shadow-sm`
      : `${base} text-slate-500 hover:bg-white/70 hover:text-slate-900`;
  }

  get dialogTitle(): string {
    const entityName = this.entityLabel(this.selectedEntity);
    if (this.dialogMode === 'confirm') return `Supprimer ${entityName.toLowerCase()} ?`;
    if (this.dialogMode === 'edit') return `Modifier ${entityName.toLowerCase()}`;
    if (this.dialogMode === 'create') return `Ajouter ${entityName.toLowerCase()}`;
    return `Détails ${entityName.toLowerCase()}`;
  }

  get dialogFields(): RecordField[] {
    let fields: RecordField[] = [];

    switch (this.selectedEntity) {
      case 'clients':
        fields = [
          { key: 'userId', label: 'Identifiant utilisateur', type: 'number', editable: false },
          { key: 'firstName', label: 'Prénom', type: 'text', required: true },
          { key: 'lastName', label: 'Nom', type: 'text', required: true },
          { key: 'email', label: 'E-mail', type: 'email', required: true },
          { key: 'contact', label: 'Contact', type: 'tel', required: true },
          { key: 'status', label: 'Statut', type: 'select', options: ['Actif', 'Inactif'], required: true }
        ];
        break;
      case 'authors':
        fields = [
          { key: 'id', label: 'Identifiant auteur', type: 'number', editable: false },
          { key: 'name', label: 'Nom de l’auteur', type: 'text', required: true },
          { key: 'birthDate', label: 'Date de naissance', type: 'date', required: true }
        ];
        break;
      case 'books':
        fields = [
          { key: 'id', label: 'Identifiant du livre', type: 'number', editable: false },
          { key: 'image', label: 'Image (URL)', type: 'url' },
          { key: 'title', label: 'Intitulé', type: 'text', required: true },
          { key: 'author', label: 'Auteur', type: 'select', options: this.authors.map((author) => author.name), required: true },
          { key: 'description', label: 'Description', type: 'textarea', required: true },
          { key: 'quantity', label: 'Nombre d’exemplaires', type: 'number', required: true },
          { key: 'pages', label: 'Nombre de pages', type: 'number', required: true },
          { key: 'status', label: 'Statut', type: 'select', options: ['Disponible', 'Emprunté'], required: true }
        ];
        break;
      case 'loans':
        fields = [
          { key: 'id', label: 'Identifiant du prêt', type: 'number', editable: false },
          { key: 'userId', label: 'Utilisateur', type: 'select', options: this.clients.map((client) => ({ value: String(client.userId), label: `${client.firstName} ${client.lastName}` })), required: true },
          { key: 'bookId', label: 'Livre', type: 'select', options: this.books.map((book) => ({ value: String(book.id), label: book.title })), required: true },
          { key: 'loanDate', label: 'Date de prêt', type: 'date', required: true },
          { key: 'returnDate', label: 'Date de retour', type: 'date', required: true },
          { key: 'status', label: 'Statut', type: 'select', options: ['En cours', 'En retard', 'Retourné'], required: true }
        ];
        break;
      default:
        fields = [];
    }

    return this.dialogMode === 'create' ? fields.filter((field) => field.editable !== false) : fields;
  }

  get dialogDescription(): string {
    return this.dialogMode === 'confirm'
      ? 'Cette action supprimera définitivement cet élément de la liste de démonstration.'
      : '';
  }

  clientName(userId: number): string {
    const client = this.clients.find((item) => item.userId === userId);
    return client ? `${client.firstName} ${client.lastName}` : `Utilisateur #${userId}`;
  }

  bookTitle(bookId: number): string {
    return this.books.find((item) => item.id === bookId)?.title ?? `Livre #${bookId}`;
  }

  openDialog(entity: EntityType, mode: DialogMode, record: DashboardRecord): void {
    this.selectedEntity = entity;
    this.selectedRecord = record;
    this.dialogValues = Object.fromEntries(
      Object.entries(record).map(([key, value]) => {
        if (value instanceof Date) {
          return [key, value.toISOString().slice(0, 10)];
        }

        return [key, String(value ?? '')];
      })
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

    const today = new Date().toISOString().slice(0, 10);
    this.selectedEntity = entity;
    this.selectedRecord = null;
    this.dialogMode = 'create';

    if (entity === 'clients') {
      this.dialogValues = { status: 'Actif' };
    } else if (entity === 'books') {
      this.dialogValues = {
        author: this.authors[0].name,
        image: '',
        quantity: 1,
        pages: 1,
        status: 'Disponible'
      };
    } else if (entity === 'authors') {
      this.dialogValues = { name: '', birthDate: today };
    } else {
      this.dialogValues = {
        userId: String(this.clients[0].userId),
        bookId: String(this.books[0].id),
        loanDate: today,
        returnDate: today,
        status: 'En cours'
      };
    }
  }

  closeDialog(): void {
    this.dialogMode = null;
    this.selectedEntity = null;
    this.selectedRecord = null;
    this.dialogValues = {};
  }

  saveRecord(values: Record<string, string | number>): void {
    if (!this.selectedEntity) return;

    const entity = this.selectedEntity;
    const isCreating = this.dialogMode === 'create';

    if (entity === 'clients') {
      if (isCreating) {
        this.clients = [...this.clients, {
          userId: this.nextId(this.clients.map((client) => client.userId)),
          firstName: String(values['firstName'] ?? ''),
          lastName: String(values['lastName'] ?? ''),
          email: String(values['email'] ?? ''),
          contact: String(values['contact'] ?? ''),
          status: values['status'] as Client['status']
        }];
      } else if (this.selectedRecord) {
        const original = this.selectedRecord as Client;
        this.clients = this.clients.map((client) => client.userId === original.userId
          ? {
              ...original,
              firstName: String(values['firstName'] ?? original.firstName),
              lastName: String(values['lastName'] ?? original.lastName),
              email: String(values['email'] ?? original.email),
              contact: String(values['contact'] ?? original.contact),
              status: values['status'] as Client['status']
            }
          : client);
      }
    } else if (entity === 'authors') {
      const authorValues = {
        name: String(values['name'] ?? ''),
        birthDate: new Date(String(values['birthDate'] ?? new Date().toISOString().slice(0, 10)))
      };

      if (isCreating) {
        this.authors = [...this.authors, {
          id: this.nextId(this.authors.map((author) => author.id)),
          ...authorValues
        }];
      } else if (this.selectedRecord) {
        const original = this.selectedRecord as Author;
        this.authors = this.authors.map((author) => author.id === original.id
          ? {
              ...original,
              ...authorValues
            }
          : author);
      }
    } else if (entity === 'books') {
      if (isCreating) {
        this.books = [...this.books, {
          id: this.nextId(this.books.map((book) => book.id)),
          image: String(values['image'] ?? ''),
          title: String(values['title'] ?? ''),
          author: String(values['author'] ?? ''),
          description: String(values['description'] ?? ''),
          quantity: Number(values['quantity'] ?? 0),
          pages: Number(values['pages'] ?? 0),
          status: values['status'] as Book['status']
        }];
      } else if (this.selectedRecord) {
        const original = this.selectedRecord as Book;
        this.books = this.books.map((book) => book.id === original.id
          ? {
              ...original,
              image: String(values['image'] ?? original.image),
              title: String(values['title'] ?? original.title),
              author: String(values['author'] ?? original.author),
              description: String(values['description'] ?? original.description),
              quantity: Number(values['quantity'] ?? original.quantity),
              pages: Number(values['pages'] ?? original.pages),
              status: values['status'] as Book['status']
            }
          : book);
      }
    } else {
      const loanValues = {
        userId: Number(values['userId'] ?? 0),
        bookId: Number(values['bookId'] ?? 0),
        loanDate: String(values['loanDate'] ?? ''),
        returnDate: String(values['returnDate'] ?? ''),
        status: values['status'] as Loan['status']
      };

      if (isCreating) {
        this.loans = [...this.loans, {
          id: this.nextId(this.loans.map((loan) => loan.id)),
          ...loanValues
        }];
      } else if (this.selectedRecord) {
        const original = this.selectedRecord as Loan;
        this.loans = this.loans.map((loan) => loan.id === original.id
          ? { ...original, ...loanValues }
          : loan);
      }
    }

    this.closeDialog();
    this.showToast(`${this.entityLabel(entity)} ${isCreating ? 'ajouté' : 'modifié'} avec succès.`);
  }

  private nextId(ids: number[]): number {
    return Math.max(0, ...ids) + 1;
  }

  confirmDelete(): void {
    if (!this.selectedEntity || !this.selectedRecord) return;

    const entity = this.selectedEntity;
    const record = this.selectedRecord;

    if (entity === 'clients') {
      this.clients = this.clients.filter((client) => client.userId !== (record as Client).userId);
    } else if (entity === 'authors') {
      this.authors = this.authors.filter((author) => author.id !== (record as Author).id);
    } else if (entity === 'books') {
      this.books = this.books.filter((book) => book.id !== (record as Book).id);
    } else if (entity === 'loans') {
      this.loans = this.loans.filter((loan) => loan.id !== (record as Loan).id);
    }

    this.closeDialog();
    this.showToast(`${this.entityLabel(entity)} supprimé.`);
  }

  showToast(message: string): void {
    if (this.toastTimer) clearTimeout(this.toastTimer);
    this.toastMessage = message;
    this.toastTimer = setTimeout(() => {
      this.toastMessage = '';
      this.toastTimer = undefined;
    }, 3500);
  }

  ngOnDestroy(): void {
    if (this.toastTimer) clearTimeout(this.toastTimer);
  }

  private entityLabel(entity: EntityType | null): string {
    switch (entity) {
      case 'clients':
        return 'Client';
      case 'authors':
        return 'Auteur';
      case 'books':
        return 'Livre';
      case 'loans':
        return 'Prêt';
      default:
        return 'Élément';
    }
  }

  selectSection(section: DashboardSection): void {
    this.activeSection = section;
  }

  handleClientAction(event: RowAction<Client>): void {
    this.openDialog('clients', event.mode === 'delete' ? 'confirm' : event.mode, event.record);
  }

  handleBookAction(event: RowAction<Book>): void {
    this.openDialog('books', event.mode === 'delete' ? 'confirm' : event.mode, event.record);
  }

  handleAuthorAction(event: RowAction<Author>): void {
    this.openDialog('authors', event.mode === 'delete' ? 'confirm' : event.mode, event.record);
  }

  handleLoanAction(event: RowAction<Loan>): void {
    this.openDialog('loans', event.mode === 'delete' ? 'confirm' : event.mode, event.record);
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
