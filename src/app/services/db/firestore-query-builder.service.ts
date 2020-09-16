import {CollectionReference, Query} from '@angular/fire/firestore';
import {DatabaseColumnEnum} from '../../modules/series-box/enums/database-columns/database-column.enum';
import {FirestoreSeriesDocument, SeriesQueryConfig} from './series-firestore.service';
import OrderByDirection = firebase.firestore.OrderByDirection;

export abstract class FirestoreQueryBuilderService {
    public static getSeriesQuery(reference: CollectionReference, config?: SeriesQueryConfig): Query {
        let isNameBeingQueried: boolean = false;

        let seriesQuery: Query;

        if (config) {
            if (config.name) {
                isNameBeingQueried = true;

                seriesQuery = this.getNameLowerCaseQuery(reference, config.name);
            }

            if (config.genreId) {
                if (seriesQuery) {
                    seriesQuery = this.getGenreIdQuery(seriesQuery, config.genreId);
                } else {
                    seriesQuery = this.getGenreIdQuery(reference, config.genreId);
                }
            }

            if (config.premiereDate) {
                if (seriesQuery) {
                    seriesQuery = this.getPremiereDateQuery(seriesQuery, config.premiereDate);
                } else {
                    seriesQuery = this.getPremiereDateQuery(reference, config.premiereDate);
                }
            }

            if (config.sortBy && config.sortBy?.sortType && config.sortBy?.sortType) {
                if (isNameBeingQueried && config.sortBy.name !== DatabaseColumnEnum.NAME_LOWERCASE) {
                    // TODO breaks subsequent order query unless it's not being executed.

                    if (seriesQuery) {
                        seriesQuery = this.getSortQuery(seriesQuery, {name: DatabaseColumnEnum.NAME_LOWERCASE, sortType: 'desc'});
                    } else {
                        seriesQuery = this.getSortQuery(reference, {name: DatabaseColumnEnum.NAME_LOWERCASE, sortType: 'desc'});
                    }

                }

                if (seriesQuery) {
                    seriesQuery = this.getSortQuery(seriesQuery, config.sortBy);
                } else {
                    seriesQuery = this.getSortQuery(reference, config.sortBy);
                }
            }

            return seriesQuery ? seriesQuery : reference;
        }

        return reference;
    }

    public static getNameLowerCaseQuery(reference: CollectionReference | Query, searchValue: string): Query {
        return reference.where(DatabaseColumnEnum.NAME_LOWERCASE, '>=', searchValue.toLowerCase())
            .where(DatabaseColumnEnum.NAME_LOWERCASE, '<=', searchValue.toLowerCase() + '\uf8ff');
    }

    public static getGenreIdQuery(reference: CollectionReference | Query, searchValue: string): Query {
        return reference.where(DatabaseColumnEnum.GENRES_IDS, 'array-contains', searchValue);
    }

    public static getPremiereDateQuery(reference: CollectionReference | Query, searchValue: number): Query {
        // TODO commented code conflicts with orderBy
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

        return reference.where(DatabaseColumnEnum.PREMIERE_DATE, '==', searchValue);
    }

    public static getSortQuery(reference: CollectionReference | Query, sortData: { name: string, sortType?: string }): Query {
        const sortType: OrderByDirection = sortData.sortType as OrderByDirection;

        return reference.orderBy(sortData.name, sortType ? sortType : 'asc');
    }

    public static getSeriesInfiniteLoadingQuery(reference: CollectionReference, config?: SeriesQueryConfig): Query {
            let query: Query = this.getSeriesQuery(reference, config);

            if (config?.lastDoc) {
                query = query.startAfter(config.lastDoc);
            }
            return query.limit(config.limit);
    }
}
