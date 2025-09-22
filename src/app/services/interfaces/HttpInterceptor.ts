import {
    HttpEvent,
    HttpInterceptor,
    HttpHandler,
    HttpRequest,
    HttpResponse,
    HttpErrorResponse
  } from '@angular/common/http';
  import { Injectable } from '@angular/core';
  import { Observable, throwError } from 'rxjs';
  import { catchError, tap } from 'rxjs/operators';
  
  @Injectable()
  export class AppHttpInterceptor implements HttpInterceptor {
  
    intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
      // Optional: Clone and modify the request
      const modifiedReq = req.clone({
        // Example: Add custom headers
        setHeaders: {
          'X-Custom-Header': 'YourHeaderValue',
          // Authorization: `Bearer ${yourAuthToken}`,
        }
      });
  
      return next.handle(modifiedReq).pipe(
        tap(event => {
          if (event instanceof HttpResponse) {
            // ✅ Handle successful response
            // console.log('HTTP Response:', event);
          }
        }),
        catchError((error: HttpErrorResponse) => {
          // ❌ Handle errors globally
          // console.error('HTTP Error:', error);
  
          // Example: Redirect on 401
          // if (error.status === 401) {
          //   this.router.navigate(['/login']);
          // }
  
          return throwError(() => error);
        })
      );
    }
  }
  