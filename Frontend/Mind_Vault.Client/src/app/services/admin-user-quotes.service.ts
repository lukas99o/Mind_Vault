import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { apiConfig } from '../core/config/api.config';
import { AdminQuote, AdminQuoteUpsertRequest } from '../models/admin.models';
import { PagedResponse } from '../models/paging.models';

@Injectable({ providedIn: 'root' })
export class AdminUserQuotesService {
  private readonly http = inject(HttpClient);

  getAllForUser(userId: string, pageNumber = 1, pageSize = 20): Observable<PagedResponse<AdminQuote>> {
    const params = new HttpParams()
      .set('pageNumber', pageNumber)
      .set('pageSize', pageSize)
      .set('sortBy', 'created')
      .set('sortDescending', true);

    return this.http.get<PagedResponse<AdminQuote>>(`${apiConfig.baseUrl}/admin/users/${userId}/quotes`, { params });
  }

  getById(userId: string, quoteId: number): Observable<AdminQuote> {
    return this.http.get<AdminQuote>(`${apiConfig.baseUrl}/admin/users/${userId}/quotes/${quoteId}`);
  }

  create(userId: string, request: AdminQuoteUpsertRequest): Observable<AdminQuote> {
    return this.http.post<AdminQuote>(`${apiConfig.baseUrl}/admin/users/${userId}/quotes`, request);
  }

  update(userId: string, quoteId: number, request: AdminQuoteUpsertRequest): Observable<void> {
    return this.http.put<void>(`${apiConfig.baseUrl}/admin/users/${userId}/quotes/${quoteId}`, request);
  }

  delete(userId: string, quoteId: number): Observable<void> {
    return this.http.delete<void>(`${apiConfig.baseUrl}/admin/users/${userId}/quotes/${quoteId}`);
  }
}
