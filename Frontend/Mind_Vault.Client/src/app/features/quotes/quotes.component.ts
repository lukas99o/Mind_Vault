import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { Quote } from '../../models/quote.models';
import { QuotesService } from '../../services/quotes.service';

@Component({
  selector: 'app-quotes',
  imports: [ReactiveFormsModule],
  template: `
    <section class="space-y-6">
      <header class="rounded-3xl border border-white/70 bg-white/80 p-6 shadow-card backdrop-blur dark:border-slate-700 dark:bg-slate-900/80">
        <p class="text-sm font-semibold uppercase tracking-[0.28em] text-vault-teal">My quotes</p>
        <h1 class="mt-2 font-display text-4xl text-vault-ink dark:text-vault-paper">Quotes</h1>
        <p class="mt-2 text-sm text-slate-600 dark:text-slate-300">Add, edit, and delete directly in this view.</p>
      </header>

      <form class="grid gap-3 rounded-3xl border border-white/70 bg-white/80 p-5 shadow-sm backdrop-blur dark:border-slate-700 dark:bg-slate-900/80 md:grid-cols-[1fr_260px_auto]" [formGroup]="createForm" (ngSubmit)="addQuote()" novalidate>
        <input
          formControlName="text"
          class="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-vault-ink outline-none transition focus:border-vault-teal focus:ring-4 focus:ring-vault-teal/10 dark:border-slate-700 dark:bg-slate-950 dark:text-vault-paper"
          placeholder="Write a quote"
        >
        <input
          formControlName="author"
          class="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-vault-ink outline-none transition focus:border-vault-teal focus:ring-4 focus:ring-vault-teal/10 dark:border-slate-700 dark:bg-slate-950 dark:text-vault-paper"
          placeholder="Author"
        >
        <button
          type="submit"
          class="inline-flex items-center justify-center gap-2 rounded-full bg-vault-ink px-5 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-slate-800 dark:hover:bg-vault-teal disabled:cursor-not-allowed disabled:opacity-60"
          [disabled]="isSubmittingCreate()"
        >
          <i class="fa-solid" [class.fa-circle-notch]="isSubmittingCreate()" [class.fa-spin]="isSubmittingCreate()" [class.fa-plus]="!isSubmittingCreate()"></i>
          {{ isSubmittingCreate() ? 'Adding...' : 'Add quote' }}
        </button>
      </form>

      @if (errorMessage()) {
        <p class="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-900/40 dark:bg-rose-950/40 dark:text-rose-200">
          {{ errorMessage() }}
        </p>
      }

      <div class="grid gap-4">
        @for (quote of quotes(); track quote.id) {
          <article class="rounded-3xl border border-white/70 bg-white/80 p-5 shadow-sm backdrop-blur dark:border-slate-700 dark:bg-slate-900/75">
            @if (editingQuoteId() === quote.id) {
              <form class="grid gap-3 md:grid-cols-[1fr_240px_auto]" [formGroup]="editForm" (ngSubmit)="saveQuote(quote.id)" novalidate>
                <input
                  formControlName="text"
                  class="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-vault-ink outline-none transition focus:border-vault-teal focus:ring-4 focus:ring-vault-teal/10 dark:border-slate-700 dark:bg-slate-950 dark:text-vault-paper"
                >
                <input
                  formControlName="author"
                  class="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-vault-ink outline-none transition focus:border-vault-teal focus:ring-4 focus:ring-vault-teal/10 dark:border-slate-700 dark:bg-slate-950 dark:text-vault-paper"
                >
                <div class="flex gap-2">
                  <button
                    type="submit"
                    class="inline-flex flex-1 items-center justify-center rounded-full bg-vault-ink px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                    [disabled]="isSubmittingEdit()"
                  >
                    Save
                  </button>
                  <button
                    type="button"
                    class="inline-flex flex-1 items-center justify-center rounded-full border border-vault-ink/20 px-4 py-2 text-sm font-semibold text-vault-ink transition hover:border-vault-teal hover:text-vault-teal dark:border-slate-600 dark:text-vault-paper"
                    (click)="cancelEdit()"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            } @else {
              <div class="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div>
                  <p class="text-lg font-semibold text-vault-ink dark:text-vault-paper">\"{{ quote.text }}\"</p>
                  <p class="mt-2 text-sm text-slate-600 dark:text-slate-300">{{ quote.author }}</p>
                </div>
                <div class="flex gap-2">
                  <button
                    type="button"
                    class="inline-flex items-center gap-2 rounded-full border border-vault-ink/20 px-4 py-2 text-sm font-semibold text-vault-ink transition hover:border-vault-teal hover:text-vault-teal dark:border-slate-600 dark:text-vault-paper"
                    (click)="startEdit(quote)"
                  >
                    <i class="fa-solid fa-pen-to-square"></i>
                    Edit
                  </button>
                  <button
                    type="button"
                    class="inline-flex items-center gap-2 rounded-full bg-rose-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-60"
                    [disabled]="deletingQuoteId() === quote.id"
                    (click)="deleteQuote(quote.id)"
                  >
                    <i class="fa-solid" [class.fa-trash]="deletingQuoteId() !== quote.id" [class.fa-circle-notch]="deletingQuoteId() === quote.id" [class.fa-spin]="deletingQuoteId() === quote.id"></i>
                    {{ deletingQuoteId() === quote.id ? 'Removing...' : 'Delete' }}
                  </button>
                </div>
              </div>
            }
          </article>
        }

        @for (_ of placeholderIndexes(); track $index) {
          <article class="rounded-3xl border border-dashed border-slate-300 bg-white/60 p-5 text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-900/45 dark:text-slate-400">
            Add another quote to reach your first five saved quotes.
          </article>
        }
      </div>
    </section>
  `
})
export class QuotesComponent {
  private readonly formBuilder = inject(FormBuilder);
  private readonly quotesService = inject(QuotesService);

