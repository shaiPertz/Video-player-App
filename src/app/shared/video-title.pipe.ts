import { Pipe, PipeTransform } from '@angular/core';

import { toVideoTitle } from './video-title';

/** Template wrapper over `toVideoTitle` — derives a display title from a Pexels url. */
@Pipe({ name: 'videoTitle' })
export class VideoTitlePipe implements PipeTransform {
  transform(url: string | null | undefined): string {
    return toVideoTitle(url ?? '');
  }
}
