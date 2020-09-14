import {Injectable} from '@angular/core';
import {Subject} from 'rxjs';

export interface PopupClosureOptions {
    exceptionPopup?: HTMLElement;
}

@Injectable({
    providedIn: 'root'
})
export class PopupService {
    public shouldBeClosed$: Subject<PopupClosureOptions> = new Subject<PopupClosureOptions>();


    constructor() {

    }


    public triggerPopupClosure(options?: PopupClosureOptions): void {
        if (!options) {
            options = {};
        }

        this.shouldBeClosed$.next(options);
    }

}
