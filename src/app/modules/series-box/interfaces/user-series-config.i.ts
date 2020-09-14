import {OrderApproachEnum} from '../enums/order-approach.enum';

export interface UserSeriesConfigI {
    addMode?: boolean;
    seriesName?: string;

    sortBy?: { name: string, sortType: OrderApproachEnum };
    genreId?: string;
    premiereDate?: number;

    pageNumber?: number;
    pagesCount?: number;
    itemsPerPage?: number;
}
