import {Pipe, PipeTransform} from '@angular/core';
import {SeriesMetaI} from '../../../interfaces/series/series-meta.i';

@Pipe({
    name: 'filter'
})
export class SeriesFilterPipe implements PipeTransform {
    public transform(seriesMetaList: SeriesMetaI[], byName?: string, byJanre?, byYear?, byPage?: number, itemsPerPage?: number): any {
        // console.log('all filters', byName, byJanre, byYear);

        if (byName) {
            seriesMetaList = seriesMetaList.filter((seriesMeta: SeriesMetaI) => {
                return seriesMeta.name.toLowerCase().indexOf(byName.toLowerCase()) !== -1;

                // return Object.keys(seriesMeta).some((seriesMetaKey: string) => {
                //     if (seriesMetaKey !== 'id') {
                //         return seriesMeta[seriesMetaKey].toLowerCase().indexOf(byName.toLowerCase()) !== -1;
                //     }
                // });
            });
        }

        if (typeof byPage === 'number') {
            const startItemIndex: number = itemsPerPage * (byPage - 1);

            seriesMetaList = seriesMetaList.slice(startItemIndex, startItemIndex + itemsPerPage);
        }

        return seriesMetaList;
    }
}
