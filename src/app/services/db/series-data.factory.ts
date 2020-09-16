import {
    FirestoreGenreDocument,
    FirestoreSeriesDocument,
    SeriesBox,
    SeriesDetails,
    SeriesGenre,
    SeriesQueryConfig
} from './series-firestore.service';
import {DocumentData, QueryDocumentSnapshot, QuerySnapshot} from '@angular/fire/firestore';

export class SeriesDataFactory {
    public static createSeriesBox(
        seriesSnapshot: QuerySnapshot<DocumentData>,
        genresSnapshot: QuerySnapshot<DocumentData>,
        config?: SeriesQueryConfig
    ): SeriesBox {
        const limit: number = config?.limit || 5;
        let pageNumber: number = config?.pageNumber || 1;

        const totalSeriesPages: number = Math.ceil(seriesSnapshot.size / limit);

        if (totalSeriesPages < pageNumber) {
            pageNumber = 1;
        }

        let seriesList: SeriesDetails[];

        const genresList: SeriesGenre[] = genresSnapshot.docs.map((genreDoc: QueryDocumentSnapshot<FirestoreGenreDocument>) => {
            const genreDocData: FirestoreGenreDocument = genreDoc.data();

            return {
                id: genreDoc.id,
                name: genreDocData.name,
                label: genreDocData.label
            };
        });

        const docsFilteredByPage: QueryDocumentSnapshot<DocumentData>[] = this.paginate<QueryDocumentSnapshot<DocumentData>>(
            seriesSnapshot.docs,
            pageNumber,
            limit
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
            totalSeriesCount: seriesSnapshot.size,
            page: pageNumber,
            totalPages: totalSeriesPages
        };
    }

    protected static paginate<T>(items: T[], pageNumber: number, itemsPerPage: number): T[] {
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
