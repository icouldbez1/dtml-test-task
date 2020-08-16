import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {HomeModule} from './modules/home/home.module';

const routes: Routes = [
    {
        path: '', redirectTo: '/home', pathMatch: 'full',
    },
    {
        path: 'home', loadChildren: () =>  import('./modules/home/home.module').then((homeModule: {HomeModule: HomeModule}) => {
            return homeModule.HomeModule;
        })
    }
];

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule]
})
export class AppRoutingModule {
}