  protected readonly quotes = signal<Quote[]>([]);
  protected readonly errorMessage = signal('');
  protected readonly editingQuoteId = signal<number | null>(null);
  protected readonly deletingQuoteId = signal<number | null>(null);
  protected readonly isSubmittingCreate = signal(false);
  protected readonly isSubmittingEdit = signal(false);

  protected readonly createForm = this.formBuilder.nonNullable.group({
    text: ['', [Validators.required, Validators.maxLength(1000)]],
    author: ['', [Validators.required, Validators.maxLength(200)]]
  });

  protected readonly editForm = this.formBuilder.nonNullable.group({
    text: ['', [Validators.required, Validators.maxLength(1000)]],
    author: ['', [Validators.required, Validators.maxLength(200)]]
  });

  constructor() {
    this.loadQuotes();
  }

  protected addQuote(): void {
    if (this.createForm.invalid) {
      this.createForm.markAllAsTouched();
      return;
    }

    this.isSubmittingCreate.set(true);
    this.errorMessage.set('');

    this.quotesService.create(this.createForm.getRawValue()).subscribe({
      next: (createdQuote) => {
        this.quotes.update((currentQuotes) => [createdQuote, ...currentQuotes]);
        this.createForm.reset({ text: '', author: '' });
        this.isSubmittingCreate.set(false);
      },
      error: () => {
        this.errorMessage.set('Could not add the quote right now. Please try again.');
        this.isSubmittingCreate.set(false);
      }
    });
  }

  protected startEdit(quote: Quote): void {
    this.errorMessage.set('');
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

    const request = this.editForm.getRawValue();

    this.quotesService.update(quoteId, request).subscribe({
      next: () => {
        this.quotes.update((currentQuotes) =>
          currentQuotes.map((quote) =>
            quote.id === quoteId
              ? {
                  ...quote,
                  text: request.text,
                  author: request.author
                }
              : quote
          )
        );
        this.isSubmittingEdit.set(false);
        this.cancelEdit();
      },
      error: () => {
        this.errorMessage.set('Could not save the quote right now. Please try again.');
        this.isSubmittingEdit.set(false);
      }
    });
  }

  protected deleteQuote(quoteId: number): void {
    this.deletingQuoteId.set(quoteId);
    this.errorMessage.set('');

    this.quotesService.delete(quoteId).subscribe({
      next: () => {
        this.quotes.update((currentQuotes) => currentQuotes.filter((quote) => quote.id !== quoteId));
        this.deletingQuoteId.set(null);
      },
      error: () => {
        this.errorMessage.set('Could not delete the quote right now. Please try again.');
        this.deletingQuoteId.set(null);
      }
    });
  }

  protected placeholderIndexes(): number[] {
    const missingCount = Math.max(0, 5 - this.quotes().length);
    return Array.from({ length: missingCount }, (_, index) => index);
  }

  private loadQuotes(): void {
    this.errorMessage.set('');

    this.quotesService.getAll(1, 20).subscribe({
      next: (response) => {
        this.quotes.set(response.items);
      },
      error: () => {
        this.errorMessage.set('Could not load quotes right now. Please try again.');
      }
    });
  }
}
