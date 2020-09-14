import {Component} from '@angular/core';
import {SeriesFirestoreService} from '../../../../services/series-firestore.service';
import {MatSnackBar} from '@angular/material/snack-bar';
import {catchError, tap} from 'rxjs/operators';
import {throwError, zip} from 'rxjs';
import {SeriesApiService} from '../../../../services/series-api.service';

@Component({
    selector: 'app-add-genre-component',
    templateUrl: './add-genre.component.html',
    styleUrls: ['./add-genre.component.scss']
})
export class AddGenreComponent {
    public genreName: string = '';
    public genreLabel: string = '';

    constructor(private seriesFirestoreService: SeriesFirestoreService,
                private seriesApiService: SeriesApiService,
                private snackBarService: MatSnackBar) {
    }


    public addTmdbMovies(): void {
        // this.seriesFirestoreService.updateMovie();
    }


    public addGenre(): void {
        if (!this.genreName || !this.genreLabel || typeof this.genreName !== 'string' || typeof this.genreLabel !== 'string') {
            return;
        }

        this.seriesFirestoreService.addGenre$(this.genreName, this.genreLabel).pipe(
            // take(1),
            tap(() => this.snackBarService.open('Added new genre!')),
            catchError((error: Error) => {
                console.error('addGenre$ error: ', error);

                this.snackBarService.open(`Can't add new genre: ${error.message}`);

                return throwError(error);
            })
        ).subscribe(() => console.log('NEXT!'), () => console.log('ERROR!'), () => console.log('COMPLETE!'));
    }
}
