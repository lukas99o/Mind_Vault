import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { apiConfig } from '../core/config/api.config';
import { AdminBook, AdminBookUpsertRequest } from '../models/admin.models';
import { PagedResponse } from '../models/paging.models';

@Injectable({ providedIn: 'root' })
export class AdminUserBooksService {
  private readonly http = inject(HttpClient);

  getAllForUser(userId: string, pageNumber = 1, pageSize = 25): Observable<PagedResponse<AdminBook>> {
    const params = new HttpParams()
      .set('pageNumber', pageNumber)
      .set('pageSize', pageSize)
      .set('sortBy', 'publicationDate')
      .set('sortDescending', true);

    return this.http.get<PagedResponse<AdminBook>>(`${apiConfig.baseUrl}/admin/users/${userId}/books`, { params });
  }

  getById(userId: string, bookId: number): Observable<AdminBook> {
    return this.http.get<AdminBook>(`${apiConfig.baseUrl}/admin/users/${userId}/books/${bookId}`);
  }

  create(userId: string, request: AdminBookUpsertRequest): Observable<AdminBook> {
    return this.http.post<AdminBook>(`${apiConfig.baseUrl}/admin/users/${userId}/books`, request);
  }

  update(userId: string, bookId: number, request: AdminBookUpsertRequest): Observable<void> {
    return this.http.put<void>(`${apiConfig.baseUrl}/admin/users/${userId}/books/${bookId}`, request);
  }

  delete(userId: string, bookId: number): Observable<void> {
    return this.http.delete<void>(`${apiConfig.baseUrl}/admin/users/${userId}/books/${bookId}`);
  }
}
