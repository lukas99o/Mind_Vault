import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';

import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-home',
  imports: [RouterLink],
  template: `
    <section class="grid gap-10 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
      <div class="space-y-6">
        <span class="inline-flex items-center gap-2 rounded-full border border-vault-gold/30 bg-white/70 px-4 py-2 text-sm font-semibold text-vault-ink shadow-sm backdrop-blur">
          <i class="fa-solid fa-book-open text-vault-coral"></i>
          A quiet vault for your strongest reading experiences
        </span>

        <div class="space-y-4">
          <p class="text-sm font-semibold uppercase tracking-[0.35em] text-vault-teal">Mind Vault</p>
          <h1 class="max-w-3xl font-display text-5xl leading-tight text-vault-ink md:text-6xl">
            Collect your best books and quotes in a library that actually feels personal.
          </h1>
          <p class="max-w-2xl text-lg leading-8 text-slate-700">
            Mind Vault makes it easy to save what you want to remember, return to favorite passages, and build a personal archive of thoughts worth keeping.
          </p>
        </div>

        <div class="flex flex-col gap-3 sm:flex-row">
          @if (authService.isAuthenticated()) {
            <a
              routerLink="/books"
              class="inline-flex items-center justify-center gap-2 rounded-full bg-vault-ink px-6 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-slate-800"
            >
              <i class="fa-solid fa-door-open"></i>
              Open the vault
            </a>
          } @else {
            <a
              routerLink="/register"
              class="inline-flex items-center justify-center gap-2 rounded-full bg-vault-ink px-6 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-slate-800"
            >
              <i class="fa-solid fa-user-plus"></i>
              Create account
            </a>
            <a
              routerLink="/login"
              class="inline-flex items-center justify-center gap-2 rounded-full border border-vault-ink/20 bg-white/70 px-6 py-3 text-sm font-semibold text-vault-ink transition hover:-translate-y-0.5 hover:border-vault-teal hover:text-vault-teal"
            >
              <i class="fa-solid fa-arrow-right-to-bracket"></i>
              Log in
            </a>
          }
        </div>
      </div>

      <aside class="relative overflow-hidden rounded-[2rem] border border-white/70 bg-white/80 p-6 shadow-card backdrop-blur">
        <div class="absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-vault-gold/80 to-transparent"></div>
        <div class="space-y-4">
          <p class="text-sm font-semibold uppercase tracking-[0.28em] text-vault-teal">What you save</p>
          <div class="grid gap-4">
            <article class="rounded-3xl bg-vault-paper p-5">
              <div class="mb-3 inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-vault-teal/10 text-vault-teal">
                <i class="fa-solid fa-book"></i>
              </div>
              <h2 class="font-display text-2xl text-vault-ink">Books worth keeping</h2>
              <p class="mt-2 text-sm leading-7 text-slate-700">
                Build a personal selection of titles you want to return to without the noise.
              </p>
            </article>

            <article class="rounded-3xl bg-vault-paper p-5">
              <div class="mb-3 inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-vault-coral/10 text-vault-coral">
                <i class="fa-solid fa-quote-left"></i>
              </div>
              <h2 class="font-display text-2xl text-vault-ink">Quotes that stay with you</h2>
              <p class="mt-2 text-sm leading-7 text-slate-700">
                Keep track of lines you want to carry with you, save, or use again.
              </p>
            </article>

            <article class="rounded-3xl bg-gradient-to-br from-vault-ink to-slate-800 p-5 text-white">
              <p class="text-sm uppercase tracking-[0.28em] text-white/70">In this MVP</p>
              <p class="mt-3 text-lg font-semibold">Sign in, registration, and a first protected space.</p>
            </article>
          </div>
        </div>
      </aside>
    </section>
  `
})
export class HomeComponent {
  protected readonly authService = inject(AuthService);
}
