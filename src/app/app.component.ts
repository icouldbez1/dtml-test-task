import {Component} from '@angular/core';
import {PopupService} from './services/popup/popup.service';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss']
})
export class AppComponent {
    public static readonly POPUP_CSS_CLASS_NAME = 'dtml_popup';
    public title: string = 'dtml-test-task';

    constructor(private popupService: PopupService) {
        this.listenForClickBeyondPopup();
    }

    public listenForClickBeyondPopup(): void {
        document.addEventListener('click', (event: MouseEvent) => {
            this.popupService.triggerPopupClosure();
        });
    }
}
