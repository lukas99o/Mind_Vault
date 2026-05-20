import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import { AdminUser } from '../../models/admin.models';
import { AdminUsersService } from '../../services/admin-users.service';

@Component({
  selector: 'app-admin-users',
  imports: [RouterLink],
  template: `
    <section class="space-y-6">
      <header class="rounded-3xl border border-white/70 bg-white/80 p-6 shadow-card backdrop-blur dark:border-slate-700 dark:bg-slate-900/80">
        <p class="text-sm font-semibold uppercase tracking-[0.28em] text-vault-teal">Admin panel</p>
        <h1 class="mt-2 font-display text-4xl text-vault-ink dark:text-vault-paper">Users</h1>
        <p class="mt-2 text-sm text-slate-600 dark:text-slate-300">Manage users and open each user vault.</p>
      </header>

      @if (errorMessage()) {
        <p class="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-900/40 dark:bg-rose-950/40 dark:text-rose-200">
          {{ errorMessage() }}
        </p>
      }

      @if (isLoading()) {
        <div class="rounded-3xl border border-dashed border-slate-300 bg-white/70 p-8 text-center text-slate-600 dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-300">
          Loading users...
        </div>
      } @else if (users().length === 0) {
        <div class="rounded-3xl border border-dashed border-slate-300 bg-white/70 p-8 text-center text-slate-600 dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-300">
          No users found.
        </div>
      } @else {
        <div class="overflow-x-auto rounded-3xl border border-white/70 bg-white/85 shadow-sm backdrop-blur dark:border-slate-700 dark:bg-slate-900/80">
          <table class="min-w-full divide-y divide-slate-200 text-sm dark:divide-slate-700">
            <thead class="bg-slate-50/80 text-left text-xs uppercase tracking-[0.18em] text-slate-500 dark:bg-slate-800/60 dark:text-slate-300">
              <tr>
                <th class="px-4 py-3">Email</th>
                <th class="px-4 py-3">Username</th>
                <th class="px-4 py-3">Roles</th>
                <th class="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100 dark:divide-slate-800">
              @for (user of users(); track user.id) {
                <tr class="text-vault-ink dark:text-vault-paper">
                  <td class="px-4 py-4">{{ user.email }}</td>
                  <td class="px-4 py-4">{{ user.userName }}</td>
                  <td class="px-4 py-4">{{ user.roles.join(', ') }}</td>
                  <td class="px-4 py-4">
                    <div class="flex flex-wrap items-center justify-end gap-2">
                      <a
                        [routerLink]="['/admin/users', user.id]"
                        class="inline-flex items-center gap-2 rounded-full border border-vault-ink/20 px-3 py-2 text-xs font-semibold text-vault-ink transition hover:border-vault-teal hover:text-vault-teal dark:border-slate-600 dark:text-vault-paper"
                      >
                        Edit
                      </a>
                      <a
                        [routerLink]="['/admin/users', user.id, 'books']"
                        class="inline-flex items-center gap-2 rounded-full border border-vault-ink/20 px-3 py-2 text-xs font-semibold text-vault-ink transition hover:border-vault-teal hover:text-vault-teal dark:border-slate-600 dark:text-vault-paper"
                      >
                        Books
                      </a>
                      <a
                        [routerLink]="['/admin/users', user.id, 'quotes']"
                        class="inline-flex items-center gap-2 rounded-full border border-vault-ink/20 px-3 py-2 text-xs font-semibold text-vault-ink transition hover:border-vault-teal hover:text-vault-teal dark:border-slate-600 dark:text-vault-paper"
                      >
                        Quotes
                      </a>
                      <button
                        type="button"
                        class="inline-flex items-center gap-2 rounded-full bg-rose-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-60"
                        [disabled]="deletingUserId() === user.id"
                        (click)="deleteUser(user)"
                      >
                        <i class="fa-solid" [class.fa-trash]="deletingUserId() !== user.id" [class.fa-circle-notch]="deletingUserId() === user.id" [class.fa-spin]="deletingUserId() === user.id"></i>
                        {{ deletingUserId() === user.id ? 'Removing...' : 'Delete' }}
                      </button>
                    </div>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      }
    </section>
  `
})
export class AdminUsersComponent {
  private readonly adminUsersService = inject(AdminUsersService);

  protected readonly users = signal<AdminUser[]>([]);
  protected readonly isLoading = signal(false);
  protected readonly deletingUserId = signal<string | null>(null);
  protected readonly errorMessage = signal('');

  constructor() {
    this.loadUsers();
  }

  protected deleteUser(user: AdminUser): void {
    this.deletingUserId.set(user.id);
    this.errorMessage.set('');

    this.adminUsersService.delete(user.id).subscribe({
      next: () => {
        this.users.update((currentUsers) => currentUsers.filter((item) => item.id !== user.id));
        this.deletingUserId.set(null);
      },
      error: () => {
        this.errorMessage.set('Could not delete this user right now. Please try again.');
        this.deletingUserId.set(null);
      }
    });
  }

  private loadUsers(): void {
    this.isLoading.set(true);
    this.errorMessage.set('');

    this.adminUsersService.getAll().subscribe({
      next: (response) => {
        this.users.set(response.users);
        this.isLoading.set(false);
      },
      error: () => {
        this.errorMessage.set('Could not load users right now. Please try again.');
        this.isLoading.set(false);
      }
    });
  }
}
