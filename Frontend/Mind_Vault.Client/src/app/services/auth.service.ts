import { computed, inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { Router } from '@angular/router';

import { apiConfig } from '../core/config/api.config';
import {
  AuthResponse,
  AuthSession,
  LoginRequest,
  RegisterRequest,
  RegisterResponse
} from '../models/auth.models';
import { TokenStorageService } from './token-storage.service';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly tokenStorage = inject(TokenStorageService);

  readonly session = signal<AuthSession | null>(this.tokenStorage.readSession());
  readonly isAuthenticated = computed(() => this.session() !== null);
  readonly isAdmin = computed(() => this.session()?.roles.includes('Admin') ?? false);
  readonly currentUserEmail = computed(() => this.session()?.email ?? null);

  login(request: LoginRequest): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${apiConfig.baseUrl}/auth/login`, request)
      .pipe(tap((response) => this.establishSession(response)));
  }

  register(request: RegisterRequest): Observable<RegisterResponse> {
    return this.http.post<RegisterResponse>(`${apiConfig.baseUrl}/auth/register`, request);
  }

  logout(): void {
    this.tokenStorage.clear();
    this.session.set(null);
    void this.router.navigateByUrl('/');
  }

  ensureValidSession(): boolean {
    const session = this.tokenStorage.readSession();
    this.session.set(session);

    return session !== null;
  }

  getAccessToken(): string | null {
    return this.ensureValidSession() ? this.session()?.token ?? null : null;
  }

  private establishSession(response: AuthResponse): void {
    const session = this.tokenStorage.store(response.token, response.expiresAtUtc);
    this.session.set(session);
  }
}
