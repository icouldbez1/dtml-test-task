import {Component, ElementRef, EventEmitter, Input, OnDestroy, Output} from '@angular/core';
import {AppComponent} from '../../../../app.component';
import {PopupClosureOptions, PopupService} from '../../../../services/popup/popup.service';
import {Subscription} from 'rxjs';
import {filter, tap} from 'rxjs/operators';

export interface Option {
    name: string;
    label?: string;
}

@Component({
    selector: 'app-selector',
    templateUrl: './selector.component.html',
    styleUrls: ['./selector.component.scss']
})
export class SelectorComponent implements OnDestroy {
    @Input()
    public placeHolder: string = 'Genre';

    public optionsList: Option[] = [];

    @Output() public optionChange: EventEmitter<string> = new EventEmitter<string>();

    public selectedValue: string = '';
    public selectedOption: Option;

    public areOptionsVisible: boolean = false;

    public popupClass: string = AppComponent.POPUP_CSS_CLASS_NAME;

    public popupClosureSub: Subscription;

    private hostHtmlElement: HTMLElement;

    constructor(private popupService: PopupService, private elementRef: ElementRef) {
        this.hostHtmlElement = elementRef.nativeElement;

        this.popupClosureSub = this.popupService.shouldBeClosed$.pipe(
            filter((closureOptions: PopupClosureOptions) => {
                return this.areOptionsVisible && closureOptions.exceptionPopup !== this.hostHtmlElement;
            }),
            tap(() => {
                this.areOptionsVisible = false;
            })
        ).subscribe();
    }

    @Input()
    public set options(options: Option[]) {
        const isEmptySelectionPresent: boolean = options.some((option: Option) => option.name === '');

        if (!isEmptySelectionPresent) {
            options.unshift({name: '', label: '-'});
        }

        this.optionsList = options;
    }

    public get options(): Option[] {
        return this.optionsList;
    }

    public getOptionLabel(option: Option): string {
        return option?.hasOwnProperty('label') ? option?.label : option?.name;
    }

    public ngOnDestroy(): void {
        this.popupClosureSub.unsubscribe();
    }

    public toggleOptionsList(event: MouseEvent): void {
        event.stopPropagation();

        if (!this.areOptionsVisible) {
            this.popupService.triggerPopupClosure({exceptionPopup: this.elementRef.nativeElement});
        }

        this.areOptionsVisible = !this.areOptionsVisible;

    }

    public selectOption(event: MouseEvent, option: Option): void {
        event.stopPropagation();

        if (option.name !== this.selectedValue) {
            this.selectedValue = option.name;
            this.selectedOption = option;

            this.optionChange.emit(this.selectedValue);
        }

        this.areOptionsVisible = false;
    }

}
