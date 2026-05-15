import { DOCUMENT } from '@angular/common';
import { computed, inject, Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly storageKey = 'mind-vault.theme';
  private readonly document = inject(DOCUMENT);

  private readonly mode = signal<'light' | 'dark'>(this.readInitialTheme());
  readonly isDarkMode = computed(() => this.mode() === 'dark');

  constructor() {
    this.applyTheme(this.mode());
  }

  toggleMode(): void {
    const nextMode = this.mode() === 'light' ? 'dark' : 'light';
    this.mode.set(nextMode);
    localStorage.setItem(this.storageKey, nextMode);
    this.applyTheme(nextMode);
  }

  private readInitialTheme(): 'light' | 'dark' {
    const savedTheme = localStorage.getItem(this.storageKey);
    return savedTheme === 'dark' ? 'dark' : 'light';
  }

  private applyTheme(mode: 'light' | 'dark'): void {
    this.document.documentElement.classList.toggle('dark', mode === 'dark');
  }
}
