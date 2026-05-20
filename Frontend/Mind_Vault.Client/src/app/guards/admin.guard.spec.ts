import { TestBed } from '@angular/core/testing';
import { provideRouter, Router, UrlTree } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';

import { adminGuard } from './admin.guard';
import { TokenStorageService } from '../services/token-storage.service';

describe('adminGuard', () => {
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

  it('redirects unauthenticated users to admin login', () => {
    const result = TestBed.runInInjectionContext(() =>
      adminGuard({} as never, { url: '/admin/users' } as never)
    );

    expect(result instanceof UrlTree).toBeTrue();
    expect(router.serializeUrl(result as UrlTree)).toBe('/admin/login?returnUrl=%2Fadmin%2Fusers');
  });

  it('allows navigation when session has Admin role', () => {
    tokenStorage.store(createToken('admin@example.com', ['Admin']), '2099-01-01T00:00:00.000Z');

    const result = TestBed.runInInjectionContext(() =>
      adminGuard({} as never, { url: '/admin/users' } as never)
    );

    expect(result).toBeTrue();
  });

  it('redirects non-admin users to books page', () => {
    tokenStorage.store(createToken('reader@example.com', ['User']), '2099-01-01T00:00:00.000Z');

    const result = TestBed.runInInjectionContext(() =>
      adminGuard({} as never, { url: '/admin/users' } as never)
    );

    expect(result instanceof UrlTree).toBeTrue();
    expect(router.serializeUrl(result as UrlTree)).toBe('/books?adminDenied=1');
  });
});

function createToken(email: string, roles: string[]): string {
  const payload = base64UrlEncode(JSON.stringify({
    email,
    role: roles
  }));

  return `header.${payload}.signature`;
}

function base64UrlEncode(value: string): string {
  return btoa(value).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}
