import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { Dashboard } from './dashboard';

describe('Dashboard', () => {
  let fixture: ComponentFixture<Dashboard>;

  beforeEach(async () => {
    sessionStorage.setItem('gestion.auth.email', 'bibliotheque@example.com');
    await TestBed.configureTestingModule({
      imports: [Dashboard],
      providers: [provideRouter([])]
    }).compileComponents();

    fixture = TestBed.createComponent(Dashboard);
    fixture.detectChanges();
  });

  afterEach(() => sessionStorage.removeItem('gestion.auth.email'));

  it('renders the dashboard body with the overview and library statistics', () => {
    const element = fixture.nativeElement as HTMLElement;

    expect(element.querySelector('h1')?.textContent).toContain('Bonjour, bienvenue');
    expect(element.querySelector('app-statistics-section')?.textContent).toContain('Lecteurs');
    expect(element.querySelector('app-statistics-section')?.textContent).toContain('Retards');
    expect(element.querySelector('app-user-table')).not.toBeNull();
  });

  it('keeps the dashboard viewport fixed and confines table overflow to the list', () => {
    const element = fixture.nativeElement as HTMLElement;

    expect(element.querySelector('.dashboard-shell')?.classList).toContain('overflow-hidden');
    expect(element.querySelector('main')?.classList).toContain('overflow-hidden');
    expect(element.querySelector('app-user-table')?.classList).toContain('overflow-auto');
  });

  it('shows the client table by default and switches to the book and loan tables', () => {
    const element = fixture.nativeElement as HTMLElement;
    expect(element.querySelector('app-user-table')).not.toBeNull();

    const buttons = Array.from(element.querySelectorAll('button'));
    buttons.find((button) => button.textContent?.includes('Livres'))?.click();
    fixture.detectChanges();
    expect(element.querySelector('app-book-table')).not.toBeNull();

    buttons.find((button) => button.textContent?.includes('Auteurs'))?.click();
    fixture.detectChanges();
    expect(element.querySelector('app-author-table')).not.toBeNull();

    buttons.find((button) => button.textContent?.includes('Emprunts'))?.click();
    fixture.detectChanges();
    expect(element.querySelector('app-loan-table')).not.toBeNull();
  });

  it('opens details and requires confirmation before deleting a book', () => {
    const element = fixture.nativeElement as HTMLElement;
    const navButtons = Array.from(element.querySelectorAll<HTMLButtonElement>('app-dashboard-sidebar button'));
    navButtons.find((button) => button.textContent?.includes('Livres'))?.click();
    fixture.detectChanges();

    const bookActions = Array.from(element.querySelectorAll<HTMLButtonElement>('app-book-table tbody tr:first-child button'));
    bookActions.find((button) => button.textContent?.includes('Détails'))?.click();
    fixture.detectChanges();
    expect(element.querySelector('[role="dialog"]')?.textContent).toContain('Les Soleils des indépendances');

    element.querySelector<HTMLButtonElement>('[aria-label="Fermer"]')?.click();
    fixture.detectChanges();
    const bookCount = fixture.componentInstance.books.length;
    const refreshedActions = Array.from(element.querySelectorAll<HTMLButtonElement>('app-book-table tbody tr:first-child button'));
    refreshedActions.find((button) => button.textContent?.includes('Supprimer'))?.click();
    fixture.detectChanges();

    expect(fixture.componentInstance.books.length).toBe(bookCount);
    expect(element.querySelector('[role="dialog"]')?.textContent).toContain('Confirmer la suppression');

    Array.from(element.querySelectorAll<HTMLButtonElement>('[role="dialog"] button'))
      .find((button) => button.textContent?.includes('Confirmer'))?.click();
    fixture.detectChanges();
    expect(fixture.componentInstance.books.length).toBe(bookCount - 1);
    expect(element.querySelector('[role="status"]')?.textContent).toContain('Livre supprimé');
  });

  it('saves edits to an existing client', async () => {
    const element = fixture.nativeElement as HTMLElement;
    const editButton = element.querySelector<HTMLButtonElement>('app-user-table tbody tr:first-child button:nth-child(2)');
    editButton?.click();
    fixture.detectChanges();

    const firstName = element.querySelector<HTMLInputElement>('#record-firstName');
    expect(firstName).not.toBeNull();
    firstName!.value = 'Aminata';
    firstName!.dispatchEvent(new Event('input', { bubbles: true }));
    await fixture.whenStable();
    fixture.detectChanges();
    const submitButton = element.querySelector<HTMLButtonElement>('[role="dialog"] button[type="submit"]');
    expect(submitButton?.disabled).toBeFalse();
    submitButton?.click();
    fixture.detectChanges();

    expect(element.querySelector('[role="dialog"]')).toBeNull();
    expect(fixture.componentInstance.clients[0].firstName).toBe('Aminata');
    expect(element.querySelector('app-user-table tbody tr')?.textContent).toContain('Aminata');
  });

  it('adds a new book from the add button above its table', () => {
    const element = fixture.nativeElement as HTMLElement;
    element.querySelector<HTMLButtonElement>('app-dashboard-sidebar button:nth-child(3)')?.click();
    fixture.detectChanges();

    const initialCount = fixture.componentInstance.books.length;
    Array.from(element.querySelectorAll<HTMLButtonElement>('button'))
      .find((button) => button.textContent?.includes('Ajouter un livre'))?.click();
    fixture.detectChanges();
    expect(element.querySelector('[role="dialog"] h2')?.textContent).toContain('Ajouter livre');
    const author = element.querySelector<HTMLSelectElement>('#record-author');
    expect(author).not.toBeNull();
    expect(Array.from(author!.options).map((option) => option.value)).toContain('Djibril Tchen');

    const title = element.querySelector<HTMLInputElement>('#record-title');
    const description = element.querySelector<HTMLTextAreaElement>('#record-description');
    const quantity = element.querySelector<HTMLInputElement>('#record-quantity');
    const pages = element.querySelector<HTMLInputElement>('#record-pages');
    title!.value = 'Livre de test';
    title!.dispatchEvent(new Event('input', { bubbles: true }));
    description!.value = 'Description de test';
    description!.dispatchEvent(new Event('input', { bubbles: true }));
    quantity!.value = '2';
    quantity!.dispatchEvent(new Event('input', { bubbles: true }));
    pages!.value = '120';
    pages!.dispatchEvent(new Event('input', { bubbles: true }));
    fixture.detectChanges();

    element.querySelector<HTMLButtonElement>('[role="dialog"] button[type="submit"]')?.click();
    fixture.detectChanges();
    expect(fixture.componentInstance.books.length).toBe(initialCount + 1);
    expect(fixture.componentInstance.books.at(-1)?.title).toBe('Livre de test');
  });

  it('asks for confirmation before signing out', () => {
    const element = fixture.nativeElement as HTMLElement;
    element.querySelector<HTMLButtonElement>('header button')?.click();
    fixture.detectChanges();

    expect(element.querySelector('[role="alertdialog"]')?.textContent).toContain('déconnecter le gérant');
    expect(fixture.componentInstance.userEmail()).toBe('bibliotheque@example.com');

    element.querySelector<HTMLButtonElement>('[role="alertdialog"] button:first-child')?.click();
    fixture.detectChanges();
    expect(element.querySelector('[role="alertdialog"]')).toBeNull();
    expect(fixture.componentInstance.userEmail()).toBe('bibliotheque@example.com');
  });

  it('creates a loan using the selected user and book', () => {
    const element = fixture.nativeElement as HTMLElement;
    element.querySelector<HTMLButtonElement>('app-dashboard-sidebar button:nth-child(4)')?.click();
    fixture.detectChanges();
    const initialCount = fixture.componentInstance.loans.length;

    Array.from(element.querySelectorAll<HTMLButtonElement>('button'))
      .find((button) => button.textContent?.includes('Ajouter un prêt'))?.click();
    fixture.detectChanges();

    element.querySelector<HTMLButtonElement>('[role="dialog"] button[type="submit"]')?.click();
    fixture.detectChanges();

    expect(fixture.componentInstance.loans.length).toBe(initialCount + 1);
    expect(fixture.componentInstance.loans.at(-1)?.userId).toBe(fixture.componentInstance.clients[0].userId);
    expect(fixture.componentInstance.loans.at(-1)?.bookId).toBe(fixture.componentInstance.books[0].id);
  });

  it('signs out and redirects only after confirmation', async () => {
    const element = fixture.nativeElement as HTMLElement;
    const router = TestBed.inject(Router);
    const navigateSpy = spyOn(router, 'navigateByUrl').and.resolveTo(true);

    element.querySelector<HTMLButtonElement>('header button')?.click();
    fixture.detectChanges();
    element.querySelector<HTMLButtonElement>('[role="alertdialog"] button:last-child')?.click();
    fixture.detectChanges();
    await fixture.whenStable();

    expect(sessionStorage.getItem('gestion.auth.email')).toBeNull();
    expect(navigateSpy).toHaveBeenCalledWith('/login');
  });
});
