import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import { BooksService } from '../../services/books.service';

@Component({
  selector: 'app-book-form',
  imports: [ReactiveFormsModule, RouterLink],
  template: `
    <section class="mx-auto max-w-3xl rounded-[2rem] border border-white/60 bg-white/80 p-6 shadow-card backdrop-blur dark:border-slate-700 dark:bg-slate-900/80 md:p-8">
      <div class="mb-6 space-y-2">
        <p class="text-sm font-semibold uppercase tracking-[0.28em] text-vault-teal">Books</p>
        <h1 class="font-display text-4xl text-vault-ink dark:text-vault-paper">{{ isEditMode() ? 'Edit book' : 'Add new book' }}</h1>
        <p class="text-sm text-slate-600 dark:text-slate-300">{{ isEditMode() ? 'Update your saved book details.' : 'Create a new book entry in your vault.' }}</p>
      </div>

      @if (errorMessage()) {
        <div class="mb-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-900/40 dark:bg-rose-950/40 dark:text-rose-200">
          {{ errorMessage() }}
        </div>
      }

      <form class="space-y-5" [formGroup]="form" (ngSubmit)="submit()" novalidate>
        <label class="block space-y-2">
          <span class="text-sm font-semibold text-vault-ink dark:text-vault-paper">Book text</span>
          <textarea
            formControlName="text"
            rows="4"
            class="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-vault-ink outline-none transition focus:border-vault-teal focus:ring-4 focus:ring-vault-teal/10 dark:border-slate-700 dark:bg-slate-950 dark:text-vault-paper"
            placeholder="Book title or note"
          ></textarea>
          @if (showError('text')) {
            <span class="text-sm text-rose-600 dark:text-rose-300">Book text is required (max 1000 characters).</span>
          }
        </label>

        <label class="block space-y-2">
          <span class="text-sm font-semibold text-vault-ink dark:text-vault-paper">Author</span>
          <input
            formControlName="author"
            class="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-vault-ink outline-none transition focus:border-vault-teal focus:ring-4 focus:ring-vault-teal/10 dark:border-slate-700 dark:bg-slate-950 dark:text-vault-paper"
            placeholder="Author name"
          >
          @if (showError('author')) {
            <span class="text-sm text-rose-600 dark:text-rose-300">Author is required (max 200 characters).</span>
          }
        </label>

        <label class="block space-y-2">
          <span class="text-sm font-semibold text-vault-ink dark:text-vault-paper">Publication date</span>
          <input
            type="date"
            formControlName="publicationDate"
            class="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-vault-ink outline-none transition focus:border-vault-teal focus:ring-4 focus:ring-vault-teal/10 dark:border-slate-700 dark:bg-slate-950 dark:text-vault-paper"
          >
          @if (showError('publicationDate')) {
            <span class="text-sm text-rose-600 dark:text-rose-300">Publication date is required.</span>
          }
        </label>

        <div class="flex flex-col gap-3 pt-2 sm:flex-row sm:justify-end">
          <a
            routerLink="/books"
            class="inline-flex items-center justify-center rounded-full border border-vault-ink/20 px-5 py-3 text-sm font-semibold text-vault-ink transition hover:border-vault-teal hover:text-vault-teal dark:border-slate-600 dark:text-vault-paper"
          >
            Cancel
          </a>
          <button
            type="submit"
            class="inline-flex items-center justify-center gap-2 rounded-full bg-vault-ink px-5 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
            [disabled]="isSubmitting() || isLoadingBook()"
          >
            <i class="fa-solid" [class.fa-circle-notch]="isSubmitting()" [class.fa-spin]="isSubmitting()" [class.fa-floppy-disk]="!isSubmitting()"></i>
            {{ isSubmitting() ? 'Saving...' : (isEditMode() ? 'Save changes' : 'Create book') }}
          </button>
        </div>
      </form>
    </section>
  `
})
export class BookFormComponent {
  private readonly formBuilder = inject(FormBuilder);
  private readonly booksService = inject(BooksService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  protected readonly isSubmitting = signal(false);
  protected readonly isLoadingBook = signal(false);
  protected readonly errorMessage = signal('');
  protected readonly isEditMode = signal(false);
  private editingBookId: number | null = null;

  protected readonly form = this.formBuilder.nonNullable.group({
    text: ['', [Validators.required, Validators.maxLength(1000)]],
    author: ['', [Validators.required, Validators.maxLength(200)]],
    publicationDate: ['', [Validators.required]]
  });

  constructor() {
    const idParam = this.route.snapshot.paramMap.get('id');
    const parsedId = idParam ? Number(idParam) : Number.NaN;

    if (Number.isInteger(parsedId) && parsedId > 0) {
      this.isEditMode.set(true);
      this.editingBookId = parsedId;
      this.loadBook(parsedId);
      return;
    }

    this.form.controls.publicationDate.setValue(new Date().toISOString().slice(0, 10));
  }

  protected submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);
    this.errorMessage.set('');

    const payload = {
      text: this.form.controls.text.value,
      author: this.form.controls.author.value,
      publicationDate: new Date(this.form.controls.publicationDate.value).toISOString()
    };

    if (this.isEditMode() && this.editingBookId) {
      this.booksService.update(this.editingBookId, payload).subscribe({
        next: () => {
          this.isSubmitting.set(false);
          void this.router.navigateByUrl('/books');
        },
        error: () => {
          this.errorMessage.set('Could not save the book right now. Please try again.');
          this.isSubmitting.set(false);
        }
      });
      return;
    }

    this.booksService.create(payload).subscribe({
      next: () => {
        this.isSubmitting.set(false);
        void this.router.navigateByUrl('/books');
      },
      error: () => {
        this.errorMessage.set('Could not save the book right now. Please try again.');
        this.isSubmitting.set(false);
      }
    });
  }

  protected showError(controlName: 'text' | 'author' | 'publicationDate'): boolean {
    const control = this.form.controls[controlName];
    return control.invalid && (control.dirty || control.touched);
  }

  private loadBook(bookId: number): void {
    this.isLoadingBook.set(true);

    this.booksService.getById(bookId).subscribe({
      next: (book) => {
        this.form.setValue({
          text: book.text,
          author: book.author,
          publicationDate: new Date(book.publicationDate).toISOString().slice(0, 10)
        });
        this.isLoadingBook.set(false);
      },
      error: () => {
        this.errorMessage.set('Could not load this book.');
        this.isLoadingBook.set(false);
      }
    });
  }
}
