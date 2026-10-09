import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-statistics-section',
  standalone: true,
  template: `
    <section aria-label="Statistiques" class="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
      <article class="rounded-xl border border-violet-200 bg-linear-to-br from-white to-violet-100 p-3 shadow-sm shadow-violet-900/5 sm:p-3.5">
        <div class="flex items-start justify-between">
          <div>
            <p class="text-[11px] font-semibold text-slate-500">Lecteurs</p>
            <p class="mt-1.5 text-2xl font-bold tracking-tight text-slate-950">{{ clientsCount }}</p>
            <p class="mt-0.5 text-[10px] text-slate-500">Comptes enregistrés</p>
          </div>
          <span class="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-100 text-[10px] font-bold text-violet-800" aria-hidden="true">CL</span>
        </div>
      </article>
      <article class="rounded-xl border border-fuchsia-200 bg-linear-to-br from-white to-fuchsia-100 p-3 shadow-sm shadow-fuchsia-900/5 sm:p-3.5">
        <div class="flex items-start justify-between">
          <div>
            <p class="text-[11px] font-semibold text-slate-500">Livres au catalogue</p>
            <p class="mt-1.5 text-2xl font-bold tracking-tight text-slate-950">{{ booksCount }}</p>
            <p class="mt-0.5 text-[10px] text-slate-500">Titres référencés</p>
          </div>
          <span class="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-100 text-[10px] font-bold text-violet-800" aria-hidden="true">LI</span>
        </div>
      </article>
      <article class="rounded-xl border border-indigo-200 bg-linear-to-br from-white to-indigo-100 p-3 shadow-sm shadow-indigo-900/5 sm:p-3.5">
        <div class="flex items-start justify-between">
          <div>
            <p class="text-[11px] font-semibold text-slate-500">Prêts actifs</p>
            <p class="mt-1.5 text-2xl font-bold tracking-tight text-slate-950">{{ loansCount }}</p>
            <p class="mt-0.5 text-[10px] text-slate-500">À suivre actuellement</p>
          </div>
          <span class="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-100 text-[10px] font-bold text-violet-800" aria-hidden="true">PR</span>
        </div>
      </article>
      <article class="rounded-xl border border-rose-200 bg-linear-to-br from-white to-rose-100 p-3 shadow-sm shadow-rose-900/5 sm:p-3.5">
        <div class="flex items-start justify-between">
          <div>
            <p class="text-[11px] font-semibold text-slate-500">Retards</p>
            <p class="mt-1.5 text-2xl font-bold tracking-tight" [class]="overdueLoansCount ? 'text-rose-700' : 'text-slate-950'">{{ overdueLoansCount }}</p>
            <p class="mt-0.5 text-[10px] text-slate-500">Retours à relancer</p>
          </div>
          <span class="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-100 text-[10px] font-bold text-violet-800" aria-hidden="true">!</span>
        </div>
      </article>
    </section>
  `
})
export class StatisticsSection {
  @Input({ required: true }) clientsCount = 0;
  @Input({ required: true }) booksCount = 0;
  @Input({ required: true }) loansCount = 0;
  @Input({ required: true }) overdueLoansCount = 0;
}
