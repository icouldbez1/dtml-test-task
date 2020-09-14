import {HttpHeaders, HttpParams} from '@angular/common/http';

export interface RequestOptions {
    body?: any;
    headers?: HttpHeaders | {
        [header: string]: string | string[];
    };
    params?: HttpParams | {
        [param: string]: string | string[];
    };
    observe?: any;
    reportProgress?: boolean;
    responseType?: any;
    withCredentials?: boolean;

    returnFullResponse?: boolean;
}
