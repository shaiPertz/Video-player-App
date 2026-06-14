/**
 * Pexels has no title field. The video `url` ends with a human-readable slug
 * that describes the content, e.g.
 *   https://www.pexels.com/video/a-monk-meditating-on-a-tree-5386411/
 * This derives a display title from that slug: "A monk meditating on a tree".
 */
export function toVideoTitle(url: string): string {
  if (!url) {
    return 'Untitled video';
  }
  const lastSegment = url.split('/').filter(Boolean).pop() ?? '';
  const withoutId = lastSegment.replace(/-?\d+$/, ''); // strip trailing "-<id>" (or a bare id)
  const words = withoutId.replace(/-/g, ' ').trim();
  if (!words) {
    return 'Untitled video';
  }
  return words.charAt(0).toUpperCase() + words.slice(1);
}
