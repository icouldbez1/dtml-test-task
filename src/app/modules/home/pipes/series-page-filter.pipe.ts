import {Pipe, PipeTransform} from '@angular/core';
import {SeriesMetaI} from '../../../interfaces/series/series-meta.i';

@Pipe({
    name: 'pageFilter'
})
export class SeriesPageFilterPipe implements PipeTransform {
    public transform(seriesMetaList: SeriesMetaI[], pageNumber: number, itemsPerPage: number): any {
        if (typeof pageNumber === 'number' && typeof itemsPerPage === 'number') {
            // ALTERNATIVE APPROACH TO FIND START ITEM INDEX
            // const endAt: number = this.itemsPerPage * pageNumber;
            // const startFrom: number = endAt - this.itemsPerPage;

            const startItemIndex: number = itemsPerPage * (pageNumber - 1);

            return seriesMetaList.slice(startItemIndex, startItemIndex + itemsPerPage);
        }

        return seriesMetaList;
    }
}
