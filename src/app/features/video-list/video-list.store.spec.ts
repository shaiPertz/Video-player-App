import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { fakeAsync, TestBed, tick } from '@angular/core/testing';

import { environment } from '../../../environments/environment';
import { PexelsResponse, Video } from '../../models/video.model';
import { VideoListStore } from './video-list.store';

const base = environment.pexelsApiBaseUrl;
const PER_PAGE = 15;

function video(id: number): Video {
  return {
    id,
    width: 1920,
    height: 1080,
    duration: 10,
    url: `https://www.pexels.com/video/clip-${id}/`,
    image: '',
    user: { id, name: 'Author', url: '' },
    video_files: [],
  };
}

/** N videos with ids start..start+N-1. */
function videos(count: number, start = 1): Video[] {
  return Array.from({ length: count }, (_, i) => video(start + i));
}

function response(list: Video[], total = list.length, page = 1): PexelsResponse {
  return { videos: list, total_results: total, page, per_page: PER_PAGE };
}

describe('VideoListStore', () => {
  let store: VideoListStore;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [VideoListStore, provideHttpClient(), provideHttpClientTesting()],
    });
    store = TestBed.inject(VideoListStore);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('loads popular videos initially and becomes ready', () => {
    expect(store.status()).toBe('loading');
    httpMock.expectOne((r) => r.url === `${base}/popular`).flush(response([video(1), video(2)]));
    expect(store.status()).toBe('ready');
    expect(store.videos().length).toBe(2);
    expect(store.hasMore()).toBe(false);
  });

  it('searches server-side via /search after debounce', fakeAsync(() => {
    httpMock.expectOne((r) => r.url === `${base}/popular`).flush(response([video(1)]));

    store.search('ocean');
    tick(400); // debounce window

    const req = httpMock.expectOne((r) => r.url === `${base}/search`);
    expect(req.request.params.get('query')).toBe('ocean');
    req.flush(response([video(9)]));

    expect(store.videos().map((v) => v.id)).toEqual([9]);
    expect(store.status()).toBe('ready');
  }));

  it('reports empty when the search returns no videos', fakeAsync(() => {
    httpMock.expectOne((r) => r.url === `${base}/popular`).flush(response([video(1)]));

    store.search('nothingmatches');
    tick(400);
    httpMock.expectOne((r) => r.url === `${base}/search`).flush(response([]));

    expect(store.status()).toBe('empty');
  }));

  it('reports error when a request fails', () => {
    httpMock
      .expectOne((r) => r.url === `${base}/popular`)
      .flush('boom', { status: 500, statusText: 'Server Error' });
    expect(store.status()).toBe('error');
  });

  it('loadMore() appends the next page and advances the page counter', () => {
    // Full first page + more results available → hasMore true.
    httpMock.expectOne((r) => r.url === `${base}/popular`).flush(response(videos(PER_PAGE, 1), 100, 1));
    expect(store.hasMore()).toBe(true);
    expect(store.page()).toBe(1);

    store.loadMore();
    const req = httpMock.expectOne((r) => r.url === `${base}/popular`);
    expect(req.request.params.get('page')).toBe('2');
    req.flush(response(videos(PER_PAGE, 16), 100, 2));

    expect(store.videos().length).toBe(30);
    expect(store.page()).toBe(2);
    expect(store.hasMore()).toBe(true);
  });

  it('stops paginating when the last page is not full', () => {
    httpMock.expectOne((r) => r.url === `${base}/popular`).flush(response(videos(PER_PAGE, 1), 20, 1));

    store.loadMore();
    httpMock.expectOne((r) => r.url === `${base}/popular`).flush(response(videos(5, 16), 20, 2));

    expect(store.videos().length).toBe(20);
    expect(store.hasMore()).toBe(false);
  });

  it('ignores loadMore() when there are no more pages', () => {
    httpMock.expectOne((r) => r.url === `${base}/popular`).flush(response([video(1)])); // hasMore false
    store.loadMore();
    httpMock.expectNone((r) => r.url === `${base}/popular`); // no extra request
  });
});
