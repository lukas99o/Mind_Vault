import { HttpErrorResponse } from '@angular/common/http';
import { Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';

import { ApiErrorResponse } from '../../models/auth.models';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, RouterLink],
  template: `
    <section class="mx-auto max-w-5xl rounded-[2rem] border border-white/60 bg-white/80 p-6 shadow-card backdrop-blur md:p-10">
      <div class="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
        <div class="space-y-5 rounded-[1.75rem] bg-vault-ink p-8 text-white">
          <p class="text-sm font-semibold uppercase tracking-[0.28em] text-white/70">Log in</p>
          <h1 class="font-display text-4xl leading-tight">The vault is one step away.</h1>
          <p class="text-sm leading-7 text-white/75">
            Log in to reach your first protected view. The token is stored locally and sent automatically with future API requests.
          </p>
          <div class="rounded-3xl border border-white/10 bg-white/5 p-5 text-sm leading-7 text-white/75">
            <p class="font-semibold text-white">Current focus</p>
            <p class="mt-2">A stable auth flow, clear feedback, and a calm starting point for the rest of the app.</p>
          </div>
        </div>

        <div class="space-y-6">
          <div>
            <p class="text-sm font-semibold uppercase tracking-[0.28em] text-vault-teal">Mind Vault</p>
            <h2 class="mt-3 font-display text-4xl text-vault-ink">Welcome back</h2>
            <p class="mt-2 text-sm leading-7 text-slate-600">Use the same email and password you registered with.</p>
          </div>

          @if (successMessage()) {
            <div class="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
              {{ successMessage() }}
            </div>
          }

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
                placeholder="name@example.com"
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
                placeholder="At least 8 characters"
              >
              @if (showError('password')) {
                <span class="text-sm text-rose-600">Enter a password with at least 8 characters.</span>
              }
            </label>

            <button
              type="submit"
              class="inline-flex w-full items-center justify-center gap-2 rounded-full bg-vault-ink px-6 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-70"
              [disabled]="isSubmitting()"
            >
              <i class="fa-solid" [class.fa-circle-notch]="isSubmitting()" [class.fa-spin]="isSubmitting()" [class.fa-arrow-right-to-bracket]="!isSubmitting()"></i>
              {{ isSubmitting() ? 'Logging in...' : 'Log in' }}
            </button>
          </form>

          <p class="text-sm text-slate-600">
            No account yet? <a routerLink="/register" class="font-semibold text-vault-teal hover:text-vault-ink">Create one here</a>.
          </p>
        </div>
      </div>
    </section>
  `
})
export class LoginComponent {
  private readonly formBuilder = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly errorMessage = signal('');
  protected readonly successMessage = signal('');
  protected readonly isSubmitting = signal(false);

  protected readonly form = this.formBuilder.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]]
  });

  constructor() {
    this.route.queryParamMap.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((params) => {
      this.successMessage.set(
        params.get('registered') === '1' ? 'Your account was created. You can log in now.' : ''
      );
    });
  }

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
          const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl') ?? '/hello';
          void this.router.navigateByUrl(returnUrl);
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
