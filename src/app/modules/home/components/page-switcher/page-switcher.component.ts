import {Component, EventEmitter, Input, Output} from '@angular/core';

@Component({
    selector: 'app-page-switcher-component',
    templateUrl: './page-switcher.component.html',
    styleUrls: ['./page-switcher.component.scss']
})
export class PageSwitcherComponent {
    @Input()
    public pageNumerationsCount: number = 3;

    @Output()
    public selectedPage: EventEmitter<number> = new EventEmitter<number>(true);

    public itemsPerPageCount: number = 1;


    public pageNumbersList: number[] = [];

    public itemsForPagination: any[] = [];

    @Input() public activePage: number;

    constructor() {

    }

    @Input()
    public set items(items: any[]) {
        this.itemsForPagination = items;

        this.setPageNumbersList();
        this.setActivePage(1);
    }

    public get items(): any[] {
        return this.itemsForPagination;
    }

    @Input()
    public set pagesCount(count: number) {
        if (typeof count === 'number') {
            this.pageNumbersList = Array.from(Array(count), (value: any, key: number) => key + 1);
        }
    }


    @Input()
    public set itemsPerPage(itemsPerPage: number) {
        this.itemsPerPageCount = itemsPerPage;

        this.setPageNumbersList();
        this.setActivePage(this.pageNumbersList.includes(this.activePage) ? this.activePage : 1);
    }

    public get itemsPerPage(): number {
        return this.itemsPerPageCount;
    }

    public setPageNumbersList(): void {
        const pagesCount: number = Math.ceil(this.items.length / this.itemsPerPage);

        this.pageNumbersList = Array.from(Array(pagesCount), (value: any, key: number) => key + 1);
    }

    public get isActivePageFirst(): boolean {
        return this.activePage === this.pageNumbersList[0];
    }

    public get isActivePageLast(): boolean {
        return this.activePage === this.pageNumbersList[this.pageNumbersList.length - 1];
    }

    public get arePagesEmpty(): boolean {
        return !this.pageNumbersList.length;
    }

    public setActivePage(pageNumber: number): void {
        if (!this.pageNumbersList.length || pageNumber < 1 || pageNumber > this.getTrailingPage()) {
            return;
        }

        if (this.pageNumbersList.includes(pageNumber)) {
            this.activePage = pageNumber;

            this.selectedPage.emit(this.activePage);
        }

    }

    public getRangeOfPagesNumbers(): number[] {
        const numberOfVisiblePages: number = this.pageNumerationsCount;
        const halfOfVisiblePages: number = numberOfVisiblePages % 2 === 0 ?
            (numberOfVisiblePages / 2) + 1 :
            Math.ceil(numberOfVisiblePages / 2);

        // 1(a), 2, 3 -> 1(a), 2, 3
        // 1, 2(a), 3 -> 1, 2(a), 3
        // 1, 2, 3(a) -> 2, 3(a), 4

        // 0 1 2 3
        // 6 7 8 9
        // 6 7 8 9 10 11

        const indexOfCurrentPageMeta: number = this.pageNumbersList.indexOf(this.activePage);

        if (indexOfCurrentPageMeta < halfOfVisiblePages) {
            return this.pageNumbersList.slice(0, numberOfVisiblePages);
        }

        if (indexOfCurrentPageMeta > (this.pageNumbersList.length - 1) - halfOfVisiblePages) {
            return this.pageNumbersList.slice((this.pageNumbersList.length - 1) - (numberOfVisiblePages - 1), this.pageNumbersList.length);
        }

        //     if (indexOfCurrentPageMeta > Math.ceil(numberOfVisiblePages / 2)) {
        //
        //     }
        // console.log('current index: ', indexOfCurrentPageMeta);

        // console.log('from: ', indexOfCurrentPageMeta - (halfOfVisiblePages - 1));
        // console.log('to: ', indexOfCurrentPageMeta + (numberOfVisiblePages - halfOfVisiblePages) + 1);
        // console.log(this.pageNumbersList.slice(indexOfCurrentPageMeta - halfOfVisiblePages - 1, indexOfCurrentPageMeta + (numberOfVisiblePages - halfOfVisiblePages) + 1));

        return this.pageNumbersList.slice(indexOfCurrentPageMeta - (halfOfVisiblePages - 1), indexOfCurrentPageMeta + (numberOfVisiblePages - halfOfVisiblePages) + 1);
    }

    protected getTrailingPage(): number {
        return this.pageNumbersList[this.pageNumbersList.length - 1] || 0;
    }
}
