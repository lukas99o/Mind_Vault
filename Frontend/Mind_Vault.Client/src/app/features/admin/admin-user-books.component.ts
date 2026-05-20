import { DatePipe } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';

import { AdminBook } from '../../models/admin.models';
import { AdminUserBooksService } from '../../services/admin-user-books.service';

@Component({
  selector: 'app-admin-user-books',
  imports: [ReactiveFormsModule, RouterLink, DatePipe],
  template: `
    <section class="space-y-6">
      <header class="rounded-3xl border border-white/70 bg-white/80 p-6 shadow-card backdrop-blur dark:border-slate-700 dark:bg-slate-900/80">
        <p class="text-sm font-semibold uppercase tracking-[0.28em] text-vault-teal">Admin panel</p>
        <h1 class="mt-2 font-display text-4xl text-vault-ink dark:text-vault-paper">User books</h1>
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

      <form class="grid gap-3 rounded-3xl border border-white/70 bg-white/80 p-5 shadow-sm backdrop-blur dark:border-slate-700 dark:bg-slate-900/80 md:grid-cols-[1fr_220px_180px_auto]" [formGroup]="createForm" (ngSubmit)="addBook()" novalidate>
        <input formControlName="text" class="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-vault-ink outline-none transition focus:border-vault-teal focus:ring-4 focus:ring-vault-teal/10 dark:border-slate-700 dark:bg-slate-950 dark:text-vault-paper" placeholder="Book title or note">
        <input formControlName="author" class="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-vault-ink outline-none transition focus:border-vault-teal focus:ring-4 focus:ring-vault-teal/10 dark:border-slate-700 dark:bg-slate-950 dark:text-vault-paper" placeholder="Author">
        <input type="date" formControlName="publicationDate" class="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-vault-ink outline-none transition focus:border-vault-teal focus:ring-4 focus:ring-vault-teal/10 dark:border-slate-700 dark:bg-slate-950 dark:text-vault-paper">
        <button type="submit" class="inline-flex items-center justify-center rounded-full bg-vault-ink px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60" [disabled]="isSubmittingCreate()">
          {{ isSubmittingCreate() ? 'Adding...' : 'Add book' }}
        </button>
      </form>

      @if (isLoading()) {
        <div class="rounded-3xl border border-dashed border-slate-300 bg-white/70 p-8 text-center text-slate-600 dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-300">Loading books...</div>
      } @else if (books().length === 0) {
        <div class="rounded-3xl border border-dashed border-slate-300 bg-white/70 p-8 text-center text-slate-600 dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-300">No books found for this user.</div>
      } @else {
        <div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          @for (book of books(); track book.id) {
            <article class="rounded-3xl border border-white/70 bg-white/80 p-5 shadow-sm backdrop-blur dark:border-slate-700 dark:bg-slate-900/70">
              @if (editingBookId() === book.id) {
                <form class="space-y-3" [formGroup]="editForm" (ngSubmit)="saveBook(book.id)">
                  <textarea formControlName="text" rows="3" class="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-vault-ink outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-vault-paper"></textarea>
                  <input formControlName="author" class="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-vault-ink outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-vault-paper">
                  <input type="date" formControlName="publicationDate" class="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-vault-ink outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-vault-paper">
                  <div class="flex gap-2">
                    <button type="submit" class="inline-flex flex-1 justify-center rounded-full bg-vault-ink px-4 py-2 text-sm font-semibold text-white" [disabled]="isSubmittingEdit()">Save</button>
                    <button type="button" class="inline-flex flex-1 justify-center rounded-full border border-vault-ink/20 px-4 py-2 text-sm font-semibold text-vault-ink dark:border-slate-600 dark:text-vault-paper" (click)="cancelEdit()">Cancel</button>
                  </div>
                </form>
              } @else {
                <div class="space-y-2">
                  <p class="text-lg font-semibold text-vault-ink dark:text-vault-paper">{{ book.text }}</p>
                  <p class="text-sm text-slate-600 dark:text-slate-300">{{ book.author }}</p>
                  <p class="text-xs uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">{{ book.publicationDate | date: 'yyyy-MM-dd' }}</p>
                </div>
                <div class="mt-4 flex gap-2">
                  <button type="button" class="inline-flex items-center justify-center rounded-full border border-vault-ink/20 px-4 py-2 text-sm font-semibold text-vault-ink dark:border-slate-600 dark:text-vault-paper" (click)="startEdit(book)">Edit</button>
                  <button type="button" class="inline-flex items-center justify-center rounded-full bg-rose-600 px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60" [disabled]="deletingBookId() === book.id" (click)="deleteBook(book.id)">
                    {{ deletingBookId() === book.id ? 'Removing...' : 'Delete' }}
                  </button>
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
export class AdminUserBooksComponent {
  private readonly formBuilder = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly adminBooksService = inject(AdminUserBooksService);

  protected readonly userId = signal('');
  protected readonly books = signal<AdminBook[]>([]);
  protected readonly isLoading = signal(false);
  protected readonly errorMessage = signal('');
  protected readonly isSubmittingCreate = signal(false);
  protected readonly isSubmittingEdit = signal(false);
  protected readonly deletingBookId = signal<number | null>(null);
  protected readonly editingBookId = signal<number | null>(null);
  protected readonly pageNumber = signal(1);
  protected readonly pageSize = signal(12);
  protected readonly totalPages = signal(0);
  protected readonly hasNextPage = computed(() => this.pageNumber() < this.totalPages());
  protected readonly totalPagesLabel = computed(() => Math.max(1, this.totalPages()));

  protected readonly createForm = this.formBuilder.nonNullable.group({
    text: ['', [Validators.required, Validators.maxLength(1000)]],
    author: ['', [Validators.required, Validators.maxLength(200)]],
    publicationDate: [new Date().toISOString().slice(0, 10), [Validators.required]]
  });

  protected readonly editForm = this.formBuilder.nonNullable.group({
    text: ['', [Validators.required, Validators.maxLength(1000)]],
    author: ['', [Validators.required, Validators.maxLength(200)]],
    publicationDate: ['', [Validators.required]]
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

  protected addBook(): void {
    if (this.createForm.invalid) {
      this.createForm.markAllAsTouched();
      return;
    }

    this.isSubmittingCreate.set(true);
    this.errorMessage.set('');

    const request = this.toBookRequest(this.createForm.getRawValue());

    this.adminBooksService.create(this.userId(), request).subscribe({
      next: () => {
        this.createForm.reset({
          text: '',
          author: '',
          publicationDate: new Date().toISOString().slice(0, 10)
        });
        this.isSubmittingCreate.set(false);
        this.loadPage(1);
      },
      error: () => {
        this.errorMessage.set('Could not add this book right now. Please try again.');
        this.isSubmittingCreate.set(false);
      }
    });
  }

  protected startEdit(book: AdminBook): void {
    this.editingBookId.set(book.id);
    this.editForm.setValue({
      text: book.text,
      author: book.author,
      publicationDate: new Date(book.publicationDate).toISOString().slice(0, 10)
    });
  }

  protected cancelEdit(): void {
    this.editingBookId.set(null);
    this.editForm.reset({ text: '', author: '', publicationDate: '' });
  }

  protected saveBook(bookId: number): void {
    if (this.editForm.invalid) {
      this.editForm.markAllAsTouched();
      return;
    }

    this.isSubmittingEdit.set(true);
    this.errorMessage.set('');

    const request = this.toBookRequest(this.editForm.getRawValue());

    this.adminBooksService.update(this.userId(), bookId, request).subscribe({
      next: () => {
        this.isSubmittingEdit.set(false);
        this.cancelEdit();
        this.loadPage(this.pageNumber());
      },
      error: () => {
        this.errorMessage.set('Could not save this book right now. Please try again.');
        this.isSubmittingEdit.set(false);
      }
    });
  }

  protected deleteBook(bookId: number): void {
    this.deletingBookId.set(bookId);
    this.errorMessage.set('');

    this.adminBooksService.delete(this.userId(), bookId).subscribe({
      next: () => {
        this.deletingBookId.set(null);
        this.loadPage(this.pageNumber());
      },
      error: () => {
        this.errorMessage.set('Could not delete this book right now. Please try again.');
        this.deletingBookId.set(null);
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

    this.adminBooksService.getAllForUser(this.userId(), pageNumber, this.pageSize()).subscribe({
      next: (response) => {
        this.books.set(response.items);
        this.pageNumber.set(response.pageNumber);
        this.totalPages.set(response.totalPages);
        this.isLoading.set(false);
      },
      error: () => {
        this.errorMessage.set('Could not load books right now. Please try again.');
        this.isLoading.set(false);
      }
    });
  }

  private toBookRequest(formValue: { text: string; author: string; publicationDate: string }): {
    text: string;
    author: string;
    publicationDate: string;
  } {
    return {
      text: formValue.text,
      author: formValue.author,
      publicationDate: new Date(formValue.publicationDate).toISOString()
    };
  }
}
