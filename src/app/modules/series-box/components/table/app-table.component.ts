import {Component, ElementRef, EventEmitter, Input, Output, ViewChild} from '@angular/core';
import {OrderApproachEnum} from '../../enums/order-approach.enum';
import {SeriesDetails} from '../../../../services/db/series-firestore.service';

export interface HeaderColumn {
    name: string;
    label?: string;
    isSortable?: boolean;
    type?: 'date' | string;
    sortType?: OrderApproachEnum;
}

export interface ColumnSortChangeData {
    name: string;
    sortType: OrderApproachEnum;
}

@Component({
    selector: 'app-table',
    templateUrl: './app-table.component.html',
    styleUrls: ['./app-table.component.scss']
})
export class AppTableComponent {
    @ViewChild('searchInput') searchInputRef: ElementRef;

    @Output()
    public sortChange: EventEmitter<ColumnSortChangeData> = new EventEmitter<ColumnSortChangeData>();

    public headerColumns: HeaderColumn[] = [];

    @Input() public rowsList: SeriesDetails[] = [];

    constructor() {
    }

    @Input()
    public set columns(columns: HeaderColumn[]) {
        this.headerColumns = columns.map((column: HeaderColumn) => {
            // TODO CHECK IF SORT IS VALID - ASC DESC ''
            if (column.isSortable && typeof column.sortType !== 'string') {
                column.sortType = OrderApproachEnum.EMPTY;
            }

            return column;
        });
    }

    public changeSort(columnName: string): void {
        const targetColumn: HeaderColumn = this.headerColumns.find((headerColumn: HeaderColumn) => headerColumn.name === columnName);

        if (targetColumn && targetColumn.isSortable) {
            const targetColumnSort: string = targetColumn.sortType;

            this.resetColumnsSort();

            if (targetColumnSort === OrderApproachEnum.EMPTY) {
                targetColumn.sortType = OrderApproachEnum.ASC;
            } else if (targetColumnSort === OrderApproachEnum.ASC) {
                targetColumn.sortType = OrderApproachEnum.DESC;
            } else if (targetColumnSort === OrderApproachEnum.DESC) {
                targetColumn.sortType = OrderApproachEnum.EMPTY;
            }

            this.sortChange.emit({
                name: targetColumn.name,
                sortType: targetColumn.sortType
            });
        }
    }

    public resetColumnsSort(): void {
        this.headerColumns.forEach((column: HeaderColumn) => column.sortType = OrderApproachEnum.EMPTY);
    }
}
