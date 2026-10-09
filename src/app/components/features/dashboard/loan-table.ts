import { Component, EventEmitter, Input, Output } from '@angular/core';
import type { Loan } from '../../../core/models/library.models';
import type { RowAction } from './user-table';

@Component({
  selector: 'app-loan-table',
  standalone: true,
  template: `
    <div class="h-full overflow-auto">
      <table class="w-full min-w-[900px] text-left text-xs">
        <thead class="sticky top-0 z-10 bg-violet-100 text-[10px] uppercase tracking-wider text-violet-950">
          <tr>
            <th scope="col" class="px-5 py-3">ID</th>
            <th scope="col" class="px-5 py-3">Utilisateur</th>
            <th scope="col" class="px-5 py-3">Livre</th>
            <th scope="col" class="px-5 py-3">Date de prêt</th>
            <th scope="col" class="px-5 py-3">Date de retour</th>
            <th scope="col" class="px-5 py-3">Statut</th>
            <th scope="col" class="px-5 py-3">Actions</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-violet-100 bg-white/75">
          @for (loan of loans; track loan.id) {
            <tr class="text-slate-700 transition hover:bg-violet-50/60">
              <td class="px-4 py-3 text-slate-400">#{{ loan.id }}</td>
              <td class="px-4 py-3 font-semibold text-slate-900">{{ clientName(loan.userId) }}</td>
              <td class="px-4 py-3">{{ bookTitle(loan.bookId) }}</td>
              <td class="px-4 py-3">{{ loan.loanDate }}</td>
              <td class="px-4 py-3">{{ loan.returnDate }}</td>
              <td class="px-4 py-3">
                <span [class]="statusClass(loan.status)">{{ loan.status }}</span>
              </td>
              <td class="px-4 py-3">
                <div class="flex items-center gap-1.5">
                  <button type="button" (click)="action.emit({ mode: 'details', record: loan })" class="rounded-lg border border-violet-200 bg-white px-2 py-1.5 text-[10px] font-bold text-violet-800 shadow-sm transition hover:bg-violet-50">Détails</button>
                  <button type="button" (click)="action.emit({ mode: 'edit', record: loan })" class="rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-[10px] font-bold text-slate-700 shadow-sm transition hover:border-violet-200 hover:bg-violet-50">Modifier</button>
                  <button type="button" (click)="action.emit({ mode: 'delete', record: loan })" class="rounded-lg border border-rose-100 bg-white px-2 py-1.5 text-[10px] font-bold text-rose-700 shadow-sm transition hover:bg-rose-50">Supprimer</button>
                </div>
              </td>
            </tr>
          } @empty {
            <tr><td colspan="7" class="px-5 py-8 text-center text-slate-500">Aucun prêt enregistré.</td></tr>
          }
        </tbody>
      </table>
    </div>
  `
})
export class LoanTable {
  @Input({ required: true }) loans: Loan[] = [];
  @Input({ required: true }) clients: { userId: number; firstName: string; lastName: string }[] = [];
  @Input({ required: true }) books: { id: number; title: string }[] = [];
  @Output() readonly action = new EventEmitter<RowAction<Loan>>();

  clientName(userId: number): string {
    const client = this.clients.find((item) => item.userId === userId);
    return client ? `${client.firstName} ${client.lastName}` : `Utilisateur #${userId}`;
  }

  bookTitle(bookId: number): string {
    return this.books.find((item) => item.id === bookId)?.title ?? `Livre #${bookId}`;
  }

  statusClass(status: Loan['status']): string {
    if (status === 'Retourné') {
      return 'rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600';
    }
    return status === 'En retard'
      ? 'rounded-full bg-red-50 px-2.5 py-1 text-xs font-medium text-red-700'
      : 'rounded-full bg-violet-50 px-2.5 py-1 text-xs font-medium text-violet-800';
  }
}
