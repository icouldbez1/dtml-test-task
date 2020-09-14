import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {SeriesBoxComponent} from './series-box.component';

const routes: Routes = [
    {
        path: '',
        component: SeriesBoxComponent,
    },
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class SeriesBoxRoutingModule {
}
