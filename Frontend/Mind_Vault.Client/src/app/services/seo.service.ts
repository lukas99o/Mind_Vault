import { DestroyRef, inject, Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, NavigationEnd, Router } from '@angular/router';
import { Meta, Title } from '@angular/platform-browser';
import { filter } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { SeoMetadata } from '../models/auth.models';

@Injectable({ providedIn: 'root' })
export class SeoService {
  private readonly router = inject(Router);
  private readonly title = inject(Title);
  private readonly meta = inject(Meta);
  private readonly destroyRef = inject(DestroyRef);

  constructor() {
    this.applyRouteMetadata();

    this.router.events
      .pipe(
        filter((event): event is NavigationEnd => event instanceof NavigationEnd),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(() => this.applyRouteMetadata());
  }

  private applyRouteMetadata(): void {
    const seo = this.findDeepestSeoMetadata(this.router.routerState.snapshot.root);

    if (!seo) {
      return;
    }

    this.title.setTitle(seo.title);
    this.meta.updateTag({ name: 'description', content: seo.description });
    this.meta.updateTag({ name: 'robots', content: seo.robots ?? 'index, follow' });
    this.meta.updateTag({ property: 'og:title', content: seo.title });
    this.meta.updateTag({ property: 'og:description', content: seo.description });
  }

  private findDeepestSeoMetadata(snapshot: ActivatedRouteSnapshot): SeoMetadata | null {
    let current: ActivatedRouteSnapshot | null = snapshot;
    let resolvedSeo: SeoMetadata | null = null;

    while (current) {
      const seo = current.data['seo'];
      if (seo) {
        resolvedSeo = seo as SeoMetadata;
      }

      current = current.firstChild ?? null;
    }

    return resolvedSeo;
  }
}
