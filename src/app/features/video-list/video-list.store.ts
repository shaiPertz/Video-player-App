import { DestroyRef, inject, Injectable, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { catchError, debounceTime, distinctUntilChanged, EMPTY, map, merge, Observable, startWith, Subject, switchMap, tap } from 'rxjs';

import { PexelsService } from '../../core/pexels.service';
import { PexelsResponse, Video } from '../../models/video.model';

export type ListStatus = 'loading' | 'ready' | 'empty' | 'error';

const PER_PAGE = 15;

/**
 * Owns the video-list data flow: server-side keyword search + infinite scroll.
 *
 * - A new query (or popular) resets to page 1 via `switchMap` (which also aborts
 *   the previous in-flight request).
 * - `loadMore()` fetches the next page and **appends**. A generation counter
 *   (`searchGen`) discards a late page-append if a new search started meanwhile.
 */
@Injectable()
export class VideoListStore {
  private readonly pexels = inject(PexelsService);
  private readonly destroyRef = inject(DestroyRef);

  private readonly terms$ = new Subject<string>();
  private readonly retry$ = new Subject<void>();
  /** Bumped on every search reset; guards stale `loadMore` appends. */
  private searchGen = 0;

  readonly query = signal('');
  readonly status = signal<ListStatus>('loading');
  readonly videos = signal<Video[]>([]);
  readonly page = signal(1);
  readonly loadingMore = signal(false);
  readonly hasMore = signal(false);

  constructor() {
    const search$ = this.terms$.pipe(debounceTime(400), distinctUntilChanged());
    const retry$ = this.retry$.pipe(map(() => this.query()));

    merge(search$, retry$)
      .pipe(
        startWith(''), // initial popular load
        tap(() => {
          this.status.set('loading');
          this.page.set(1);
          this.hasMore.set(false);
          this.loadingMore.set(false);
          this.searchGen++;
        }),
        switchMap((term) =>
          this.fetchPage(term, 1).pipe(
            catchError(() => {
              this.status.set('error');
              return EMPTY;
            }),
          ),
        ),
        takeUntilDestroyed(),
      )
      .subscribe((res) => {
        this.videos.set(res.videos);
        this.status.set(res.videos.length ? 'ready' : 'empty');
        this.hasMore.set(this.hasMorePages(res));
      });
  }

  /** Push a new search term. Empty/whitespace falls back to popular. */
  search(term: string): void {
    this.query.set(term);
    this.terms$.next(term);
  }

  retry(): void {
    this.retry$.next();
  }

  /** Fetch and append the next page (infinite scroll). */
  loadMore(): void {
    if (this.loadingMore() || !this.hasMore() || this.status() !== 'ready') {
      return;
    }
    const gen = this.searchGen;
    const nextPage = this.page() + 1;
    this.loadingMore.set(true);

    this.fetchPage(this.query(), nextPage)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          if (gen !== this.searchGen) {
            return; // a newer search replaced the list; drop this page
          }
          this.videos.update((current) => [...current, ...res.videos]);
          this.page.set(nextPage);
          this.hasMore.set(this.hasMorePages(res));
          this.loadingMore.set(false);
        },
        error: () => {
          if (gen === this.searchGen) {
            this.loadingMore.set(false); // keep what we have; user can scroll to retry
          }
        },
      });
  }

  private fetchPage(term: string, page: number): Observable<PexelsResponse> {
    return term.trim()
      ? this.pexels.search(term, PER_PAGE, page)
      : this.pexels.getPopular(PER_PAGE, page);
  }

  private hasMorePages(res: PexelsResponse): boolean {
    return res.videos.length === PER_PAGE && res.page * res.per_page < res.total_results;
  }
}
