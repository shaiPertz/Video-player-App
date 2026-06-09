import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';

import { Video } from '../../models/video.model';
import { DurationPipe } from '../duration.pipe';

/**
 * Presentational card for a single video: poster, author and duration.
 * Rendered as an <a> so it is keyboard-focusable and Enter-activatable for free.
 */
@Component({
  selector: 'app-video-card',
  imports: [RouterLink, DurationPipe],
  templateUrl: './video-card.component.html',
  styleUrl: './video-card.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VideoCardComponent {
  readonly video = input.required<Video>();
}
