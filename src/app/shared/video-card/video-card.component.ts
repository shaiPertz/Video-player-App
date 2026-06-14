import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';

import { Video } from '../../models/video.model';
import { DurationPipe } from '../duration.pipe';
import { VideoTitlePipe } from '../video-title.pipe';

/**
 * Presentational card for a single video: poster, title, author and duration.
 * Rendered as an <a> so it is keyboard-focusable and Enter-activatable for free.
 */
@Component({
  selector: 'app-video-card',
  imports: [RouterLink, DurationPipe, VideoTitlePipe],
  templateUrl: './video-card.component.html',
  styleUrl: './video-card.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VideoCardComponent {
  readonly video = input.required<Video>();
}
