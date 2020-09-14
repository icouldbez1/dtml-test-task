import {Injectable} from '@angular/core';
import {from, Observable, zip} from 'rxjs';
import {
    AngularFirestore,
    AngularFirestoreCollection,
    AngularFirestoreDocument,
    CollectionReference,
    DocumentData,
    DocumentSnapshot,
    QueryDocumentSnapshot,
    QuerySnapshot
} from '@angular/fire/firestore';
import {bufferCount, concatMap, map, switchMap, take} from 'rxjs/operators';
import * as firebase from 'firebase';
import Query = firebase.firestore.Query;
import OrderByDirection = firebase.firestore.OrderByDirection;

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
}

export interface SeriesQueryConfig {
    name?: string;
    genreId?: string;
    premiereDate?: number;
    pageNumber?: number;
    limit?: number;
    sortBy?: { name: string, sortType: string };
}

interface FirestoreSeriesDocument {
    name: string;
    genre_id: AngularFirestoreDocument<SeriesGenre>;
    genres: AngularFirestoreDocument<SeriesGenre>[];
    genresIds: string[];
    premiereDate: number;
    season: number;
    network: string;
}

interface FirestoreGenreDocument {
    name: string;
    label: string;
}


@Injectable({
    providedIn: 'root'
})
export class SeriesFirestoreService {
    public static readonly GENRES_PATH: string = '/genres';
    public static readonly GENRES_TMDB_PATH: string = '/genres_tmdb';
    public static readonly SERIES_PATH: string = '/series';

    public queryStartSeriesDoc: QueryDocumentSnapshot<DocumentData>;
    public previousConfig: SeriesQueryConfig;

    constructor(protected firestoreDb: AngularFirestore) {

    }

    public getSeriesData$(config?: SeriesQueryConfig): Observable<SeriesBox> {
        return zip(from(this.genresCollection.get()), this.getSeriesByConfig$(config)).pipe(
            map(([genresDocs, seriesDocs]: QuerySnapshot<DocumentData>[]) => {
                let seriesList: SeriesDetails[];

                const genresList: SeriesGenre[] = genresDocs.docs.map((genreDoc: QueryDocumentSnapshot<FirestoreGenreDocument>) => {
                    const genreDocData: FirestoreGenreDocument = genreDoc.data();

                    return {
                        id: genreDoc.id,
                        name: genreDocData.name,
                        label: genreDocData.label
                    };
                });

                const limit: number = config.limit || 5;
                let pageNumber: number = config.pageNumber || 1;

                if (seriesDocs.size < pageNumber) {
                    pageNumber = Math.ceil(seriesDocs.size / limit);
                }

                const docsFilteredByPage: QueryDocumentSnapshot<DocumentData>[] = this.paginate<QueryDocumentSnapshot<DocumentData>>(
                    seriesDocs.docs,
                    pageNumber,
                    config.limit || 5
                );

                seriesList = docsFilteredByPage.map((seriesDoc: QueryDocumentSnapshot<FirestoreSeriesDocument>) => {
                    const seriesDocData: FirestoreSeriesDocument = seriesDoc.data();

                    return {
                        id: seriesDoc.id,
                        name: seriesDocData.name,
                        premiereDate: seriesDocData.premiereDate,
                        season: seriesDocData.season,
                        network: seriesDocData.network,
                        genres: genresList.filter((genre: SeriesGenre) => seriesDocData.genresIds.includes(genre.id)),
                        docRef: seriesDoc
                    };
                });

                return {
                    genres: genresList,
                    series: seriesList,
                    totalSeriesCount: seriesDocs.size,
                    page: pageNumber,
                    totalPages: Math.ceil(seriesDocs.size / limit)
                };
            })
        );
    }

