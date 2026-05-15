import { TestBed } from '@angular/core/testing';
import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';

import { authInterceptor } from './auth.interceptor';
import { TokenStorageService } from '../services/token-storage.service';

describe('authInterceptor', () => {
  let httpClient: HttpClient;
  let httpTestingController: HttpTestingController;
  let tokenStorage: TokenStorageService;

  beforeEach(() => {
    localStorage.clear();

    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        provideHttpClient(withInterceptors([authInterceptor])),
        provideHttpClientTesting()
      ]
    });

    httpClient = TestBed.inject(HttpClient);
    httpTestingController = TestBed.inject(HttpTestingController);
    tokenStorage = TestBed.inject(TokenStorageService);
  });

  afterEach(() => {
    httpTestingController.verify();
    localStorage.clear();
  });

  it('adds the bearer token to outgoing requests', () => {
    tokenStorage.store(createToken('reader@example.com'), '2099-01-01T00:00:00.000Z');

    httpClient.get('/api/books').subscribe();

    const request = httpTestingController.expectOne('/api/books');

    expect(request.request.headers.get('Authorization')).toBe(
      `Bearer ${tokenStorage.getToken()}`
    );

    request.flush({});
  });
});

function createToken(email: string): string {
  const payload = base64UrlEncode(JSON.stringify({ email }));
  return `header.${payload}.signature`;
}

function base64UrlEncode(value: string): string {
  return btoa(value).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}
