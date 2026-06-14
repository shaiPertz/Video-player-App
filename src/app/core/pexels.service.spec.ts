import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { environment } from '../../environments/environment';
import { PexelsResponse, Video } from '../models/video.model';
import { PexelsService } from './pexels.service';

describe('PexelsService', () => {
  const base = environment.pexelsApiBaseUrl;
  let service: PexelsService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [PexelsService, provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(PexelsService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('getPopular() hits /popular with per_page', () => {
    const response = { videos: [], total_results: 0, page: 1, per_page: 15 } as PexelsResponse;
    let received: PexelsResponse | undefined;

    service.getPopular().subscribe((r) => (received = r));

    const req = httpMock.expectOne(`${base}/popular?per_page=15&page=1`);
    expect(req.request.method).toBe('GET');
    req.flush(response);
    expect(received).toEqual(response);
  });

  it('getPopular() passes the requested page', () => {
    service.getPopular(15, 3).subscribe();
    const req = httpMock.expectOne(`${base}/popular?per_page=15&page=3`);
    expect(req.request.params.get('page')).toBe('3');
    req.flush({ videos: [], total_results: 0, page: 3, per_page: 15 });
  });

  it('search() hits /search with query, per_page and page', () => {
    service.search('nature', 9, 2).subscribe();

    const req = httpMock.expectOne(`${base}/search?query=nature&per_page=9&page=2`);
    expect(req.request.method).toBe('GET');
    expect(req.request.params.get('query')).toBe('nature');
    expect(req.request.params.get('page')).toBe('2');
    req.flush({ videos: [], total_results: 0, page: 2, per_page: 9 });
  });

  it('getById() hits /videos/:id and maps the response', () => {
    const video = { id: 42, video_files: [], user: { id: 1, name: 'Jane', url: '' } } as unknown as Video;
    let received: Video | undefined;

    service.getById(42).subscribe((v) => (received = v));

    const req = httpMock.expectOne(`${base}/videos/42`);
    req.flush(video);
    expect(received?.id).toBe(42);
    expect(received?.user.name).toBe('Jane');
  });
});
