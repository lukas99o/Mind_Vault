import { Book, BookUpsertRequest } from './book.models';
import { Quote, QuoteUpsertRequest } from './quote.models';

export interface AdminUser {
  id: string;
  email: string;
  userName: string;
  roles: string[];
}

export interface UserListResponse {
  users: AdminUser[];
  total: number;
}

export interface UpdateUserRequest {
  userName: string;
}

export type AdminBook = Book;
export type AdminBookUpsertRequest = BookUpsertRequest;

export type AdminQuote = Quote;
export type AdminQuoteUpsertRequest = QuoteUpsertRequest;
