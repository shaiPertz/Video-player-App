import { toVideoTitle } from './video-title';

describe('toVideoTitle', () => {
  it('derives a readable title from a Pexels url and strips the trailing id', () => {
    const url = 'https://www.pexels.com/video/a-monk-meditating-on-a-tree-5386411/';
    expect(toVideoTitle(url)).toBe('A monk meditating on a tree');
  });

  it('handles a url without a trailing slash', () => {
    const url = 'https://www.pexels.com/video/seal-on-the-beach-12345';
    expect(toVideoTitle(url)).toBe('Seal on the beach');
  });

  it('falls back when there is no usable slug', () => {
    expect(toVideoTitle('')).toBe('Untitled video');
    expect(toVideoTitle('https://www.pexels.com/video/123456/')).toBe('Untitled video');
  });
});
