# AI Usage Notes

This document is an honest disclosure of how AI tooling was used while building this
project, the prompts that drove it, and where the AI got things wrong (and how I caught it).

## AI tools used — and for what

| Tool | Used for |
|------|----------|
| **Claude Code (Claude Opus)** | Scaffolding the Angular 19 standalone app; writing the `PexelsService`, HTTP interceptor, list/player components, the signals-based store, the `DurationPipe` and `videoTitle` derivation; setting up **Jest** (`jest-preset-angular`) and writing the unit tests; debugging the Pexels `401`; implementing debounced search and infinite scroll. |
| **Pexels Videos API** (inspected directly) | Calling `/videos/popular` and `/videos/search` with my real token to verify the **actual** JSON shape and confirm which fields exist (author, duration, `video_files` resolutions, the `url` slug) before coding against them. |
| **Browser DevTools (Network tab)** | My own verification — checking which requests the app actually fires (this is how I caught the search bug below). |

## Representative prompts I wrote

> **1. Kickoff / planning**
> "I need to build a video player app in Angular + TypeScript for a job interview; I have 3 hours.
> Required features: (1) fetch & list videos rendered as cards (poster, author, duration);
> (2) play a selected video with native controls; (3) search by keyword, debounced;
> (4) quality selection when more than one resolution exists; (5) visibly distinguish
> loading / error / empty states. Use the Pexels API. Ask me questions and let's plan it together."

> **2. Search behaviour**
> "I want the search to actually go out to the API and search the whole Pexels library on every
> keystroke — not just filter the videos already loaded on the page."

> **3. Infinite scroll**
> "Every time I scroll down past the first 15 videos, automatically load more videos."

## Where the AI got it wrong (and how I caught it)

- **Search wasn't making a network request.** At one stage the AI implemented the search as a
  **client-side filter** over the already-loaded videos — so typing in the search box did **not**
  fire any new request to Pexels. I opened the **DevTools Network tab**, searched, and saw that
  **no outgoing call** was made. I flagged it, and we changed the search to **server-side**:
  every debounced keystroke now calls `GET /videos/search?query=…` (with `switchMap` cancelling
  the previous in-flight request), so it searches the whole library, not just the loaded page.

- **Assumed the Pexels endpoint worked without a token.** Early on the AI accepted that the API
  could be called without authentication. The app got a **`401 Unauthorized`** while a direct
  browser hit appeared to work (browser navigation vs. cross-origin XHR). The fix was a real
  Pexels API key, attached via an HTTP interceptor.

