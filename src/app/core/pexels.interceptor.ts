import { HttpInterceptorFn } from '@angular/common/http';

import { environment } from '../../environments/environment';

/**
 * Attaches the Pexels Authorization header — but only when a key is configured
 * and only for Pexels requests. With an empty key it is a no-op, which is the
 * default for this app (the endpoints work unauthenticated).
 */
export const pexelsInterceptor: HttpInterceptorFn = (req, next) => {
  const key = environment.pexelsApiKey;
  if (key && req.url.startsWith('https://api.pexels.com')) {
    return next(req.clone({ setHeaders: { Authorization: key } }));
  }
  return next(req);
};
