# Video Player App — Plan & Architecture

An Angular + TypeScript app that lists videos from the **Pexels Videos API**, plays them,
and lets the user search and pick a resolution. Built as a focused MVP.

## Required features

1. **Fetch & list** — load videos and render them as cards (poster, author, duration).
2. **Play** — selecting a video plays it (native HTML5 controls).
3. **Search** — search videos by keyword, debounced.
4. **Quality selection** — let the user pick a resolution when more than one exists.
5. **States** — visibly distinguish loading / error / empty.

## Key decisions

| Area | Decision | Why |
|------|----------|-----|
| State | **Angular Signals** + RxJS only for the search stream | Modern, minimal boilerplate; RxJS where it shines (debounce/cancel). |
| Styling | **Raw SCSS**, zero UI libraries | Full control, no dependencies, fast. |
| Player | **Separate route** (`/video/:id`) | Deep-linkable; clean separation from the list. |
| Pagination | **Infinite scroll** (15/page) | `IntersectionObserver` on a bottom sentinel loads the next page and appends. |
| Auth token | Endpoints work unauthenticated; optional key via interceptor | If a key is ever needed, set it in one place. |
| Testing | **Jest** (`jest-preset-angular`) | Fast unit tests for service, pipe, card. |
| UI language | **English only** | All visible text, labels, alt, aria. |

## Architecture

Angular 19, standalone components, Signals, `HttpClient`. Feature routes are **lazy-loaded**.

```
src/
  environments/environment.ts        # base URL + optional pexelsApiKey
  app/
    models/video.model.ts            # Video, VideoFile, PexelsUser, PexelsResponse (no `any`)
    core/
      pexels.service.ts              # getPopular(), search(q), getById(id) — typed HttpClient
      pexels.interceptor.ts          # attaches Authorization header iff a key is set
    features/
      video-list/
        video-list.component.*        # route '' — search box + grid + states
        video-list.store.ts           # signals: videos/status/query; switchMap data flow
      video-player/
        video-player.component.*      # route 'video/:id' — native player + quality <select>
    shared/
      video-card/video-card.component.*   # presentational card (input.required<Video>)
      duration.pipe.ts                # seconds -> "m:ss"
    app.routes.ts                    # '' (list), 'video/:id' (player), '**' -> ''
    app.config.ts                    # provideRouter + provideHttpClient(withInterceptors)
```

## Feature → implementation map

| # | Feature | Where |
|---|---------|-------|
| 1 | Fetch & list | `PexelsService.getPopular(80)` → `VideoListStore` → grid of `app-video-card` (poster, title, author, duration) |
| 2 | Play | Card is a `routerLink` to `/video/:id`; player uses `<video controls autoplay>` |
| 3 | Search (debounced, **server-side**) | `FormControl.valueChanges` → `store.search()`; store does `debounceTime(400)` + `distinctUntilChanged` + `switchMap` to `/search?query=` (empty → `/popular`) |
| 4 | Quality selection | `<select>` of `video_files` sorted by `height`; shown only when `> 1` rendition |
| 5 | States | `@switch (status())` → loading skeletons / error+retry / empty / ready |
| + | Infinite scroll | `IntersectionObserver` on a bottom sentinel → `store.loadMore()` fetches the next page (`page+1`) and appends; `loadingMore`/`hasMore` signals; a `searchGen` guard drops a stale append if a new search started meanwhile |

### A note on search
Search is **server-side**: every (debounced) keystroke calls Pexels' `/search?query=`, which
searches the whole library by **topic/content** (tags & description) — e.g. `ocean`, `dog`, `city`.
An empty query falls back to `/popular`. `switchMap` cancels the previous in-flight request when a
new term arrives (the "abort in-flight" performance requirement). Note Pexels matches by topic, not
by author or by a video title (videos have no title field — the card's title is derived from the
`url` slug via `toVideoTitle`, for display only).

## Cross-cutting quality requirements

### Type safety (no `any`)
- All API calls use generics: `http.get<PexelsResponse>()`, `http.get<Video>()`.
- `tsconfig` runs in **strict** mode with `strictTemplates`.

### Accessibility
- Search `<input type="search">` with a linked `<label>` + `aria-label`.
- Cards are `<a>` elements — keyboard-focusable, Enter-activatable, descriptive `alt`.
- Quality `<select>` is a native control (keyboard-accessible) with a `<label>`.
- State regions use `role="status"` / `role="alert"` so screen readers announce them.
- Visible `:focus-visible` outlines everywhere (no bare `outline: none`).

### Performance
- **Abort in-flight requests**: `switchMap` in the store cancels the previous HTTP
  request when a new search arrives.
- **Avoid needless re-renders**: every component is `ChangeDetectionStrategy.OnPush`;
  Signals drive change detection; `@for` uses `track video.id`.
- **Lazy thumbnails**: `<img loading="lazy" decoding="async">`.
- **Lazy routes**: both feature components are `loadComponent`-split.

## Pexels response shape (verified)

```jsonc
{
  "videos": [{
    "id": 6963395,
    "duration": 7,                       // seconds
    "image": "https://…jpeg",            // poster
    "user": { "id": 1, "name": "…", "url": "…" },
    "video_files": [
      { "id": 1, "quality": "hd", "width": 1080, "height": 1920, "fps": 25, "link": "…mp4" },
      { "id": 2, "quality": "hd", "width": 720,  "height": 1280, "fps": 50, "link": "…mp4" }
      // NOTE: `quality` is only sd/hd — same bucket appears at multiple resolutions,
      //       so the quality picker sorts/labels by `height` (with `fps` as a tie-breaker).
    ]
  }],
  "total_results": 0, "page": 1, "per_page": 15
}
```

## Running & verifying

```bash
npm start        # dev server at http://localhost:4200
npm run build    # production build (passes type checks)
npm test         # Jest unit tests
```

Manual end-to-end checks:
1. Home shows a grid of cards with poster / author / duration.
2. Typing in search updates the list after ~400ms; no-match shows the empty state.
3. Network failure shows the error state with a working **Retry** button.
4. Clicking a card navigates to `/video/:id` and plays with native controls.
5. A video with multiple renditions shows the quality selector; changing it swaps the source.
6. Deep-linking / refreshing `/video/:id` re-fetches via `getById`.
7. Keyboard: Tab through cards, Enter opens; Tab to the select, arrows change quality.
8. DevTools Network: fast typing cancels prior search requests; thumbnails load lazily.

## Tests

- `pexels.service.spec.ts` — correct URLs/params for popular/search/getById; maps the response.
- `duration.pipe.spec.ts` — `135 → "2:15"`, `5 → "0:05"`, guards bad input.
- `video-card.component.spec.ts` — renders poster, author and formatted duration from the input.

## Notes / risks

- **Token**: if the API starts returning 401, set `pexelsApiKey` in `environment.ts` —
  the interceptor already wires it in.
- Everything is standalone — no NgModules.
