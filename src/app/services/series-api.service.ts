import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {RequestService} from './http/http.service';
import {HttpRequestMethodEnum} from '../enums/http/http-request-method.enum';
import {SeriesMetaI} from '../interfaces/series/series-meta.i';
import {map} from 'rxjs/operators';
import {HttpResponse} from '@angular/common/http';

@Injectable({
    providedIn: 'root'
})
export class SeriesApiService {
    private static readonly REST_API_URL = 'http://localhost:3000';
    private static readonly TMDB_URL = 'https://api.themoviedb.org/3/genre/tv/list?api_key=cfd62e8c2a327c16b8ebc81ddcc92cfa&language=en-US';
    private static readonly TMDB_URL_NO_API = 'https://api.themoviedb.org/3/genre/tv/list?language=en-US';

    constructor(private requestService: RequestService) {
    }

    public getAll$(): Observable<SeriesMetaI[]> {
        return this.requestService.request$(HttpRequestMethodEnum.GET, SeriesApiService.seriesUrl);
    }

    public getAllGenres$(): Observable<any[]> {
        return this.requestService.request$(HttpRequestMethodEnum.GET, SeriesApiService.TMDB_URL_NO_API, {
            headers: {
                Authorization: 'Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJjZmQ2MmU4YzJhMzI3YzE2YjhlYmM4MWRkY2M5MmNmYSIsInN1YiI6IjVmNTBmNmJmZTg5NGE2MDAzNjRhYjI2ZCIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.kkuZ0aTG2WibZKyosD84bRRAUNcd_3tUS8U6hB_VaH0'
            }
        }).pipe(
            map((genresObject: { genres: any[] }) => genresObject.genres)
        );
    }

    public getAllSeries$(): Observable<any[]> {
        return this.requestService.request$(HttpRequestMethodEnum.GET, 'https://api.themoviedb.org/3/tv/popular?language=en-US&page=1', {
            headers: {
                Authorization: this.authToken
            }
        }).pipe(
            // map((genresObject: { genres: any[] }) => genresObject.genres)
        );
    }


    public getCount$(): Observable<number> {
        return this.requestService.request$(HttpRequestMethodEnum.GET,
            SeriesApiService.seriesUrl + '?_start=0&_end=0',
            {returnFullResponse: true}).pipe(
            map((response: HttpResponse<any>) => Number(response.headers.get('X-Total-Count')))
        );
    }

    private static get seriesUrl(): string {
        return SeriesApiService.REST_API_URL + '/series';
    }

    private get authToken(): string {
        return 'Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJjZmQ2MmU4YzJhMzI3YzE2YjhlYmM4MWRkY2M5MmNmYSIsInN1YiI6IjVmNTBmNmJmZTg5NGE2MDAzNjRhYjI2ZCIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.kkuZ0aTG2WibZKyosD84bRRAUNcd_3tUS8U6hB_VaH0';
    }
}

