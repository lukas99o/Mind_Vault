import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { apiConfig } from '../core/config/api.config';
import { Book, BookUpsertRequest } from '../models/book.models';
import { PagedResponse } from '../models/paging.models';

@Injectable({ providedIn: 'root' })
export class BooksService {
  private readonly http = inject(HttpClient);

  getAll(pageNumber = 1, pageSize = 25): Observable<PagedResponse<Book>> {
    const params = new HttpParams()
      .set('pageNumber', pageNumber)
      .set('pageSize', pageSize)
      .set('sortBy', 'publicationDate')
      .set('sortDescending', true);

    return this.http.get<PagedResponse<Book>>(`${apiConfig.baseUrl}/books`, { params });
  }

  getById(id: number): Observable<Book> {
    return this.http.get<Book>(`${apiConfig.baseUrl}/books/${id}`);
  }

  create(request: BookUpsertRequest): Observable<Book> {
    return this.http.post<Book>(`${apiConfig.baseUrl}/books`, request);
  }

  update(id: number, request: BookUpsertRequest): Observable<void> {
    return this.http.put<void>(`${apiConfig.baseUrl}/books/${id}`, request);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${apiConfig.baseUrl}/books/${id}`);
  }
}
