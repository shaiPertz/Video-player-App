import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';

import { PexelsService } from '../../core/pexels.service';
import { Video, VideoFile } from '../../models/video.model';
import { VideoTitlePipe } from '../../shared/video-title.pipe';

type PlayerStatus = 'loading' | 'ready' | 'error';

@Component({
  selector: 'app-video-player',
  imports: [RouterLink, VideoTitlePipe],
  templateUrl: './video-player.component.html',
  styleUrl: './video-player.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VideoPlayerComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly pexels = inject(PexelsService);

  protected readonly status = signal<PlayerStatus>('loading');
  protected readonly video = signal<Video | null>(null);
  protected readonly selectedFile = signal<VideoFile | null>(null);

  /** Renditions sorted by resolution (highest first). */
  protected readonly qualities = computed<VideoFile[]>(() => {
    const v = this.video();
    return v ? [...v.video_files].sort((a, b) => b.height - a.height) : [];
  });

  constructor() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.pexels
      .getById(id)
      .pipe(takeUntilDestroyed())
      .subscribe({
        next: (video) => {
          const best = [...video.video_files].sort((a, b) => b.height - a.height)[0] ?? null;
          this.video.set(video);
          this.selectedFile.set(best);
          this.status.set('ready');
        },
        error: () => this.status.set('error'),
      });
  }

  protected onQualityChange(fileId: string): void {
    const file = this.video()?.video_files.find((f) => f.id === Number(fileId));
    if (file) {
      this.selectedFile.set(file);
    }
  }
}