    public getSeriesByConfig$(config?: SeriesQueryConfig): Observable<QuerySnapshot<DocumentData>> {
        return from(this.firestoreDb.collection<FirestoreSeriesDocument>(SeriesFirestoreService.SERIES_PATH, (ref: CollectionReference) => {
            let isNameBeingQueried: boolean = false;

            let seriesQuery: Query<DocumentData>;

            if (config) {
                if (config.name) {
                    isNameBeingQueried = true;

                    if (seriesQuery) {
                        seriesQuery = seriesQuery.where('name', '>=', config.name).where('name', '<=', config.name + '\uf8ff');
                    } else {
                        seriesQuery = ref.where('name', '>=', config.name).where('name', '<=', config.name + '\uf8ff');
                    }
                }

                if (config.genreId) {
                    if (seriesQuery) {
                        seriesQuery = seriesQuery.where('genresIds', 'array-contains', config.genreId);
                    } else {
                        seriesQuery = ref.where('genresIds', 'array-contains', config.genreId);
                    }
                }

                if (config.premiereDate) {
                    // TODO conflicts with orderBy
                    // const premiereDateYear: number = Number(config.premiereDate);
                    //
                    // const premiereYearFromFirstSecond: Date = new Date(premiereDateYear, 0, 1, 0, 0, 0);
                    // const premiereYearToLastSecond: Date = new Date(premiereDateYear + 1, 0, 1, 0, 0, 0);
                    //
                    // console.log(premiereYearFromFirstSecond, premiereYearFromFirstSecond);
                    // console.log(premiereYearToLastSecond, premiereYearToLastSecond);
                    //
                    // if (seriesQuery) {
                    //     seriesQuery = seriesQuery.where('premiereDate', '>=', premiereYearFromFirstSecond)
                    //         .where('premiereDate', '<=', premiereYearToLastSecond);
                    // } else {
                    //     seriesQuery = ref.where('premiereDate', '>', premiereYearFromFirstSecond)
                    //         .where('premiereDate', '<', premiereYearToLastSecond);
                    // }

                    if (seriesQuery) {
                        seriesQuery = seriesQuery.where('premiereDate', '==', config.premiereDate);
                    } else {
                        seriesQuery = ref.where('premiereDate', '==', config.premiereDate);
                    }
                }

                if (config.sortBy && config.sortBy.sortType) {
                    if (isNameBeingQueried && config.sortBy?.name !== 'name') {
                        if (seriesQuery) {
                            seriesQuery = seriesQuery.orderBy('name', 'desc');
                        } else {
                            seriesQuery = ref.orderBy('name', 'desc');
                        }
                    }

                    if (seriesQuery) {
                        seriesQuery = seriesQuery.orderBy(config.sortBy.name, config.sortBy.sortType as OrderByDirection);
                    } else {
                        seriesQuery = ref.orderBy(config.sortBy.name, config.sortBy.sortType as OrderByDirection);
                    }
                }
            }

            // TODO temporary limit (don't wanna pay extra money for the read requests)
            return seriesQuery ? seriesQuery.limit(100) : ref.limit(100);
        }).get());
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
            genresIds: genres.docs.filter((doc: any) => genresIds.includes(doc.data().tmdbId)).map((doc: any) => doc.id),
            season: Math.floor(Math.random() * 10) + 1,
            network: networks[Math.floor(Math.random() * networks.length)],
            premiereDate: new Date(date)
        })).subscribe();
    }

    protected get genresCollection(): AngularFirestoreCollection<FirestoreGenreDocument> {
        return this.firestoreDb.collection<FirestoreGenreDocument>(SeriesFirestoreService.GENRES_TMDB_PATH);
    }

    protected get seriesCollection(): AngularFirestoreCollection<{ name: string, genre_id: AngularFirestoreDocument }> {
        return this.firestoreDb.collection<{ name: string, genre_id: AngularFirestoreDocument }>(SeriesFirestoreService.SERIES_PATH);
    }

    protected paginate<T>(items: T[], pageNumber: number, itemsPerPage: number): T[] {
        if (typeof pageNumber === 'number' && typeof itemsPerPage === 'number') {
            // ALTERNATIVE APPROACH TO FIND START ITEM INDEX
            // const endAt: number = this.itemsPerPage * pageNumber;
            // const startFrom: number = endAt - this.itemsPerPage;

            const startItemIndex: number = itemsPerPage * (pageNumber - 1);

            return items.slice(startItemIndex, startItemIndex + itemsPerPage);
        }

        return items;
    }
}