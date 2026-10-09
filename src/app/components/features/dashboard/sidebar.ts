import { Component, EventEmitter, Input, Output } from '@angular/core';

export type DashboardSection = 'clients' | 'authors' | 'books' | 'loans' ;

@Component({
  selector: 'app-dashboard-sidebar',
  standalone: true,
  template: `
    <aside class="w-full shrink-0 p-2.5 lg:h-full lg:p-4 bg-gray-300 border border-violet-600 rounded">
      <p class="hidden px-3 pb-3 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400 lg:block">Menu principal</p>
      <nav aria-label="Navigation principale" class="flex gap-1.5 overflow-x-auto lg:flex-col">
        <button
          type="button"
          (click)="sectionChange.emit('clients')"
          [attr.aria-current]="activeSection === 'clients' ? 'page' : null"
          [class]="navClass('clients')"
        >
          <span>Clients</span>
        </button>
        <button
          type="button"
          (click)="sectionChange.emit('authors')"
          [attr.aria-current]="activeSection === 'authors' ? 'page' : null"
          [class]="navClass('authors')"
        >
          <span>Auteurs</span>
        </button>
        <button
          type="button"
          (click)="sectionChange.emit('books')"
          [attr.aria-current]="activeSection === 'books' ? 'page' : null"
          [class]="navClass('books')"
        >
          <span>Livres</span>
        </button>
        <button
          type="button"
          (click)="sectionChange.emit('loans')"
          [attr.aria-current]="activeSection === 'loans' ? 'page' : null"
          [class]="navClass('loans')"
        >
          <span>Emprunts</span>
        </button>
      </nav>
    </aside>
  `
})
export class Sidebar {
  @Output() readonly sectionChange = new EventEmitter<DashboardSection>();
  @Input() activeSection: DashboardSection = 'clients';

  navClass(section: DashboardSection): string {
    const base = 'flex shrink-0 items-center gap-3 rounded-xl px-3 py-2.5 text-left text-xs font-semibold transition focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2 lg:w-full';
    return this.activeSection === section
      ? `${base} bg-violet-100 text-violet-900 ring-1 ring-inset ring-violet-200`
      : `${base} text-slate-600 hover:bg-white/80 hover:text-violet-900`;
  }
}
