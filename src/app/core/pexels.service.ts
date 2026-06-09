import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../environments/environment';
import { PexelsResponse, Video } from '../models/video.model';

/**
 * Thin, fully-typed wrapper over the Pexels Videos API.
 * All requests are typed with HttpClient generics — no `any` leaks out.
 */
@Injectable({ providedIn: 'root' })
export class PexelsService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.pexelsApiBaseUrl;

  /** Popular videos — used as the default/empty-query list. */
  getPopular(perPage = 15): Observable<PexelsResponse> {
    const params = new HttpParams().set('per_page', perPage);
    return this.http.get<PexelsResponse>(`${this.baseUrl}/popular`, { params });
  }

  /** Search videos by keyword. */
  search(query: string, perPage = 15): Observable<PexelsResponse> {
    const params = new HttpParams().set('query', query).set('per_page', perPage);
    return this.http.get<PexelsResponse>(`${this.baseUrl}/search`, { params });
  }

  /** Fetch a single video by id — supports deep-linking to the player page. */
  getById(id: number): Observable<Video> {
    return this.http.get<Video>(`${this.baseUrl}/videos/${id}`);
  }
}
