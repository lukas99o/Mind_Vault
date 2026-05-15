import { Injectable } from '@angular/core';

import { AuthSession } from '../models/auth.models';

@Injectable({ providedIn: 'root' })
export class TokenStorageService {
  private readonly tokenKey = 'mind-vault.auth.token';
  private readonly expiryKey = 'mind-vault.auth.expires-at';

  readSession(): AuthSession | null {
    const token = localStorage.getItem(this.tokenKey);
    const expiresAtUtc = localStorage.getItem(this.expiryKey);

    if (!token || !expiresAtUtc) {
      return null;
    }

    if (this.isExpired(expiresAtUtc)) {
      this.clear();
      return null;
    }

    return {
      token,
      expiresAtUtc,
      email: this.readEmailFromToken(token)
    };
  }

  store(token: string, expiresAtUtc: string): AuthSession {
    localStorage.setItem(this.tokenKey, token);
    localStorage.setItem(this.expiryKey, expiresAtUtc);

    return {
      token,
      expiresAtUtc,
      email: this.readEmailFromToken(token)
    };
  }

  clear(): void {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.expiryKey);
  }

  getToken(): string | null {
    const session = this.readSession();
    return session?.token ?? null;
  }

  private isExpired(expiresAtUtc: string): boolean {
    const timestamp = Date.parse(expiresAtUtc);
    return Number.isNaN(timestamp) || timestamp <= Date.now();
  }

  private readEmailFromToken(token: string): string | null {
    try {
      const payload = token.split('.')[1];

      if (!payload) {
        return null;
      }

      const normalizedPayload = payload.replace(/-/g, '+').replace(/_/g, '/');
      const paddedPayload = normalizedPayload.padEnd(Math.ceil(normalizedPayload.length / 4) * 4, '=');
      const decodedPayload = JSON.parse(atob(paddedPayload)) as Record<string, unknown>;

      const email = decodedPayload['email'] ?? decodedPayload['unique_name'];
      return typeof email === 'string' ? email : null;
    } catch {
      return null;
    }
  }
}
