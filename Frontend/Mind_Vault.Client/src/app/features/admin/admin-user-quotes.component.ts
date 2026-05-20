import { Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';

import { AdminQuote } from '../../models/admin.models';
import { AdminUserQuotesService } from '../../services/admin-user-quotes.service';

@Component({
  selector: 'app-admin-user-quotes',
  imports: [ReactiveFormsModule, RouterLink],
  template: `
    <section class="space-y-6">
      <header class="rounded-3xl border border-white/70 bg-white/80 p-6 shadow-card backdrop-blur dark:border-slate-700 dark:bg-slate-900/80">
        <p class="text-sm font-semibold uppercase tracking-[0.28em] text-vault-teal">Admin panel</p>
        <h1 class="mt-2 font-display text-4xl text-vault-ink dark:text-vault-paper">User quotes</h1>
        <p class="mt-2 text-sm text-slate-600 dark:text-slate-300">User ID: {{ userId() }}</p>
      </header>

      <div class="flex flex-wrap gap-2">
        <a [routerLink]="['/admin/users', userId()]" class="rounded-full border border-vault-ink/20 px-4 py-2 text-sm font-semibold text-vault-ink transition hover:border-vault-teal hover:text-vault-teal dark:border-slate-600 dark:text-vault-paper">Edit user</a>
        <a routerLink="/admin/users" class="rounded-full border border-vault-ink/20 px-4 py-2 text-sm font-semibold text-vault-ink transition hover:border-vault-teal hover:text-vault-teal dark:border-slate-600 dark:text-vault-paper">All users</a>
      </div>

      @if (errorMessage()) {
        <p class="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-900/40 dark:bg-rose-950/40 dark:text-rose-200">
          {{ errorMessage() }}
        </p>
      }

      <form class="grid gap-3 rounded-3xl border border-white/70 bg-white/80 p-5 shadow-sm backdrop-blur dark:border-slate-700 dark:bg-slate-900/80 md:grid-cols-[1fr_260px_auto]" [formGroup]="createForm" (ngSubmit)="addQuote()" novalidate>
        <input formControlName="text" class="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-vault-ink outline-none transition focus:border-vault-teal focus:ring-4 focus:ring-vault-teal/10 dark:border-slate-700 dark:bg-slate-950 dark:text-vault-paper" placeholder="Write a quote">
        <input formControlName="author" class="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-vault-ink outline-none transition focus:border-vault-teal focus:ring-4 focus:ring-vault-teal/10 dark:border-slate-700 dark:bg-slate-950 dark:text-vault-paper" placeholder="Author">
        <button type="submit" class="inline-flex items-center justify-center rounded-full bg-vault-ink px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60" [disabled]="isSubmittingCreate()">
          {{ isSubmittingCreate() ? 'Adding...' : 'Add quote' }}
        </button>
      </form>

      @if (isLoading()) {
        <div class="rounded-3xl border border-dashed border-slate-300 bg-white/70 p-8 text-center text-slate-600 dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-300">Loading quotes...</div>
      } @else if (quotes().length === 0) {
        <div class="rounded-3xl border border-dashed border-slate-300 bg-white/70 p-8 text-center text-slate-600 dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-300">No quotes found for this user.</div>
      } @else {
        <div class="grid gap-4">
          @for (quote of quotes(); track quote.id) {
            <article class="rounded-3xl border border-white/70 bg-white/80 p-5 shadow-sm backdrop-blur dark:border-slate-700 dark:bg-slate-900/75">
              @if (editingQuoteId() === quote.id) {
                <form class="grid gap-3 md:grid-cols-[1fr_240px_auto]" [formGroup]="editForm" (ngSubmit)="saveQuote(quote.id)">
                  <input formControlName="text" class="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-vault-ink outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-vault-paper">
                  <input formControlName="author" class="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-vault-ink outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-vault-paper">
                  <div class="flex gap-2">
                    <button type="submit" class="inline-flex flex-1 justify-center rounded-full bg-vault-ink px-4 py-2 text-sm font-semibold text-white" [disabled]="isSubmittingEdit()">Save</button>
                    <button type="button" class="inline-flex flex-1 justify-center rounded-full border border-vault-ink/20 px-4 py-2 text-sm font-semibold text-vault-ink dark:border-slate-600 dark:text-vault-paper" (click)="cancelEdit()">Cancel</button>
                  </div>
                </form>
              } @else {
                <div class="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div>
                    <p class="text-lg font-semibold text-vault-ink dark:text-vault-paper">"{{ quote.text }}"</p>
                    <p class="mt-2 text-sm text-slate-600 dark:text-slate-300">{{ quote.author }}</p>
                  </div>
                  <div class="flex gap-2">
                    <button type="button" class="inline-flex items-center justify-center rounded-full border border-vault-ink/20 px-4 py-2 text-sm font-semibold text-vault-ink dark:border-slate-600 dark:text-vault-paper" (click)="startEdit(quote)">Edit</button>
                    <button type="button" class="inline-flex items-center justify-center rounded-full bg-rose-600 px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60" [disabled]="deletingQuoteId() === quote.id" (click)="deleteQuote(quote.id)">
                      {{ deletingQuoteId() === quote.id ? 'Removing...' : 'Delete' }}
                    </button>
                  </div>
                </div>
              }
            </article>
          }
        </div>
      }

      <div class="flex items-center justify-between rounded-2xl border border-white/70 bg-white/80 px-4 py-3 text-sm dark:border-slate-700 dark:bg-slate-900/75">
        <button type="button" class="rounded-full border border-vault-ink/20 px-4 py-2 font-semibold text-vault-ink disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-600 dark:text-vault-paper" (click)="previousPage()" [disabled]="pageNumber() <= 1">Previous</button>
        <p class="text-slate-600 dark:text-slate-300">Page {{ pageNumber() }} of {{ totalPagesLabel() }}</p>
        <button type="button" class="rounded-full border border-vault-ink/20 px-4 py-2 font-semibold text-vault-ink disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-600 dark:text-vault-paper" (click)="nextPage()" [disabled]="!hasNextPage()">Next</button>
      </div>
    </section>
  `
})
export class AdminUserQuotesComponent {
  private readonly formBuilder = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly adminQuotesService = inject(AdminUserQuotesService);

  protected readonly userId = signal('');
  protected readonly quotes = signal<AdminQuote[]>([]);
  protected readonly isLoading = signal(false);
  protected readonly errorMessage = signal('');
  protected readonly isSubmittingCreate = signal(false);
  protected readonly isSubmittingEdit = signal(false);
  protected readonly deletingQuoteId = signal<number | null>(null);
  protected readonly editingQuoteId = signal<number | null>(null);
  protected readonly pageNumber = signal(1);
  protected readonly pageSize = signal(12);
  protected readonly totalPages = signal(0);
  protected readonly hasNextPage = computed(() => this.pageNumber() < this.totalPages());
  protected readonly totalPagesLabel = computed(() => Math.max(1, this.totalPages()));

  protected readonly createForm = this.formBuilder.nonNullable.group({
    text: ['', [Validators.required, Validators.maxLength(1000)]],
    author: ['', [Validators.required, Validators.maxLength(200)]]
  });

  protected readonly editForm = this.formBuilder.nonNullable.group({
    text: ['', [Validators.required, Validators.maxLength(1000)]],
    author: ['', [Validators.required, Validators.maxLength(200)]]
  });

  constructor() {
    const userId = this.route.snapshot.paramMap.get('userId');

    if (!userId) {
      this.errorMessage.set('Invalid user id.');
      return;
    }

    this.userId.set(userId);
    this.loadPage(1);
  }

  protected addQuote(): void {
    if (this.createForm.invalid) {
      this.createForm.markAllAsTouched();
      return;
    }

    this.isSubmittingCreate.set(true);
    this.errorMessage.set('');

    this.adminQuotesService.create(this.userId(), this.createForm.getRawValue()).subscribe({
      next: () => {
        this.createForm.reset({ text: '', author: '' });
        this.isSubmittingCreate.set(false);
        this.loadPage(1);
      },
      error: () => {
        this.errorMessage.set('Could not add this quote right now. Please try again.');
        this.isSubmittingCreate.set(false);
      }
    });
  }

  protected startEdit(quote: AdminQuote): void {
    this.editingQuoteId.set(quote.id);
    this.editForm.setValue({
      text: quote.text,
      author: quote.author
    });
  }

  protected cancelEdit(): void {
    this.editingQuoteId.set(null);
    this.editForm.reset({ text: '', author: '' });
  }

  protected saveQuote(quoteId: number): void {
    if (this.editForm.invalid) {
      this.editForm.markAllAsTouched();
      return;
    }

    this.isSubmittingEdit.set(true);
    this.errorMessage.set('');

    this.adminQuotesService.update(this.userId(), quoteId, this.editForm.getRawValue()).subscribe({
      next: () => {
        this.isSubmittingEdit.set(false);
        this.cancelEdit();
        this.loadPage(this.pageNumber());
      },
      error: () => {
        this.errorMessage.set('Could not save this quote right now. Please try again.');
        this.isSubmittingEdit.set(false);
      }
    });
  }

  protected deleteQuote(quoteId: number): void {
    this.deletingQuoteId.set(quoteId);
    this.errorMessage.set('');

    this.adminQuotesService.delete(this.userId(), quoteId).subscribe({
      next: () => {
        this.deletingQuoteId.set(null);
        this.loadPage(this.pageNumber());
      },
      error: () => {
        this.errorMessage.set('Could not delete this quote right now. Please try again.');
        this.deletingQuoteId.set(null);
      }
    });
  }

  protected previousPage(): void {
    const targetPage = Math.max(1, this.pageNumber() - 1);
    this.loadPage(targetPage);
  }

  protected nextPage(): void {
    if (!this.hasNextPage()) {
      return;
    }

    this.loadPage(this.pageNumber() + 1);
  }

  private loadPage(pageNumber: number): void {
    this.isLoading.set(true);
    this.errorMessage.set('');

    this.adminQuotesService.getAllForUser(this.userId(), pageNumber, this.pageSize()).subscribe({
      next: (response) => {
        this.quotes.set(response.items);
        this.pageNumber.set(response.pageNumber);
        this.totalPages.set(response.totalPages);
        this.isLoading.set(false);
      },
      error: () => {
        this.errorMessage.set('Could not load quotes right now. Please try again.');
        this.isLoading.set(false);
      }
    });
  }
}
