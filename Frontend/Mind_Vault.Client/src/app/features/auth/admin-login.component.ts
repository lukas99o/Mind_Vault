import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';

import { ApiErrorResponse } from '../../models/auth.models';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-admin-login',
  imports: [ReactiveFormsModule, RouterLink],
  template: `
    <section class="mx-auto max-w-5xl rounded-[2rem] border border-white/60 bg-white/80 p-6 shadow-card backdrop-blur md:p-10">
      <div class="grid gap-8 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
        <div class="space-y-5 rounded-[1.75rem] bg-vault-ink p-8 text-white">
          <p class="text-sm font-semibold uppercase tracking-[0.28em] text-white/70">Admin access</p>
          <h1 class="font-display text-4xl leading-tight">Mind Vault control center</h1>
          <p class="text-sm leading-7 text-white/75">
            Sign in with an administrator account to manage users and their books and quotes.
          </p>
          <div class="rounded-3xl border border-white/10 bg-white/5 p-5 text-sm leading-7 text-white/75">
            <p class="font-semibold text-white">Restricted area</p>
            <p class="mt-2">Only accounts with the Admin role can open the admin dashboard.</p>
          </div>
        </div>

        <div class="space-y-6">
          <div>
            <p class="text-sm font-semibold uppercase tracking-[0.28em] text-vault-teal">Mind Vault</p>
            <h2 class="mt-3 font-display text-4xl text-vault-ink">Admin log in</h2>
            <p class="mt-2 text-sm leading-7 text-slate-600">Use your admin email and password.</p>
          </div>

          @if (errorMessage()) {
            <div class="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              {{ errorMessage() }}
            </div>
          }

          <form class="space-y-5" [formGroup]="form" (ngSubmit)="submit()" novalidate>
            <label class="block space-y-2">
              <span class="text-sm font-semibold text-vault-ink">Email</span>
              <input
                type="email"
                formControlName="email"
                autocomplete="email"
                class="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-vault-ink outline-none transition focus:border-vault-teal focus:ring-4 focus:ring-vault-teal/10"
                placeholder="admin@example.com"
              >
              @if (showError('email')) {
                <span class="text-sm text-rose-600">Enter a valid email address.</span>
              }
            </label>

            <label class="block space-y-2">
              <span class="text-sm font-semibold text-vault-ink">Password</span>
              <input
                type="password"
                formControlName="password"
                autocomplete="current-password"
                class="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-vault-ink outline-none transition focus:border-vault-teal focus:ring-4 focus:ring-vault-teal/10"
                placeholder="Enter password"
              >
              @if (showError('password')) {
                <span class="text-sm text-rose-600">Enter your password.</span>
              }
            </label>

            <button
              type="submit"
              class="inline-flex w-full items-center justify-center gap-2 rounded-full bg-vault-ink px-6 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-70"
              [disabled]="isSubmitting()"
            >
              <i class="fa-solid" [class.fa-circle-notch]="isSubmitting()" [class.fa-spin]="isSubmitting()" [class.fa-user-shield]="!isSubmitting()"></i>
              {{ isSubmitting() ? 'Logging in...' : 'Log in as admin' }}
            </button>
          </form>

          <p class="text-sm text-slate-600">
            Need a regular account? <a routerLink="/login" class="font-semibold text-vault-teal hover:text-vault-ink">Go to standard login</a>.
          </p>
        </div>
      </div>
    </section>
  `
})
export class AdminLoginComponent {
  private readonly formBuilder = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  protected readonly errorMessage = signal('');
  protected readonly isSubmitting = signal(false);

  protected readonly form = this.formBuilder.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]]
  });

  protected submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);
    this.errorMessage.set('');

    this.authService
      .login(this.form.getRawValue())
      .pipe(finalize(() => this.isSubmitting.set(false)))
      .subscribe({
        next: () => {
          if (!this.authService.isAdmin()) {
            void this.router.navigate(['/books'], {
              queryParams: { adminDenied: '1' }
            });
            return;
          }

          const requestedReturnUrl = this.route.snapshot.queryParamMap.get('returnUrl');
          const safeReturnUrl = requestedReturnUrl?.startsWith('/admin') ? requestedReturnUrl : '/admin/users';
          void this.router.navigateByUrl(safeReturnUrl);
        },
        error: (error: unknown) => {
          this.errorMessage.set(readApiErrorMessage(error));
        }
      });
  }

  protected showError(controlName: 'email' | 'password'): boolean {
    const control = this.form.controls[controlName];
    return control.invalid && (control.dirty || control.touched);
  }
}

function readApiErrorMessage(error: unknown): string {
  if (!(error instanceof HttpErrorResponse)) {
    return 'Something went wrong. Please try again.';
  }

  const apiError = error.error as ApiErrorResponse | undefined;

  if (apiError?.errors) {
    const nestedError = Object.values(apiError.errors).flat()[0];
    if (nestedError) {
      return nestedError;
    }
  }

  return apiError?.message || error.message || 'Something went wrong. Please try again.';
}
