import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { Component, Input, ElementRef, HostListener, Injector, OnInit } from '@angular/core';
import { MatChipInputEvent } from '@angular/material/chips';
import { FormGroup, FormControl, FormArray, Validators } from '@angular/forms';
import { BaseComponent } from 'projects/picturepark-sdk-v1-angular-ui/src/lib/shared-module/components/base.component';
import { debounceTime, tap, switchMap, finalize } from 'rxjs/operators';
import { TermsAggregator, ShareService, ShareAggregationRequest, SearchBehavior } from '@picturepark/sdk-v1-angular';
import { MatAutocompleteSelectedEvent } from '@angular/material';

@Component({
  selector: 'pp-share-content-recipients-input',
  templateUrl: './share-content-recipients-input.component.html',
  styleUrls: ['./share-content-recipients-input.component.scss']
})
export class ShareContentRecipientsInputComponent extends BaseComponent implements OnInit {
  @Input() parentForm: FormGroup;

  public elementRef: ElementRef;

  visible = true;
  selectable = true;
  removable = true;
  addOnBlur = true;

  recipientsAutocomplete: string[] = [];
  isLoading = false;

  readonly separatorKeysCodes: number[] = [ ENTER, COMMA ];
  recipients: String[] = [];

  // REGULAR EXPRESSION FOR EMAIL VALIDATION
  private reg = /^(([^<>()\[\]\.,;:\s@\"]+(\.[^<>()\[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;

  constructor(private myElement: ElementRef, private shareService: ShareService) {
    super();

    this.elementRef = this.myElement;
  }

  ngOnInit(): void {
    ((<FormArray>this.parentForm.controls['recipientsSearch']))
    .valueChanges
    .pipe(
      debounceTime(300),
      tap(() => this.isLoading = true),
      switchMap(value => this.shareService.aggregate(new ShareAggregationRequest({
        searchString: value,
        searchBehaviors: [SearchBehavior.WildcardOnEveryTerm],
        aggregators: [
           new TermsAggregator({
            name: 'recipientsAutocomplete',
            field: 'data.mailRecipients.userEmail.emailAddress',
            size: 20
           })
        ]
       }))
      .pipe(
        finalize(() => this.isLoading = false),
        )
      )
    )
    .subscribe(users => {
      this.recipientsAutocomplete = users.aggregationResults[0]!.aggregationResultItems!.map(i => i.name);
    });
  }

  optionSelected(event: MatAutocompleteSelectedEvent): void {
    this.recipientsAutocomplete = [];
    this.add({ input: document.getElementById('recipient')! as HTMLInputElement, value: event.option.value });
  }

  // ADD RECIPIENT TO LIST
  add(event: MatChipInputEvent): void {
    // Exit if suggestions open
    if (this.recipientsAutocomplete.length) { return; }

    const input = event.input;
    const value = event.value;

    this.parentForm.controls['recipients'].markAsTouched();

    // Add our email
    if (value.match(this.reg)) {

      this.recipients.push(value.trim());

      const recipientsControl = <FormArray>this.parentForm.controls['recipients'];
      recipientsControl.push(new FormControl(value, [ Validators.pattern(this.reg) ]));

      input.value = '';

    } else if (value.length > 0) {
      this.parentForm.controls['recipients'].setErrors({'error': true });
    }

  }

  remove(email: string): void {

    const index = this.recipients.indexOf(email);
    const recipientsControl = <FormArray>this.parentForm.controls['recipients'];
    const recipientsControlIndex = recipientsControl.value.indexOf(email);

    if (index >= 0) {
      this.recipients.splice(index, 1);
    }
    if (recipientsControlIndex >= 0) {
      recipientsControl.removeAt(recipientsControlIndex);
    }
  }

  // HANDLE COMPONENENT ENTER KEY PRESS EVENT
  @HostListener('document:keydown.Enter', ['$event'])
  handleEnterDown(event: any): void {
    if (event.srcElement.id && event.srcElement.id === 'mat-chip-list-input-0') {

      this.parentForm.controls['recipients'].markAsTouched();

      if (event.srcElement.value.length > 0 && this.recipients.length === 0 && !event.srcElement.value.match(this.reg)) {
        this.parentForm.controls['recipients'].setErrors({'error': true });
      } else if (this.recipients.length === 0 && !event.srcElement.value.match(this.reg)) {
        this.parentForm.controls['recipients'].setErrors({'required': true });
      }

    }
  }

  // HANDLE COMPONENENT BACKSPACE KEY PRESS EVENT
  @HostListener('document:keydown.backspace', ['$event'])
  handleEscapeDown(event: any): void {

    if (event.srcElement.id && event.srcElement.id === 'mat-chip-list-input-0') {

      if (event.srcElement.value.length > 1 && !event.srcElement.value.match(this.reg)) {
        this.parentForm.controls['recipients'].setErrors({'error': true });
      } else if (event.srcElement.value.length <= 1 && this.recipients.length > 0) {
        setTimeout(() => { this.parentForm.controls['recipients'].setErrors(null); }, 0);
      } else if (event.srcElement.value.length === 0 && this.recipients.length === 0) {
        this.parentForm.controls['recipients'].setErrors({'required': true });
      }

    }
  }

}