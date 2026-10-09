import { Author } from './../../../core/models/library.models';
import { DatePipe } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import type { RowAction } from './user-table';

@Component({
  selector: 'app-author-table',
  standalone: true,
  imports: [DatePipe],
  template: `
    <div class="h-full overflow-auto">
      <table class="w-full min-w-250 text-left text-xs">
        <thead class="sticky top-0 z-10 bg-violet-100 text-[10px] uppercase tracking-wider text-violet-950">
          <tr>
            <th scope="col" class="px-5 py-3">ID</th>
            <th scope="col" class="px-5 py-3">Nom</th>
            <th scope="col" class="px-5 py-3">Date de naissance</th>
            <th scope="col" class="px-5 py-3">Actions</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-violet-100 bg-white/75">
          @for( author of authors; track author.id) {
            <tr class="text-slate-700 transition hover:bg-violet-50/60">
              <td class="px-4 py-3 text-slate-400">#{{ author.id }}</td>
              <td class="px-4 py-3">{{ author.name }}</td>
              <td class="px-4 py-3">{{ author.birthdate | date: 'dd/MM/yyyy' }}</td>
              <td class="px-4 py-3">
                <div class="flex items-center gap-1.5">
                  <button type="button" (click)="action.emit({ mode: 'edit', record: author })" class="rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-[10px] font-bold text-slate-700 shadow-sm transition hover:border-violet-200 hover:bg-violet-50">Modifier</button>
                  <button type="button" (click)="action.emit({ mode: 'delete', record: author })" class="rounded-lg border border-rose-100 bg-white px-2 py-1.5 text-[10px] font-bold text-rose-700 shadow-sm transition hover:bg-rose-50">Supprimer</button>
                </div>
              </td>
            </tr>
          } @empty {
            <tr><td colspan="4" class="px-5 py-8 text-center text-slate-500">Aucun auteur enregistré.</td></tr>
          }
        </tbody>
      </table>
    </div>
  `
})
export class AuthorTable {
  @Input({ required: true }) authors: Author[] = [];
  @Output() readonly action = new EventEmitter<RowAction<Author>>();
}
