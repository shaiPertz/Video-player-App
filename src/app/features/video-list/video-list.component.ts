import { ChangeDetectionStrategy, Component, DestroyRef, effect, ElementRef, inject, viewChild } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';

import { VideoCardComponent } from '../../shared/video-card/video-card.component';
import { VideoListStore } from './video-list.store';

@Component({
  selector: 'app-video-list',
  imports: [ReactiveFormsModule, VideoCardComponent],
  providers: [VideoListStore],
  templateUrl: './video-list.component.html',
  styleUrl: './video-list.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VideoListComponent {
  private readonly store = inject(VideoListStore);

  protected readonly status = this.store.status;
  protected readonly videos = this.store.videos;
  protected readonly hasMore = this.store.hasMore;
  protected readonly loadingMore = this.store.loadingMore;
  protected readonly searchControl = new FormControl('', { nonNullable: true });

  /** Bottom sentinel; present only while there are more pages to load. */
  private readonly sentinel = viewChild<ElementRef<HTMLElement>>('sentinel');
  private observer?: IntersectionObserver;

  constructor() {
    // Forward keystrokes to the store; debounce + switchMap live there.
    this.searchControl.valueChanges
      .pipe(takeUntilDestroyed())
      .subscribe((term) => this.store.search(term));

    // Observe the sentinel whenever it (re)appears; load the next page on view.
    effect(() => {
      const el = this.sentinel()?.nativeElement;
      this.observer?.disconnect();
      if (!el) {
        return;
      }
      this.observer = new IntersectionObserver(
        (entries) => {
          if (entries.some((e) => e.isIntersecting)) {
            this.store.loadMore();
          }
        },
        { rootMargin: '200px' },
      );
      this.observer.observe(el);
    });

    inject(DestroyRef).onDestroy(() => this.observer?.disconnect());
  }

  protected retry(): void {
    this.store.retry();
  }
}
