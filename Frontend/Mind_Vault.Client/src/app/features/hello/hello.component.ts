import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';

import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-hello',
  imports: [RouterLink],
  template: `
    <section class="mx-auto max-w-4xl rounded-[2rem] border border-white/60 bg-white/80 p-6 shadow-card backdrop-blur md:p-10">
      <div class="grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
        <div class="space-y-5">
          <p class="text-sm font-semibold uppercase tracking-[0.28em] text-vault-teal">Protected view</p>
          <h1 class="font-display text-5xl text-vault-ink">Hello World</h1>
          <p class="max-w-2xl text-lg leading-8 text-slate-700">
            You are now signed in and the route is protected by the auth guard. This is where the next step in Mind Vault will grow.
          </p>

          <div class="rounded-3xl bg-vault-paper p-5 text-sm leading-7 text-slate-700">
            <p class="font-semibold text-vault-ink">Active session</p>
            <p class="mt-2">
              Signed in as
              <span class="font-semibold text-vault-teal">{{ authService.currentUserEmail() || 'unknown user' }}</span>
            </p>
          </div>

          <div class="flex flex-col gap-3 sm:flex-row">
            <a
              routerLink="/"
              class="inline-flex items-center justify-center gap-2 rounded-full border border-vault-ink/15 bg-white px-6 py-3 text-sm font-semibold text-vault-ink transition hover:-translate-y-0.5 hover:border-vault-teal hover:text-vault-teal"
            >
              <i class="fa-solid fa-house"></i>
              Back to home
            </a>
            <button
              type="button"
              class="inline-flex items-center justify-center gap-2 rounded-full bg-vault-ink px-6 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-slate-800"
              (click)="authService.logout()"
            >
              <i class="fa-solid fa-right-from-bracket"></i>
              Log out
            </button>
          </div>
        </div>

        <aside class="rounded-[1.75rem] bg-gradient-to-br from-vault-ink to-slate-800 p-8 text-white">
          <p class="text-sm font-semibold uppercase tracking-[0.28em] text-white/65">Implemented now</p>
          <ul class="mt-6 space-y-4 text-sm leading-7 text-white/80">
            <li class="flex items-start gap-3">
              <i class="fa-solid fa-shield-halved mt-1 text-vault-gold"></i>
              JWT is stored in LocalStorage and attached to the Authorization header.
            </li>
            <li class="flex items-start gap-3">
              <i class="fa-solid fa-route mt-1 text-vault-gold"></i>
              The Hello route is protected and redirects to login when no session exists.
            </li>
            <li class="flex items-start gap-3">
              <i class="fa-solid fa-magnifying-glass mt-1 text-vault-gold"></i>
              Basic SEO is updated per route through Angular's Title and Meta services.
            </li>
          </ul>
        </aside>
      </div>
    </section>
  `
})
export class HelloComponent {
  protected readonly authService = inject(AuthService);
}
