import { ApplicationConfig, inject } from '@angular/core';
import { Router, provideRouter } from '@angular/router';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import {
  HttpErrorResponse,
  HttpEvent,
  HttpHandlerFn,
  HttpRequest,
  provideHttpClient,
  withInterceptors,
} from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';

import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideAnimationsAsync(),
    provideHttpClient(withInterceptors([errorInterceptor])),
  ],
};

//Interceptor for network errors
function errorInterceptor(
  req: HttpRequest<unknown>,
  next: HttpHandlerFn
): Observable<HttpEvent<unknown>> {
  const router = inject(Router);
  return next(req).pipe(
    catchError((err: HttpErrorResponse) => {
      //for network error route to error page
      if (err instanceof HttpErrorResponse && err.status == 0) {
        router.navigate(['/error']);
        return new Observable<HttpEvent<unknown>>();
      }
      //for other errors pass it along
      return throwError(()=>err);
    })
  );
}
