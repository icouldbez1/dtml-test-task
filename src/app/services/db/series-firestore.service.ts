import {Injectable} from '@angular/core';
import {from, Observable, zip} from 'rxjs';
import {
    AngularFirestore,
    AngularFirestoreCollection,
    AngularFirestoreDocument,
    CollectionReference,
    DocumentData,
    DocumentSnapshot,
    Query,
    QueryDocumentSnapshot,
    QuerySnapshot
} from '@angular/fire/firestore';
import {bufferCount, concatMap, map, switchMap, take} from 'rxjs/operators';
import {HttpRequestMethodEnum} from '../../enums/http/http-request-method.enum';
import {RequestService} from '../http/http.service';
import {FirestoreQueryBuilderService} from './firestore-query-builder.service';
import {SeriesDataFactory} from './series-data.factory';

export interface SeriesBox {
    genres: SeriesGenre[];
    series: SeriesDetails[];
    totalSeriesCount: number;
    page: number;
    totalPages: number;
}

export interface SeriesDetails {
    id: string;
    name: string;
    genres: SeriesGenre[];
    premiereDate: number;
    season: number;
    network: string;
    docRef: QueryDocumentSnapshot<FirestoreSeriesDocument>;
}

export interface SeriesGenre {
    id: string;
    name: string;
    label: string;
    backgroundColor?: string;
}

export interface SeriesQueryConfig {
    name?: string;
    genreId?: string;
    premiereDate?: number;
    pageNumber?: number;
    limit?: number;
    sortBy?: { name: string, sortType: string };
    lastDoc?: QueryDocumentSnapshot<FirestoreSeriesDocument>;
}

export interface FirestoreSeriesDocument {
    name: string;
    genre_id: AngularFirestoreDocument<SeriesGenre>;
    genres: AngularFirestoreDocument<SeriesGenre>[];
    genresIds: string[];
    premiereDate: number;
    season: number;
    network: string;
}

export interface FirestoreGenreDocument {
    name: string;
    label: string;
    backgroundColor: string;
}

export interface InfiniteLoadingSeriesBox {
    genres: SeriesGenre[];
    series: SeriesDetails[];
}


@Injectable({
    providedIn: 'root'
})
export class SeriesFirestoreService extends FirestoreQueryBuilderService {
    public static readonly GENRES_PATH: string = '/genres_tmdb';
    public static readonly SERIES_PATH: string = '/series';

    public queryStartSeriesDoc: QueryDocumentSnapshot<DocumentData>;
    public previousConfig: SeriesQueryConfig;

    constructor(protected firestoreDb: AngularFirestore, private requestService: RequestService) {
        super();
    }

    public getSeriesData$(config?: SeriesQueryConfig): Observable<SeriesBox> {
        return zip(this.genresCollection.get(), this.getSeriesByConfig$(config)).pipe(
            map(([genresSnapshot, seriesSnapshot]: QuerySnapshot<DocumentData>[]) => {
                return SeriesDataFactory.createSeriesBox(seriesSnapshot, genresSnapshot, config);
            })
        );
    }

    public getSeriesByConfig$(config?: SeriesQueryConfig): Observable<QuerySnapshot<DocumentData>> {
        return this.firestoreDb.collection<FirestoreSeriesDocument>(SeriesFirestoreService.SERIES_PATH, (ref: CollectionReference) => {
            return SeriesFirestoreService.getSeriesQuery(ref, config).limit(20);
        }).get();
    }

    public loadMoreSeries$(config: SeriesQueryConfig): Observable<InfiniteLoadingSeriesBox> {
        return zip(
            this.genresCollection.get(),
            this.firestoreDb.collection<FirestoreSeriesDocument>(SeriesFirestoreService.SERIES_PATH, (ref: CollectionReference) => {
                return SeriesFirestoreService.getSeriesInfiniteLoadingQuery(ref, config);
            }).get()
        ).pipe(
            map(([genresSnapshot, seriesSnapshot]: QuerySnapshot<DocumentData>[]) => {
                return SeriesDataFactory.transformSeriesData(seriesSnapshot.docs, genresSnapshot.docs);
            })
        );
    }

