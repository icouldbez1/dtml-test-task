import {Component, OnDestroy, OnInit} from '@angular/core';
import {SeriesApiService} from '../../services/series-api.service';
import {catchError, finalize, tap} from 'rxjs/operators';
import {ColumnSortChangeData, HeaderColumn} from './components/table/app-table.component';
import {SeriesBox, SeriesDetails, SeriesFirestoreService, SeriesGenre, SeriesQueryConfig} from '../../services/series-firestore.service';
import {UserSeriesConfigI} from './interfaces/user-series-config.i';
import {Subscription, throwError} from 'rxjs';
import {MatSnackBar} from '@angular/material/snack-bar';

@Component({
    selector: 'app-home',
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit, OnDestroy {
    public static readonly DEFAULT_ITEMS_COUNT_PER_PAGE: number = 5;

    public localSeriesList: SeriesDetails[] = [];
    public seriesLoadError = true;

    public yearsOptions: { name: string }[] = [];

    public countOfPagesNumerations: number = 3;
    public itemsCountPerPageList: number[] = [5, 10, 25];
    public activePage: number;

    public itemsPerPage: number = HomeComponent.DEFAULT_ITEMS_COUNT_PER_PAGE;

    public genres: any = [];

    public userSeriesConfig: UserSeriesConfigI = {itemsPerPage: this.itemsPerPage};

    public isLoaderVisible: boolean = false;

    public nameFilterInputValue: string = '';

    public tableColumns: HeaderColumn[] = [
        {name: 'name', label: 'Name', isSortable: true},
        {name: 'season', label: 'Season', isSortable: true},
        {name: 'network', label: 'Network', isSortable: true},
        {name: 'premiereDate', label: 'Premiere', isSortable: !this.userSeriesConfig.premiereDate, type: 'date'}
    ];

    public seriesDataSub: Subscription;

    constructor(private seriesApiService: SeriesApiService,
                private seriesFirestoreService: SeriesFirestoreService,
                private snackBarService: MatSnackBar) {
        this.initYearsOptions();
        this.getSeriesData(true);
    }

    public ngOnInit(): void {
    }

    public ngOnDestroy(): void {
        this.seriesDataSub.unsubscribe();
    }

    public getSeriesData(initialQuery: boolean = false): void {
        this.seriesDataSub?.unsubscribe();

        let queryConfig: SeriesQueryConfig = {};

        if (initialQuery) {
            queryConfig = {pageNumber: 1, limit: this.userSeriesConfig.itemsPerPage};
        } else {
            queryConfig = this.getSeriesQueryByUserSeriesConfig();
        }

        this.isLoaderVisible = true;

        this.seriesDataSub = this.seriesFirestoreService.getSeriesData$(queryConfig).pipe(
            tap((seriesData: SeriesBox) => {
                this.genres = seriesData.genres;
                this.localSeriesList = seriesData.series;

                this.userSeriesConfig.pagesCount = seriesData.totalPages;
                this.userSeriesConfig.pageNumber = seriesData.page;
            }),
            catchError((error: Error) => {
                this.snackBarService.open(error.message, 'Ok', {duration: 3000});

                return throwError(error);
            }),
            finalize(() => {
                this.isLoaderVisible = false;
            })
        ).subscribe();
    }

    public setActivePage(pageNumber: number): void {
        console.log('set active page', this.activePage);

        this.activePage = pageNumber;

        this.userSeriesConfig.pageNumber = pageNumber;

        this.getSeriesData();

    }

    public setSort(sortData: ColumnSortChangeData): void {
        console.log('set sort', sortData);

        this.userSeriesConfig.sortBy = sortData;

        this.getSeriesData();
    }

    public setGenreFilter(value: string): void {
        console.log('set genre filter', value);

        const targetGenre: SeriesGenre = this.genres.find((genre: SeriesGenre) => genre.name === value);

        if (targetGenre) {
            this.userSeriesConfig.genreId = targetGenre.id;

            this.getSeriesData();
        }
    }

    public setPremiereFilter(value: string): void {
        console.log('set premiere filter', value);
        const premiereDateColumn: HeaderColumn = this.tableColumns.find((column: HeaderColumn) => column.name === 'premiereDate');

        premiereDateColumn.isSortable = !value;

        if (!!value && this.userSeriesConfig.sortBy?.name === 'premiereDate' && !!this.userSeriesConfig.sortBy?.sortType) {
            this.userSeriesConfig.sortBy.sortType = '';
            premiereDateColumn.sortType = '';

        }

        this.userSeriesConfig.premiereDate = Number(value);

        this.getSeriesData();
    }

    public setItemsPerPageLimit(itemsLimit: number): void {
        if (this.itemsCountPerPageList.includes(itemsLimit) || itemsLimit === HomeComponent.DEFAULT_ITEMS_COUNT_PER_PAGE) {
            console.log('set items per page', itemsLimit);

            this.itemsPerPage = itemsLimit;

            this.userSeriesConfig.itemsPerPage = this.itemsPerPage;

            this.getSeriesData();
        }
    }

    public setNameFilter(event: KeyboardEvent): void {
        this.userSeriesConfig.seriesName = this.nameFilterInputValue;

        this.getSeriesData();
    }

    public getSeriesQueryByUserSeriesConfig(): SeriesQueryConfig {
        const userConfig: UserSeriesConfigI = this.userSeriesConfig;

        return {
            name: userConfig.seriesName,
            pageNumber: userConfig.pageNumber,
            limit: userConfig.itemsPerPage,
            sortBy: {name: userConfig.sortBy?.name, sortType: userConfig.sortBy?.sortType},
            genreId: userConfig.genreId,
            premiereDate: userConfig.premiereDate
        };
    }

    protected initYearsOptions(): void {
        const yearsRange: number = 300;
        const currentYear: number = new Date().getFullYear();
        const startYear: number = currentYear - Math.ceil(yearsRange / 2);

        this.yearsOptions = Array.from({length: yearsRange + 1}, (_, index: number) => {
            return {name: `${startYear + index}`};
        });
    }

}
