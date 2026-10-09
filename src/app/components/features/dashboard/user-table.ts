import { Component, EventEmitter, Input, Output } from '@angular/core';
import type { Client } from '../../../core/models/library.models';

export interface RowAction<T> {
  mode: 'details' | 'edit' | 'delete';
  record: T;
}

@Component({
  selector: 'app-user-table',
  standalone: true,
  template: `
    <div class="h-full overflow-auto">
      <table class="w-full min-w-[900px] text-left text-xs">
        <thead class="sticky top-0 z-10 bg-violet-100 text-[10px] uppercase tracking-wider text-violet-950">
          <tr>
            <th scope="col" class="px-5 py-3">User ID</th>
            <th scope="col" class="px-5 py-3">Nom</th>
            <th scope="col" class="px-5 py-3">Prénom</th>
            <th scope="col" class="px-5 py-3">E-mail</th>
            <th scope="col" class="px-5 py-3">Contact</th>
            <th scope="col" class="px-5 py-3">Statut</th>
            <th scope="col" class="px-5 py-3">Actions</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-violet-100 bg-white/75">
          @for (client of clients; track client.userId) {
            <tr class="text-slate-700 transition hover:bg-violet-50/60">
              <td class="px-4 py-3 text-slate-400">#{{ client.userId }}</td>
              <td class="px-4 py-3 font-semibold text-slate-900">{{ client.lastName }}</td>
              <td class="px-4 py-3">{{ client.firstName }}</td>
              <td class="px-4 py-3">{{ client.email }}</td>
              <td class="px-4 py-3">{{ client.contact }}</td>
              <td class="px-4 py-3">
                <span [class]="client.status === 'Actif' ? 'rounded-full bg-emerald-50 px-2.5 py-1 text-emerald-700 ring-1 ring-emerald-600/20 ring-inset' : 'rounded-full bg-rose-50 px-2.5 py-1 text-rose-700 ring-1 ring-rose-600/20 ring-inset'">
                  {{ client.status }}
                </span>
              </td>
              <td class="px-4 py-3">
                <div class="flex items-center gap-1.5">
                  <button type="button" (click)="action.emit({ mode: 'details', record: client })" class="inline-flex items-center gap-1 rounded-lg border border-violet-200 bg-white px-2 py-1.5 text-[10px] font-bold text-violet-800 shadow-sm transition hover:bg-violet-50" aria-label="Détails du client">
                    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" class="h-3.5 w-3.5"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" stroke="currentColor" stroke-width="1.8"/><circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="1.8"/></svg>
                    Détails
                  </button>
                  <button type="button" (click)="action.emit({ mode: 'edit', record: client })" class="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-[10px] font-bold text-slate-700 shadow-sm transition hover:border-violet-200 hover:bg-violet-50" aria-label="Modifier le client">
                    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" class="h-3.5 w-3.5"><path d="m16 4 4 4M4 20l4-.8L19 8a2.1 2.1 0 0 0-3-3L5 16l-1 4Z" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>
                    Modifier
                  </button>
                  <button type="button" (click)="action.emit({ mode: 'delete', record: client })" class="inline-flex items-center gap-1 rounded-lg border border-rose-100 bg-white px-2 py-1.5 text-[10px] font-bold text-rose-700 shadow-sm transition hover:bg-rose-50" aria-label="Supprimer le client">
                    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" class="h-3.5 w-3.5"><path d="M4 7h16m-10 4v6m4-6v6M5 7l1 14h12l1-14M9 7V4h6v3" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>
                    Supprimer
                  </button>
                </div>
              </td>
            </tr>
          } @empty {
            <tr><td colspan="7" class="px-5 py-8 text-center text-slate-500">Aucun utilisateur enregistré.</td></tr>
          }
        </tbody>
      </table>
    </div>
  `
})
export class UserTable {
  @Input({ required: true }) clients: Client[] = [];
  @Output() readonly action = new EventEmitter<RowAction<Client>>();
}
