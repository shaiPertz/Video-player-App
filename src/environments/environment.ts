/**
 * Pexels API configuration.
 *
 * `pexelsApiKey` is intentionally empty: the endpoints used by this app are
 * reachable without an Authorization header. If a key ever becomes required,
 * drop it here and `pexelsInterceptor` will attach it automatically — no other
 * code changes needed.
 */
export const environment = {
  production: false,
  pexelsApiBaseUrl: 'https://api.pexels.com/videos',
  pexelsApiKey: '',
};
