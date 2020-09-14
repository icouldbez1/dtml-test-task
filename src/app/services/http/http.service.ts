import {Injectable} from '@angular/core';
import {Observable, throwError} from 'rxjs';
import {catchError, filter, map, take, timeout} from 'rxjs/operators';
import {HttpClient, HttpResponse} from '@angular/common/http';
import {HttpRequestMethodEnum} from '../../enums/http/http-request-method.enum';
import {RequestOptions} from '../../interfaces/http/http-request-options.i';


@Injectable({
    providedIn: 'root'
})
export class RequestService {
    private static REQUEST_TIMEOUT_IN_SECONDS: number = 10;

    constructor(private http: HttpClient) {

    }

    public request$(requestMethod: HttpRequestMethodEnum, url: string, options?: RequestOptions): Observable<any> {
        if (!options) {
            options = {};
        }

        options.reportProgress = true;
        options.observe = 'response';

        return this.sendHttpRequest$(requestMethod, url, options);
    }

    protected sendHttpRequest$(requestMethod: HttpRequestMethodEnum, url: string, options?: RequestOptions): Observable<any> {
        const requestTimeoutInMilliseconds: number = RequestService.REQUEST_TIMEOUT_IN_SECONDS * 1000;

        let renewableRequestTimeout: number = requestTimeoutInMilliseconds;

        const requestOptions: object = JSON.parse(JSON.stringify(options));

        delete (requestOptions as any).returnFullResponse;

        return this.http.request(requestMethod, url, requestOptions).pipe(
            map((response: any) => {
                renewableRequestTimeout = requestTimeoutInMilliseconds;

                if (response instanceof HttpResponse) {
                    return options.returnFullResponse ? response : response.body;
                } else {
                    return undefined;
                }
            }),
            timeout(renewableRequestTimeout),
            filter(Boolean),
            take(1),
            catchError((error) => throwError(error))
        );
    }

}
