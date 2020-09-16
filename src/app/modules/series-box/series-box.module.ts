import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {SeriesBoxRoutingModule} from './series-box-routing.module';
import {PageSwitcherComponent} from './components/page-switcher/page-switcher.component';
import {AppTableComponent} from './components/table/app-table.component';
import {SeriesBoxComponent} from './series-box.component';
import {FormsModule} from '@angular/forms';
import {SeriesFilterPipe} from './pipes/series-filter.pipe';
import {SeriesPageFilterPipe} from './pipes/series-page-filter.pipe';
import {AngularMaterialModule} from '../angular-material/angular-material.module';
import {SelectorComponent} from './components/selector/selector.component';
import {MatSnackBarModule} from '@angular/material/snack-bar';
import {InfiniteScrollModule} from 'ngx-infinite-scroll';
import {MatSidenavModule} from '@angular/material/sidenav';


@NgModule({
    declarations: [
        SeriesBoxComponent,
        AppTableComponent,
        PageSwitcherComponent,
        SeriesFilterPipe,
        SeriesPageFilterPipe,
        SelectorComponent
    ],
    imports: [
        CommonModule,
        SeriesBoxRoutingModule,
        FormsModule,
        AngularMaterialModule,
        MatSnackBarModule,
        InfiniteScrollModule,
        MatSidenavModule
    ],
    exports: [
        PageSwitcherComponent
    ]

})
export class SeriesBoxModule {
}
