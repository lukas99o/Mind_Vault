import { TestBed } from '@angular/core/testing';

import { TokenStorageService } from './token-storage.service';

describe('TokenStorageService', () => {
  let service: TokenStorageService;

  beforeEach(() => {
    localStorage.clear();

    TestBed.configureTestingModule({});
    service = TestBed.inject(TokenStorageService);
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('extracts roles from role array claim', () => {
    const session = service.store(
      createToken({
        email: 'admin@example.com',
        role: ['Admin', 'User']
      }),
      '2099-01-01T00:00:00.000Z'
    );

    expect(session.email).toBe('admin@example.com');
    expect(session.roles).toEqual(['Admin', 'User']);
  });

  it('extracts roles from claim uri when present', () => {
    const session = service.store(
      createToken({
        email: 'admin@example.com',
        'http://schemas.microsoft.com/ws/2008/06/identity/claims/role': 'Admin'
      }),
      '2099-01-01T00:00:00.000Z'
    );

    expect(session.roles).toEqual(['Admin']);
  });

  it('returns empty roles when claim is missing', () => {
    const session = service.store(
      createToken({
        email: 'reader@example.com'
      }),
      '2099-01-01T00:00:00.000Z'
    );

    expect(session.roles).toEqual([]);
  });
});

function createToken(payloadObject: Record<string, unknown>): string {
  const payload = base64UrlEncode(JSON.stringify(payloadObject));
  return `header.${payload}.signature`;
}

function base64UrlEncode(value: string): string {
  return btoa(value).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}
