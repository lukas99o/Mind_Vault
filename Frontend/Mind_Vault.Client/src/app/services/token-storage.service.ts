import { Injectable } from '@angular/core';

import { AuthSession } from '../models/auth.models';

@Injectable({ providedIn: 'root' })
export class TokenStorageService {
  private readonly tokenKey = 'mind-vault.auth.token';
  private readonly expiryKey = 'mind-vault.auth.expires-at';
  private readonly roleClaimUri = 'http://schemas.microsoft.com/ws/2008/06/identity/claims/role';

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

    const payload = this.decodePayload(token);

    return {
      token,
      expiresAtUtc,
      email: this.readEmailFromPayload(payload),
      roles: this.readRolesFromPayload(payload)
    };
  }

  store(token: string, expiresAtUtc: string): AuthSession {
    localStorage.setItem(this.tokenKey, token);
    localStorage.setItem(this.expiryKey, expiresAtUtc);

    const payload = this.decodePayload(token);

    return {
      token,
      expiresAtUtc,
      email: this.readEmailFromPayload(payload),
      roles: this.readRolesFromPayload(payload)
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

  private decodePayload(token: string): Record<string, unknown> | null {
    try {
      const payload = token.split('.')[1];

      if (!payload) {
        return null;
      }

      const normalizedPayload = payload.replace(/-/g, '+').replace(/_/g, '/');
      const paddedPayload = normalizedPayload.padEnd(Math.ceil(normalizedPayload.length / 4) * 4, '=');
      return JSON.parse(atob(paddedPayload)) as Record<string, unknown>;
    } catch {
      return null;
    }
  }

  private readEmailFromPayload(payload: Record<string, unknown> | null): string | null {
    if (!payload) {
      return null;
    }

    const email = payload['email'] ?? payload['unique_name'];
    return typeof email === 'string' ? email : null;
  }

  private readRolesFromPayload(payload: Record<string, unknown> | null): string[] {
    if (!payload) {
      return [];
    }

    const roleClaim = payload['role'] ?? payload[this.roleClaimUri];

    if (typeof roleClaim === 'string') {
      return [roleClaim];
    }

    if (Array.isArray(roleClaim)) {
      return roleClaim.filter((role): role is string => typeof role === 'string');
    }

    return [];
  }
}
