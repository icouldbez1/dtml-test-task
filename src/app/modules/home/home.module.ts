import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {HomeRoutingModule} from './home-routing.module';
import {PageSwitcherComponent} from './components/page-switcher/page-switcher.component';
import {AppTableComponent} from './components/table/app-table.component';
import {HomeComponent} from './home.component';
import {FormsModule} from '@angular/forms';
import {SeriesFilterPipe} from './pipes/series-filter.pipe';
import {SeriesPageFilterPipe} from './pipes/series-page-filter.pipe';
import {AngularMaterialModule} from '../angular-material/angular-material.module';
import {SelectorComponent} from './components/selector/selector.component';
import {AddGenreComponent} from './components/add-genre/add-genre.component';
import {MatSnackBarModule} from '@angular/material/snack-bar';


@NgModule({
    declarations: [
        HomeComponent,
        AppTableComponent,
        PageSwitcherComponent,
        SeriesFilterPipe,
        SeriesPageFilterPipe,
        SelectorComponent,
        AddGenreComponent
    ],
    imports: [
        CommonModule,
        HomeRoutingModule,
        FormsModule,
        AngularMaterialModule,
        MatSnackBarModule
    ],
    exports: [
        PageSwitcherComponent
    ]

})
export class HomeModule {
}
