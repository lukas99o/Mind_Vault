import { TestBed } from '@angular/core/testing';
import { provideRouter, Router, UrlTree } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';

import { authGuard } from './auth.guard';
import { TokenStorageService } from '../services/token-storage.service';

describe('authGuard', () => {
  let router: Router;
  let tokenStorage: TokenStorageService;

  beforeEach(() => {
    localStorage.clear();

    TestBed.configureTestingModule({
      providers: [provideRouter([]), provideHttpClient()]
    });

    router = TestBed.inject(Router);
    tokenStorage = TestBed.inject(TokenStorageService);
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('redirects unauthenticated users to login', () => {
    const result = TestBed.runInInjectionContext(() =>
      authGuard({} as never, { url: '/books' } as never)
    );

    expect(result instanceof UrlTree).toBeTrue();
    expect(router.serializeUrl(result as UrlTree)).toBe('/login?returnUrl=%2Fbooks');
  });

  it('allows navigation when a valid session exists', () => {
    tokenStorage.store(createToken('reader@example.com'), '2099-01-01T00:00:00.000Z');

    const result = TestBed.runInInjectionContext(() =>
      authGuard({} as never, { url: '/books' } as never)
    );

    expect(result).toBeTrue();
  });
});

function createToken(email: string): string {
  const payload = base64UrlEncode(JSON.stringify({ email }));
  return `header.${payload}.signature`;
}

function base64UrlEncode(value: string): string {
  return btoa(value).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}
