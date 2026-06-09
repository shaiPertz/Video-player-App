import { Pipe, PipeTransform } from '@angular/core';

/**
 * Formats a duration in seconds as `m:ss` (or `h:mm:ss` past an hour).
 * Example: 135 -> "2:15", 5 -> "0:05".
 */
@Pipe({ name: 'duration' })
export class DurationPipe implements PipeTransform {
  transform(totalSeconds: number | null | undefined): string {
    if (totalSeconds == null || totalSeconds < 0 || !Number.isFinite(totalSeconds)) {
      return '0:00';
    }
    const seconds = Math.floor(totalSeconds);
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    const ss = s.toString().padStart(2, '0');

    if (h > 0) {
      const mm = m.toString().padStart(2, '0');
      return `${h}:${mm}:${ss}`;
    }
    return `${m}:${ss}`;
  }
}
