import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {SeriesBoxModule} from './modules/series-box/series-box.module';

const routes: Routes = [
    {
        path: '', redirectTo: '/series-box', pathMatch: 'full'
    },
    {
        path: '**', redirectTo: '/series-box'
    },
    {
        path: 'series-box',
        loadChildren: () => import('./modules/series-box/series-box.module')
            .then((seriesBoxModule: { SeriesBoxModule: SeriesBoxModule }) => {
                return seriesBoxModule.SeriesBoxModule;
            })
    }
];

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule]
})
export class AppRoutingModule {
}
