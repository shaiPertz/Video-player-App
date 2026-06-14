/**
 * Pexels API configuration.
 *
 * `pexelsApiKey` is sent as the `Authorization` header by `pexelsInterceptor`.
 * In a real project this should NOT be committed — load it from a build-time
 * env var or proxy it server-side. It lives here for the interview demo.
 */
export const environment = {
  production: false,
  pexelsApiBaseUrl: 'https://api.pexels.com/videos',
  pexelsApiKey: 'Rx3JRV771dZFKgjvezKE7BYYGvjLKUE6oCc652hmkaTylXrUaTWhU4Xx',
};
