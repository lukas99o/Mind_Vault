import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Router } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';

import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;
  let httpTestingController: HttpTestingController;
  let router: Router;

  beforeEach(() => {
    localStorage.clear();

    TestBed.configureTestingModule({
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()]
    });

    service = TestBed.inject(AuthService);
    httpTestingController = TestBed.inject(HttpTestingController);
  router = TestBed.inject(Router);
  });

  afterEach(() => {
    httpTestingController.verify();
    localStorage.clear();
  });

  it('stores the session after a successful login', () => {
    let completed = false;
    const token = createToken('reader@example.com');
    const expiresAtUtc = '2099-01-01T00:00:00.000Z';

    service.login({ email: 'reader@example.com', password: 'Password123!' }).subscribe(() => {
      completed = true;
    });

    const request = httpTestingController.expectOne('https://localhost:7058/api/auth/login');

    expect(request.request.method).toBe('POST');
    request.flush({ token, expiresAtUtc });

    expect(completed).toBeTrue();
    expect(service.isAuthenticated()).toBeTrue();
    expect(service.currentUserEmail()).toBe('reader@example.com');
    expect(localStorage.getItem('mind-vault.auth.token')).toBe(token);
    expect(localStorage.getItem('mind-vault.auth.expires-at')).toBe(expiresAtUtc);
  });

  it('clears the session on logout', () => {
    const token = createToken('reader@example.com');

    spyOn(router, 'navigateByUrl').and.resolveTo(true);

    service.login({ email: 'reader@example.com', password: 'Password123!' }).subscribe();

    httpTestingController
      .expectOne('https://localhost:7058/api/auth/login')
      .flush({ token, expiresAtUtc: '2099-01-01T00:00:00.000Z' });

    service.logout();

    expect(service.isAuthenticated()).toBeFalse();
    expect(localStorage.getItem('mind-vault.auth.token')).toBeNull();
    expect(localStorage.getItem('mind-vault.auth.expires-at')).toBeNull();
  });
});

function createToken(email: string): string {
  const payload = base64UrlEncode(JSON.stringify({ email }));
  return `header.${payload}.signature`;
}

function base64UrlEncode(value: string): string {
  return btoa(value).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}