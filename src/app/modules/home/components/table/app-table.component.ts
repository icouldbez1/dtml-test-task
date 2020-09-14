import {Component, ElementRef, EventEmitter, Input, Output, ViewChild} from '@angular/core';

export interface HeaderColumn {
    name: string;
    label?: string;
    isSortable?: boolean;
    type?: 'date' | string;
    sortType?: string;
}

export interface ColumnSortChangeData {
    name: string;
    sortType: string;
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

    @Input() public rowsList: { [key: string]: any }[] = [];

    constructor() {
    }

    @Input()
    public set columns(columns: HeaderColumn[]) {
        this.headerColumns = columns.map((column: HeaderColumn) => {
            // TODO CHECK IF SORT IS VALID - ASC DESC ''
            if (column.isSortable && typeof column.sortType !== 'string') {
                column.sortType = '';
            }

            return column;
        });
    }

    public changeSort(columnName: string): void {
        const targetColumn: HeaderColumn = this.headerColumns.find((headerColumn: HeaderColumn) => headerColumn.name === columnName);

        if (targetColumn && targetColumn.isSortable) {
            const targetColumnSort: string = targetColumn.sortType;

            this.resetColumnsSort();

            if (targetColumnSort === '') {
                targetColumn.sortType = 'asc';
            } else if (targetColumnSort === 'asc') {
                targetColumn.sortType = 'desc';
            } else if (targetColumnSort === 'desc') {
                targetColumn.sortType = '';
            }

            this.sortChange.emit({
                name: targetColumn.name,
                sortType: targetColumn.sortType
            });
        }
    }

    public resetColumnsSort(): void {
        this.headerColumns.forEach((column: HeaderColumn) => column.sortType = '');
    }
}
