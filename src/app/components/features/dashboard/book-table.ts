import { Component, EventEmitter, Input, Output } from '@angular/core';
import type { Book } from '../../../core/models/library.models';
import type { RowAction } from './user-table';

@Component({
  selector: 'app-book-table',
  standalone: true,
  template: `
    <div class="h-full overflow-auto">
      <table class="w-full min-w-250 text-left text-xs">
        <thead class="sticky top-0 z-10 bg-violet-100 text-[10px] uppercase tracking-wider text-violet-950">
          <tr>
            <th scope="col" class="px-5 py-3">ID</th>
            <th scope="col" class="px-5 py-3">Image</th>
            <th scope="col" class="px-5 py-3">Intitulé</th>
            <th scope="col" class="px-5 py-3">Auteur</th>
            <th scope="col" class="px-5 py-3">Description</th>
            <th scope="col" class="px-5 py-3">Nombre</th>
            <th scope="col" class="px-5 py-3">Nbr. pages</th>
            <th scope="col" class="px-5 py-3">Statut</th>
            <th scope="col" class="px-5 py-3">Actions</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-violet-100 bg-white/75">
          @for (book of books; track book.id) {
            <tr class="text-slate-700 transition hover:bg-violet-50/60">
              <td class="px-4 py-3 text-slate-400">#{{ book.id }}</td>
              <td class="px-4 py-3">
                @if (book.image) {
                  <img [src]="" [alt]="'Couverture de ' + book.title" class="h-12 w-10 rounded object-cover" />
                } @else {
                  <span class="flex h-12 w-10 items-center justify-center rounded-lg bg-violet-100 text-[10px] font-semibold text-violet-800">Livre</span>
                }
              </td>
              <td class="max-w-48 px-4 py-3 font-semibold text-slate-900">{{ book.title }}</td>
              <td class="max-w-64 px-4 py-3 font-semibold text-slate-900">{{ book.author }}</td>
              <td class="max-w-64 px-4 py-3">
                <p class="line-clamp-2">{{ book.description }}</p>
              </td>
              <td class="px-4 py-3">{{ book.quantity }}</td>

              <td class="px-4 py-3">{{ book.pages }}</td>
              <td class="px-4 py-3">
                <span [class]="book.status === 'Disponible' ? 'rounded-full bg-emerald-50 px-2.5 py-1 text-emerald-700 ring-1 ring-emerald-600/20 ring-inset' : 'rounded-full bg-rose-50 px-2.5 py-1 text-amber-700 ring-1 ring-inset'">
                  {{ book.status }}
                </span>
              </td>
              <td class="px-4 py-3">
                <div class="flex items-center gap-1.5">
                  <button type="button" (click)="action.emit({ mode: 'details', record: book })" class="rounded-lg border border-violet-200 bg-white px-2 py-1.5 text-[10px] font-bold text-violet-800 shadow-sm transition hover:bg-violet-50">Détails</button>
                  <button type="button" (click)="action.emit({ mode: 'edit', record: book })" class="rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-[10px] font-bold text-slate-700 shadow-sm transition hover:border-violet-200 hover:bg-violet-50">Modifier</button>
                  <button type="button" (click)="action.emit({ mode: 'delete', record: book })" class="rounded-lg border border-rose-100 bg-white px-2 py-1.5 text-[10px] font-bold text-rose-700 shadow-sm transition hover:bg-rose-50">Supprimer</button>
                </div>
              </td>
            </tr>
          } @empty {
            <tr><td colspan="8" class="px-5 py-8 text-center text-slate-500">Aucun livre enregistré.</td></tr>
          }
        </tbody>
      </table>
    </div>
  `
})
export class BookTable {
  @Input({ required: true }) books: Book[] = [];
  @Output() readonly action = new EventEmitter<RowAction<Book>>();
}
