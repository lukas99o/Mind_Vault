import { Routes } from '@angular/router';

import { LoginComponent } from './features/auth/login.component';
import { RegisterComponent } from './features/auth/register.component';
import { HelloComponent } from './features/hello/hello.component';
import { HomeComponent } from './features/home/home.component';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
	{
		path: '',
		component: HomeComponent,
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
		path: 'hello',
		component: HelloComponent,
		canActivate: [authGuard],
		data: {
			seo: {
				title: 'Hello World | Mind Vault',
				description: 'The first protected page in Mind Vault after a successful sign-in.',
				robots: 'noindex, nofollow'
			}
		}
	},
	{
		path: '**',
		redirectTo: ''
	}
];
