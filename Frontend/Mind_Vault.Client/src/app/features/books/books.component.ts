import { DatePipe } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import { Book } from '../../models/book.models';
import { BooksService } from '../../services/books.service';

@Component({
  selector: 'app-books',
  imports: [RouterLink, DatePipe],
  template: `
    <section class="space-y-6">
      <header class="flex flex-col gap-4 rounded-3xl border border-white/70 bg-white/80 p-6 shadow-card backdrop-blur dark:border-slate-700 dark:bg-slate-900/80 md:flex-row md:items-center md:justify-between">
        <div class="space-y-1">
          <p class="text-sm font-semibold uppercase tracking-[0.28em] text-vault-teal">Signed-in home</p>
          <h1 class="font-display text-4xl text-vault-ink dark:text-vault-paper">Books</h1>
          <p class="text-sm text-slate-600 dark:text-slate-300">All your books in one place. Add, edit, or delete in one click.</p>
        </div>

        <a
          routerLink="/books/new"
          class="inline-flex items-center justify-center gap-2 rounded-full bg-vault-ink px-5 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-slate-800 dark:hover:bg-vault-teal"
        >
          <i class="fa-solid fa-plus"></i>
          Add new book
        </a>
      </header>

      @if (errorMessage()) {
        <p class="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-900/40 dark:bg-rose-950/40 dark:text-rose-200">
          {{ errorMessage() }}
        </p>
      }

      @if (isLoading()) {
        <div class="rounded-3xl border border-dashed border-slate-300 bg-white/70 p-8 text-center text-slate-600 dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-300">
          Loading books...
        </div>
      } @else if (books().length === 0) {
        <div class="rounded-3xl border border-dashed border-slate-300 bg-white/70 p-8 text-center text-slate-600 dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-300">
          <p class="text-lg font-semibold text-vault-ink dark:text-vault-paper">No books yet</p>
          <p class="mt-2 text-sm">Create your first book entry to start your personal vault.</p>
        </div>
      } @else {
        <div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          @for (book of books(); track book.id) {
            <article class="flex h-full flex-col justify-between rounded-3xl border border-white/70 bg-white/80 p-5 shadow-sm backdrop-blur dark:border-slate-700 dark:bg-slate-900/70">
              <div class="space-y-3">
                <p class="line-clamp-3 text-lg font-semibold text-vault-ink dark:text-vault-paper">{{ book.text }}</p>
                <p class="text-sm text-slate-600 dark:text-slate-300">{{ book.author }}</p>
                <p class="text-xs uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
                  {{ book.publicationDate | date: 'yyyy-MM-dd' }}
                </p>
              </div>

              <div class="mt-5 flex items-center gap-2">
                <a
                  [routerLink]="['/books', book.id, 'edit']"
                  class="inline-flex items-center gap-2 rounded-full border border-vault-ink/20 px-4 py-2 text-sm font-semibold text-vault-ink transition hover:border-vault-teal hover:text-vault-teal dark:border-slate-600 dark:text-vault-paper"
                >
                  <i class="fa-solid fa-pen-to-square"></i>
                  Edit
                </a>

                <button
                  type="button"
                  class="inline-flex items-center gap-2 rounded-full bg-rose-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-60"
                  [disabled]="deletingBookId() === book.id"
                  (click)="deleteBook(book)"
                >
                  <i class="fa-solid" [class.fa-trash]="deletingBookId() !== book.id" [class.fa-circle-notch]="deletingBookId() === book.id" [class.fa-spin]="deletingBookId() === book.id"></i>
                  {{ deletingBookId() === book.id ? 'Removing...' : 'Delete' }}
                </button>
              </div>
            </article>
          }
        </div>
      }
    </section>
  `
})
export class BooksComponent {
  private readonly booksService = inject(BooksService);

  protected readonly books = signal<Book[]>([]);
  protected readonly isLoading = signal(false);
  protected readonly deletingBookId = signal<number | null>(null);
  protected readonly errorMessage = signal('');

  constructor() {
    this.loadBooks();
  }

  protected deleteBook(book: Book): void {
    this.deletingBookId.set(book.id);
    this.errorMessage.set('');

    this.booksService.delete(book.id).subscribe({
      next: () => {
        this.books.update((currentBooks) => currentBooks.filter((item) => item.id !== book.id));
        this.deletingBookId.set(null);
      },
      error: () => {
        this.errorMessage.set('Could not delete the book right now. Please try again.');
        this.deletingBookId.set(null);
      }
    });
  }

  private loadBooks(): void {
    this.isLoading.set(true);
    this.errorMessage.set('');

    this.booksService.getAll(1, 50).subscribe({
      next: (response) => {
        this.books.set(response.items);
        this.isLoading.set(false);
      },
      error: () => {
        this.errorMessage.set('Could not load books right now. Please try again.');
        this.isLoading.set(false);
      }
    });
  }
}
