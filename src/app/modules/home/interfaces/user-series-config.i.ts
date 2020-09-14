export interface UserSeriesConfigI {
    addMode?: boolean;
    seriesName?: string;

    sortBy?: { name: string, sortType: string };
    genreId?: string;
    premiereDate?: number;

    pageNumber?: number;
    pagesCount?: number;
    itemsPerPage?: number;
}
