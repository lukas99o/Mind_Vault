import { Routes } from '@angular/router';

import { LoginComponent } from './features/auth/login.component';
import { RegisterComponent } from './features/auth/register.component';
import { BookFormComponent } from './features/books/book-form.component';
import { BooksComponent } from './features/books/books.component';
import { HomeComponent } from './features/home/home.component';
import { QuotesComponent } from './features/quotes/quotes.component';
import { authGuard } from './guards/auth.guard';
import { startPageGuard } from './guards/start-page.guard';

export const routes: Routes = [
	{
		path: '',
		component: HomeComponent,
		canActivate: [startPageGuard],
		data: {
			seo: {
				title: 'Mind Vault | Store your strongest book and quote memories',
				description:
					'Save your best books and quotes in Mind Vault, a personal digital vault with a calm design and an easy start.',
				robots: 'index, follow'
			}
		}
	},
	{
		path: 'books',
		component: BooksComponent,
		canActivate: [authGuard],
		data: {
			seo: {
				title: 'Books | Mind Vault',
				description: 'Browse, add, edit, and remove your saved books in Mind Vault.',
				robots: 'noindex, nofollow'
			}
		}
	},
	{
		path: 'books/new',
		component: BookFormComponent,
		canActivate: [authGuard],
		data: {
			seo: {
				title: 'Add Book | Mind Vault',
				description: 'Create a new book entry in your Mind Vault.',
				robots: 'noindex, nofollow'
			}
		}
	},
	{
		path: 'books/:id/edit',
		component: BookFormComponent,
		canActivate: [authGuard],
		data: {
			seo: {
				title: 'Edit Book | Mind Vault',
				description: 'Update a book entry in your Mind Vault.',
				robots: 'noindex, nofollow'
			}
		}
	},
	{
		path: 'quotes',
		component: QuotesComponent,
		canActivate: [authGuard],
		data: {
			seo: {
				title: 'My Quotes | Mind Vault',
				description: 'Manage your favorite quotes directly in Mind Vault.',
				robots: 'noindex, nofollow'
			}
		}
	},
	{
		path: 'welcome',
		redirectTo: '',
		pathMatch: 'full'
	},
	{
		path: 'login',
		component: LoginComponent,
		data: {
			seo: {
				title: 'Log In | Mind Vault',
				description: 'Log in to Mind Vault to open your personal vault for books and quotes.',
				robots: 'noindex, nofollow'
			}
		}
	},
	{
		path: 'register',
		component: RegisterComponent,
		data: {
			seo: {
				title: 'Create Account | Mind Vault',
				description: 'Create an account in Mind Vault and start collecting books and quotes in your own digital vault.',
				robots: 'noindex, nofollow'
			}
		}
	},
	{
		path: '**',
		redirectTo: ''
	}
];