    public getSeries$(): Observable<{ genres: SeriesGenre[], name: string }[]> {
        let seriesLength: number = 0;

        return from(this.seriesCollection.get()).pipe(
            switchMap((seriesSnapshot: QuerySnapshot<FirestoreSeriesDocument>) => {
                seriesLength = seriesSnapshot.size;

                return from(seriesSnapshot.docs);
            }),
            concatMap((singleSeries: QueryDocumentSnapshot<FirestoreSeriesDocument>) => {
                const singleSeriesData: FirestoreSeriesDocument = singleSeries.data();

                return this.getSingleSeriesGenres$(singleSeriesData).pipe(
                    map((genresList: SeriesGenre[]) => {

                        return {
                            genres: genresList,
                            name: singleSeriesData.name
                        };
                    })
                );
            }),
            bufferCount(seriesLength)
        );
    }

    public getSingleSeriesGenres$(series: FirestoreSeriesDocument): Observable<SeriesGenre[]> {
        const seriesGenresLength: number = series.genres.length;

        return from(series.genres).pipe(
            concatMap((genresDocument: AngularFirestoreDocument<SeriesGenre>) => {
                return from(genresDocument.get()).pipe(
                    map((seriesGenreDocument: DocumentSnapshot<SeriesGenre>) => {
                        const genreData: { name: string, label: string } = seriesGenreDocument.data();


                        return {name: genreData.name, label: genreData.label, id: seriesGenreDocument.id};
                    })
                );
            }),
            bufferCount(seriesGenresLength),
            take(1)
        );
    }

    // dev. purposes function // used this function to add the data to Firestore (with random values for some props) from other api service.
    public addMovie(genres: QuerySnapshot<DocumentData>, name: string, date: string, genresIds: number[]): void {
        const networks: string[] = ['Netflix', 'HBO', 'AMC', 'FX', 'NBC', 'ABC', 'The CW', 'History', 'Fox', 'CBS',
            'Showtime', 'Natural Geographic Channel', 'BBC', 'Disney+', 'DC Universe', 'Paramount Network'];

        from(this.firestoreDb.collection(SeriesFirestoreService.SERIES_PATH).add({
            name,
            nameLowercase: name.toLowerCase(),
            genresIds: genres.docs.filter((doc: any) => genresIds.includes(doc.data().tmdbId)).map((doc: any) => doc.id),
            season: Math.floor(Math.random() * 10) + 1,
            network: networks[Math.floor(Math.random() * networks.length)],
            premiereDate: new Date(date).getFullYear()
        })).subscribe();
    }

    // dev. purposes function for retrieving The Movie DataBase series.
    public getAllTmdbSeries$(): Observable<any[]> {
        // backdrop_path: "/mGVrXeIjyecj6TKmwPVpHlscEmw.jpg"
        // first_air_date: "2019-07-25"
        // genre_ids: (2) [10759, 10765]
        // id: 76479
        // name: "The Boys"
        // origin_country: ["US"]
        // original_language: "en"
        // original_name: "The Boys"
        // overview: "A group."
        // popularity: 1975.715
        // poster_path: "/mY7SeH4HFFxW1hiI6cWuwCRKptN.jpg"
        // vote_average: 8.4
        // vote_count: 1797

        return this.requestService.request$(HttpRequestMethodEnum.GET,
            'https://api.themoviedb.org/3/tv/popular?language=en-US&page=8', {
                headers: {
                    Authorization: this.authToken
                }
            }).pipe(
            map((genresObject: { results: any[] }) => genresObject.results)
        );
    }

    protected get genresCollection(): AngularFirestoreCollection<FirestoreGenreDocument> {
        return this.firestoreDb.collection<FirestoreGenreDocument>(SeriesFirestoreService.GENRES_PATH);
    }

    protected get seriesCollection(): AngularFirestoreCollection<{ name: string, genre_id: AngularFirestoreDocument }> {
        return this.firestoreDb.collection<FirestoreSeriesDocument>(SeriesFirestoreService.SERIES_PATH);
    }

    private get authToken(): string {
        return 'Bearer YOUR_API_KEY_V4_HERE';
    }
}
