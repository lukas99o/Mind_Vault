import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { apiConfig } from '../core/config/api.config';
import { AdminUser, UpdateUserRequest, UserListResponse } from '../models/admin.models';

@Injectable({ providedIn: 'root' })
export class AdminUsersService {
  private readonly http = inject(HttpClient);

  getAll(): Observable<UserListResponse> {
    return this.http.get<UserListResponse>(`${apiConfig.baseUrl}/admin/users`);
  }

  getById(id: string): Observable<AdminUser> {
    return this.http.get<AdminUser>(`${apiConfig.baseUrl}/admin/users/${id}`);
  }

  update(id: string, request: UpdateUserRequest): Observable<AdminUser> {
    return this.http.put<AdminUser>(`${apiConfig.baseUrl}/admin/users/${id}`, request);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${apiConfig.baseUrl}/admin/users/${id}`);
  }
}
