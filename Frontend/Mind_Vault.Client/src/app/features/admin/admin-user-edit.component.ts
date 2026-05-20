import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import { AdminUsersService } from '../../services/admin-users.service';

@Component({
  selector: 'app-admin-user-edit',
  imports: [ReactiveFormsModule, RouterLink],
  template: `
    <section class="mx-auto max-w-3xl space-y-6">
      <header class="rounded-3xl border border-white/70 bg-white/80 p-6 shadow-card backdrop-blur dark:border-slate-700 dark:bg-slate-900/80">
        <p class="text-sm font-semibold uppercase tracking-[0.28em] text-vault-teal">Admin panel</p>
        <h1 class="mt-2 font-display text-4xl text-vault-ink dark:text-vault-paper">Edit user</h1>
      </header>

      @if (errorMessage()) {
        <p class="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-900/40 dark:bg-rose-950/40 dark:text-rose-200">
          {{ errorMessage() }}
        </p>
      }

      @if (successMessage()) {
        <p class="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800 dark:border-emerald-900/40 dark:bg-emerald-950/40 dark:text-emerald-200">
          {{ successMessage() }}
        </p>
      }

      <form class="space-y-5 rounded-3xl border border-white/70 bg-white/80 p-6 shadow-sm backdrop-blur dark:border-slate-700 dark:bg-slate-900/75" [formGroup]="form" (ngSubmit)="save()" novalidate>
        <label class="block space-y-2">
          <span class="text-sm font-semibold text-vault-ink dark:text-vault-paper">Username</span>
          <input
            formControlName="userName"
            class="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-vault-ink outline-none transition focus:border-vault-teal focus:ring-4 focus:ring-vault-teal/10 dark:border-slate-700 dark:bg-slate-950 dark:text-vault-paper"
            placeholder="Username"
          >
          @if (showError()) {
            <span class="text-sm text-rose-600 dark:text-rose-300">Username is required.</span>
          }
        </label>

        <div class="flex flex-wrap gap-3">
          <button
            type="submit"
            class="inline-flex items-center justify-center gap-2 rounded-full bg-vault-ink px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
            [disabled]="isSubmitting()"
          >
            <i class="fa-solid" [class.fa-circle-notch]="isSubmitting()" [class.fa-spin]="isSubmitting()" [class.fa-floppy-disk]="!isSubmitting()"></i>
            {{ isSubmitting() ? 'Saving...' : 'Save username' }}
          </button>

          <a
            [routerLink]="['/admin/users', userId(), 'books']"
            class="inline-flex items-center justify-center rounded-full border border-vault-ink/20 px-5 py-3 text-sm font-semibold text-vault-ink transition hover:border-vault-teal hover:text-vault-teal dark:border-slate-600 dark:text-vault-paper"
          >
            User books
          </a>

          <a
            [routerLink]="['/admin/users', userId(), 'quotes']"
            class="inline-flex items-center justify-center rounded-full border border-vault-ink/20 px-5 py-3 text-sm font-semibold text-vault-ink transition hover:border-vault-teal hover:text-vault-teal dark:border-slate-600 dark:text-vault-paper"
          >
            User quotes
          </a>

          <button
            type="button"
            class="inline-flex items-center justify-center gap-2 rounded-full bg-rose-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-60"
            [disabled]="isDeleting()"
            (click)="deleteUser()"
          >
            <i class="fa-solid" [class.fa-circle-notch]="isDeleting()" [class.fa-spin]="isDeleting()" [class.fa-trash]="!isDeleting()"></i>
            {{ isDeleting() ? 'Deleting...' : 'Delete user' }}
          </button>
        </div>
      </form>

      <a
        routerLink="/admin/users"
        class="inline-flex items-center justify-center rounded-full border border-vault-ink/20 px-5 py-3 text-sm font-semibold text-vault-ink transition hover:border-vault-teal hover:text-vault-teal dark:border-slate-600 dark:text-vault-paper"
      >
        Back to users
      </a>
    </section>
  `
})
export class AdminUserEditComponent {
  private readonly formBuilder = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly adminUsersService = inject(AdminUsersService);

  protected readonly userId = signal('');
  protected readonly errorMessage = signal('');
  protected readonly successMessage = signal('');
  protected readonly isSubmitting = signal(false);
  protected readonly isDeleting = signal(false);

  protected readonly form = this.formBuilder.nonNullable.group({
    userName: ['', [Validators.required]]
  });

  constructor() {
    const userId = this.route.snapshot.paramMap.get('id');

    if (!userId) {
      this.errorMessage.set('Invalid user id.');
      return;
    }

    this.userId.set(userId);
    this.loadUser(userId);
  }

  protected save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);
    this.errorMessage.set('');
    this.successMessage.set('');

    this.adminUsersService.update(this.userId(), this.form.getRawValue()).subscribe({
      next: (user) => {
        this.form.controls.userName.setValue(user.userName);
        this.successMessage.set('Username updated.');
        this.isSubmitting.set(false);
      },
      error: () => {
        this.errorMessage.set('Could not save this user right now. Please try again.');
        this.isSubmitting.set(false);
      }
    });
  }

  protected deleteUser(): void {
    this.isDeleting.set(true);
    this.errorMessage.set('');
    this.successMessage.set('');

    this.adminUsersService.delete(this.userId()).subscribe({
      next: () => {
        this.isDeleting.set(false);
        void this.router.navigateByUrl('/admin/users');
      },
      error: () => {
        this.errorMessage.set('Could not delete this user right now. Please try again.');
        this.isDeleting.set(false);
      }
    });
  }

  protected showError(): boolean {
    const control = this.form.controls.userName;
    return control.invalid && (control.dirty || control.touched);
  }

  private loadUser(userId: string): void {
    this.errorMessage.set('');

    this.adminUsersService.getById(userId).subscribe({
      next: (user) => {
        this.form.controls.userName.setValue(user.userName);
      },
      error: () => {
        this.errorMessage.set('Could not load this user right now.');
      }
    });
  }
}
