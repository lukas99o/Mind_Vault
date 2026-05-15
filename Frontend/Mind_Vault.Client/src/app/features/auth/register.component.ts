import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';

import { ApiErrorResponse } from '../../models/auth.models';
import { AuthService } from '../../services/auth.service';

const strongPasswordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;

@Component({
  selector: 'app-register',
  imports: [ReactiveFormsModule, RouterLink],
  template: `
    <section class="mx-auto max-w-5xl rounded-[2rem] border border-white/60 bg-white/80 p-6 shadow-card backdrop-blur md:p-10">
      <div class="grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
        <div class="space-y-6">
          <div>
            <p class="text-sm font-semibold uppercase tracking-[0.28em] text-vault-teal">Create account</p>
            <h1 class="mt-3 font-display text-4xl text-vault-ink">Build your own memory vault</h1>
            <p class="mt-2 max-w-xl text-sm leading-7 text-slate-600">
              Register to start saving books and quotes. The password must match the same rules already validated by the API.
            </p>
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
                autocomplete="new-password"
                class="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-vault-ink outline-none transition focus:border-vault-teal focus:ring-4 focus:ring-vault-teal/10"
                placeholder="Create a strong password"
              >
              @if (showError('password')) {
                <span class="text-sm text-rose-600">At least 8 characters, uppercase, lowercase, number, and special character required.</span>
              }
            </label>

            <button
              type="submit"
              class="inline-flex w-full items-center justify-center gap-2 rounded-full bg-vault-ink px-6 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-70"
              [disabled]="isSubmitting()"
            >
              <i class="fa-solid" [class.fa-circle-notch]="isSubmitting()" [class.fa-spin]="isSubmitting()" [class.fa-user-plus]="!isSubmitting()"></i>
              {{ isSubmitting() ? 'Creating account...' : 'Create account' }}
            </button>
          </form>

          <p class="text-sm text-slate-600">
            Already have an account? <a routerLink="/login" class="font-semibold text-vault-teal hover:text-vault-ink">Log in</a>.
          </p>
        </div>

        <aside class="rounded-[1.75rem] bg-gradient-to-br from-vault-paper to-white p-8">
          <p class="text-sm font-semibold uppercase tracking-[0.28em] text-vault-coral">Password requirements</p>
          <ul class="mt-5 space-y-3 text-sm leading-7 text-slate-700">
            <li class="flex items-start gap-3">
              <i class="fa-solid fa-check mt-1 text-vault-teal"></i>
              At least 8 characters
            </li>
            <li class="flex items-start gap-3">
              <i class="fa-solid fa-check mt-1 text-vault-teal"></i>
              At least one uppercase and one lowercase letter
            </li>
            <li class="flex items-start gap-3">
              <i class="fa-solid fa-check mt-1 text-vault-teal"></i>
              At least one number and one special character
            </li>
          </ul>

          <div class="mt-8 rounded-3xl bg-vault-ink p-5 text-sm leading-7 text-white/75">
            <p class="font-semibold text-white">After registration</p>
            <p class="mt-2">After registering, you will be sent to the login page, sign in, and then land on your protected Books start page.</p>
          </div>
        </aside>
      </div>
    </section>
  `
})
export class RegisterComponent {
  private readonly formBuilder = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  protected readonly errorMessage = signal('');
  protected readonly isSubmitting = signal(false);

  protected readonly form = this.formBuilder.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: [
      '',
      [Validators.required, Validators.minLength(8), Validators.pattern(strongPasswordPattern)]
    ]
  });

  protected submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);
    this.errorMessage.set('');

    this.authService
      .register(this.form.getRawValue())
      .pipe(finalize(() => this.isSubmitting.set(false)))
      .subscribe({
        next: () => {
          void this.router.navigate(['/login'], {
            queryParams: { registered: '1' }
          });
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
