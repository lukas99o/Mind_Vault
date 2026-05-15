import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { apiConfig } from '../core/config/api.config';
import { PagedResponse } from '../models/paging.models';
import { Quote, QuoteUpsertRequest } from '../models/quote.models';

@Injectable({ providedIn: 'root' })
export class QuotesService {
  private readonly http = inject(HttpClient);

  getAll(pageNumber = 1, pageSize = 10): Observable<PagedResponse<Quote>> {
    const params = new HttpParams()
      .set('pageNumber', pageNumber)
      .set('pageSize', pageSize)
      .set('sortBy', 'created')
      .set('sortDescending', true);

    return this.http.get<PagedResponse<Quote>>(`${apiConfig.baseUrl}/quotes`, { params });
  }

  create(request: QuoteUpsertRequest): Observable<Quote> {
    return this.http.post<Quote>(`${apiConfig.baseUrl}/quotes`, request);
  }

  update(id: number, request: QuoteUpsertRequest): Observable<void> {
    return this.http.put<void>(`${apiConfig.baseUrl}/quotes/${id}`, request);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${apiConfig.baseUrl}/quotes/${id}`);
  }
}
